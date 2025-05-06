package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"regexp"
	"strings"
)

func (cfg *apiConfig) generateSlugUser(firstName, lastName string, r *http.Request) (string, error) {
	name := strings.ToLower(strings.TrimSpace(firstName) + "-" + strings.TrimSpace(lastName))
	name = strings.ReplaceAll(name, " ", "-")
	re := regexp.MustCompile(`[^\w\-]`)
	name = re.ReplaceAllString(name, "")

	id, err := generateHexId(6)
	if err != nil {
		return "", err
	}

	slug := fmt.Sprintf("%s-%s", name, id)

	slugCheck, err := cfg.db.CheckSlugUser(r.Context(), slug)
	if err != nil {
		return "", err
	}
	if slugCheck > 0 {
		return cfg.generateSlugUser(firstName, lastName, r)
	}
	return slug, nil
}

func (cfg *apiConfig) generateSlugGroup(r *http.Request) (string, error) {
	slug, err := generateHexId(8)
	if err != nil {
		return "", err
	}

	slugCheck, err := cfg.db.CheckSlugGroup(r.Context(), slug)
	if err != nil {
		return "", err
	}
	if slugCheck > 0 {
		return cfg.generateSlugGroup(r)
	}

	return slug, nil
}

func generateHexId(n int) (string, error) {
	idByte := make([]byte, n)
	_, err := rand.Read(idByte)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(idByte), nil
}
