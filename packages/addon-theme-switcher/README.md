# `@vuesion/addon-theme-switcher`

> storybook addon to switch themes in the [vuesion project](https://github.com/vuesion/vuesion)

# Usage

`addons.js`
```
import '@vuesion/addon-theme-switcher/register'
```

`config.js`
```
addParameters({
  themeSwitcher: {
    themes: [{ label: 'Light Theme', value: 'light' }, { label: 'Dark Theme', value: 'dark' }],
  },
});
```