package main

import (
	"net/http"

	"github.com/gh4rris/ar-united/internal/auth"
	"github.com/gh4rris/ar-united/internal/database"
	"github.com/google/uuid"
)

func (cfg *apiConfig) handlerUserFriends(w http.ResponseWriter, r *http.Request) {
	stringID := r.PathValue("userID")
	userID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	dbFriends, err := cfg.db.GetUserFriends(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find friends", err)
		return
	}

	friends := []User{}
	for _, friend := range dbFriends {
		friends = append(friends, User{
			ID:        friend.ID,
			FirstName: friend.FirstName,
			LastName:  friend.LastName.String,
			DOB:       friend.Dob.Time,
			CreatedAt: friend.CreatedAt,
			UpdatedAt: friend.UpdatedAt,
			Email:     friend.Email,
		})
	}

	respondWithJson(w, http.StatusOK, friends)
}

func (cfg *apiConfig) handlerAddFriend(w http.ResponseWriter, r *http.Request) {
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

	stringID := r.PathValue("friendID")
	friendID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid friend ID", err)
		return
	}

	err = cfg.db.AddFriend(r.Context(), database.AddFriendParams{
		RequesterID: userID,
		RequesteeID: friendID,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't add friend", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (cfg *apiConfig) handlerConfirmFriend(w http.ResponseWriter, r *http.Request) {
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

	stringID := r.PathValue("friendID")
	friendID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid friend ID", err)
		return
	}

	err = cfg.db.ConfirmFriend(r.Context(), database.ConfirmFriendParams{
		RequesteeID: userID,
		RequesterID: friendID,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't confirm friend", err)
		return
	}

	w.WriteHeader(http.StatusOK)
}
