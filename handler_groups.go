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

type Group struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	AdminID     uuid.UUID `json:"admin_id"`
	Description string    `json:"description"`
	Slug        string    `json:"slug"`
}

func (cfg *apiConfig) handlerCreateGroup(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	type response struct {
		Group Group `json:"group"`
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

	slug, err := cfg.generateSlugGroup(r)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't generate slug", err)
		return
	}

	group, err := cfg.db.CreateGroup(r.Context(), database.CreateGroupParams{
		Name:    params.Name,
		AdminID: userID,
		Description: sql.NullString{
			String: params.Description,
			Valid:  params.Description != "",
		},
		Slug: slug,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't Create group", err)
		return
	}

	err = cfg.db.CreateMember(r.Context(), database.CreateMemberParams{
		UserID:  userID,
		GroupID: group.ID,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't join group", err)
		return
	}

	respondWithJson(w, http.StatusCreated, response{
		Group: Group{
			ID:          group.ID,
			Name:        group.Name,
			CreatedAt:   group.CreatedAt,
			UpdatedAt:   group.UpdatedAt,
			AdminID:     group.AdminID,
			Description: group.Description.String,
			Slug:        group.Slug,
		},
	})
}

func (cfg *apiConfig) handlerJoinGroup(w http.ResponseWriter, r *http.Request) {
	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	groupStringID := r.PathValue("groupID")
	groupID, err := uuid.Parse(groupStringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid group ID", err)
		return
	}

	err = cfg.db.CreateMember(r.Context(), database.CreateMemberParams{
		UserID:  userID,
		GroupID: groupID,
	})

	w.WriteHeader(http.StatusNoContent)
}

func (cfg *apiConfig) handlerUserGroups(w http.ResponseWriter, r *http.Request) {
	stringID := r.PathValue("userID")
	userID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	dbGroups, err := cfg.db.GroupsByUser(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find groups", err)
		return
	}

	groups := []Group{}
	for _, group := range dbGroups {
		groups = append(groups, Group{
			ID:          group.ID,
			Name:        group.Name,
			CreatedAt:   group.CreatedAt,
			UpdatedAt:   group.UpdatedAt,
			AdminID:     group.AdminID,
			Description: group.Description.String,
			Slug:        group.Slug,
		})
	}

	respondWithJson(w, http.StatusOK, groups)
}

func (cfg *apiConfig) handlerGroupMembers(w http.ResponseWriter, r *http.Request) {
	stringID := r.PathValue("groupID")
	groupID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid group ID", err)
		return
	}

	dbUsers, err := cfg.db.GroupMembers(r.Context(), groupID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find Members", err)
		return
	}

	members := []User{}
	for _, user := range dbUsers {
		members = append(members, User{
			ID:        user.ID,
			FirstName: user.FirstName,
			LastName:  user.LastName.String,
			DOB:       user.Dob.Time,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
			Email:     user.Email,
		})
	}

	respondWithJson(w, http.StatusOK, members)
}

func (cfg *apiConfig) handlerAdminGroups(w http.ResponseWriter, r *http.Request) {
	stringID := r.PathValue("userID")
	userID, err := uuid.Parse(stringID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	dbGroups, err := cfg.db.GroupsByAdmin(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find groups", err)
		return
	}

	groups := []Group{}
	for _, group := range dbGroups {
		groups = append(groups, Group{
			ID:          group.ID,
			Name:        group.Name,
			CreatedAt:   group.CreatedAt,
			UpdatedAt:   group.UpdatedAt,
			AdminID:     group.AdminID,
			Description: group.Description.String,
			Slug:        group.Slug,
		})
	}

	respondWithJson(w, http.StatusOK, groups)
}

func (cfg *apiConfig) handlerGetGroupBySlug(w http.ResponseWriter, r *http.Request) {
	type respone struct {
		Group Group `json:"group"`
	}

	slugID := r.PathValue("slugID")

	group, err := cfg.db.GetGroupBySlug(r.Context(), slugID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find user", err)
		return
	}

	respondWithJson(w, http.StatusOK, respone{
		Group: Group{
			ID:          group.ID,
			Name:        group.Name,
			CreatedAt:   group.CreatedAt,
			UpdatedAt:   group.UpdatedAt,
			AdminID:     group.AdminID,
			Description: group.Description.String,
			Slug:        group.Slug,
		},
	})
}

func (cfg *apiConfig) handlerIsMember(w http.ResponseWriter, r *http.Request) {
	type response struct {
		UserID  uuid.UUID `json:"user_id"`
		GroupID uuid.UUID `json:"group_id"`
	}

	userStrID := r.PathValue("userID")
	userID, err := uuid.Parse(userStrID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Invalid user ID", err)
		return
	}

	groupStrID := r.PathValue("groupID")
	groupID, err := uuid.Parse(groupStrID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Invalid group ID", err)
		return
	}

	member, _ := cfg.db.IsMember(r.Context(), database.IsMemberParams{
		UserID:  userID,
		GroupID: groupID,
	})

	respondWithJson(w, http.StatusOK, response{
		UserID:  member.UserID,
		GroupID: member.GroupID,
	})
}
