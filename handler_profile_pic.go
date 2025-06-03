package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
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

	filename := getAssetFilename(userID, mediaType)

	var url string
	if cfg.host == "local" {
		url = fmt.Sprintf("%s/assets/%s", cfg.apiBaseURL, filename)
		str, err := cfg.uploadLocal(filename, file)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, str, err)
			return
		}
	} else {
		url = fmt.Sprintf("%s/%s", cfg.supabaseURL, filename)
		str, err := cfg.uploadSupabase(url, file, header)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, str, err)
			return
		}
	}

	err = cfg.db.UpdateProfilePic(r.Context(), database.UpdateProfilePicParams{
		ID: userID,
		ProfilePicUrl: sql.NullString{
			String: url,
			Valid:  url != "",
		},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't update profile pic", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)

}

func (cfg *apiConfig) uploadLocal(filename string, file multipart.File) (string, error) {
	assetDiskPath := filepath.Join(cfg.assetsRoot, filename)
	dst, err := os.Create(assetDiskPath)
	if err != nil {
		return "Couldn't create file on server", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "Error saving file", err
	}

	return "", nil

}

func (cfg *apiConfig) uploadSupabase(url string, file multipart.File, header *multipart.FileHeader) (string, error) {
	var buf bytes.Buffer
	_, err := io.Copy(&buf, file)
	if err != nil {
		return "Failed to read file", err
	}

	req, err := http.NewRequest("POST", url, &buf)
	if err != nil {
		return "Failed to create request", err
	}

	req.Header.Set("Authorization", "Bearer "+cfg.supabasekey)
	req.Header.Set("Content-Type", header.Header.Get("Content-Type"))
	req.Header.Set("x-upsert", "true")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "Upload failed", err
	}
	defer resp.Body.Close()

	if resp.StatusCode > 299 {
		body, _ := io.ReadAll(resp.Body)
		return "Upload error", fmt.Errorf("error: %s", string(body))
	}

	return "", nil
}
