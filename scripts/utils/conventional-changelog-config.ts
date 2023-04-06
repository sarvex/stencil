/**
 * Options for conventional changelog.
 */
module.exports = {
  parserOpts: {
    /**
     * Override the conventional-changelog parser's preset for detecting issues. Stencil uses the "Angular preset",
     * which defaults the "issuesPrefixes" field to a single pound sign ('#'). This sometimes gets mistaken by the
     * changelog generator as an issue that is fixed, when it fact it's cross-reference to another issue.
     *
     * Reference for this property: [GitHub README]{@link https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#issueprefixes}
     *
     * By default, [these are case-insensitive]{@link https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#issueprefixescasesensitive)}
     */
    issuePrefixes: ['closes: #', 'closes:#', 'closes- #', 'closes-#', 'closes #', 'closes#'],
  },
};
