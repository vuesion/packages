import { prompt } from 'inquirer';
import { runProcess } from '@vuesion/utils';
import { App } from './App';

const cleanUp = async () => {
  await runProcess('npm', ['uninstall', '--save', '@vuesion/addon-vuetify'], { silent: true });
};

const askForTesting = async () => {
  const result = await prompt([
    {
      type: 'confirm',
      name: 'test',
      message: `Do you want to test Vuetify?`,
    },
  ]);

  if (result.test) {
    await runProcess('npm', ['run', 'dev'], { silent: false });
  }
};

export default async () => {
  await runProcess('npm', ['install', '--save', 'vuetify'], { silent: true });
  await runProcess('npm', ['install', '--save-dev', '@mdi/font'], {
    silent: true,
  });

  const app = new App();
  app.transform();

  await cleanUp();

  await askForTesting();
};
