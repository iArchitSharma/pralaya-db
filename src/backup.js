import fs from "fs";
import zlib from "zlib";
import postgres from './db/postgres.js';
import mysql from "./db/mysql.js";

/**
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
      fs.unlinkSync(filePath); // Remove the uncompressed backup file
    })
    .on("error", (err) => {
      console.error("Error compressing backup file:", err.message);
    });
}

/**
 * @param {string} dbType - Type of the database
 * @param {Object} config - Database connection parameters.
 * @param {string} outputFile - Path for the backup file.
 */
function createBackup(dbType, config, outputFile) {
  switch (dbType.toLowerCase()) {
    case "mysql":
      mysql.createBackup(config, outputFile, () => compressBackup(outputFile));
      break;

    case "postgres":
      postgres.createBackup(config, outputFile, () => compressBackup(outputFile));
      break;

    case "mongodb":
      mongodb.createBackup(config, outputFile, () => compressBackup(outputFile));
      break;

    case "sqlite":
      sqlite.createBackup(config, outputFile, () => compressBackup(outputFile));
      break;

    default:
      console.error(`Unsupported database type: ${dbType}`);
  }
}

export { createBackup };