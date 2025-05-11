package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gh4rris/ar-united/internal/auth"
	"github.com/gh4rris/ar-united/internal/database"
	"github.com/google/uuid"
)

type Event struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Location    string    `json:"location"`
	Date        time.Time `json:"date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Description string    `json:"description"`
	GroupID     uuid.UUID `json:"group_id"`
	Slug        string    `json:"slug"`
}

func (cfg *apiConfig) handlerCreateEvent(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Name        string    `json:"name"`
		Location    string    `json:"location"`
		Date        time.Time `json:"date"`
		Description string    `json:"description"`
		GroupID     uuid.UUID `json:"group_id"`
	}
	type response struct {
		Event Event `json:"event"`
	}

	_, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	if err = decoder.Decode(&params); err != nil {
		respondWithError(w, http.StatusBadRequest, "Couldn't decode parameters", err)
		return
	}

	slug, err := cfg.generateSlugEvent(r)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't generate slug", err)
		return
	}

	event, err := cfg.db.CreateEvent(r.Context(), database.CreateEventParams{
		Name: params.Name,
		Location: sql.NullString{
			String: params.Location,
			Valid:  params.Location != "",
		},
		Date: params.Date,
		Description: sql.NullString{
			String: params.Description,
			Valid:  params.Description != "",
		},
		GroupID: params.GroupID,
		Slug:    slug,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't create event", err)
		return
	}

	respondWithJson(w, http.StatusOK, response{
		Event: Event{
			ID:          event.ID,
			Name:        event.Name,
			Location:    event.Location.String,
			Date:        event.CreatedAt,
			CreatedAt:   event.CreatedAt,
			UpdatedAt:   event.UpdatedAt,
			Description: event.Description.String,
			GroupID:     event.GroupID,
			Slug:        event.Slug,
		},
	})
}

func (cfg *apiConfig) handlerUserEvents(w http.ResponseWriter, r *http.Request) {
	stringID := r.PathValue("userID")
	userID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	dbEvents, err := cfg.db.EventsByUser(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find events", err)
		return
	}

	events := []Event{}
	for _, event := range dbEvents {
		events = append(events, Event{
			ID:          event.ID,
			Name:        event.Name,
			Location:    event.Location.String,
			Date:        event.Date,
			CreatedAt:   event.CreatedAt,
			UpdatedAt:   event.UpdatedAt,
			Description: event.Description.String,
			GroupID:     event.GroupID,
			Slug:        event.Slug,
		})
	}

	respondWithJson(w, http.StatusOK, events)
}

func (cfg *apiConfig) handlerAdminEvents(w http.ResponseWriter, r *http.Request) {
	stringID := r.PathValue("userID")
	userID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	dbEvents, err := cfg.db.EventsByAdmin(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn;t find events", err)
		return
	}

	events := []Event{}
	for _, event := range dbEvents {
		events = append(events, Event{
			ID:          event.ID,
			Name:        event.Name,
			Location:    event.Location.String,
			Date:        event.Date,
			CreatedAt:   event.CreatedAt,
			UpdatedAt:   event.UpdatedAt,
			Description: event.Description.String,
			GroupID:     event.GroupID,
			Slug:        event.Slug,
		})
	}

	respondWithJson(w, http.StatusOK, events)
}

func (cfg *apiConfig) handlerGetEventBySlug(w http.ResponseWriter, r *http.Request) {
	type respone struct {
		Event Event `json:"event"`
	}

	slugID := r.PathValue("slugID")

	event, err := cfg.db.GetEventBySlug(r.Context(), slugID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find event", err)
		return
	}

	respondWithJson(w, http.StatusOK, respone{
		Event: Event{
			ID:          event.ID,
			Name:        event.Name,
			Location:    event.Location.String,
			Date:        event.Date,
			CreatedAt:   event.CreatedAt,
			UpdatedAt:   event.UpdatedAt,
			Description: event.Description.String,
			GroupID:     event.GroupID,
			Slug:        event.Slug,
		},
	})
}
