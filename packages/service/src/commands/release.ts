import { Command, ICommandHandler } from '../lib/command';
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

  public async run(args: string[], silent: boolean) {
    let npmVersion = 'major';

    if (this.minor) {
      npmVersion = 'minor';
    } else if (this.patch) {
      npmVersion = 'patch';
    }

    Result(`Releasing new ${npmVersion} version...`);

    try {
      logInfo('Generating CHANGELOG.md...');

      await runProcess('changelog', args.filter((arg: string) => arg !== '--silent'), { silent });

      logInfo('Adding CHANGELOG.md...');

      await runProcess('git', ['add', 'CHANGELOG.md'], { silent });

      logInfo('Committing changes...');

      await runProcess('git', ['commit', '-m', 'chore: update changelog'], { silent });

      logInfo(`Releasing npm ${npmVersion} version...`);

      await runProcess('npm', ['version', npmVersion], { silent });

      logInfo('Pushing changes...');

      await runProcess('git', ['push', 'origin'], { silent });

      logInfo('Pushing tags...');

      await runProcess('git', ['push', 'origin', '--tags'], { silent });

      log('');

      Result('New version released.');
    } catch (e) {
      handleProcessError(e);
    }
  }
}
