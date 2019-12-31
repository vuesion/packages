import * as fs from 'fs';
import { prompt } from 'inquirer';
import * as hasBin from 'hasbin';
import * as client from 'firebase-tools';
import { sync } from 'rimraf';
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

const getProject = async () => {
  let projects: any[] = [];

  try {
    projects = await client.list();
  } catch (e) {
    logError(e);
  }

  projects = projects.map((p: any) => p.id);
  projects.unshift({ name: 'Create new Firebase project', value: 'new' });

  const project = await prompt([
    {
      type: 'list',
      name: 'project',
      message: `Please select a project?`,
      choices: projects,
    },
  ]);

  if (project.project === 'new') {
    await runProcess('firebase', ['projects:create'], { silent: false });
    return await getProject();
  } else {
    return project.project;
  }
};

const getDeployment = async () => {
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

  return deployment.deployment;
};

const addToGitIgnore = () => {
  fs.appendFileSync(runtimeRoot('.gitignore'), '.firebase/\n');
  fs.appendFileSync(runtimeRoot('.gitignore'), 'firebase-debug.log');
};

const setup = async () => {
  const hasFirebase = hasBin.sync('firebase');

  if (hasFirebase === false) {
    await fireBasePrompt();
  }

  await runProcess('firebase', ['login'], { silent: false });

  const project = await getProject();
  const deployment = await getDeployment();

  addToGitIgnore();

  return { project, deployment };
};

const addGitIgnore = () => {
  fs.writeFileSync(
    runtimeRoot('./functions/.gitignore'),
    `## Compiled JavaScript files
**/*.js
**/*.js.map

# Typescript v1 declaration files
typings/

node_modules/
.vuesion/
dist/
i18n/
`,
    'utf-8',
  );
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
  delete FunctionsPackage.model.dependencies['@vuesion/addon-firebase'];
  FunctionsPackage.save(true);

  VuesionPackage.model.scripts.build = 'vuesion build && cd ./functions && npm run build';
  VuesionPackage.model.scripts.postinstall = 'cd ./functions && npm i';
  VuesionPackage.save(true);

  addGitIgnore();

  TsConfig.model.include.push('./functions/**/*');
  TsConfig.save(true);
};

const spa = async () => {
  sync(runtimeRoot('./functions'));

  delete FireBaseJSON.model.functions;
  FireBaseJSON.model.hosting.public = VuesionConfig.outputDirectory;
  FireBaseJSON.model.hosting.rewrites = [
    {
      source: '**',
      destination: '/index.html',
    },
  ];
  FireBaseJSON.save(true);
};

const loadFiles = () => {
  FireBaseRc.load();
  FireBaseJSON.load();
  ProductionConfig.load();
  FunctionsPackage.load();
  TsConfig.load();
};

const setProjectToFirebaseRc = (project: string) => {
  FireBaseRc.model.projects.default = project;
  FireBaseRc.save(true);
};

const setProductionUrl = (project: string) => {
  ProductionConfig.model.api.baseUrl = `https://${project}.firebaseio.com/`;
  ProductionConfig.save(true);
};

const addFirebaseScripts = (deployment: string) => {
  VuesionPackage.model.scripts['prefirebase:serve'] = `npm run build${deployment === 'spa' ? ':spa' : ''}`;
  VuesionPackage.model.scripts['firebase:serve'] = 'firebase serve -p 5000';
  VuesionPackage.model.scripts.deploy = 'firebase deploy';
  VuesionPackage.save(true);
};

const cleanUp = async () => {
  await runProcess('npm', ['uninstall', '--save', '@vuesion/addon-firebase'], { silent: true });
  await runProcess('npm', ['install'], { silent: true });
};

const askForTesting = async () => {
  const result = await prompt([
    {
      type: 'confirm',
      name: 'test',
      message: `Do you want to test Firebase locally?`,
    },
  ]);

  if (result.test) {
    await runProcess('npm', ['run', 'firebase:serve'], { silent: false });
  }
};

export default async () => {
  const { project, deployment } = await setup();

  loadFiles();
  setProjectToFirebaseRc(project);
  setProductionUrl(project);
  addFirebaseScripts(deployment);

  if (deployment === 'ssr') {
    await ssr();
  } else {
    await spa();
  }

  await cleanUp();

  await askForTesting();
};
