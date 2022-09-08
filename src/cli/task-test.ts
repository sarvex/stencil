import type { ValidatedConfig, TestingRunOptions } from '../declarations';
import { IS_NODE_ENV } from '../compiler/sys/environment';

/**
 * Entrypoint for any Stencil tests
 * @param config a validated Stencil configuration entity
 */
export const taskTest = async (config: ValidatedConfig): Promise<void> => {
  if (!IS_NODE_ENV) {
    config.logger.error(`"test" command is currently only implemented for a NodeJS environment`);
    return config.sys.exit(1);
  }

  // TODO(NOW): need a way to determine the version
  const jestVersion = 28;
  // TODO(NOW): new name
  const isExperimentalJestSupport = jestVersion >= 28;

  config.buildDocs = false;
  const testingRunOpts: TestingRunOptions = {
    e2e: !!config.flags.e2e,
    screenshot: !!config.flags.screenshot,
    spec: !!config.flags.spec,
    updateScreenshot: !!config.flags.updateScreenshot,
    isExperimentalJestSupport,
  };

  // always ensure we have jest modules installed
  const ensureModuleIds = config.testing?.experimentalJestArchitecture ? [] : ['@types/jest', 'jest', 'jest-cli'];

  if (testingRunOpts.e2e) {
    if (isExperimentalJestSupport) {
      // TODO(NOW): Warn that this isn't supported, e2e will not run
    } else {
      // if it's an e2e test, also make sure we're got
      // puppeteer modules installed and if browserExecutablePath is provided don't download Chromium use only puppeteer-core instead
      const puppeteer = config.testing.browserExecutablePath ? 'puppeteer-core' : 'puppeteer';

      ensureModuleIds.push(puppeteer);

      if (testingRunOpts.screenshot) {
        // ensure we've got pixelmatch for screenshots
        config.logger.warn(
          config.logger.yellow(
            `EXPERIMENTAL: screenshot visual diff testing is currently under heavy development and has not reached a stable status. However, any assistance testing would be appreciated.`
          )
        );
      }
    }
  }

  try {
    // ensure we've got the required modules installed
    const diagnostics = await config.sys.lazyRequire.ensure(config.rootDir, ensureModuleIds);
    if (diagnostics.length > 0) {
      config.logger.printDiagnostics(diagnostics);
      return config.sys.exit(1);
    }

    // let's test!
    const { createTesting } = await import('@stencil/core/testing');
    const testing = await createTesting(config);
    const passed = await testing.run(testingRunOpts);
    await testing.destroy();

    if (!passed) {
      return config.sys.exit(1);
    }
  } catch (e) {
    config.logger.error(e);
    return config.sys.exit(1);
  }
};
