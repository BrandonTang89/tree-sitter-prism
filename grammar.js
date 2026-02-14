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

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($._declaration),

    _declaration: $ => choice(
      $.model_type_declaration,
      $.player_declaration,
      $.const_declaration,
      $.module_declaration,
      $.reward_declaration,
    ),

    model_type_declaration: $ => choice(
      'csg', 'mdp', 'tsg'
    ),

    player_declaration: $ => seq(
      'player',
      field('name', $.identifier),
      field('owned_modules', repeat($.identifier)),
      'endplayer'
    ),

    const_declaration: $ => seq(
      'const',
      optional(field('type', choice('int', 'double', 'bool'))),
      field('name', $.identifier),
      optional(seq('=', field('value', $.expression))),
      ';'
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
      $.expression,
      seq(
        $.expression,
        ':',
        $.expression,
        repeat(seq(
          '+',
          $.expression,
          ':',
          $.expression,
        )),
      )),

    reward_declaration: $ => seq(
      'rewards',
      '"',
      field('name', $.identifier),
      '"',
      field('formulas', repeat($.reward_formula)),
      'endrewards'
    ),

    reward_formula: $ => choice(
      $.state_reward_formula,
      $.trans_ward_formula,
    ),

    state_reward_formula: $ => seq(
      field('guard', $.expression),
      ':',
      field('reward', $.expression),
      ';'
    ),

    trans_ward_formula: $ => seq(
      field('actions', $.action_list),
      field('guard', $.expression),
      ':',
      field('reward', $.expression),
      ';'
    ),

    expression: $ => choice(
      $.integer_literal,
      $.double_literal,
      $.boolean_literal,
      $.variable,
      $.unary_expression,
      $.binary_expression,
      $.ternary_expression,
      $.function_call,
      $.parenthesized_expression,
    ),

    // --- Literals ---
    integer_literal: $ => /-?\d+/,
    double_literal: $ => /-?\d+\.\d+/,
    boolean_literal: $ => choice('true', 'false'),

    // --- Parenthesized ---
    parenthesized_expression: $ => seq('(', $.expression, ')'),

    // --- Unary expressions ---
    // Unary minus and negation bind most tightly
    unary_expression: $ => choice(
      prec(11, seq('-', $.expression)),
      prec(11, seq('!', $.expression)),
    ),

    // --- Binary expressions ---
    // Flat structure with precedence to resolve ambiguity, following the PRISM manual:
    //   Prec 10: ^       (power)              left
    //   Prec  9: * /     (multiply, divide)    left
    //   Prec  8: + -     (add, subtract)       left
    //   Prec  7: < <= >= > (relational)        left
    //   Prec  6: = !=    (equality)            left
    //   Prec  5: &       (conjunction)         left
    //   Prec  4: |       (disjunction)         left
    //   Prec  3: <=>     (iff)                 left
    //   Prec  2: =>      (implication)         right
    binary_expression: $ => choice(
      prec.left(10, seq(field('left', $.expression), '^', field('right', $.expression))),
      prec.left(9, seq(field('left', $.expression), '*', field('right', $.expression))),
      prec.left(9, seq(field('left', $.expression), '/', field('right', $.expression))),
      prec.left(8, seq(field('left', $.expression), '+', field('right', $.expression))),
      prec.left(8, seq(field('left', $.expression), '-', field('right', $.expression))),
      prec.left(7, seq(field('left', $.expression), '<', field('right', $.expression))),
      prec.left(7, seq(field('left', $.expression), '<=', field('right', $.expression))),
      prec.left(7, seq(field('left', $.expression), '>=', field('right', $.expression))),
      prec.left(7, seq(field('left', $.expression), '>', field('right', $.expression))),
      prec.left(6, seq(field('left', $.expression), '=', field('right', $.expression))),
      prec.left(6, seq(field('left', $.expression), '!=', field('right', $.expression))),
      prec.left(5, seq(field('left', $.expression), '&', field('right', $.expression))),
      prec.left(4, seq(field('left', $.expression), '|', field('right', $.expression))),
      prec.left(3, seq(field('left', $.expression), '<=>', field('right', $.expression))),
      prec.right(2, seq(field('left', $.expression), '=>', field('right', $.expression))),
    ),

    // --- Ternary conditional ---
    // condition ? a : b — right associative, lowest precedence
    ternary_expression: $ => prec.right(1, seq(
      field('condition', $.expression),
      '?',
      field('consequence', $.expression),
      ':',
      field('alternative', $.expression),
    )),

    // --- Built-in function calls ---
    // min(...), max(...), floor(x), ceil(x), round(x), pow(x,y), mod(i,n), log(x,b)
    function_call: $ => seq(
      field('function', $.builtin_function),
      '(',
      field('arguments', commaSep1($.expression)),
      ')',
    ),

    builtin_function: $ => choice(
      'min', 'max', 'floor', 'ceil', 'round', 'pow', 'mod', 'log',
    ),

    variable_declaration: $ => seq(
      field('name', $.identifier),
      ':',
      choice(
        'bool',
        field('range', seq(
          '[', field('low', $.expression), '..', field('high', $.expression), ']'
        )),
      ),
      optional(
        seq(
          'init',
          field('initial_value', $.expression),
        )
      ),
      ';'
    ),

    variable: $ => seq(
      field('name', $.identifier),
      optional('\''),
    ),

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
