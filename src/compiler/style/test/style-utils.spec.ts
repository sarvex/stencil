import { stripCssComments } from '../style-utils';

describe('style-utils', () => {
  describe('stripCssComments', () => {
    it('returns an empty string for empty input', () => {
      expect(stripCssComments('')).toBe('');
    });

    it('returns the original CSS if no comments exist', () => {
      const css = `div {
  color: red;
}`;
      expect(stripCssComments(css)).toBe(css);
    });

    it('removes comments', () => {
      const css = `/* Make it red */
div {
  color: red;
}`;
      // Note the newline at the start of the CSS content is not removed
      const expected = `
div {
  color: red;
}`;
      expect(stripCssComments(css)).toBe(expected);
    });

    it.each<string>([
      `body {background-image: url("stenciljs.png");}`,
      `body {background-image: url('stenciljs.png');}`,
    ])('does not remove valid strings', (cssWithUrl) => {
      expect(stripCssComments(cssWithUrl)).toBe(cssWithUrl);
    });
  });
});
