import { Command, ICommandHandler } from '../decorators/command';
import { VuesionConfig } from '@vuesion/models';

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

  public async run(args: string[]) {
    if (this.staged) {
      prettyQuick(args);
    } else {
      prettier(args, this.pattern);
    }
  }
}

const prettier = (args: string[], pattern: string) => {
  args = [
    '--config',
    '.prettierrc',
    '--ignore-path',
    '.prettierignore',
    '--write',
    pattern ? pattern : `./**/*.{${VuesionConfig.prettier.extensions}}`,
  ];

  process.argv.pop();

  process.argv = process.argv.concat(args);

  require('prettier/bin-prettier.js');
};

const prettyQuick = (args: string[]) => {
  args = ['--staged'].concat(args);

  process.argv = process.argv.concat(args);

  require('pretty-quick/bin/pretty-quick.js');
};
