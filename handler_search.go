package main

import (
	"database/sql"
	"net/http"
)

func (cfg *apiConfig) handlerSearch(w http.ResponseWriter, r *http.Request) {
	searchValue := r.URL.Query().Get("value")
	searchType := r.URL.Query().Get("type")

	if searchType == "activists" {
		dbUserResults, err := cfg.db.SearchUsers(r.Context(), sql.NullString{
			String: searchValue,
			Valid:  searchValue != "",
		})
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Couldn't find users", err)
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
				Slug:      user.Slug,
			})
		}

		respondWithJson(w, http.StatusOK, userResults)
	} else if searchType == "groups" {
		dbGroupResults, err := cfg.db.SearchGroups(r.Context(), sql.NullString{
			String: searchValue,
			Valid:  searchValue != "",
		})
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Couldn't find groups", err)
			return
		}

		groupResults := []Group{}
		for _, group := range dbGroupResults {
			groupResults = append(groupResults, Group{
				ID:          group.ID,
				Name:        group.Name,
				CreatedAt:   group.CreatedAt,
				UpdatedAt:   group.UpdatedAt,
				AdminID:     group.AdminID,
				Description: group.Description.String,
				Slug:        group.Slug,
			})
		}

		respondWithJson(w, http.StatusOK, groupResults)
	}

}
