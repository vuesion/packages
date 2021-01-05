import { ChildProcess, SpawnOptions } from 'child_process';
import { logError, Spinner } from './ui';
import Signals = NodeJS.Signals;

export interface IProcessOptions {
  cwd?: string;
  silent?: boolean;
  debug?: boolean;
}

export interface IProcessError {
  code: number;
  trace: string;
}

const spawn = require('cross-spawn');
const signals = [
  'SIGHUP',
  'SIGINT',
  'SIGQUIT',
  'SIGUSR1',
  'SIGUSR2',
  'SIGTERM',
  'SIGCONT',
  'SIGILL',
  'SIGTRAP',
  'SIGABRT',
  'SIGBUS',
  'SIGFPE',
  'SIGSEGV',
  'SIGPIPE',
  'SIGALRM',
  'SIGTSTP',
  'SIGTTIN',
  'SIGTTOU',
  'SIGPROF',
  'SIGSYS',
  'uncaughtException',
];
const processes = [];
const killProcesses = () => {
  processes.forEach((p: ChildProcess) => {
    p.kill();
  });
  process.exit(1);
};

signals.forEach((signal: Signals) => {
  process.on(signal, () => killProcesses());
});

export const runProcess = (name: string, args: string[] = [], options?: IProcessOptions): Promise<any> => {
  return new Promise((resolve: any, reject: any) => {
    options = Object.assign({ cwd: process.cwd(), silent: false, debug: false }, options);

    const localOptions: SpawnOptions = Object.assign(
      {
        detached: false,
        cwd: options.cwd,
        env: process.env,
      },
      options.silent === false || options.debug === true ? { stdio: 'inherit' as const } : {},
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
  });
};

export const handleProcessError = (err: IProcessError, spinner: Spinner = null) => {
  if (spinner) {
    spinner.stop(true);
  }

  if (err.code) {
    logError(`Exit with error code: ${err.code}`);
  }

  if (err.trace) {
    logError(`Trace:\n${err.trace}`);
  }

  killProcesses();

  process.exit(err.code);
};
