import type * as d from '../../../declarations';
import { transformCssToEsm } from '../css-to-esm';

describe('css-to-esm', () => {
  describe('transformCssToEsm', () => {
    let transformCssToEsmInput: d.TransformCssToEsmInput;

    beforeEach(() => {
      // TODO(NOW): Stub
      transformCssToEsmInput = {
        input:
          ':host {\n' +
          '  display: block;\n' +
          '  position: relative;\n' +
          '  width: 100%;\n' +
          '  background-color: var(--ion-background-color, #ffffff);\n' +
          '  overflow: hidden;\n' +
          '  /**\n' +
          '   * This is required to force WebKit\n' +
          '   * to create a new stacking context\n' +
          '   * otherwise the border radius is\n' +
          '   * temporarily lost when hovering over\n' +
          '   * the ion-item or expanding/collapsing\n' +
          '   * the accordion.\n' +
          '   */\n' +
          '  z-index: 0;\n' +
          '}\n' +
          '\n' +
          ':host(.accordion-expanding) ::slotted(ion-item[slot=header]),\n' +
          ':host(.accordion-expanded) ::slotted(ion-item[slot=header]) {\n' +
          '  --border-width: 0px;\n' +
          '}\n' +
          '\n' +
          ':host(.accordion-animated) {\n' +
          '  transition: all 300ms cubic-bezier(0.25, 0.8, 0.5, 1);\n' +
          '}\n' +
          '\n' +
          ':host(.accordion-animated) #content {\n' +
          '  transition: max-height 300ms cubic-bezier(0.25, 0.8, 0.5, 1);\n' +
          '}\n' +
          '\n' +
          '#content {\n' +
          '  overflow: hidden;\n' +
          '  will-change: max-height;\n' +
          '}\n' +
          '\n' +
          ':host(.accordion-collapsing) #content {\n' +
          '  /* stylelint-disable-next-line declaration-no-important */\n' +
          '  max-height: 0 !important;\n' +
          '}\n' +
          '\n' +
          ':host(.accordion-collapsed) #content {\n' +
          '  display: none;\n' +
          '}\n' +
          '\n' +
          ':host(.accordion-expanding) #content {\n' +
          '  max-height: 0;\n' +
          '}\n' +
          '\n' +
          ':host(.accordion-disabled) #header,\n' +
          ':host(.accordion-readonly) #header,\n' +
          ':host(.accordion-disabled) #content,\n' +
          ':host(.accordion-readonly) #content {\n' +
          '  pointer-events: none;\n' +
          '}\n' +
          '\n' +
          '/**\n' +
          ' * We do not set the opacity on the\n' +
          ' * host otherwise you would see the\n' +
          ' * box-shadow behind it.\n' +
          ' */\n' +
          ':host(.accordion-disabled) #header,\n' +
          ':host(.accordion-disabled) #content {\n' +
          '  opacity: 0.4;\n' +
          '}\n' +
          '\n' +
          '@media (prefers-reduced-motion: reduce) {\n' +
          '  :host,\n' +
          '#content {\n' +
          '    /* stylelint-disable declaration-no-important */\n' +
          '    transition: none !important;\n' +
          '  }\n' +
          '}',
        // we need these
        file: '/test-css/test-css/src/components/my-component/accordion.md.css',
        mode: '',
        // otherwise it falls over trying to resolve the autoprefixer
        autoprefixer: false,
        // otherwise it will try to minify
        minify: false,
        // ???? IDK when this isn't set? Need to trace. Perhaps for an import of a CSS file?
        tag: 'my-component',
      };
    });

    it('TODO', async () => {
      const result = await transformCssToEsm(transformCssToEsmInput);
      expect(result).toBe(0);
    });
  });
});
