package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"patterns/backend/internal/app"
	"patterns/backend/internal/config"
)

func main() {
	cfg := config.Load()
	container, err := app.NewContainer(cfg)
	if err != nil {
		log.Fatalf("bootstrap api: %v", err)
	}
	defer container.Close()

	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           container.Router(),
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("api listening on :%s", cfg.Port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Printf("server stopped: %v", err)
		os.Exit(1)
	}
}
