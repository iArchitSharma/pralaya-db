package db

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
)

func ConnectMySQL(host, user, password, dbName string, port int) (*sql.DB, error){
	connStr := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s", user, password, host, port, dbName)
	db, err := sql.Open("mysql", connStr)
	if err != nil {
		return nil, err
	}

	return db, db.Ping()
	
}