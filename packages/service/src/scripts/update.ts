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
const deleteFile = (status: string, filePath: string, idx: number) => {
  return new Promise((resolve) => {
    fs.unlink(filePath, () => {
      logError(`${idx} - ${status}: ${filePath}`);

      resolve(null);
    });
  });
};
const renameFile = (status: string, oldPath: string, newPath: string, idx: number) => {
  return new Promise((resolve) => {
    fs.rename(oldPath, newPath, () => {
      logInfo(`${idx} - ${status}: ${oldPath} --> ${newPath}`);

      resolve(null);
    });
  });
};
const downloadFinished = (status: string, filePath: string, idx: number) => {
  switch (status) {
    case 'added':
      logSuccess(`${idx} - ${status}: ${filePath}`);
      break;
    case 'modified':
      console.log(`${idx} - ${status}: ${filePath}`);
      break;
    default:
      log(`${idx} - ${status}: ${filePath}`);
  }
};
const downloadFile = async (status: string, filePath: string, url: string, idx: number) => {
  return new Promise((resolve) => {
    ensureDirectoryExists(filePath);
    const file = fs.createWriteStream(filePath);

    https
      .get(url, (response: any) => {
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          downloadFinished(status, filePath, idx);
          resolve(null);
        });
      })
      .on('error', () => {
        deleteFile(status, filePath, idx);
        resolve(null);
      });
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
const handleFile = async (diffFile: IFile, dest: string, url: string, idx: number) => {
  if (diffFile.status === 'removed') {
    await deleteFile(diffFile.status, dest, idx);
  } else if (diffFile.status === 'renamed') {
    await renameFile(diffFile.status, runtimeRoot(diffFile.previous_filename), dest, idx);
  } else {
    await downloadFile(diffFile.status, dest, url, idx);
  }
};
const handleFiles = async (diffFiles: IFile[], branch: string) => {
  for (let i = 0; i < diffFiles.length; i++) {
    const idx = i + 1;
    const diffFile = diffFiles[i];
    const dest: string = runtimeRoot(diffFile.filename);
    const url = `https://raw.githubusercontent.com/vuesion/vuesion/${branch}/${diffFile.filename}`;

    if (shouldProcessFile(diffFile)) {
      await handleFile(diffFile, dest, url, idx);
    } else {
      log(`${idx} - skipping: ${dest}`);
    }
  }
};
const updateVersion = (next: boolean, latestVersion: string) => {
  if (next === false) {
    VuesionConfig.load();
    VuesionConfig.updateCurrentVersion(latestVersion);
  }
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

    logInfo(`Processing ${diffResponse.data.files.length} files...`);

    await handleFiles(diffResponse.data.files, next ? 'next' : 'master');

    updateVersion(next, latestVersion);
  } catch (e) {
    logErrorBold(e);
  }
}
