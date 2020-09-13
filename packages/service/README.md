# `@vuesion/service`

> This service includes tasks and tools that are used by the [vuesion project](https://github.com/vuesion/vuesion)

# Installation

```
npm i -D --save-exact @vuesion/service
```

# Usage

Please make sure to have the contents from **[this .vuesion folder](https://github.com/vuesion/vuesion/tree/master/.vuesion)** in the root directory of your project.

```
Usage: vuesion [options] [command]

vuesion service for development tasks

Options:
  -v, --version             output the version number
  -d, --debug               Show debugging output. (default: false)
  -h, --help                Output usage information.

Commands:
  clean                     Clean up the project directory.
  e2e|e                     Run e2e tests with cypress.io. All cypress CLI options are supported.
  extract-i18n-messages|em  Extract i18n default messages from .vue files.
  generate|g                Generate Components, Connected Components or Modules.
  lint|l                    Lint project files.
  parallel|p [commands...]  Run commands in parallel.
  post-install <options>    Separate steps that run after creating a new vuesion app.
  prettier [options]        Format project files.
  release|r [options]       Generate changelog, release new npm version add new git tag.
  statistics|s              Generate a report for certain project management KPIs.
  storybook [options]       Run Storybook.
  test|t [options]          Run unit-tests with jest. All Jest CLI options are supported.
  update|u [options]        Update your local copy of vuesion.
  help [command]            display help for command

```
