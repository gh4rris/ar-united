package main

import (
	"net/http"

	"github.com/gh4rris/ar-united/internal/auth"
	"github.com/gh4rris/ar-united/internal/database"
	"github.com/google/uuid"
)

func (cfg *apiConfig) handlerGoingEvent(w http.ResponseWriter, r *http.Request) {
	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	stringID := r.PathValue("eventID")
	eventID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	err = cfg.db.AddGoing(r.Context(), database.AddGoingParams{
		UserID:  userID,
		EventID: eventID,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't add going", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (cfg *apiConfig) handlerNotGoingEvent(w http.ResponseWriter, r *http.Request) {
	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	stringID := r.PathValue("eventID")
	eventID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	err = cfg.db.RemoveGoing(r.Context(), database.RemoveGoingParams{
		UserID:  userID,
		EventID: eventID,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't remove going", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (cfg *apiConfig) handlerIsGoing(w http.ResponseWriter, r *http.Request) {
	type response struct {
		UserID  uuid.UUID `json:"user_id"`
		EventID uuid.UUID `json:"event_id"`
	}

	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	stringID := r.PathValue("eventID")
	eventID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Invalid event ID", err)
		return
	}

	attender, err := cfg.db.IsAttending(r.Context(), database.IsAttendingParams{
		UserID:  userID,
		EventID: eventID,
	})
	if err != nil {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	respondWithJson(w, http.StatusOK, response{
		UserID:  attender.UserID,
		EventID: attender.EventID,
	})
}
