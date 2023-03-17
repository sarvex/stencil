import color from 'ansi-colors';
import fs from 'fs-extra';
import { join } from 'path';

import { promptPrepareRelease, promptRelease } from './prompts';
import { runReleaseTasks } from './release-tasks';
import { BuildOptions, getOptions } from './utils/options';
import { getNewVersion } from './utils/release-utils';

/**
 * Runner for creating a release of Stencil
 * @param rootDir the root directory of the Stencil repository
 * @param args stringified arguments used to influence the release steps that are taken
 */
export async function release(rootDir: string, args: ReadonlyArray<string>): Promise<void> {
  const buildDir = join(rootDir, 'build');
  const releaseDataPath = join(buildDir, 'release-data.json');

  if (args.includes('--prepare')) {
    await fs.emptyDir(buildDir);
    const opts = getOptions(rootDir, {
      isPublishRelease: false,
      isProd: true,
    });

    const responses = await promptPrepareRelease(opts);
    opts.version = responses.versionToUse;

    if (!responses.confirm) {
      console.log(`\n${color.bold.magenta('Publish preparation cancelled by user')}\n`);
      return;
    }

    fs.writeJsonSync(releaseDataPath, responses, { spaces: 2 });
    await prepareRelease(opts, args);
    return;
  }

  if (args.includes('--publish')) {
    const releaseData = await fs.readJson(releaseDataPath);
    const opts = getOptions(rootDir, {
      buildId: releaseData.buildId,
      version: releaseData.version,
      vermoji: releaseData.vermoji,
      isCI: releaseData.isCI,
      isPublishRelease: true,
      isProd: true,
    });
    const responses = await promptRelease(opts);
    opts.otp = responses.otp;
    opts.tag = responses.tagToUse;

    if (!responses.confirm) {
      console.log(`\n${color.bold.magenta('Publish cancelled by user')}\n`);
      return;
    }

    return publishRelease(opts, args);
  }

  if (args.includes('--ci-publish')) {
    const versionIdx = args.indexOf('--version');
    const tagIdx = args.indexOf('--tag');

    if (versionIdx === -1 || versionIdx === args.length) {
      // TODO: Available?
      console.log(`\n${color.bold.red('No `--version [VERSION]` argument was found. Exiting')}\n`);
      process.exit(1);
    }
    if (tagIdx === -1 || tagIdx === args.length) {
      // TODO: Available?
      console.log(`\n${color.bold.red('No `--tag [TAG]` argument was found. Exiting')}\n`);
      process.exit(1);
    }

    await fs.emptyDir(buildDir);
    const prepareOpts = getOptions(rootDir, {
      isPublishRelease: false,
      isProd: true,
      //  TODO(NOW): Does this get assigned right?
      // version: newVersion,
    });

    console.log(`version idx ${versionIdx} gives us ${args[versionIdx + 1]}`);
    console.log(`tag idx ${tagIdx} gives us ${args[tagIdx + 1]}`);

    // TODO(NOW): Temp DS
    const newVersion = getNewVersion(prepareOpts.packageJson.version, args[versionIdx + 1]);
    // TODO(NOW): Better validation
    const newTag = args[tagIdx + 1];

    console.log(`new version is ${newVersion}`);
    console.log(`new tag is ${newTag}`);

    prepareOpts.version = newVersion;

    await prepareRelease(prepareOpts, args);

    const publishOpts = getOptions(rootDir, {
      buildId: prepareOpts.buildId,
      version: prepareOpts.version,
      vermoji: prepareOpts.vermoji,
      isCI: prepareOpts.isCI,
      isPublishRelease: true,
      isProd: true,
      tag: newTag,
    });
    return publishRelease(publishOpts, args);
  }
}

/**
 * Prepares a release of Stencil
 * @param opts build options containing the metadata needed to release a new version of Stencil
 * @param args stringified arguments used to influence the release steps that are taken
 */
async function prepareRelease(opts: BuildOptions, args: ReadonlyArray<string>): Promise<void> {
  const pkg = opts.packageJson;
  const oldVersion = opts.packageJson.version;
  console.log(
    `\nPrepare to publish ${opts.vermoji}  ${color.bold.magenta(pkg.name)} ${color.dim(`(currently ${oldVersion})`)}\n`
  );

  try {
    await runReleaseTasks(opts, args);
  } catch (err: any) {
    console.log('\n', color.red(err), '\n');
    process.exit(0);
  }
}

/**
 * Initiates publishing a Stencil release.
 * @param opts build options containing the metadata needed to publish a new version of Stencil
 * @param args stringified arguments used to influence the steps that are taken
 */
async function publishRelease(opts: BuildOptions, args: ReadonlyArray<string>): Promise<void> {
  const pkg = opts.packageJson;
  if (opts.version !== pkg.version) {
    throw new Error(
      `Version strings in release data (${opts.version}) and package.json (${pkg.version}) do not match. Try re-running release prepare.`
    );
  }

  console.log(`\nPublish ${opts.vermoji}  ${color.bold.magenta(pkg.name)} ${color.yellow(`${opts.version}`)}\n`);

  try {
    return runReleaseTasks(opts, args);
  } catch (err: any) {
    console.log('\n', color.red(err), '\n');
    process.exit(0);
  }
}
