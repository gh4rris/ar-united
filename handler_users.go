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
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	DOB       time.Time `json:"dob"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Email     string    `json:"email"`
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
		User User `json:"user"`
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
			LastName:  user.LastName.String,
			DOB:       user.Dob.Time,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
			Email:     user.Email,
		},
	})
}

func (cfg *apiConfig) handlerUpdateUser(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	type response struct {
		User
	}

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

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	if err = decoder.Decode(&params); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Counldn't decode parameters", err)
		return
	}

	hashedPassword, err := auth.HashPassword(params.Password)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't hash password", err)
		return
	}

	user, err := cfg.db.UpdateUser(r.Context(), database.UpdateUserParams{
		ID:            userID,
		Email:         params.Email,
		HasedPassword: hashedPassword,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't update user info", err)
		return
	}

	respondWithJson(w, http.StatusOK, response{
		User: User{
			ID:        userID,
			FirstName: user.FirstName,
			LastName:  user.LastName.String,
			DOB:       user.Dob.Time,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
			Email:     user.Email,
		},
	})
}
