import * as webpack from 'webpack';
import { logError, logWarning, log } from '@vuesion/utils/dist/ui';

const build = () => {
  const configPath = process.argv[2];
  const mode = process.argv[3];
  const debug = process.argv[4] === 'true';
  const config = require(configPath).default;

  config.mode = mode;

  webpack(config).run((error, stats) => {
    if (error) {
      logError(error);
      return 1;
    }

    const jsonStats = stats.toJson();

    if (jsonStats.hasErrors) {
      jsonStats.errors.forEach((err) => logError(err));
      return 1;
    }
    if (jsonStats.hasWarnings) {
      jsonStats.warnings.forEach((warning) => logWarning(warning));
    }

    if (debug) {
      log(stats.toString());
    }
  });
};

build();
