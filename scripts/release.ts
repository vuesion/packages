import * as fs from 'fs';
import * as path from 'path';
import { runProcess } from '../packages/utils/src';
import { getPackages, IPackage } from './Packages';
import { getGraph, INode } from './Graph';

const run = async () => {
  await runProcess('lerna', ['version', '--no-git-tag-version', '--no-push', '--force-publish'], {
    silent: false,
  });

  const lernaVersion = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../lerna.json')).toString()).version;
  const tagName = `v${lernaVersion}`;

  const packages = getPackages();
  const graph = getGraph();

  graph.walk((node: INode) => {
    const packageJson = packages.find((p: IPackage) => p.name === node.name);

    Object.keys(packageJson.dependencies).forEach(
      (key: string) => (packageJson.dependencies[key] = `^${lernaVersion}`),
    );
    Object.keys(packageJson.devDependencies).forEach(
      (key: string) => (packageJson.devDependencies[key] = `^${lernaVersion}`),
    );
    packageJson.version = lernaVersion;

    packageJson.save();
  });

  await runProcess('npm', ['run', 'build'], { silent: false });
  await runProcess('changelog', [], { silent: false });

  // clean change set
  await runProcess('git', ['add', '.'], { silent: false });
  await runProcess('git', ['commit', '--no-verify', '-m', tagName], { silent: false });
  await runProcess('git', ['push', 'origin'], { silent: false });

  // add Tag
  await runProcess('git', ['tag', '-a', tagName, '-m', tagName], { silent: false });
  await runProcess('git', ['push', 'origin', '--tags'], { silent: false });

  // publish packages
  await runProcess('lerna', ['publish', 'from-git'], { silent: false });
};

run().catch((e) => console.log(e)); // tslint:disable-line
