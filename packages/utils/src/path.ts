import * as path from 'path';

export const packagesRoot = (packageName: string, dir: any = '') => {
  return path.join(__dirname, '..', '..', packageName, dir);
};

export const runtimeRoot = (dir: any = '') => {
  return path.join(process.cwd(), dir);
};
