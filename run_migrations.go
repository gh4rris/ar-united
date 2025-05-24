package main

import (
	"database/sql"
	"log"

	"github.com/pressly/goose"
)

func (cfg *apiConfig) runMigrations(db *sql.DB) error {
	goose.SetLogger(log.Default())

	if err := goose.Up(db, cfg.migrationsRoot); err != nil {
		return err
	}

	log.Println("Database migrations ran successfully")
	return nil
}
