package platform

import (
	"database/sql"
	"sync"
	"time"

	_ "github.com/lib/pq"
)

var (
	db     *sql.DB
	dbOnce sync.Once
	dbErr  error
)

// Database is a Singleton: the process owns one connection pool.
func Database(databaseURL string) (*sql.DB, error) {
	dbOnce.Do(func() {
		db, dbErr = sql.Open("postgres", databaseURL)
		if dbErr != nil {
			return
		}
		db.SetMaxOpenConns(12)
		db.SetMaxIdleConns(4)
		db.SetConnMaxLifetime(30 * time.Minute)
		dbErr = db.Ping()
	})
	return db, dbErr
}
