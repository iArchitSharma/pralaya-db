
# Pralaya-DB

**Pralaya-DB** is a robust solution for efficient and reliable database backup and recovery. It offers features to automate backup processes, manage versions, ensure data integrity, and support various database management systems (DBMSs).

---

## Features
- Supports multiple DBMSs, including PostgreSQL, MySQL, MongoDB, and SQLite.
- Automated backup and restoration.
- Version management for backups.
- Ensures data integrity during operations.

---

## Usage

### Backup
To create a backup of your database, use the following command:  
```bash
node src/cli.js backup --dbType <dbType> --config <path_to_config> --output <output_file_path>
```

#### Example (PostgreSQL):
```bash
node src/cli.js backup --dbType postgres --config ./dbConfig.json --output ./backups/testdb_backup.sql
```

---

### Restore
**Note:** Ensure the database with the same name exists before restoring the data.

To restore your database from a backup, use the following command:  
```bash
node src/cli.js restore --dbType <dbType> --config <path_to_config> --backup <backup_file_path> --backupType <type_of_backup>
```

#### Example (PostgreSQL):
```bash
node src/cli.js restore --dbType postgres --config ./dbConfig.json --backup ./backups/testdb_backup.sql.gz --backupType incremental
```

#### Example Incremental backup(mySQL):
```
node src/cli.js backup --dbType mysql --config ./dbConfig.json --output ./backups/mysql-backup --backupType incremental
```

---

## Configuration Files

### For MySQL, PostgreSQL, and MongoDB:
Create a `dbConfig.json` file with the following structure:
```json
{
  "host": "localhost",
  "port": <port_number>,
  "user": "root",
  "password": "yourpassword",
  "database": "dbName"
}
```

### For SQLite:
For SQLite databases, use this configuration:
```json
{
  "databasePath": "./mydatabase.db"
}
```

---

## Notes
- Ensure you have the necessary permissions and tools installed for the database you are working with.
- The backup and restore operations may vary slightly based on the DBMS.

Feel free to contribute or raise issues if you encounter any problems.

---

Package the CLI as a Global Command
Now you need to install your package globally so that users can access it from anywhere on their system.

Run the following command to link your package globally:

```bash
Copy code
npm link```