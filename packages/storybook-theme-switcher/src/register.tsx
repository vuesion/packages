import React from 'react';
import addons, { types } from '@storybook/addons';
import { ThemeSwitcher } from './ThemeSwitcher';

const ADDON_ID = 'theme-switcher';

addons.register(ADDON_ID, (api) => {
  const render = () => <ThemeSwitcher api={api} />;
  const title = 'themes';

  addons.add(ADDON_ID, {
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story',
    title,
    render,
  });
});
