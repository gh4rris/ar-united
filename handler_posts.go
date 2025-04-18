package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gh4rris/ar-united/internal/database"
	"github.com/google/uuid"
)

type Post struct {
	ID        uuid.UUID
	CreatedAt time.Time
	UpdatedAt time.Time
	Body      string
	UserID    uuid.UUID
}

func (cfg *apiConfig) handlerCreatePost(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Body   string    `json:"body"`
		UserID uuid.UUID `json:"user_id"`
	}

	type response struct {
		Post
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
