import { copyFile } from 'fs';

function saveLocally(filePath, destination) {
  copyFile(filePath, destination, (err) => {
    if (err) console.error('Error saving locally:', err);
    else console.log('Backup saved locally at:', destination);
  });
}

export default { saveLocally };
