import fs from "fs";
import zlib from "zlib";
import postgres from 'db/postgres';

/**
 * Compresses a backup file using Gzip.
 * @param {string} filePath - Path of the file to be compressed.
 */

function compressBackup(filePath) {
  const compressFP = `${filePath}.gz`;
  const readStream = fs.createReadStream(filePath);
  const writeStream = fs.createWriteStream(compressFP);
  const gzip = zlib.createGzip();

  readStream
    .pipe(gzip)
    .pipe(writeStream)
    .on("finish", () => {
      console.log("Backup file compressed:", compressFP);
      fs.unlinkSync(filePath);
    });
}

/**
 * @param {string} dbType - Type of the database (mysql, postgres, mongodb, sqlite).
 * @param {Object} config - Database connection parameters.
 * @param {string} outputFile - Path for the backup file.
 */

function createBackup(dbType, config, outputFile) {
  switch (dbType.toLowerCase()) {
    case "mysql":
      mysql.createBackup(config, outputFile, () => compressBackup(outputFile));
      break;

    case "postgres":
      postgres.createBackup(config, outputFile, () =>
        compressBackup(outputFile)
      );
      break;

    case "mongodb":
      mongodb.createBackup(config, outputFile, () =>
        compressBackup(outputFile)
      );
      break;

    case "sqlite":
      sqlite.createBackup(config, outputFile, () => compressBackup(outputFile));
      break;

    default:
      console.error(`Unsupported database type: ${dbType}`);
  }
}

module.exports = { createBackup };