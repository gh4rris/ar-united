package main

import (
	"net/http"

	"github.com/gh4rris/ar-united/internal/auth"
)

func (cfg *apiConfig) handlerUserFriends(w http.ResponseWriter, r *http.Request) {
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
