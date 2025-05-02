package main

import (
	"net/http"
	"time"

	"github.com/gh4rris/ar-united/internal/auth"
)

func (cfg *apiConfig) handlerRefreshToken(w http.ResponseWriter, r *http.Request) {
	type response struct {
		Token string `json:"token"`
	}

	cookie, err := r.Cookie("refreshToken")
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "No cookie", err)
		return
	}

	user, err := cfg.db.GetUserFromRefreshToken(r.Context(), cookie.Value)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Couldn't get user for refresh token", err)
		return
	}

	newToken, err := auth.MakeJWT(user.ID, cfg.jwtSecret, time.Hour)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't create access JWT", err)
		return
	}

	respondWithJson(w, http.StatusOK, response{
		Token: newToken,
	})
}

func (cfg *apiConfig) handlerRevoke(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refreshToken")
	if err == nil && cookie.Value != "" {
		_, err = cfg.db.RevokeRefreshToken(r.Context(), cookie.Value)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Couldn't revoke token", err)
			return
		}
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refreshToken",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	})

	w.WriteHeader(http.StatusNoContent)
}
