/**
 * @file A tree-sitter grammar for the PRISM-games project, focused on CSGs
 * @author BrandonTang89 <tangyuhanbrandon@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "prism",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
