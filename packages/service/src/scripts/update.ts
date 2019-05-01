import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as https from 'https';
import { Config, configPath } from '../models/Config';
import { runtimeRoot, ensureDirectoryExists } from '../utils/path';
import { log, logError, logErrorBold, logInfoBold, logSuccess, Result } from '../utils/ui';

interface IFile {
  filename: string;
  status: string;
  previous_filename: string;
}

const vuesionRepo: string = 'https://api.github.com/repos/vuesion/vuesion';
const deleteFile = (status: string, filePath: string) => {
  try {
    fs.unlinkSync(filePath);
    logError(`${status}: ${filePath}`);
  } catch (e) {
    logErrorBold(e.message);
  }
};
const renameFile = (status: string, oldPath: string, newPath: string) => {
  try {
    fs.renameSync(oldPath, newPath);
    logInfoBold(`${status}: ${oldPath} --> ${newPath}`);
  } catch (e) {
    logErrorBold(e.message);
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

const handleFiles = (diffFiles: IFile[]) => {
  diffFiles.forEach((diffFile: IFile) => {
    const dest: string = runtimeRoot(diffFile.filename);
    const url: string = `https://raw.githubusercontent.com/vuesion/vuesion/master/${diffFile.filename}`;

    if (diffFile.status === 'removed') {
      deleteFile(diffFile.status, dest);
    } else if (diffFile.status === 'renamed') {
      renameFile(diffFile.status, runtimeRoot(diffFile.previous_filename), dest);
    } else {
      downloadFile(diffFile.status, dest, url);
    }
  });
};

export async function run() {
  try {
    const tagsResponse: AxiosResponse<any> = await axios.get(`${vuesionRepo}/tags`);
    const latestVersion: string = tagsResponse.data[0].name;
    const currentVersion: string = Config.currentVersion;

    if (latestVersion === currentVersion) {
      Result(`Your project is up to date (Version: ${currentVersion}).`);
      return;
    }

    Result(`Update from version: ${currentVersion} to version: ${latestVersion}.`);

    const diffResponse: AxiosResponse<any> = await axios.get(
      `${vuesionRepo}/compare/${currentVersion}...${latestVersion}`,
    );

    handleFiles(diffResponse.data.files);

    Config.currentVersion = latestVersion;

    fs.writeFileSync(configPath, JSON.stringify(Config, null, 2));
  } catch (e) {
    logErrorBold(e);
  }
}
