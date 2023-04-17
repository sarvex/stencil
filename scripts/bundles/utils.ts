import fs from 'fs-extra';
import { join, relative } from 'path';

import { bundleDts } from '../utils/bundle-dts';
import { BuildOptions } from '../utils/options';

/**
 * A nearly-empty bundle which is responsible for bundling the typedef file
 * for the `src/utils/` module and then copying that to the right location
 * (`internal/util.d.ts`)
 *
 * @param opts options set for the Rollup build
 * @returns an (empty) array of Rollup option objects
 */
export async function utils(opts: BuildOptions) {
  await createUtilDtsBundle(opts);

  // dummy return to agree with type of other bundles
  return [];
}

async function createUtilDtsBundle(opts: BuildOptions) {
  const utilsPath = join(opts.buildDir, 'utils');

  const copyUtilsDtsFiles = async (utilsPath: string) => {
    const files = await fs.readdir(join(opts.buildDir, utilsPath));

    const outputDirPath = join(opts.output.internalDir, utilsPath);
    await fs.ensureDir(outputDirPath);

    await Promise.all(
      files.map(async (fileName: string) => {
        const inputFilePath = join(opts.buildDir, utilsPath, fileName);
        const stat = await fs.stat(inputFilePath);

        if (stat.isFile() && inputFilePath.endsWith('.d.ts')) {
          const buffer = await fs.readFile(inputFilePath);
          const contents = String(buffer).replace('/declarations', '');
          const outputFilePath = join(opts.output.internalDir, utilsPath, fileName);
          await fs.writeFile(outputFilePath, contents);
        } else if (stat.isDirectory()) {
          // its a directory, recur!
          await copyUtilsDtsFiles(join(utilsPath, fileName));
        }
      })
    );
  };

  await copyUtilsDtsFiles('utils');
}
