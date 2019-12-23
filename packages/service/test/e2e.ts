import * as path from 'path';
import * as fs from 'fs';
import { runProcess } from '@vuesion/utils';

const rimraf = require('rimraf');

describe('e2e tests for vuesion', () => {
  const cwd: string = path.resolve(__dirname, '../../create/bin');
  const testProject: string = path.resolve(__dirname, '../../create/bin/my-app');

  beforeAll(async () => {
    await runProcess('npm', ['link'], { cwd: path.resolve(__dirname, '..') });
    await runProcess('npm', ['link'], { cwd: path.resolve(__dirname, '../../create') });
    await runProcess('npm', ['link'], { cwd: path.resolve(__dirname, '../../webpack') });
    await runProcess('npm', ['link'], { cwd: path.resolve(__dirname, '../../utils') });
    await runProcess('npm', ['link'], { cwd: path.resolve(__dirname, '../../models') });
    await runProcess('lerna', ['bootstrap'], { cwd: path.resolve(__dirname, '..') });
  }, 30000);

  afterAll(() => {
    rimraf.sync(testProject);
  });

  it('should create a new project', async () => {
    await runProcess('node', ['cli', 'MY_APP', '--debug'], { cwd });
    expect(fs.existsSync(testProject)).toBeTruthy();

    await runProcess('npm', ['link', '@vuesion/service'], { cwd: testProject });
    await runProcess('npm', ['link', '@vuesion/webpack'], { cwd: testProject });
    await runProcess('npm', ['link', '@vuesion/utils'], { cwd: testProject });
    await runProcess('npm', ['link', '@vuesion/models'], { cwd: testProject });

    await runProcess('npm', ['run', 'build', '--', '--debug'], { cwd: testProject });
    expect(fs.existsSync(`${testProject}/dist`)).toBeTruthy();

    await runProcess('npm', ['run', 'storybook:build'], { cwd: testProject });
    expect(fs.existsSync(`${testProject}/storybook-static`)).toBeTruthy();

    await runProcess('npm', ['run', 'test'], { cwd: testProject });
    expect(fs.existsSync(`${testProject}/coverage`)).toBeTruthy();

    await runProcess('npm', ['run', 'clean'], { cwd: testProject });
    expect(fs.existsSync(`${testProject}/dist`)).toBeFalsy();
    expect(fs.existsSync(`${testProject}/storybook-static`)).toBeFalsy();
    expect(fs.existsSync(`${testProject}/coverage`)).toBeFalsy();
  }, 3000000);
});
