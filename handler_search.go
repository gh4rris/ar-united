package main

import (
	"database/sql"
	"net/http"
)

func (cfg *apiConfig) handlerSearchUsers(w http.ResponseWriter, r *http.Request) {
	searchValue := r.URL.Query().Get("search")

	dbUserResults, err := cfg.db.SearchUsers(r.Context(), sql.NullString{
		String: searchValue,
		Valid:  searchValue != "",
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
