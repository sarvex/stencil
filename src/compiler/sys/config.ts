import { join } from 'path';

import { isBoolean } from '@utils';

import { createConfigFlags } from '../../cli/config-flags';
import type * as d from '../../declarations';
import {
  DEFAULT_DEV_MODE,
  DEFAULT_FS_NAMESPACE,
  DEFAULT_HASHED_FILENAME_LENTH,
  DEFAULT_NAMESPACE,
} from '../config/constants';
import { setPlatformPath } from '../sys/modules/path';
import { createLogger } from './logger/console-logger';
import { createSystem } from './stencil-sys';
// import { validateConfig } from '../config/validate-config';

export const getConfig = (userConfig: d.Config): d.ValidatedConfig => {
  const logger = userConfig.logger ?? createLogger();
  const rootDir = userConfig.rootDir ?? '/';

  let devMode = userConfig.devMode ?? DEFAULT_DEV_MODE;
  // default devMode false
  if (userConfig.flags?.prod) {
    devMode = false;
  } else if (userConfig.flags?.dev) {
    devMode = true;
  } else if (!isBoolean(userConfig.devMode)) {
    devMode = DEFAULT_DEV_MODE;
  }

  const hashFileNames = userConfig.hashFileNames ?? !devMode;

  const config: d.ValidatedConfig = {
    ...userConfig,
    // ...validateConfig(userConfig, {}).config,
    buildEs5: userConfig.buildEs5 === true || (!devMode && userConfig.buildEs5 === 'prod'),
    devMode,
    flags: createConfigFlags(userConfig.flags ?? {}),
    fsNamespace: userConfig.fsNamespace ?? DEFAULT_FS_NAMESPACE,
    hashFileNames,
    hashedFileNameLength: userConfig.hashedFileNameLength ?? DEFAULT_HASHED_FILENAME_LENTH,
    hydratedFlag: userConfig.hydratedFlag ?? null,
    logger,
    minifyCss: userConfig.minifyCss ?? !devMode,
    minifyJs: userConfig.minifyJs ?? !devMode,
    namespace: userConfig.namespace ?? DEFAULT_NAMESPACE,
    outputTargets: userConfig.outputTargets ?? [],
    packageJsonFilePath: join(rootDir, 'package.json'),
    rootDir,
    sys: userConfig.sys ?? createSystem({ logger }),
    testing: userConfig ?? {},
    transformAliasedImportPaths: userConfig.transformAliasedImportPaths ?? false,
  };

  setPlatformPath(config.sys.platformPath);

  if (config.flags.debug || config.flags.verbose) {
    config.logLevel = 'debug';
  } else if (config.flags.logLevel) {
    config.logLevel = config.flags.logLevel;
  } else if (typeof config.logLevel !== 'string') {
    config.logLevel = 'info';
  }
  config.logger.setLevel(config.logLevel);

  return config;
};
