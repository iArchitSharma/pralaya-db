import fs from "fs";
import zlib from "zlib";
import postgres from 'db/postgres';
const { logMessage, logError } = require("./utils/logger");

/**
 * Decompress a .gz file.
 * @param {string} filePath - Path to the compressed file.
 * @returns {Promise<string>} - Resolves with the path to the decompressed file.
 */
function decompressBackup(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath.endsWith(".gz")) {
      return resolve(filePath); // No decompression needed
    }

    const decompressedFile = filePath.replace(/\.gz$/, "");
    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(decompressedFile);
    const gunzip = zlib.createGunzip();

    readStream
      .pipe(gunzip)
      .pipe(writeStream)
      .on("finish", () => {
        logMessage(`Backup file decompressed: ${decompressedFile}`);
        resolve(decompressedFile);
      })
      .on("error", (err) => {
        logError(`Error decompressing file: ${err.message}`);
        reject(err);
      });
  });
}

/**
 * @param {string} dbType - Type of the database (mysql, postgres, mongodb, sqlite).
 * @param {string} backupFile - Path to the backup file (compressed or uncompressed).
 * @param {Object} config - Database connection parameters.
 */
async function restoreBackup(dbType, backupFile, config) {
    try {
      const decompressedFile = await decompressBackup(backupFile);
  
      switch (dbType.toLowerCase()) {
        case 'mysql':
          mysql.restoreBackup(config, decompressedFile, (err) => {
            if (err) {
              logError(`MySQL restore failed: ${err.message}`);
            } else {
              logMessage('MySQL restore completed successfully.');
            }
          });
          break;
  
        case 'postgres':
          postgres.restoreBackup(config, decompressedFile, (err) => {
            if (err) {
              logError(`PostgreSQL restore failed: ${err.message}`);
            } else {
              logMessage('PostgreSQL restore completed successfully.');
            }
          });
          break;
  
        case 'mongodb':
          mongodb.restoreBackup(config, decompressedFile, (err) => {
            if (err) {
              logError(`MongoDB restore failed: ${err.message}`);
            } else {
              logMessage('MongoDB restore completed successfully.');
            }
          });
          break;
  
        case 'sqlite':
          sqlite.restoreBackup(config, decompressedFile, (err) => {
            if (err) {
              logError(`SQLite restore failed: ${err.message}`);
            } else {
              logMessage('SQLite restore completed successfully.');
            }
          });
          break;
  
        default:
          const errorMessage = `Unsupported database type: ${dbType}`;
          logError(errorMessage);
          console.error(errorMessage);
      }
    } catch (err) {
      logError(`Restore process failed: ${err.message}`);
      console.error('Restore process failed:', err.message);
    }
  }

  export default { restoreBackup };
