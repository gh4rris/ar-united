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

type User struct {
	ID        uuid.UUID      `json:"id"`
	FirstName string         `json:"first_name"`
	LastName  sql.NullString `json:"last_name"`
	DOB       sql.NullTime   `json:"dob"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	Email     string         `json:"email"`
}

func (cfg *apiConfig) handlerCreateUser(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		FirstName string     `json:"first_name"`
		LastName  string     `json:"last_name"`
		DOB       *time.Time `json:"dob"`
		Email     string     `json:"email"`
		Password  string     `json:"password"`
	}
	type response struct {
		User
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	if err := decoder.Decode(&params); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Counldn't decode parameters", err)
		return
	}

	hashedPassword, err := auth.HashPassword(params.Password)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't hash password", err)
		return
	}

	var DOB time.Time
	if params.DOB != nil {
		DOB = *params.DOB
	}

	user, err := cfg.db.CreateUser(r.Context(), database.CreateUserParams{
		FirstName: params.FirstName,
		LastName: sql.NullString{
			String: params.LastName,
			Valid:  params.LastName != "",
		},
		Dob: sql.NullTime{
			Time:  DOB,
			Valid: params.DOB != nil,
		},
		Email:         params.Email,
		HasedPassword: hashedPassword,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't create user", err)
		return
	}

	respondWithJson(w, http.StatusCreated, response{
		User: User{
			ID:        user.ID,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			DOB:       user.Dob,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
			Email:     user.Email,
		},
	})
}
