import { ChildProcess, SpawnOptions } from 'child_process';
import { logError, Spinner } from './ui';
import Signals = NodeJS.Signals;

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

export const runProcess = (
  name: string,
  args: string[] = [],
  options: { cwd?: string; silent?: boolean } = {},
): Promise<any> => {
  return new Promise((resolve: any, reject: any) => {
    const silent = options.silent === undefined ? false : options.silent;

    const localOptions: SpawnOptions = {
      detached: true,
      cwd: options.cwd ? options.cwd : process.cwd(),
      env: process.env,
    };

    if (!silent) {
      localOptions.stdio = 'inherit';
    }

    const childProcess: any = spawn(name, args, localOptions);
    let trace = '';

    if (silent) {
      childProcess.stdout.on('data', (data: any) => {
        trace += data;
      });
      childProcess.stderr.on('data', (data: any) => {
        trace += data;
      });
    }

    childProcess.on('exit', (code: number) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        const err: IProcessError = { code, trace };
        reject(err);
      }
    });

    childProcess.on('error', (e) => {
      const err: IProcessError = { code: e.code, trace: e.toString() };
      reject(err);
    });

    processes.push(childProcess);

    [
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
    ].forEach((signal: Signals) => {
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
