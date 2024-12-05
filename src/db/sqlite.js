import { spawn } from 'child_process';
import fs from 'fs';
import { logMessage, logError } from "../utils/logger.js";

/**
 * Test the connection to the SQLite database.
 * @param {Object} config - Database connection parameters.
 */

async function testConn(config){
    const { databasePath } = config;
    try {
        if(fs.existsSync(databasePath)){
            logMessage('SQLite connection successful. Database file exists.');
        }else{
            logError('SQLite connection failed: Database file does not exist.');
        }
    }catch(err){
        logError('SQLite connection error:', err.message);
    }
}

/**
 * @param {string} outputFile - Backup file path.
 * @param {Function} callback - Callback function to execute after the backup is complete.
 */

function createBackup(config, outputFile, callback, backupType) {
    const { databasePath } = config;
  
    logMessage('Starting SQLite backup...');
    const backupCommand = spawn('sqlite3', [databasePath, `.backup '${outputFile}'`]);
  
    backupCommand.stdout.on('data', (data) => {
      logMessage(`Backup output: ${data}`);
    });
  
    backupCommand.stderr.on('data', (data) => {
      logError(`Backup error: ${data}`);
    });
  
    backupCommand.on('close', (code) => {
      if (code === 0) {
        logMessage('SQLite backup successful:', outputFile);
        if (callback) callback();
      } else {
        logError(`Backup process exited with code ${code}`);
      }
    });
  }

/**
 * @param {string} backupFile - Backup file path.
 */
function restoreBackup(config, backupFile, callback) {
    const { databasePath } = config;
  
    logMessage('Starting SQLite restore...');
    try {
      fs.copyFileSync(backupFile, databasePath);
      logMessage('SQLite restore successful.');
      if (callback) callback();
    } catch (err) {
        logError('SQLite restore error:', err.message);
      if (callback) callback(err);
    }
  }
  
  export default {
    testConn,
    createBackup,
    restoreBackup,
  };