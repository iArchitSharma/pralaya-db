import { spawn } from "child_process";
import mysql from 'mysql2/promise';
import { logMessage, logError } from "../utils/logger.js";

/**
 * Test the connection to the MySQL database.
 * @param {Object} config - Database connection parameters.
 */
async function testConn(config) {
    try {
      const connection = await mysql.createConnection(config);
  
      logMessage('MySQL connection successful.');
      await connection.end();
    } catch (err) {
      logError('MySQL connection failed:', err.message);
    }
  }

/**
 * @param {string} outputFile - Path for the backup file.
 * @param {Function} callback - Callback function to execute after the backup is complete.
 */

function createBackup(config, outputFile, callback, backupType){
    const { host, port, user, password, database } = config;
    logMessage('Starting MySQL backup...');

    let backupCommand;

  switch (backupType.toLowerCase()){
    case 'full':
      backupCommand = spawn('mysqldump', [
        '-h', host,
        '-P', port,
        '-u', user,
        `--password=${password}`,
        database,
        '-r', outputFile,
      ]);
      break;

    case 'incremental':
      
      break;

    case 'differential':
      logError("Differential backups are not natively supported with Postgres.");
      break;

    default:
      logError(`Invalid backup type: ${backupType}`);
      return;
  }

      backupCommand.stdout.on('data', (data) => {
        logMessage(`Backup output: ${data}`);
      });

      backupCommand.stderr.on('data', (data) => {
        logError(`Backup error: ${data}`);
      });
    
      backupCommand.on('close', (code) => {
        if (code === 0) {
          logMessage('MySQL backup successful:', outputFile);
          if (callback) callback();
        } else {
          logError(`Backup process exited with code ${code}`);
        }
      });
}

/**
 * @param {string} backupFile - Path to the backup file.
 */
function restoreBackup(config, backupFile, callback) {
    const { host, port, user, password, database } = config;
  
    logMessage('Starting MySQL restore...');
    const restoreCommand = spawn('mysql', [
      '-h', host,
      '-P', port,
      '-u', user,
      `--password=${password}`,
      database,
      '-e', `source ${backupFile}`,
    ]);
  
    restoreCommand.stdout.on('data', (data) => {
      logMessage(`Restore output: ${data}`);
    });
  
    restoreCommand.stderr.on('data', (data) => {
      logError(`Restore error: ${data}`);
    });
  
    restoreCommand.on('close', (code) => {
      if (code === 0) {
        logMessage('MySQL restore successful.');
        if (callback) callback();
      } else {
        logError(`Restore process exited with code ${code}`);
      }
    });
  }
  
  export default {
    testConn,
    createBackup,
    restoreBackup,
  };