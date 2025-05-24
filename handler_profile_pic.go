package main

import (
	"database/sql"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gh4rris/ar-united/internal/auth"
	"github.com/gh4rris/ar-united/internal/database"
)

func (cfg *apiConfig) handlerProfilePicUpload(w http.ResponseWriter, r *http.Request) {
	userID, msg, err := auth.AuthorizeToken(r.Header, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, msg, err)
		return
	}

	const maxMemory = 10 << 20 // 10MB
	r.ParseMultipartForm(maxMemory)

	file, header, err := r.FormFile("profile-pic")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Unable to parse form file", err)
		return
	}
	defer file.Close()

	mediaType, _, err := mime.ParseMediaType(header.Header.Get("Content-Type"))
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Content-Type", err)
		return
	}
	if mediaType != "image/jpeg" && mediaType != "image/png" {
		respondWithError(w, http.StatusBadRequest, "Invalid file type", err)
		return
	}

	assetPath := getAssetPath(userID, mediaType)
	assetDiskPath := filepath.Join(cfg.assetsRoot, assetPath)

	dst, err := os.Create(assetDiskPath)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't create file on server", err)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error saving file", err)
		return
	}

	url := fmt.Sprintf("%s/assets/%s", cfg.apiBaseURL, assetPath)
	err = cfg.db.UpdateProfilePic(r.Context(), database.UpdateProfilePicParams{
		ID: userID,
		ProfilePicUrl: sql.NullString{
			String: url,
			Valid:  url != "",
		},
	})

	w.WriteHeader(http.StatusNoContent)
}
