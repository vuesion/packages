import * as fs from 'fs-extra';
import * as chalk from 'chalk';
import { Command, ICommandHandler, IRunOptions } from '../decorators/command';
import { prompt, QuestionCollection } from 'inquirer';
import { logErrorBold, logInfo, logSuccessBold } from '@vuesion/utils/dist/ui';
import { handleProcessError, runProcess } from '@vuesion/utils/dist/process';
import { runtimeRoot } from '@vuesion/utils/dist/path';

@Command({
  name: 'add',
  alias: 'a',
  description: 'Add a vuesion package to your project.',
  arguments: [{ name: 'package' }],
  options: [
    { flags: '-l, --link', description: 'Use npm link instead of npm install.', defaultValue: false },
    { flags: '-lo, --local', description: 'Install a local package relative to root folder.', defaultValue: false },
  ],
})
export class Add implements ICommandHandler {
  private questions: QuestionCollection = [
    {
      type: 'list',
      name: 'package',
      message: 'Which package do you want to add to your project?',
      choices: ['@vuesion/addon-contentful', '@vuesion/addon-firebase'],
    },
  ];

  public package: string;
  public link: boolean;
  public local: boolean;
  public templateSource: string;
  public templateDestination: string;
  public addonIndex: string;

  private async init() {
    let result: any = null;

    if (!this.package) {
      result = await prompt(this.questions);

      this.package = result.package;
    }

    this.templateSource = runtimeRoot(`node_modules/${this.package}/template`);
    this.addonIndex = runtimeRoot(`node_modules/${this.package}/dist/index.js`);
    this.templateDestination = runtimeRoot();

    if (this.local) {
      this.templateSource = runtimeRoot(`${this.package}/template`);
      this.addonIndex = runtimeRoot(`${this.package}/dist/index.js`);
    }
  }

  private async install(options: IRunOptions) {
    try {
      logInfo(`Installing ${chalk.bold(this.package)} into your project...`);

      await runProcess('npm', [this.link ? 'link' : 'install', '--save', this.package], { silent: true, ...options });
    } catch (e) {
      handleProcessError(e);
    }
  }

  private copyTemplate() {
    if (fs.existsSync(this.templateSource)) {
      logInfo(`Copying template into your project...`);

      fs.copy(this.templateSource, this.templateDestination, async (e) => {
        if (e) {
          logErrorBold(e);
        }
      });
    }
  }

  private async runAddOn() {
    try {
      logInfo(`Running add-on...`);

      await require(this.addonIndex).default();
    } catch (e) {
      handleProcessError(e);
    }
  }

  public async run(args: string[], options: IRunOptions) {
    await this.init();
    await this.install(options);

    await this.copyTemplate();
    await this.runAddOn();

    logSuccessBold(`✓ Package ${chalk.bold(this.package)} successfully installed`);
  }
}
