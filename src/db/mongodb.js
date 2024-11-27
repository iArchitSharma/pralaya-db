import { spawn } from 'child_process';
import { exec } from 'child_process';
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

  const connectionString = `mongodb://${host}:${port}/${database}`;
  console.log(`DEBUG: Running mongodump with --uri=${connectionString} --archive=${outputFile}`);

  logMessage('Starting MongoDB backup...');

  const backupCommand = spawn('mongodump', [
    `--uri=${connectionString}`, 
    `--archive=${outputFile}`  
  ], { shell: true });

  backupCommand.stdout.on('data', (data) => {
    logMessage(`Backup stdout: ${data}`);
  });

  backupCommand.stderr.on('data', (data) => {
    const message = data.toString().trim();
  
    // Check if the message is a known error pattern
    if (message.toLowerCase().includes('error')) {
      logError(`Backup stderr: ${message}`);
    } else {
      logMessage(`Backup info: ${message}`);
    }
  });
  

  backupCommand.on('close', (code) => {
    if (code === 0) {
      logMessage(`MongoDB backup completed successfully. File saved at: ${outputFile}`);
      if (callback) callback();
    } else {
      logError(`Backup process exited with code ${code}`);
    }
  });

  backupCommand.on('error', (error) => {
    logError(`Failed to start mongodump process: ${error.message}`);
  });
}



  /**
   * @param {string} backupFile - Path to the backup file.
   */
  function restoreBackup(config, backupFile, callback) {
    const { host, port, database } = config;
  
    logMessage("Starting MongoDB restore...");
    const restoreCommand = `mongorestore --host=${host} --port=${port} --archive=${backupFile} --nsInclude=${database}.*`;
  
    logMessage(`Running restore command: ${restoreCommand}`);
  
    const restoreProcess = exec(restoreCommand, (error, stdout, stderr) => {
      if (error) {
        logError(`Restore process failed with error: ${error.message}`);
        return;
      }
  
      if (stderr) {
        const lines = stderr.split("\n").filter((line) => line.trim());
        lines.forEach((line) => {
          if (line.includes("failed")) {
            logError(`Restore error: ${line}`);
          } else {
            logMessage(`Restore progress: ${line}`);
          }
        });
      }
  
      if (stdout) {
        logMessage(`Restore output: ${stdout}`);
      }
  
      logMessage("MongoDB restore successful.");
      if (callback) callback();
    });
  
    restoreProcess.on("exit", (code) => {
      if (code === 0) {
        logMessage("Restore process exited successfully.");
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