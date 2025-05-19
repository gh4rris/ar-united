package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gh4rris/ar-united/internal/auth"
	"github.com/gh4rris/ar-united/internal/database"
	"github.com/google/uuid"
)

type Post struct {
	ID        uuid.UUID `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Body      string    `json:"body"`
	UserID    uuid.UUID `json:"user_id"`
	GroupID   uuid.UUID `json:"group_id"`
	EventID   uuid.UUID `json:"event_id"`
}

func (cfg *apiConfig) handlerCreateUserPost(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Body string `json:"body"`
	}

	type response struct {
		Post Post `json:"post"`
	}

	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	if err := decoder.Decode(&params); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Counldn't decode parameters", err)
		return
	}

	post, err := cfg.db.CreateUserPost(r.Context(), database.CreateUserPostParams{
		Body:   params.Body,
		UserID: userID,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't create post", err)
		return
	}

	respondWithJson(w, http.StatusCreated, response{
		Post: Post{
			ID:        post.ID,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.CreatedAt,
			Body:      post.Body,
			UserID:    post.UserID,
			GroupID:   post.GroupID.UUID,
			EventID:   post.EventID.UUID,
		},
	})
}

func (cfg *apiConfig) handlerCreateGroupPost(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Body string `json:"body"`
	}

	type response struct {
		Post Post `json:"post"`
	}

	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	groupStringID := r.PathValue("groupID")
	groupID, err := uuid.Parse(groupStringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid group ID", err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	if err := decoder.Decode(&params); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Counldn't decode parameters", err)
		return
	}

	post, err := cfg.db.CreateGroupPost(r.Context(), database.CreateGroupPostParams{
		Body:   params.Body,
		UserID: userID,
		GroupID: uuid.NullUUID{
			UUID:  groupID,
			Valid: groupID != uuid.Nil,
		},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't create post", err)
		return
	}

	respondWithJson(w, http.StatusCreated, response{
		Post: Post{
			ID:        post.ID,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.CreatedAt,
			Body:      post.Body,
			UserID:    post.UserID,
			GroupID:   post.GroupID.UUID,
			EventID:   post.EventID.UUID,
		},
	})
}

func (cfg *apiConfig) handlerCreateEventPost(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Body string `json:"body"`
	}

	type response struct {
		Post Post `json:"post"`
	}

	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	eventStringID := r.PathValue("eventID")
	eventID, err := uuid.Parse(eventStringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid group ID", err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	if err := decoder.Decode(&params); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Counldn't decode parameters", err)
		return
	}

	post, err := cfg.db.CreateEventPost(r.Context(), database.CreateEventPostParams{
		Body:   params.Body,
		UserID: userID,
		EventID: uuid.NullUUID{
			UUID:  eventID,
			Valid: eventID != uuid.Nil,
		},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't create post", err)
		return
	}

	respondWithJson(w, http.StatusCreated, response{
		Post: Post{
			ID:        post.ID,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.CreatedAt,
			Body:      post.Body,
			UserID:    post.UserID,
			GroupID:   post.GroupID.UUID,
			EventID:   post.EventID.UUID,
		},
	})
}

func (cfg *apiConfig) handlerGetPosts(w http.ResponseWriter, r *http.Request) {
	dbPosts, err := cfg.db.GetPosts(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't retrieve posts", err)
		return
	}

	posts := []Post{}
	for _, post := range dbPosts {
		posts = append(posts, Post{
			ID:        post.ID,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
			Body:      post.Body,
			UserID:    post.UserID,
			GroupID:   post.GroupID.UUID,
			EventID:   post.EventID.UUID,
		})
	}

	respondWithJson(w, http.StatusOK, posts)
}

func (cfg *apiConfig) handlerGetPost(w http.ResponseWriter, r *http.Request) {
	stringID := r.PathValue("postID")
	postID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid post ID", err)
		return
	}

	dbPost, err := cfg.db.GetPost(r.Context(), postID)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Couldn't find post", err)
		return
	}

	respondWithJson(w, http.StatusOK, Post{
		ID:        dbPost.ID,
		CreatedAt: dbPost.CreatedAt,
		UpdatedAt: dbPost.UpdatedAt,
		Body:      dbPost.Body,
		UserID:    dbPost.UserID,
		GroupID:   dbPost.GroupID.UUID,
		EventID:   dbPost.EventID.UUID,
	})
}

func (cfg *apiConfig) handlerUserPosts(w http.ResponseWriter, r *http.Request) {
	stringID := r.PathValue("userID")
	userID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	dbPosts, err := cfg.db.GetUserPosts(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't retrieve posts", err)
		return
	}

	posts := []Post{}
	for _, post := range dbPosts {
		posts = append(posts, Post{
			ID:        post.ID,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
			Body:      post.Body,
			UserID:    post.UserID,
			GroupID:   post.GroupID.UUID,
			EventID:   post.EventID.UUID,
		})
	}

	respondWithJson(w, http.StatusOK, posts)
}

func (cfg *apiConfig) handlerGroupPosts(w http.ResponseWriter, r *http.Request) {
	stringID := r.PathValue("groupID")
	groupID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	dbPosts, err := cfg.db.GetGroupPosts(r.Context(), uuid.NullUUID{
		UUID:  groupID,
		Valid: groupID != uuid.Nil,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't retrieve posts", err)
		return
	}

	posts := []Post{}
	for _, post := range dbPosts {
		posts = append(posts, Post{
			ID:        post.ID,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
			Body:      post.Body,
			UserID:    post.UserID,
			GroupID:   post.GroupID.UUID,
			EventID:   post.EventID.UUID,
		})
	}

	respondWithJson(w, http.StatusOK, posts)
}

func (cfg *apiConfig) handlerEventPosts(w http.ResponseWriter, r *http.Request) {
	stringID := r.PathValue("eventID")
	eventID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	dbPosts, err := cfg.db.GetEventPosts(r.Context(), uuid.NullUUID{
		UUID:  eventID,
		Valid: eventID != uuid.Nil,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't retrieve posts", err)
		return
	}

	posts := []Post{}
	for _, post := range dbPosts {
		posts = append(posts, Post{
			ID:        post.ID,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
			Body:      post.Body,
			UserID:    post.UserID,
			GroupID:   post.GroupID.UUID,
			EventID:   post.EventID.UUID,
		})
	}

	respondWithJson(w, http.StatusOK, posts)
}

func (cfg *apiConfig) handlerDeletePost(w http.ResponseWriter, r *http.Request) {
	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	stringID := r.PathValue("postID")
	postID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid post ID", err)
		return
	}

	post, err := cfg.db.GetPost(r.Context(), postID)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Couldn't get post", err)
		return
	}

	if post.UserID != userID {
		respondWithError(w, http.StatusForbidden, "You can't delete this post", err)
		return
	}

	if err = cfg.db.DeletePost(r.Context(), postID); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't delete post", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
