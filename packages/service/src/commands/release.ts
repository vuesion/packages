import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { log, logInfo, Result } from '../utils/ui';

@Command({
  name: 'release',
  alias: 'r',
  description: 'Generate changelog, release new npm version add new git tag.',
  options: [
    { flags: '-M, --major', description: 'Release new major version' },
    { flags: '-m, --minor', description: 'Release new minor version' },
    { flags: '-p, --patch', description: 'Release new patch version' },
  ],
})
export class Release implements ICommandHandler {
  public major: boolean;
  public minor: boolean;
  public patch: boolean;

  public async run(args: string[], options: IRunOptions) {
    let npmVersion = 'major';

    if (this.minor) {
      npmVersion = 'minor';
    } else if (this.patch) {
      npmVersion = 'patch';
    }

    Result(`Releasing new ${npmVersion} version...`);

    try {
      logInfo('Generating CHANGELOG.md...');

      await runProcess('changelog', args.filter((arg: string) => arg !== '--silent'), { silent: true, ...options });

      logInfo('Adding CHANGELOG.md...');

      await runProcess('git', ['add', 'CHANGELOG.md'], { silent: true, ...options });

      logInfo('Committing changes...');

      await runProcess('git', ['commit', '-m', 'chore: update changelog'], { silent: true, ...options });

      logInfo(`Releasing npm ${npmVersion} version...`);

      await runProcess('npm', ['version', npmVersion], { silent: true, ...options });

      logInfo('Pushing changes...');

      await runProcess('git', ['push', 'origin'], { silent: true, ...options });

      logInfo('Pushing tags...');

      await runProcess('git', ['push', 'origin', '--tags'], { silent: true, ...options });

      log('');

      Result('New version released.');
    } catch (e) {
      handleProcessError(e);
    }
  }
}
