import { Command, ICommandHandler } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { Config } from '../models/Config';

@Command({
  name: 'prettier',
  alias: 'p',
  description: 'Format project files.',
  options: [
    { flags: '-p, --pattern <pattern>', description: 'Match file pattern' },
    { flags: '-s, --staged', description: 'O≈nly prettify staged files' },
  ],
})
export class Prettier implements ICommandHandler {
  public pattern: string;
  public staged: boolean;

  public async run(args: string[], silent: boolean) {
    if (this.staged) {
      prettyQuick(args, silent);
    } else {
      prettier(args, this.pattern, silent);
    }
  }
}

const prettier = async (args: string[], pattern: string, silent: boolean) => {
  args = [
    '--config',
    '.prettierrc',
    '--ignore-path',
    '.prettierignore',
    '--write',
    pattern ? pattern : `./**/*.{${Config.prettier.extensions}}`,
  ];

  try {
    await runProcess('vuesion', ['clean'], { silent });

    await runProcess('prettier', args, { silent });
  } catch (e) {
    handleProcessError(e);
  }
};

const prettyQuick = async (args: string[], silent: boolean) => {
  args = ['--staged'].concat(args);

  try {
    await runProcess('pretty-quick', args, { silent });
  } catch (e) {
    handleProcessError(e);
  }
};
