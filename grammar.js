/**
 * @file A tree-sitter grammar for the PRISM-games project
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

  conflicts: $ => [
    [$.label_ref, $.reward_property],
  ],

  rules: {
    source_file: $ => repeat($._declaration),

    _declaration: $ => choice(
      $.model_type_declaration,
      $.const_declaration,
      $.global_declaration,
      $.formula_declaration,
      $.label_declaration,
      $.player_declaration,
      $.module_declaration,
      $.reward_declaration,
      $.state_formula,
    ),

    // ═══════════════════════════════════════════
    // Property specification (rPATL + PCTL/CSL)
    // ═══════════════════════════════════════════

    // State formula: the top-level property language
    // Used at top-level and as operands inside path/reward queries
    state_formula: $ => choice(
      $.expression,
      // Game properties (with coalition prefix)
      $.zero_sum_property,
      $.nonzero_sum_property,
      $.game_multi_objective,
      // Non-game properties (standalone P, S, R)
      $.path_property,
      $.steady_state_property,
      $.reward_property,
      // Non-game multi-objective: multi(...)
      $.multi_property,
      // Filters: filter(op, prop, states?)
      $.filter_property,
    ),

    // "label_name" as a state formula reference (inside properties)
    label_ref: $ => seq('"', field('name', $.identifier), '"'),

    // ═══════════════════════════════════════════
    // Game-specific properties (rPATL)
    // ═══════════════════════════════════════════

    // ── Zero-sum properties ──
    // <<coalition>> P... [...] or <<coalition>> R... [...]
    zero_sum_property: $ => seq(
      field('coalition', $.coalition),
      field('query', $._property_objective),
    ),

    // ── Nonzero-sum (equilibria) properties ──
    // <<c1:c2>> cond ( obj + obj )
    // <<c1:c2>>{nash,social} cond ( obj + obj )
    nonzero_sum_property: $ => seq(
      field('coalitions', $.coalition_pair),
      optional(field('equilibrium_type', $.equilibrium_type)),
      field('condition', $.nonzero_sum_condition),
      '(',
      field('objectives', $.objective_list),
      ')',
    ),

    // Coalition: <<p1,p2>> or <<>> (empty)
    coalition: $ => seq(
      '<<',
      commaSep(choice($.identifier, $.integer_literal)),
      '>>',
    ),

    // Coalition pair for nonzero-sum: <<c1:c2>>
    coalition_pair: $ => seq(
      '<<',
      field('coalition1', commaSep1(choice($.identifier, $.integer_literal))),
      ':',
      field('coalition2', commaSep1(choice($.identifier, $.integer_literal))),
      '>>',
    ),

    // Equilibrium type annotation: {nash,social}, {corr,fair}, etc.
    equilibrium_type: $ => seq(
      '{',
      field('equilibrium', choice('nash', 'corr')),
      ',',
      field('criterion', choice('social', 'fair')),
      '}',
    ),

    // Nonzero-sum condition: >=val, min=?, max=?
    nonzero_sum_condition: $ => choice(
      seq(
        field('operator', choice('>=', '<=', '>', '<')),
        field('threshold', $.expression),
      ),
      'min=?',
      'max=?',
    ),

    // Objective list: obj + obj (+ obj ...)
    objective_list: $ => seq(
      $._objective,
      repeat(seq('+', $._objective)),
    ),

    _objective: $ => choice(
      $.prob_objective,
      $.reward_objective,
    ),

    // P[ path_query ] — used inside nonzero-sum properties
    prob_objective: $ => seq(
      'P',
      '[',
      field('query', $.path_query),
      ']',
    ),

    // R{"name"}[ reward_query ] — used inside nonzero-sum properties
    reward_objective: $ => seq(
      'R',
      '{', '"', field('reward_name', $.identifier), '"', '}',
      '[',
      field('query', $.reward_query),
      ']',
    ),

    // ── Game multi-objective properties ──
    // <<coalition>> ( obj_cond & obj_cond ) or with | ! =>
    game_multi_objective: $ => seq(
      field('coalition', $.coalition),
      '(',
      field('objectives', $._multi_obj_expr),
      ')',
    ),

    _multi_obj_expr: $ => choice(
      $.single_objective,
      $.multi_obj_binary,
      $.multi_obj_unary,
      seq('(', $._multi_obj_expr, ')'),
    ),

    single_objective: $ => choice(
      // R{"name"}/{"name"}>=val [ query ]
      seq(
        'R',
        '{', '"', field('reward_name', $.identifier), '"', '}',
        '/', '{', '"', field('ratio_cost', $.identifier), '"', '}',
        field('operator', choice('>=', '<=', '>', '<')),
        field('threshold', $.expression),
        '[', field('query', $.reward_query), ']',
      ),
      // R{"name"}>=val [ query ]
      seq(
        'R',
        '{', '"', field('reward_name', $.identifier), '"', '}',
        field('operator', choice('>=', '<=', '>', '<')),
        field('threshold', $.expression),
        '[', field('query', $.reward_query), ']',
      ),
      // P>=val [ path_query ]
      seq(
        'P',
        field('operator', choice('>=', '<=', '>', '<')),
        field('threshold', $.expression),
        '[', field('query', $.path_query), ']',
      ),
    ),

    multi_obj_binary: $ => choice(
      prec.left(2, seq(
        field('left', $._multi_obj_expr), '&', field('right', $._multi_obj_expr),
      )),
      prec.left(1, seq(
        field('left', $._multi_obj_expr), '|', field('right', $._multi_obj_expr),
      )),
      prec.right(0, seq(
        field('left', $._multi_obj_expr), '=>', field('right', $._multi_obj_expr),
      )),
    ),

    multi_obj_unary: $ => prec.left(3, seq('!', $._multi_obj_expr)),

    // ═══════════════════════════════════════════
    // Shared property components (used by both game and non-game)
    // ═══════════════════════════════════════════

    // ── Property objectives (after coalition or standalone) ──
    _property_objective: $ => choice(
      $.path_property,
      $.reward_property,
    ),

    // ── Path (probability) properties ──
    // P=? [ ... ], Pmin=? [ ... ], Pmax=? [ ... ], P>=val [ ... ], etc.
    path_property: $ => seq(
      field('condition', $.prob_condition),
      '[',
      field('query', $.path_query),
      ']',
    ),

    // Probability condition: P=?, Pmin=?, Pmax=?, P>=val, P<=val, P>val, P<val
    prob_condition: $ => choice(
      'Pmin=?',
      'Pmax=?',
      'P=?',
      seq('P', field('operator', choice('>=', '<=', '>', '<')), field('threshold', $.expression)),
    ),

    // ── Steady-state properties (S operator) ──
    // S=? [ expr ], S>=val [ expr ], S<0.05 [ expr ]
    steady_state_property: $ => seq(
      field('condition', $.steady_state_condition),
      '[',
      field('operand', $.state_formula),
      ']',
    ),

    steady_state_condition: $ => choice(
      'S=?',
      seq('S', field('operator', choice('>=', '<=', '>', '<')), field('threshold', $.expression)),
    ),

    // ── Path queries ──
    // X phi, F phi, F<=k phi, phi U phi, phi U<=k phi,
    // G phi, G<=k phi, phi W phi, phi R phi (release)
    path_query: $ => choice(
      $.next_query,
      $.eventually_query,
      $.globally_query,
      $.until_query,
      $.weak_until_query,
      $.release_query,
      // R(path){"r"}>=val [ S ] — path reward inside P>=1 [...]
      $.path_reward_query,
    ),

    next_query: $ => seq(
      'X',
      field('operand', $.state_formula),
    ),

    eventually_query: $ => seq(
      'F',
      optional(field('bound', $.temporal_bound)),
      field('operand', $.state_formula),
    ),

    globally_query: $ => seq(
      'G',
      optional(field('bound', $.temporal_bound)),
      field('operand', $.state_formula),
    ),

    until_query: $ => seq(
      field('left', $.state_formula),
      'U',
      optional(field('bound', $.temporal_bound)),
      field('right', $.state_formula),
    ),

    weak_until_query: $ => seq(
      field('left', $.state_formula),
      'W',
      optional(field('bound', $.temporal_bound)),
      field('right', $.state_formula),
    ),

    release_query: $ => seq(
      field('left', $.state_formula),
      // Use token to disambiguate from reward R
      token('R'),
      optional(field('bound', $.temporal_bound)),
      field('right', $.state_formula),
    ),

    // Temporal bound: <=k, >=k, <k, >k, =k, [t1,t2]
    temporal_bound: $ => choice(
      seq('<=', field('bound', $.expression)),
      seq('>=', field('bound', $.expression)),
      seq('<', field('bound', $.expression)),
      seq('>', field('bound', $.expression)),
      seq('=', field('bound', $.expression)),
      seq(
        '[',
        field('low', $.expression),
        ',',
        field('high', $.expression),
        ']',
      ),
    ),

    // ── Reward properties ──
    // R{"name"}min=? [ ... ], R>=val [ ... ], Rmin=? [ ... ],
    // R{"name"}>=val [ ... ], R{"r"}/{"c"}>=val [ ... ],
    // R=? [ ... ], R{2}=? [ ... ]
    reward_property: $ => choice(
      // R{"name"}/{"name"} cond [...] — ratio reward (named)
      seq(
        'R',
        '{', '"', field('reward_name', $.identifier), '"', '}',
        '/', '{', '"', field('ratio_cost', $.identifier), '"', '}',
        field('condition', $.reward_condition),
        '[', field('query', $.reward_query), ']',
      ),
      // R{"name"} cond [...] — named reward
      seq(
        'R',
        '{', '"', field('reward_name', $.identifier), '"', '}',
        field('condition', $.reward_condition),
        '[', field('query', $.reward_query), ']',
      ),
      // R{index} cond [...] — indexed reward
      seq(
        'R',
        '{', field('reward_index', $.expression), '}',
        field('condition', $.reward_condition),
        '[', field('query', $.reward_query), ']',
      ),
      // Rmin=? [...], Rmax=? [...], R>=val [...], R=? [...] — unnamed reward
      seq(
        field('condition', $.reward_condition_no_name),
        '[', field('query', $.reward_query), ']',
      ),
    ),

    // Reward condition (after R{"name"} or R{index})
    reward_condition: $ => choice(
      'min=?',
      'max=?',
      '=?',
      seq(field('operator', choice('>=', '<=', '>', '<')), field('threshold', $.expression)),
    ),

    // Reward condition without name: Rmin=?, Rmax=?, R=?, R>=val, R>val
    reward_condition_no_name: $ => choice(
      'Rmin=?',
      'Rmax=?',
      'R=?',
      seq('R', field('operator', choice('>=', '<=', '>', '<')), field('threshold', $.expression)),
    ),

    // ── Reward queries ──
    // I=k, C, C<=k, F phi, Fc phi, F0 phi, S
    // Also co-safe LTL: phi U phi, X phi (syntactic co-safe fragment)
    reward_query: $ => choice(
      $.instantaneous_reward,   // I=k
      $.cumulative_reward,      // C or C<=k
      $.reachability_reward,    // F phi (and co-safe LTL: F(a & F b))
      $.co_safe_reward,         // Fc phi (games-specific)
      $.zero_reward,            // F0 phi (games-specific)
      $.steady_state_reward,    // S
      $.until_query,            // phi U phi (co-safe LTL reward)
      $.next_query,             // X phi (co-safe LTL reward)
    ),

    instantaneous_reward: $ => seq(
      'I', '=', field('step', $.expression),
    ),

    cumulative_reward: $ => seq(
      'C',
      optional(field('bound', $.temporal_bound)),
    ),

    reachability_reward: $ => seq(
      'F',
      field('operand', $.state_formula),
    ),

    co_safe_reward: $ => seq(
      'Fc',
      field('operand', $.state_formula),
    ),

    zero_reward: $ => seq(
      'F0',
      field('operand', $.state_formula),
    ),

    steady_state_reward: $ => 'S',

    // R(path){"r"}>=val [ S ] — path reward formula inside a P>=1[...] context
    path_reward_query: $ => seq(
      'R',
      '(', 'path', ')',
      '{', '"', field('reward_name', $.identifier), '"', '}',
      optional(seq(
        '/', '{', '"', field('ratio_cost', $.identifier), '"', '}',
      )),
      field('operator', choice('>=', '<=', '>', '<')),
      field('threshold', $.expression),
      '[', field('query', $.reward_query), ']',
    ),

    // ═══════════════════════════════════════════
    // Non-game multi-objective: multi(obj, obj, ...)
    // ═══════════════════════════════════════════

    multi_property: $ => seq(
      'multi',
      '(',
      commaSep1($._multi_objective_item),
      ')',
    ),

    _multi_objective_item: $ => choice(
      $.path_property,
      $.reward_property,
    ),

    // ═══════════════════════════════════════════
    // Filters: filter(op, prop, states?)
    // ═══════════════════════════════════════════

    filter_property: $ => seq(
      'filter',
      '(',
      field('operator', $.filter_operator),
      ',',
      field('property', $.state_formula),
      optional(seq(',', field('states', $.state_formula))),
      ')',
    ),

    filter_operator: $ => choice(
      'min', 'max', 'count', 'sum', 'avg',
      'first', 'range', 'forall', 'exists',
      'state', 'argmin', 'argmax', 'print', 'printall',
      // Shorthand operators
      '+', '&', '|',
    ),

    // ═══════════════════════════════════════════
    // Model language
    // ═══════════════════════════════════════════

    model_type_declaration: $ => choice(
      'csg', 'smg', 'mdp', 'dtmc', 'ctmc'
    ),

    _const_var_type: $ => choice(
      'int',
      'double',
      'bool',
    ),

    const_declaration: $ => seq(
      'const',
      optional(field('type', $._const_var_type)),
      field('name', $.identifier),
      optional(seq('=', field('value', $.expression))),
      ';'
    ),

    global_declaration: $ => seq(
      'global',
      $.variable_declaration,
    ),

    label_declaration: $ => seq(
      'label',
      '"',
      field('name', $.identifier),
      '"',
      '=',
      field('value', $.expression),
      ';'
    ),

    formula_declaration: $ => seq(
      'formula',
      field('name', $.identifier),
      '=',
      field('value', $.expression),
      ';'
    ),

    player_declaration: $ => seq(
      'player',
      field('name', $.identifier),
      commaSep($._player_owned),
      'endplayer'
    ),

    _player_owned: $ => choice(
      field('owned_module', $.identifier),
      field('owned_action', seq(
        "[",
        $.identifier,
        "]"
      ))
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
      $.trans_reward_formula,
    ),

    state_reward_formula: $ => seq(
      field('guard', $.expression),
      ':',
      field('reward', $.expression),
      ';'
    ),

    trans_reward_formula: $ => seq(
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
      $.label_ref,
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
        choice(
          seq(
            'init',
            field('initial_value', $.expression),
          ),
          seq(
            "init",
            field('init_relation', $.expression),
            "endinit"
          )
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
