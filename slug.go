package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"regexp"
	"strings"
)

func (cfg *apiConfig) generateSlug(firstName, lastName string, r *http.Request) (string, error) {
	name := strings.ToLower(strings.TrimSpace(firstName) + "-" + strings.TrimSpace(lastName))
	name = strings.ReplaceAll(name, " ", "-")
	re := regexp.MustCompile(`[^\w\-]`)
	name = re.ReplaceAllString(name, "")

	idByte := make([]byte, 6)
	_, err := rand.Read(idByte)
	if err != nil {
		return "", err
	}
	id := hex.EncodeToString(idByte)

	slug := fmt.Sprintf("%s-%s", name, id)

	slugCheck, err := cfg.db.CheckSlug(r.Context(), slug)
	if err != nil {
		return "", err
	}
	if slugCheck > 0 {
		return cfg.generateSlug(firstName, lastName, r)
	}
	return slug, nil
}
