package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/google/uuid"
)

func (cfg *apiConfig) ensureAssetsDir() error {
	if _, err := os.Stat(cfg.assetsRoot); os.IsNotExist(err) {
		return os.Mkdir(cfg.assetsRoot, 0755)
	}
	return nil
}

func getAssetPath(userID uuid.UUID, mediaType string) string {
	var ext string
	parts := strings.Split(mediaType, "/")
	if len(parts) != 2 {
		ext = "bin"
	} else {
		ext = parts[1]
	}
	return fmt.Sprintf("%s.%s", userID, ext)
}
