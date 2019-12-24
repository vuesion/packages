import * as fs from 'fs-extra';
import * as chalk from 'chalk';
import { Command, ICommandHandler, IRunOptions } from '../decorators/command';
import { prompt, QuestionCollection } from 'inquirer';
import { logErrorBold, Spinner } from '@vuesion/utils/dist/ui';
import { handleProcessError, runProcess } from '@vuesion/utils/dist/process';
import { runtimeRoot } from '@vuesion/utils/dist/path';

@Command({
  name: 'add',
  alias: 'a',
  description: 'Add a vuesion package to your project.',
  arguments: [{ name: 'package' }],
})
export class Add implements ICommandHandler {
  private questions: QuestionCollection = [
    {
      type: 'list',
      name: 'package',
      message: 'Which package do you want to add to your project?',
      choices: ['@vuesion/addon-contentful'],
    },
  ];

  public package: string;
  public templateSource: string;
  public templateDestination: string;
  public addonIndex: string;
  public spinner = new Spinner();

  private async init() {
    let result: any = null;

    if (!this.package) {
      result = await prompt(this.questions);

      this.package = result.package;
    }

    this.templateSource = runtimeRoot(`node_modules/${this.package}/template`);
    this.addonIndex = runtimeRoot(`node_modules/${this.package}/dist/index.js`);
    this.templateDestination = runtimeRoot();
  }

  private async install(options: IRunOptions) {
    try {
      await runProcess('npm', ['link', '--save', this.package], { silent: true, ...options });
    } catch (e) {
      this.spinner.stop();
      handleProcessError(e);
    }
  }

  private copyTemplate() {
    if (fs.existsSync(this.templateSource)) {
      fs.copy(this.templateSource, this.templateDestination, async (e) => {
        if (e) {
          this.spinner.stop();
          logErrorBold(e);
        }
      });
    }
  }

  private async runAddOn() {
    return await require(this.addonIndex).default();
  }

  public async run(args: string[], options: IRunOptions) {
    await this.init();

    this.spinner.message = `Installing ${chalk.bold(this.package)} into your project...`;
    this.spinner.start();

    await this.install(options);
    await this.copyTemplate();
    await this.runAddOn();

    this.spinner.message = `Package ${chalk.bold(this.package)} successfully installed`;
    this.spinner.stop();
  }
}
