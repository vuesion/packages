import { kebabCase, snakeCase as _snakeCase } from 'lodash';

export const dashCase = (text: string) => {
  return kebabCase(text);
};

export const snakeCase = (text: string) => {
  return _snakeCase(text);
};

export const constantCase = (text: string) => {
  return _snakeCase(text).toUpperCase();
};
