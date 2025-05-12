package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
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
	Slug      string    `json:"slug"`
}

type Displayable interface {
	DisplayName() string
}

func (u User) DisplayName() string {
	return fmt.Sprintf("%s %s", u.FirstName, u.LastName)
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

	slug, err := cfg.generateSlugUser(params.FirstName, params.LastName, r)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't generate slug", err)
		return
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
		Email:          params.Email,
		Slug:           slug,
		HashedPassword: hashedPassword,
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
			Slug:      slug,
		},
	})
}

func (cfg *apiConfig) handlerUpdateUser(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
	}
	type response struct {
		User User `json:"user"`
	}

	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	if err = decoder.Decode(&params); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Counldn't decode parameters", err)
		return
	}

	user, err := cfg.db.UpdateUser(r.Context(), database.UpdateUserParams{
		ID:        userID,
		FirstName: params.FirstName,
		LastName: sql.NullString{
			String: params.LastName,
			Valid:  params.LastName != "",
		},
		Email: params.Email,
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
			Slug:      user.Slug,
		},
	})
}

func (cfg *apiConfig) handlerUpdatePassword(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Password string `json:"password"`
	}

	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	params := parameters{}
	decoder := json.NewDecoder(r.Body)
	if err = decoder.Decode(&params); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Counldn't decode parameters", err)
		return
	}

	hashedPassword, err := auth.HashPassword(params.Password)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't hash password", err)
		return
	}

	err = cfg.db.UpdatePassword(r.Context(), database.UpdatePasswordParams{
		ID:             userID,
		HashedPassword: hashedPassword,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't update password", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (cfg *apiConfig) handlerGetUserBySlug(w http.ResponseWriter, r *http.Request) {
	type response struct {
		User User `json:"user"`
	}

	slugID := r.PathValue("slugID")

	user, err := cfg.db.GetUserBySlug(r.Context(), slugID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find user", err)
		return
	}

	respondWithJson(w, http.StatusOK, response{
		User: User{
			ID:        user.ID,
			FirstName: user.FirstName,
			LastName:  user.LastName.String,
			Email:     user.Email,
			Slug:      user.Slug,
		},
	})
}

func (cfg *apiConfig) handlerCheckUsers(w http.ResponseWriter, r *http.Request) {
	type response struct {
		Entries int64 `json:"entries"`
	}

	entries, err := cfg.db.CheckUsers(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't count users", err)
		return
	}

	respondWithJson(w, http.StatusOK, response{
		Entries: entries,
	})
}
