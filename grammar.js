/**
 * @file A tree-sitter grammar for the PRISM-games project, focused on CSGs
 * @author BrandonTang89 <tangyuhanbrandon@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "prism",

  extras: $ => [
    /\s/,              // whitespace
    $.line_comment,
    $.block_comment,
  ],

  rules: {
    source_file: $ => repeat($._declaration),

    _declaration: $ => choice(
      $.model_type_declaration,
      $.player_declaration,
      $.module_declaration,
    ),

    // @ts-ignore
    model_type_declaration: $ => choice(
      'csg', 'mdp', 'tsg'
    ),

    player_declaration: $ => seq(
      'player',
      field('name', $.identifier),
      field('owned_modules', repeat($.identifier)),
      'endplayer'
    ),

    module_declaration: $ => seq(
      'module',
      field('name', $.identifier),
      choice(
        seq(
          field('variables', repeat($.variable_declaration)),
          field('commands', repeat($.command)),
        ),
        seq(
          '=',
          field('instantiated_from', $.identifier),
          '[',
          commaSep($.rename),
          ']',
        ),
      ),
      'endmodule'
    ),

    rename: $ => seq(
      field('from', $.identifier),
      '=',
      field('to', $.identifier)
    ),

    command: $ => seq(
      field('actions', $.action_list),
      field('guard', $.expression),
      '->',
      field('updates', $.update_list),
      ';'
    ),

    action_list: $ => seq(
      '[',
      commaSep($.identifier),
      ']'
    ),

    update_list: $ => choice(
      $.update,
      repeat1(
        seq(
          $.expression,
          ':',
          $.update,
        )
      ),
    ),

    // @ts-ignore
    update: $ => 'true' /* Placeholder for actual update syntax */,

    // @ts-ignore
    expression: $ => choice(
      'true' /* Placeholder for actual expression syntax */,
      'false'
    ),

    variable_declaration: $ => seq(
      field('name', $.identifier),
      ':',
      field('range', seq(
        '[', /-?\d+/, '..', /-?\d+/, ']'
      )),
      ';'
    ),


    // @ts-ignore
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    // Comment definitions
    // @ts-ignore
    line_comment: $ => token(seq('//', /.*/)),
    // @ts-ignore
    block_comment: $ => token(seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/'
    )),
  }
});

// @ts-ignore
function commaSep(rule) {
  return optional(commaSep1(rule));
}

// @ts-ignore
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
