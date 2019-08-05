import * as fs from 'fs-extra';
import chalk from 'chalk';
import { Command, ICommandHandler, IRunOptions } from '../decorators/command';
import { prompt, QuestionCollection } from 'inquirer';
import { logErrorBold, Spinner } from '@vuesion/utils/dist/ui';
import { handleProcessError, runProcess } from '@vuesion/utils/dist/process';
import { runtimeRoot } from '@vuesion/utils/dist/path';
const opn = require('open');

@Command({
  name: 'add',
  alias: 'a',
  description: 'Add a vuesion package to your project.',
})
export class Add implements ICommandHandler {
  private questions: QuestionCollection = [
    {
      type: 'list',
      name: 'package',
      message: 'Which package do you want to add to your project?',
      choices: ['addon-contentful'],
    },
  ];

  public async run(args: string[], options: IRunOptions) {
    let result: any = await prompt(this.questions);
    const packageName = result.package;
    const dependencyName = `@vuesion/${packageName}`;
    const source = runtimeRoot(`node_modules/${dependencyName}/template`);
    const destination = runtimeRoot();
    const spinner = new Spinner();

    spinner.message = `Installing ${chalk.bold(dependencyName)} into your project...`;
    spinner.start();

    try {
      await runProcess('npm', ['install', '--save', dependencyName], { silent: true, ...options });
    } catch (e) {
      spinner.stop();
      handleProcessError(e);
    }

    if (fs.existsSync(source)) {
      fs.copy(source, destination, async (e) => {
        if (e) {
          spinner.stop();
          logErrorBold(e);
        } else {
          spinner.message = `Package ${chalk.bold(dependencyName)} successfully installed`;
          spinner.stop();

          this.questions = [
            {
              type: 'confirm',
              name: 'open',
              message: 'Do you want to open the package documentation?',
              default: true,
            },
          ];

          result = await prompt(this.questions);

          if (result.open) {
            try {
              await opn(`https://github.com/vuesion/packages/tree/master/packages/${packageName}`, {
                wait: false,
              });
            } catch (e) {
              logErrorBold(e);
            }
          }
        }
      });
    }
  }
}
