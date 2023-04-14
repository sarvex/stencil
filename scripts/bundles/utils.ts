import fs from 'fs-extra';
import { join } from 'path';

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

  // dummy return to agree with types of other bundles
  return [];
}

async function createUtilDtsBundle(opts: BuildOptions) {
  // const utilDtsPath = join(opts.buildDir, 'utils', 'index.d.ts');
  // const dtsContent = await bundleDts(opts, utilDtsPath);

  // // the path where we'll write hte bundled `.d.ts` file
  // const outputPath = join(opts.output.internalDir, 'utils.d.ts');

  // await fs.writeFile(outputPath, dtsContent);


  const utilsPath = join(opts.buildDir, 'utils');

  const outputDirectory = join(opts.output.internalDir, 'utils');

  // create the directory if it doesn't exist
  await fs.ensureDir(outputDirectory);

  // recursively copy all `.d.ts` files found in `utilsPath` and its
// subdirectories to a new directory found at `outputDirectory`, creating
// subdirectories as needed
console.log(`going to copy everything I can from ${utilsPath} to ${outputDirectory}`);
  await fs.copy(utilsPath, outputDirectory, {
    filter: (src) => (
      !src.endsWith('.js')
    ),
    recursive: true,
  });

  // gah why is copying files hard
  //
  // ok so here I need to copy all the `.d.ts` files in `build/utils` (and
  // subdirectories) to `internal/utils`. Then `../declarations` in  all of
  // them needs to be rewritten to `..`
}
