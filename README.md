Pralaya-DB is a solution designed for efficient and reliable database backup and recovery. It typically includes features that help automate backup processes, manage versions, ensure data integrity, and support various DBMSs.

backup - node src/cli.js backup --dbType postgres --config ./dbConfig.json --output ./backups/testdb_backup.sql

away make sure to create the database with same name before restoring data
restore - node src/cli.js restore --dbType postgres --config ./dbConfig.json --backup ./backups/testdb_backup.sql.gz
