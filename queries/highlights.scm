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

; Storage keywords
("const") @keyword.storage.modifier
("init") @keyword.storage.modifier

; Type keywords
("int") @type.builtin
("double") @type.builtin
("bool") @type.builtin

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

; ──────────────────────────────────────────
; Names and variables
; ──────────────────────────────────────────

; Module names
(module_declaration name: (identifier) @namespace)
(module_declaration instantiated_from: (identifier) @namespace)

; Player name
(player_declaration name: (identifier) @namespace)
; Modules owned by player
(player_declaration owned_modules: (identifier) @namespace)

; Reward structure name
(reward_declaration name: (identifier) @label)

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
