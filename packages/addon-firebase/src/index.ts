import * as fs from 'fs';
import { prompt } from 'inquirer';
import * as hasBin from 'hasbin';
import * as client from 'firebase-tools';
import { runProcess, runtimeRoot, logError, logSuccessBold } from '@vuesion/utils';
import { VuesionConfig, VuesionPackage } from '@vuesion/models';
import { FireBaseRc } from './FirebaseRc';
import { FireBaseJSON } from './FirebaseJSON';
import { ProductionConfig } from './ProductionConfig';
import { FunctionsPackage } from './FunctionsPackage';
import { TsConfig } from './TsConfig';

const fireBasePrompt = async () => {
  const result = await prompt([
    {
      type: 'confirm',
      name: 'firebase',
      message: `You don't have the Firebase CLI installed, do you want to install it?`,
    },
  ]);

  if (result.firebase) {
    await runProcess('npm', ['install', '-g', 'firebase-tools'], { silent: true });
    logSuccessBold(`✓ Firebase CLI successfully installed`);
  }
};

const fireBaseCreateProject = async () => {
  const result = await prompt([
    {
      type: 'confirm',
      name: 'create',
      message: `You don't have any Firebase Projects, do you want to create one?`,
    },
  ]);

  if (result.create) {
    await runProcess('firebase', ['projects:create'], { silent: false });
  }
};

const setup = async () => {
  const hasFirebase = hasBin.sync('firebase');

  if (hasFirebase === false) {
    await fireBasePrompt();
  }

  await runProcess('firebase', ['login'], { silent: false });

  let projects: string[] = [];

  try {
    projects = await client.list();
  } catch (e) {
    logError(e);
  }

  if (projects.length === 0) {
    await fireBaseCreateProject();
  }

  const project = await prompt([
    {
      type: 'list',
      name: 'project',
      message: `Please select a project?`,
      choices: projects.map((p: any) => p.id),
    },
  ]);

  const deployment = await prompt([
    {
      type: 'list',
      name: 'deployment',
      message: `Which kind of deployment do you want?`,
      default: 'ssr',
      choices: [
        { name: 'Dynamic with server-side-rendering', value: 'ssr' },
        { name: 'Static Single Page Application', value: 'spa' },
      ],
    },
  ]);

  fs.appendFileSync(runtimeRoot('.gitignore'), '.firebase/\n');
  fs.appendFileSync(runtimeRoot('.gitignore'), 'firebase-debug.log');

  return { project: project.project, deployment: deployment.deployment };
};

const ssr = async () => {
  FireBaseJSON.model.hosting.public = VuesionConfig.outputDirectory;
  FireBaseJSON.model.hosting.rewrites = [
    {
      source: '**',
      function: 'vuesionApp',
    },
  ];
  FireBaseJSON.save(true);

  FunctionsPackage.model.dependencies = {
    ...FunctionsPackage.model.dependencies,
    ...VuesionPackage.model.dependencies,
  };
  FunctionsPackage.save(true);

  VuesionPackage.model.scripts.build = 'vuesion build && cd ./functions && npm run build';
  VuesionPackage.model.scripts.postinstall = 'cd ./functions && npm i';
  VuesionPackage.model.scripts['firebase:serve'] = 'firebase serve -p 3000';
  VuesionPackage.save(true);

  TsConfig.model.include.push('./functions/**/*');
  TsConfig.save(true);
};

const spa = async () => {
  FireBaseJSON.model.hosting.public = VuesionConfig.outputDirectory;
  FireBaseJSON.model.hosting.rewrites = [
    {
      source: '**',
      destination: '/index.html',
    },
  ];
  FireBaseJSON.save(true);
};

export default async () => {
  const { project, deployment } = await setup();

  FireBaseRc.load();
  FireBaseJSON.load();
  ProductionConfig.load();
  FunctionsPackage.load();
  TsConfig.load();

  FireBaseRc.model.projects.default = project;
  FireBaseRc.save(true);

  ProductionConfig.model.api.baseUrl = `https://${project}.firebaseio.com/`;
  ProductionConfig.save(true);

  VuesionPackage.scripts.deploy = 'firebase deploy';
  VuesionPackage.save(true);

  if (deployment === 'ssr') {
    await ssr();
  } else {
    await spa();
  }

  await runProcess('npm', ['uninstall', '--save', '@vuesion/addon-firebase'], { silent: true });
  await runProcess('npm', ['install'], { silent: true });

  const result = await prompt([
    {
      type: 'confirm',
      name: 'test',
      message: `To you want to test Firebase locally?`,
    },
  ]);

  if (result.test) {
    if (deployment === 'ssr') {
      await runProcess('npm', ['run', 'build'], { silent: false });
      return await runProcess('npm', ['run', 'firebase:serve'], { silent: false });
    } else {
      await runProcess('npm', ['run', 'build:spa'], { silent: false });
      return await runProcess('firebase', ['serve'], { silent: false });
    }
  }

  return Promise.resolve();
};
