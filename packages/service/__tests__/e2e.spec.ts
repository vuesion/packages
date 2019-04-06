import * as path from 'path';
import * as fs from 'fs';
import { runProcess } from '../src/utils/process';

describe('e2e tests for vuesion', () => {
  const cwd: string = path.resolve(__dirname, '../bin');
  const testProject: string = path.resolve(__dirname, '../bin/tmp');

  beforeAll(async () => {
    await runProcess('npm', ['link'], { cwd: path.resolve(__dirname, '..') });
  }, 30000);

  it('should create a new project', async () => {
    await runProcess('node', ['cli', 'create', 'tmp'], { cwd });
    expect(fs.existsSync(cwd + '/tmp')).toBeTruthy();

    await runProcess('npm', ['link', '@vuesion/service'], { cwd: testProject });

    await runProcess('npm', ['run', 'build'], { cwd: testProject });
    expect(fs.existsSync(cwd + '/tmp/dist')).toBeTruthy();

    await runProcess('npm', ['run', 'storybook:build'], { cwd: testProject });
    expect(fs.existsSync(cwd + '/tmp/storybook-static')).toBeTruthy();

    await runProcess('npm', ['run', 'test'], { cwd: testProject });
    expect(fs.existsSync(cwd + '/tmp/coverage')).toBeTruthy();

    await runProcess('npm', ['run', 'clean'], { cwd: testProject });
    expect(fs.existsSync(cwd + '/tmp/dist')).toBeFalsy();
    expect(fs.existsSync(cwd + '/tmp/storybook-static')).toBeFalsy();
    expect(fs.existsSync(cwd + '/tmp/coverage')).toBeFalsy();
  }, 3000000);
});
