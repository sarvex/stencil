import { BUILD } from '@app-data';

import type * as d from '../declarations';

export const Build: d.UserBuildConditionals = {
  isDev: BUILD.isDev ? true : false,
  isBrowser: false,
  isServer: false,
  isTesting: BUILD.isTesting ? true : false,
};
