import { hasError, normalizePath } from '@utils';

import type * as d from '../../declarations';
import { optimizeCssId } from '../../version';

export const optimizeCss = async (
  config: d.Config,
  compilerCtx: d.CompilerCtx,
  diagnostics: d.Diagnostic[],
  styleText: string,
  filePath: string
) => {
  console.log(`optimizeCss::Gonna optimize ${styleText}`);
  if (typeof styleText !== 'string' || !styleText.length) {
    console.log(`JK invalid data`)
    //  don't bother with invalid data
    return styleText;
  }

  if ((config.autoprefixCss === false || config.autoprefixCss === null) && !config.minifyCss) {
    // don't wanna autoprefix or minify, so just skip this
    console.log(`optimizeCss::JK no minify`)
    return styleText;
  }

  if (typeof filePath === 'string') {
    console.log(`optimizeCss::normalized ${filePath}`);
    filePath = normalizePath(filePath);
    console.log(`optimizeCss::to ${filePath}`)
  }

  const opts: d.OptimizeCssInput = {
    input: styleText,
    filePath: filePath,
    autoprefixer: config.autoprefixCss,
    minify: config.minifyCss,
  };

  const cacheKey = await compilerCtx.cache.createKey('optimizeCss', optimizeCssId, opts);
  const cachedContent = await compilerCtx.cache.get(cacheKey);
  if (cachedContent != null) {
    // let's use the cached data we already figured out
    console.log(`optimizeCss::cached content found: ${cachedContent}`)
    return cachedContent;
  }

  const minifyResults = await compilerCtx.worker!.optimizeCss(opts);
  console.log(`optimizeCss::results: ${minifyResults.output}`);
  minifyResults.diagnostics.forEach((d) => {
    // collect up any diagnostics from minifying
    diagnostics.push(d);
  });

  if (typeof minifyResults.output === 'string' && !hasError(diagnostics)) {
    // cool, we got valid minified output

    // only cache if we got a cache key, if not it probably has an @import
    await compilerCtx.cache.put(cacheKey, minifyResults.output);

    return minifyResults.output;
  }

  return styleText;
};
