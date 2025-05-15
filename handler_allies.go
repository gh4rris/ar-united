package main

import (
	"net/http"
	"time"

	"github.com/gh4rris/ar-united/internal/auth"
	"github.com/gh4rris/ar-united/internal/database"
	"github.com/google/uuid"
)

func (cfg *apiConfig) handlerUserAllies(w http.ResponseWriter, r *http.Request) {
	stringID := r.PathValue("userID")
	userID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	dbAllies, err := cfg.db.GetUserAllies(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find allies", err)
		return
	}

	allies := []User{}
	for _, ally := range dbAllies {
		allies = append(allies, User{
			ID:            ally.ID,
			FirstName:     ally.FirstName,
			LastName:      ally.LastName.String,
			DOB:           ally.Dob.Time,
			CreatedAt:     ally.CreatedAt,
			UpdatedAt:     ally.UpdatedAt,
			Email:         ally.Email,
			Bio:           ally.Bio.String,
			Slug:          ally.Slug,
			ProfilePicURL: ally.ProfilePicUrl.String,
		})
	}

	respondWithJson(w, http.StatusOK, allies)
}

func (cfg *apiConfig) handlerAddAlly(w http.ResponseWriter, r *http.Request) {
	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	stringID := r.PathValue("allyID")
	allyID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid ally ID", err)
		return
	}

	err = cfg.db.AddAlly(r.Context(), database.AddAllyParams{
		RequesterID: userID,
		RequesteeID: allyID,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't add ally", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (cfg *apiConfig) handlerConfirmAlly(w http.ResponseWriter, r *http.Request) {
	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	stringID := r.PathValue("allyID")
	allyID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid ally ID", err)
		return
	}

	err = cfg.db.ConfirmAlly(r.Context(), database.ConfirmAllyParams{
		RequesteeID: userID,
		RequesterID: allyID,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't confirm ally", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (cfg *apiConfig) handlerGetAllyRequests(w http.ResponseWriter, r *http.Request) {
	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	dbAllyRequests, err := cfg.db.GetAllyRequests(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find ally requests", err)
		return
	}

	allyRequests := []User{}
	for _, ally := range dbAllyRequests {
		allyRequests = append(allyRequests, User{
			ID:            ally.ID,
			FirstName:     ally.FirstName,
			LastName:      ally.LastName.String,
			DOB:           ally.Dob.Time,
			CreatedAt:     ally.CreatedAt,
			UpdatedAt:     ally.UpdatedAt,
			Email:         ally.Email,
			Bio:           ally.Bio.String,
			Slug:          ally.Slug,
			ProfilePicURL: ally.ProfilePicUrl.String,
		})
	}

	respondWithJson(w, http.StatusOK, allyRequests)
}

func (cfg *apiConfig) handlerIsAlly(w http.ResponseWriter, r *http.Request) {
	type response struct {
		RequesterID uuid.UUID  `json:"requester_id"`
		Requested   *time.Time `json:"requested"`
		Confirmed   *time.Time `json:"confirmed"`
	}

	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	stringID := r.PathValue("allyID")
	allyID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Invalid ally ID", err)
		return
	}

	ally, _ := cfg.db.IsAlly(r.Context(), database.IsAllyParams{
		RequesterID: userID,
		RequesteeID: allyID,
	})

	var requested *time.Time
	if !ally.Requested.IsZero() {
		requested = &ally.Requested
	}
	var confirmed *time.Time
	if !ally.Confirmed.Time.IsZero() {
		confirmed = &ally.Confirmed.Time
	}

	respondWithJson(w, http.StatusOK, response{
		RequesterID: ally.RequesterID,
		Requested:   requested,
		Confirmed:   confirmed,
	})
}
