package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func (cfg *apiConfig) handlerSearchUsers(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		SearchText string `json:"search_text"`
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	if err := decoder.Decode(&params); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Counldn't decode parameters", err)
		return
	}

	dbUserResults, err := cfg.db.SearchUsers(r.Context(), sql.NullString{
		String: params.SearchText,
		Valid:  params.SearchText != "",
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find Users", err)
		return
	}

	userResults := []User{}
	for _, user := range dbUserResults {
		userResults = append(userResults, User{
			ID:        user.ID,
			FirstName: user.FirstName,
			LastName:  user.LastName.String,
			DOB:       user.Dob.Time,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
			Email:     user.Email,
		})
	}

	respondWithJson(w, http.StatusOK, userResults)
}
