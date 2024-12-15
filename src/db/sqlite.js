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

function createIncrementalBackup(config, outputDir, callback) {
  const { databasePath } = config;

  try {
    const dbDir = path.dirname(databasePath);
    const dbName = path.basename(databasePath);
    const walFile = path.join(dbDir, `${dbName}-wal`);
    const backupDbFile = path.join(outputDir, `${dbName}`);
    const backupWalFile = path.join(outputDir, `${dbName}-wal`);

    logMessage('Starting SQLite incremental backup...');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.copyFileSync(databasePath, backupDbFile);
    logMessage(`Copied main database file to: ${backupDbFile}`);

    if (fs.existsSync(walFile)) {
      fs.copyFileSync(walFile, backupWalFile);
      logMessage(`Copied WAL file to: ${backupWalFile}`);
    } else {
      logMessage('No WAL file found. Database changes are fully committed.');
    }

    if (callback) callback();
  } catch (err) {
    logError('Error during SQLite incremental backup:', err.message);
    if (callback) callback(err);
  }
}

function createDifferentialBackup(config, fullBackupDir, outputDir, callback) {
  const { databasePath } = config;
  try {
    const dbDir = path.dirname(databasePath);
    const dbName = path.basename(databasePath);
    const fullBackupFile = path.join(fullBackupDir, dbName);
    const walFile = path.join(dbDir, `${dbName}-wal`);
    const diffBackupFile = path.join(outputDir, `${dbName}`);
    const diffWalFile = path.join(outputDir, `${dbName}-wal`);

    logMessage('Starting SQLite differential backup...');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (!fs.existsSync(fullBackupFile)) {
      logError('No full backup found. Please create a full backup first.');
      return;
    }

    const dbStats = fs.statSync(databasePath);
    const fullBackupStats = fs.statSync(fullBackupFile);

    if (dbStats.mtime <= fullBackupStats.mtime) {
      logMessage('No changes detected since the last full backup. Differential backup skipped.');
      return;
    }

    fs.copyFileSync(databasePath, diffBackupFile);
    logMessage(`Copied differential database file to: ${diffBackupFile}`);

    if (fs.existsSync(walFile)) {
      fs.copyFileSync(walFile, diffWalFile);
      logMessage(`Copied WAL file to: ${diffWalFile}`);
    } else {
      logMessage('No WAL file found. All changes are in the main database.');
    }

    if (callback) callback();
  } catch (err) {
    logError('Error during SQLite differential backup:', err.message);
    if (callback) callback(err);
  }
}


/**
 * @param {string} outputFile - Backup file path.
 * @param {Function} callback - Callback function to execute after the backup is complete.
 */

function createBackup(config, outputFile, callback, backupType) {
    const { databasePath } = config;
  
    logMessage('Starting SQLite backup...');
    let backupCommand;

    switch (backupType.toLowerCase()) {
      case "full":
        backupCommand = spawn('sqlite3', [databasePath, `.backup '${outputFile}'`]);
        break;
  
      case "incremental":
        createIncrementalBackup(config, outputFile, callback);
        break;
  
      case "differential":
        if (!fullBackupDir) {
          logError('Full backup directory is required for differential backups.');
          return;
        }
        createDifferentialBackup(config, fullBackupDir, outputFile, callback);
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