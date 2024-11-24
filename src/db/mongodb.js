import { spawn } from 'child_process';
import { MongoClient } from 'mongodb';
import { logMessage, logError } from "../utils/logger.js";

/**
 * Test the connection to the MongoDB database.
 * @param {Object} config - Database connection parameters.
 */

async function testConn(config){
    const {host, port, database} = config;
    const uri = `mongodb://${host}:${port}`;

    try{
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db(database);
        await client.close();
        await db.command({ ping: 1 });
        logMessage('MongoDB connection successful.');
        await client.close();
    }catch (err){
        logError('MongoDB connection failed:', err.message);
    }
}

/**
 * @param {string} outputFile - Path for the backup file.
 * @param {Function} callback - Callback function to execute after the backup is complete.
 */

function createBackup(config, outputFile, callback) {
  const { host, port, database } = config;

  // Construct connection string
  const connectionString = `mongodb://${host}:${port}/${database}`;
  console.log(`DEBUG: Running mongodump with --uri=${connectionString} --archive=${outputFile}`);

  logMessage('Starting MongoDB backup...');
  
  // Spawn the mongodump process
  const backupCommand = spawn('mongodump', [
    '--uri', connectionString,
    '--archive', outputFile
  ]);

  // Log stdout and stderr for debugging
  backupCommand.stdout.on('data', (data) => {
    logMessage(`Backup stdout: ${data}`);
  });

  backupCommand.stderr.on('data', (data) => {
    logError(`Backup stderr: ${data}`);
  });

  // Handle process exit
  backupCommand.on('close', (code) => {
    if (code === 0) {
      logMessage(`MongoDB backup completed successfully. File saved at: ${outputFile}`);
      if (callback) callback();
    } else {
      logError(`Backup process exited with code ${code}`);
    }
  });

  // Log process errors
  backupCommand.on('error', (error) => {
    logError(`Failed to start mongodump process: ${error.message}`);
  });
}


  /**
   * @param {string} backupFile - Path to the backup file.
   */
  function restoreBackup(config, backupFile, callback) {
    const { host, port, database } = config;
  
    logMessage('Starting MongoDB restore...');
    const restoreCommand = spawn('mongorestore', [
      '--host', host,
      '--port', port,
      '--archive', backupFile,
      '--db', database
    ]);
  
    restoreCommand.stdout.on('data', (data) => {
      logMessage(`Restore output: ${data}`);
    });
  
    restoreCommand.stderr.on('data', (data) => {
      logError(`Restore error: ${data}`);
    });
  
    restoreCommand.on('close', (code) => {
      if (code === 0) {
        logMessage('MongoDB restore successful.');
        if (callback) callback();
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