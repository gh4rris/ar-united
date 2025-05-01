package main

import (
	"net/http"
	"path/filepath"

	"github.com/gh4rris/ar-united/internal/auth"
)

func (cfg *apiConfig) handlerServeHTTP(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, filepath.Join(cfg.filepathRoot, "index.html"))
}

func (cfg *apiConfig) handlerValidateToken(w http.ResponseWriter, r *http.Request) {
	token, err := auth.GetBearerToken(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "No Bearer token header", err)
		return
	}

	_, err = auth.ValidateJWT(token, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid JWT token", err)
		return
	}

	w.WriteHeader(http.StatusOK)
}
