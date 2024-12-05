import pkg from 'pg';
const { Client } = pkg;
import { spawn } from 'child_process';
import { logMessage, logError } from "../utils/logger.js";

/**
 * Test the connection to the PostgreSQL database.
 * @param {Object} config - Database connection parameters.
 */
async function testConn(config) {
  const client = new Client(config);
  try {
    await client.connect();
    logMessage('PostgreSQL connection successful.');
  } catch (err) {
    logError('PostgreSQL connection failed:', err.message);
  } finally {
    await client.end();
  }
}

/**
 * @param {string} outputFile - Path for the backup file.
 * @param {Function} callback - Callback function to execute after the backup is complete.
 */
function createBackup(config, outputFile, callback, backupType) {
  const { host, port, user, password, database } = config;

  logMessage(`Starting PostgreSQL ${backupType} backup...`);

  let backupCommand;

  switch (backupType.toLowerCase()){
    case 'full':
      backupCommand = spawn('pg_dump', [
        '-h', host,
        '-p', port,
        '-U', user,
        '-d', database,
        '-f', outputFile
      ], {
        env: {
          ...process.env, // Preserve existing environment variables
          PGPASSWORD: password
        }
      });
      break;

    case 'incremental':
      backupCommand = spawn("pg_basebackup", [
        "-h",
        host,
        "-p",
        port,
        "-U",
        user,
        "-D",
        outputFile,
        "--wal-method=stream", // Include WAL files for incremental restore
      ]);
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
      logMessage('PostgreSQL backup successful:', outputFile);
      if(callback&&backupType=="full") callback();
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

  logMessage('Starting PostgreSQL restore...');
  const restoreCommand = spawn('psql', [
    '-h', host,
    '-p', port,
    '-U', user,
    '-d', database,
    '-f', backupFile
  ], {
    env: {
      ...process.env,
      PGPASSWORD: password
    }
  });

  restoreCommand.stdout.on('data', (data) => {
    logMessage(`Restore output: ${data}`);
  });

  restoreCommand.stderr.on('data', (data) => {
    logError(`Restore error: ${data}`);
  });

  restoreCommand.on('close', (code) => {
    if (code === 0) {
      logMessage('PostgreSQL restore successful.');
      if(callback) callback();
    } else {
      logError(`Restore process exited with code ${code}`);
    }
  });
}

export default {
  testConn,
  createBackup,
  restoreBackup
};
