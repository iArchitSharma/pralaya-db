import fs from "fs";
import zlib from "zlib";
import postgres from './db/postgres.js';
import { logMessage, logError } from "./utils/logger.js";

/**
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
 * Deletes a file from the filesystem.
 */
function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      logError(`Error deleting file ${filePath}: ${err.message}`);
    } else {
      logMessage(`Decompressed file deleted: ${filePath}`);
    }
  });
}

/**
 * @param {string} dbType - Type of the database.
 * @param {string} backupFile - Path to the backup file (compressed or uncompressed).
 * @param {Object} config - Database connection parameters.
 */
async function restoreBackup(dbType, backupFile, config) {
    try {
      const decompressedFile = await decompressBackup(backupFile);
  
      switch (dbType.toLowerCase()) {
        case 'mysql':
          mysql.restoreBackup(config, decompressedFile, () => deleteFile(decompressedFile));
          break;
  
        case 'postgres':
          postgres.restoreBackup(config, decompressedFile, () => deleteFile(decompressedFile));
          break;
  
        case 'mongodb':
          mongodb.restoreBackup(config, decompressedFile, () => deleteFile(decompressedFile));
          break;
  
        case 'sqlite':
          sqlite.restoreBackup(config, decompressedFile, () => deleteFile(decompressedFile));
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

  export { restoreBackup };
