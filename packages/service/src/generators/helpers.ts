export const dashCase = (text: string) => {
  return text.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
};

export const snakeCase = (text: string) => {
  return text.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();
};

export const constantCase = (text: string) => {
  return text.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toUpperCase();
};
