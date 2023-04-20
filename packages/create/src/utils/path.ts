import * as path from 'path';

export const packagesRoot = () => {
  return path.join(__dirname, '..', '..');
};

export const runtimeRoot = (dir: any = '') => {
  return path.join(process.cwd(), dir);
};
