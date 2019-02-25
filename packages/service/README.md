# `@vuesion/service`

> This service includes tasks and tools that are used by the [vue-starter project](https://github.com/devCrossNet/vue-starter)

# Installation

```
npm i -D --save-exact @vuesion/service
```

# Usage

Please make sure to have the contents from **[this .vuesion folder](https://github.com/devCrossNet/vue-starter/tree/master/.vuesion)** in the root directory of your project.

```
Usage: vuesion [options] [command]

vuesion service for development tasks

Options:
  -v, --version              output the version number
  -s, --silent               silence output.
  -h, --help                 output usage information

Commands:
  add|a                      Add a vuesion package to your project.
  build|b [options]          Build project for production.
  clean                      Clean up the project directory.
  create|c [options] [name]  Create a new vue-starter project.
  dev|d [options]            Serve application for development.
  e2e|e                      Run e2e tests with cypress.io. All cypress CLI options are supported.
  extract-i18n-messages|em   Extract i18n default messages from .vue files.
  generate|g                 Generate Components, Connected Components or Modules.
  lint|l                     Lint project files.
  parallel|p [commands...]   Run commands in parallel.
  prettier [options]         Format project files.
  release|r [options]        Generate changelog, release new npm version add new git tag.
  statistics|s               Generates a report for certain project management KPIs.
  storybook [options]        Run Storybook.
  test|t [options]           Run unit-tests with jest. All Jest CLI options are supported.
  update|u                   Update your local copy of the vue-starter.

```
