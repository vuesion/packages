import { Project } from 'ts-morph';
import { runtimeRoot } from '@vuesion/utils';

export const project = new Project({
  tsConfigFilePath: runtimeRoot('tsconfig.json'),
});
