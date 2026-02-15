; ──────────────────────────────────────────
; Keywords
; ──────────────────────────────────────────

; Model type declarations
(model_type_declaration) @keyword

; Block-scope keywords (module, player, rewards)
("module") @keyword.function
("endmodule") @keyword.function
("player") @keyword.function
("endplayer") @keyword.function
("rewards") @keyword.function
("endrewards") @keyword.function

; Storage / declaration keywords
("const") @keyword.storage.modifier
("global") @keyword.storage.modifier
("init") @keyword.storage.modifier
("endinit") @keyword.storage.modifier
("formula") @keyword.storage.type
("label") @keyword.storage.type

; Type keywords
("int") @type.builtin
("double") @type.builtin
("bool") @type.builtin

; ──────────────────────────────────────────
; Property specification keywords
; ──────────────────────────────────────────

; Probability conditions: P=?, Pmin=?, Pmax=?, P>=val
(prob_condition "Pmin=?" @keyword.operator)
(prob_condition "Pmax=?" @keyword.operator)
(prob_condition "P=?" @keyword.operator)
(prob_condition "P" @keyword.operator)
(prob_condition operator: _ @operator)

; Steady-state conditions: S=?, S>=val
(steady_state_condition "S=?" @keyword.operator)
(steady_state_condition "S" @keyword.operator)
(steady_state_condition operator: _ @operator)

; Reward conditions (unnamed): Rmin=?, Rmax=?, R=?, R>=val
(reward_condition_no_name "Rmin=?" @keyword.operator)
(reward_condition_no_name "Rmax=?" @keyword.operator)
(reward_condition_no_name "R=?" @keyword.operator)
(reward_condition_no_name "R" @keyword.operator)
(reward_condition_no_name operator: _ @operator)

; Reward conditions (named/indexed): min=?, max=?, =?, >=val
(reward_condition "min=?" @keyword.operator)
(reward_condition "max=?" @keyword.operator)
(reward_condition "=?" @keyword.operator)
(reward_condition operator: _ @operator)

; Nonzero-sum conditions
(nonzero_sum_condition "min=?" @keyword.operator)
(nonzero_sum_condition "max=?" @keyword.operator)
(nonzero_sum_condition operator: _ @operator)

; Path query temporal operators
(next_query "X" @keyword.operator)
(eventually_query "F" @keyword.operator)
(globally_query "G" @keyword.operator)
(until_query "U" @keyword.operator)
(weak_until_query "W" @keyword.operator)

; Reward query operators
(instantaneous_reward "I" @keyword.operator)
(cumulative_reward "C" @keyword.operator)
(reachability_reward "F" @keyword.operator)
(cumulative_reachability "Fc" @keyword.operator)
(zero_reward "F0" @keyword.operator)
(steady_state_reward) @keyword.operator

; Path reward query
(path_reward_query "R" @keyword.operator)
(path_reward_query "path" @keyword.operator)
(path_reward_query operator: _ @operator)

; Named reward structures in properties
(reward_property "R" @keyword.operator)
(reward_property reward_name: (identifier) @label)
(reward_property ratio_cost: (identifier) @label)

; Reward/prob objectives in nonzero-sum
(non_zero_prob_objective "P" @keyword.operator)
(non_zero_reward_objective "R" @keyword.operator)
(non_zero_reward_objective reward_name: (identifier) @label)

; Single objectives in game multi-objective
(single_objective "P" @keyword.operator)
(single_objective "R" @keyword.operator)
(single_objective reward_name: (identifier) @label)
(single_objective ratio_cost: (identifier) @label)
(single_objective operator: _ @operator)

; Path reward query reward names
(path_reward_query reward_name: (identifier) @label)
(path_reward_query ratio_cost: (identifier) @label)

; Temporal bounds
(temporal_bound "<=" @operator)
(temporal_bound ">=" @operator)
(temporal_bound "<" @operator)
(temporal_bound ">" @operator)
(temporal_bound "=" @operator)

; Coalitions
(coalition "<<" @punctuation.special)
(coalition ">>" @punctuation.special)
(coalition (identifier) @variable.parameter)

(coalition_pair "<<" @punctuation.special)
(coalition_pair ">>" @punctuation.special)
(coalition_pair ":" @punctuation.special)
(coalition_pair coalition1: (identifier) @variable.parameter)
(coalition_pair coalition2: (identifier) @variable.parameter)

; Equilibrium type
(equilibrium_type equilibrium: _ @keyword)
(equilibrium_type criterion: _ @keyword)

; Multi-objective operators
(multi_obj_binary "&" @operator)
(multi_obj_binary "|" @operator)
(multi_obj_binary "=>" @operator)
(multi_obj_unary "!" @operator)

; multi() keyword
(multi_property "multi" @function.builtin)

; filter() keyword and operator
(filter_property "filter" @function.builtin)
(filter_operator) @keyword.operator

; Label references: "name" in property contexts
(label_ref name: (identifier) @label)

; ──────────────────────────────────────────
; Literals
; ──────────────────────────────────────────

(integer_literal) @constant.numeric.integer
(double_literal) @constant.numeric.float
(boolean_literal) @constant.builtin.boolean

; ──────────────────────────────────────────
; Comments
; ──────────────────────────────────────────

(line_comment) @comment.line
(block_comment) @comment.block

; ──────────────────────────────────────────
; Operators
; ──────────────────────────────────────────

; Binary operators
(binary_expression "^" @operator)
(binary_expression "*" @operator)
(binary_expression "/" @operator)
(binary_expression "+" @operator)
(binary_expression "-" @operator)
(binary_expression "<" @operator)
(binary_expression "<=" @operator)
(binary_expression ">=" @operator)
(binary_expression ">" @operator)
(binary_expression "=" @operator)
(binary_expression "!=" @operator)
(binary_expression "&" @operator)
(binary_expression "|" @operator)
(binary_expression "<=>" @operator)
(binary_expression "=>" @operator)

; Unary operators
(unary_expression "-" @operator)
(unary_expression "!" @operator)

; Ternary operator
(ternary_expression "?" @operator)
(ternary_expression ":" @operator)

; Command arrow
(command "->" @operator)

; ──────────────────────────────────────────
; Functions
; ──────────────────────────────────────────

(builtin_function) @function.builtin

; ──────────────────────────────────────────
; Punctuation
; ──────────────────────────────────────────

"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket

"," @punctuation.delimiter
";" @punctuation.delimiter
".." @punctuation.delimiter
"\"" @punctuation.delimiter

; ──────────────────────────────────────────
; Names and variables
; ──────────────────────────────────────────

; Module names
(module_declaration name: (identifier) @namespace)
(module_declaration instantiated_from: (identifier) @namespace)

; Player name
(player_declaration name: (identifier) @namespace)
; Modules owned by player
(player_declaration owned_module: (identifier) @namespace)
; Actions owned by player
(player_declaration owned_action: (identifier) @label)

; Reward structure name
(reward_declaration name: (identifier) @label)

; Label declaration name
(label_declaration name: (identifier) @label)

; Formula declaration name
(formula_declaration name: (identifier) @function)

; Constant name in declaration
(const_declaration name: (identifier) @variable)

; Variable name in declaration
(variable_declaration name: (identifier) @variable)

; Rename identifiers
(rename from: (identifier) @variable)
(rename to: (identifier) @variable)

; Action labels in commands
(action_list (identifier) @label)

; Variable references in expressions
(variable name: (identifier) @variable)
(variable "'" @variable)
