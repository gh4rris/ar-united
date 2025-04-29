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
}

func (cfg *apiConfig) handlerCreatePost(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Body   string    `json:"body"`
		UserID uuid.UUID `json:"user_id"`
	}

	type response struct {
		Post Post `json:"post"`
	}

	token, err := auth.GetBearerToken(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "No Bearer token header", err)
		return
	}

	_, err = auth.ValidateJWT(token, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid JWT token", err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	if err := decoder.Decode(&params); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Counldn't decode parameters", err)
		return
	}

	post, err := cfg.db.CreatePost(r.Context(), database.CreatePostParams{
		Body:   params.Body,
		UserID: params.UserID,
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
	})
}

func (cfg *apiConfig) handlerGetUserPosts(w http.ResponseWriter, r *http.Request) {
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
		})
	}

	respondWithJson(w, http.StatusOK, posts)
}

func (cfg *apiConfig) handlerDeletePost(w http.ResponseWriter, r *http.Request) {
	token, err := auth.GetBearerToken(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "No Bearer token header", err)
		return
	}

	userID, err := auth.ValidateJWT(token, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid JWT token", err)
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
