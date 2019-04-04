import { ChildProcess, SpawnOptions } from 'child_process';
import { logError, Spinner } from './ui';
import Signals = NodeJS.Signals;
import { IRunOptions } from '../lib/command';

interface IProcessOptions extends IRunOptions {
  cwd?: string;
  silent?: boolean;
}

interface IProcessError {
  code: number;
  trace: string;
}

const spawn = require('cross-spawn');
const processes = [];
const killProcesses = () => {
  processes.forEach((p: ChildProcess) => {
    p.kill();
  });
};

export const runProcess = (name: string, args: string[] = [], options?: IProcessOptions): Promise<any> => {
  return new Promise((resolve: any, reject: any) => {
    options = Object.assign({ cwd: process.cwd(), silent: false, debug: false }, options);

    const localOptions: SpawnOptions = Object.assign(
      {
        detached: true,
        cwd: options.cwd,
        env: process.env,
      },
      options.silent === false || options.debug === true ? { stdio: 'inherit' } : {},
    );
    const childProcess: any = spawn(name, args, localOptions);

    childProcess.on('exit', (code: number) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        const err: IProcessError = { code, trace: '' };
        reject(err);
      }
    });

    childProcess.on('error', (e) => {
      const err: IProcessError = { code: e.code, trace: e.toString() };
      reject(err);
    });

    processes.push(childProcess);

    ['SIGINT', 'SIGTERM'].forEach((signal: Signals) => {
      process.on(signal, () => {
        killProcesses();

        process.exit(1);
      });
    });

    process.on('uncaughtException', (e) => handleProcessError({ code: 1, trace: e.message }));
  });
};

export const handleProcessError = (err: IProcessError, spinner: Spinner = null) => {
  if (spinner) {
    spinner.stop(true);
  }

  logError(`Exit with error code: ${err.code}\n\nTrace:\n${err.trace}`);

  killProcesses();

  process.exit(err.code);
};
