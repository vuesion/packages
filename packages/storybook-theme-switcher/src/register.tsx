import React from 'react';
import { addons, types } from '@storybook/manager-api';
import { ThemeSwitcher } from './ThemeSwitcher';

const ADDON_ID = 'theme-switcher';

addons.register(ADDON_ID, (api) => {
  const render = () => {
    return <ThemeSwitcher api={api} />;
  };
  const title = 'themes';

  addons.add(ADDON_ID, {
    title,
    type: types.TOOL,
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render,
  });
});
