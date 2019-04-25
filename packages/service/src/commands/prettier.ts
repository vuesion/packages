import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { Config } from '../models/Config';

@Command({
  name: 'prettier',
  description: 'Format project files.',
  options: [
    { flags: '-p, --pattern <pattern>', description: 'Match file pattern' },
    { flags: '-s, --staged', description: 'O≈nly prettify staged files' },
  ],
})
export class Prettier implements ICommandHandler {
  public pattern: string;
  public staged: boolean;

  public async run(args: string[], options: IRunOptions) {
    if (this.staged) {
      prettyQuick(args, options);
    } else {
      prettier(args, this.pattern, options);
    }
  }
}

const prettier = async (args: string[], pattern: string, options: IRunOptions) => {
  args = [
    '--config',
    '.prettierrc',
    '--ignore-path',
    '.prettierignore',
    '--write',
    pattern ? pattern : `./**/*.{${Config.prettier.extensions}}`,
  ];

  try {
    await runProcess('prettier', args, options);
  } catch (e) {
    handleProcessError(e);
  }
};

const prettyQuick = async (args: string[], options: IRunOptions) => {
  args = ['--staged'].concat(args);

  try {
    await runProcess('pretty-quick', args, options);
  } catch (e) {
    handleProcessError(e);
  }
};
