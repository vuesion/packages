import * as path from 'path';
import * as fs from 'fs';

export const packageRoot = (dir: any = '') => {
  return path.join(__dirname, '../../', dir);
};

export const runtimeRoot = (dir: any = '') => {
  return path.join(process.cwd(), dir);
};

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
