import * as path from 'path';
import * as fs from 'fs';

export const folderExists = (folder: string): boolean => {
  return fs.existsSync(path.resolve(folder));
};

export const ensureDirectoryExists = (filePath) => {
  const dirname = path.dirname(filePath);

  if (fs.existsSync(dirname)) {
    return true;
  }

  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
};
