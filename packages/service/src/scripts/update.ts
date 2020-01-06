import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as https from 'https';
import { runtimeRoot } from '@vuesion/utils/dist/path';
import { ensureDirectoryExists } from '@vuesion/utils/dist/fileSystem';
import { log, logError, logErrorBold, logInfo, logSuccess, Result } from '@vuesion/utils/dist/ui';
import { VuesionConfig } from '@vuesion/models';

interface IFile {
  raw_url: string;
  filename: string;
  status: string;
  previous_filename: string;
}

const vuesionRepo = 'https://api.github.com/repos/vuesion/vuesion';
const deleteFile = (status: string, filePath: string) => {
  fs.unlinkSync(filePath);
  logError(`${status}: ${filePath}`);
};
const renameFile = (status: string, oldPath: string, newPath: string) => {
  try {
    fs.renameSync(oldPath, newPath);
    logInfo(`${status}: ${oldPath} --> ${newPath}`);
  } catch (e) {
    logErrorBold(`error: ${oldPath} --> ${newPath}`);
  }
};
const downloadFile = (status: string, filePath: string, url: string) => {
  ensureDirectoryExists(filePath);
  const file = fs.createWriteStream(filePath);

  const done = () => {
    switch (status) {
      case 'added':
        logSuccess(`${status}: ${filePath}`);
        break;
      case 'modified':
        log(`${status}: ${filePath}`);
        break;
      default:
        log(`${status}: ${filePath}`);
    }
  };

  https
    .get(url, (response: any) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        done();
      });
    })
    .on('error', () => {
      deleteFile(status, filePath);
    });
};
const shouldProcessFile = (diffFile: IFile) => {
  const foldersToNotSync = [
    '.circleci/',
    '.github/',
    'cypress/',
    'i18n/',
    'src/app/config',
    'src/app/example',
    'src/app/home',
    'src/server/routes/CounterRoutes.ts',
    'src/server/routes/DemoRoutes.ts',
    'src/static',
    '.all-contributorsrc',
    'CHANGELOG.md',
    'CODE_OF_CONDUCT.md',
    'LICENSE',
    'README.md',
  ];
  let process = true;

  foldersToNotSync.forEach((folder) => {
    if (diffFile.filename.toLowerCase().indexOf(folder.toLowerCase()) > -1 && process === true) {
      process = false;
    }
  });

  return process;
};
const handleFiles = (diffFiles: IFile[], branch: string) => {
  diffFiles.forEach((diffFile: IFile) => {
    if (shouldProcessFile(diffFile)) {
      const dest: string = runtimeRoot(diffFile.filename);
      const url = `https://raw.githubusercontent.com/vuesion/vuesion/${branch}/${diffFile.filename}`;

      if (diffFile.status === 'removed') {
        deleteFile(diffFile.status, dest);
      } else if (diffFile.status === 'renamed') {
        renameFile(diffFile.status, runtimeRoot(diffFile.previous_filename), dest);
      } else {
        downloadFile(diffFile.status, dest, url);
      }
    }
  });
};

export async function run(next = false) {
  try {
    const tagsResponse: AxiosResponse = await axios.get<any>(`${vuesionRepo}/tags`);
    const latestVersion: string = next ? 'next' : tagsResponse.data[0].name;
    const currentVersion: string = VuesionConfig.currentVersion;

    if (latestVersion === currentVersion) {
      Result(`Your project is up to date (Version: ${currentVersion}).`);
      return;
    }

    Result(`Update from version: ${currentVersion} to version: ${latestVersion}.`);

    const diffUrl = next
      ? `${vuesionRepo}/compare/master...next`
      : `${vuesionRepo}/compare/${currentVersion}...${latestVersion}`;

    const diffResponse: AxiosResponse = await axios.get<any>(diffUrl);

    handleFiles(diffResponse.data.files, next ? 'next' : 'master');

    setTimeout(() => {
      VuesionConfig.load();
      VuesionConfig.updateCurrentVersion(latestVersion);
    }, 1000);
  } catch (e) {
    logErrorBold(e);
  }
}
