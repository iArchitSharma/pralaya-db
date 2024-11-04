package db

import (
    "database/sql"
    "fmt"
    _ "github.com/lib/pq"
)


func ConnectPostgres(host, user, password, dbName string, port int) (*sql.DB, error) {
    connStr := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable", user, password, host, port, dbName)
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        return nil, err
    }
    return db, db.Ping()
}