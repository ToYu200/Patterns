package config

import "os"

// Config is loaded once and passed through the app explicitly.
type Config struct {
	Port        string
	DatabaseURL string
	AuthSecret  string
}

func Load() Config {
	return Config{
		Port:        env("PORT", "8080"),
		DatabaseURL: env("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/pvp_platform?sslmode=disable"),
		AuthSecret:  env("AUTH_SECRET", "dev-secret-change-me"),
	}
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
