-- Migration for Semantic Analysis Problems

CREATE TABLE IF NOT EXISTS semantic_problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic VARCHAR(50) NOT NULL,
    problem_number INT NOT NULL,
    question TEXT NOT NULL,
    code_snippet TEXT,
    expected_output TEXT NOT NULL,
    solution_steps TEXT,
    explanation TEXT,
    difficulty VARCHAR(20),
    learning_outcome TEXT,
    UNIQUE KEY unique_problem (topic, problem_number)
);

-- Clear existing seed data (idempotent re-run safe)
DELETE FROM semantic_problems;

-- =====================================================
-- TYPE CHECKING PROBLEMS
-- =====================================================

INSERT INTO semantic_problems (topic, problem_number, question, code_snippet, expected_output, solution_steps, explanation, difficulty, learning_outcome) VALUES

-- Type Checking Problem 1
(
    'type-checking',
    1,
    'Perform type checking for the expression: x + y * 2.5, where x is int and y is float',
    'int x = 10;\nfloat y = 20.5;\nfloat z = x + y * 2.5;',
    '{"x": "int", "y": "float", "2.5": "float", "y * 2.5": "float", "x + (y * 2.5)": "float"}',
    '[{"step": 1, "description": "Identify types: x is int, y is float, 2.5 is float"}, {"step": 2, "description": "Check y * 2.5: float * float = float"}, {"step": 3, "description": "Check x + result: int + float = float (with coercion)"}]',
    'Type checking involves verifying operator compatibility and applying type coercion rules. In this case, int is coerced to float before addition.',
    'easy',
    'Understanding type coercion and operator compatibility in expressions'
),

-- Type Checking Problem 2
(
    'type-checking',
    2,
    'Check if the function call is valid: int foo(int a, float b); called as foo(10, 20);',
    'int foo(int a, float b) {\n    return a;\n}\nint result = foo(10, 20);',
    '{"foo": "function(int, float) → int", "argument1": "int", "argument2": "int", "coercion": "int → float", "result": "valid with coercion"}',
    '[{"step": 1, "description": "Check argument count: 2 matches"}, {"step": 2, "description": "Argument 1: int matches int ✓"}, {"step": 3, "description": "Argument 2: int can be coerced to float ✓"}]',
    'Function calls require checking both argument count and type compatibility. Implicit type conversion is allowed for compatible types.',
    'medium',
    'Understanding function type signatures and argument type checking'
),

-- Type Checking Problem 3
(
    'type-checking',
    3,
    'Identify type errors in: int x = 5; char c = ''a''; boolean b = x + c;',
    'int x = 5;\nchar c = ''a'';\nboolean b = x + c;',
    '{"x": "int", "c": "char", "x + c": "int", "error": "cannot assign int to boolean"}',
    '[{"step": 1, "description": "x: int, c: char"}, {"step": 2, "description": "x + c: char promoted to int, result is int"}, {"step": 3, "description": "ERROR: cannot assign int to boolean"}]',
    'Type errors occur when trying to assign incompatible types without explicit conversion. Here, int cannot be implicitly converted to boolean.',
    'medium',
    'Identifying type mismatches and understanding type compatibility rules'
);

-- =====================================================
-- SDT PROBLEMS
-- =====================================================

INSERT INTO semantic_problems (topic, problem_number, question, code_snippet, expected_output, solution_steps, explanation, difficulty, learning_outcome) VALUES

-- SDT Problem 1
(
    'sdt',
    1,
    'Write SDT rules for evaluating the expression: 3 * 4 + 5',
    'E → E1 + T    { E.val = E1.val + T.val }\nE → T         { E.val = T.val }\nT → T1 * F    { T.val = T1.val * F.val }\nT → F         { T.val = F.val }\nF → digit     { F.val = digit.value }',
    '{"result": 17}',
    '[{"step": 1, "production": "F → 3", "value": "3"}, {"step": 2, "production": "T → F", "value": "3"}, {"step": 3, "production": "F → 4", "value": "4"}, {"step": 4, "production": "T → T * F", "value": "12"}, {"step": 5, "production": "E → T", "value": "12"}, {"step": 6, "production": "F → 5", "value": "5"}, {"step": 7, "production": "T → F", "value": "5"}, {"step": 8, "production": "E → E + T", "value": "17"}]',
    'SDT rules compute attribute values during parsing. Synthesized attributes flow bottom-up from children to parents.',
    'medium',
    'Understanding syntax-directed translation and attribute computation'
),

-- SDT Problem 2
(
    'sdt',
    2,
    'Create SDT for generating postfix notation for: a + b * c',
    'E → E1 + T    { E.code = E1.code || T.code || ''+'' }\nE → T         { E.code = T.code }\nT → T1 * F    { T.code = T1.code || F.code || ''*'' }\nT → F         { T.code = F.code }\nF → id        { F.code = id.name }',
    '{"result": "abc*+"}',
    '[{"step": 1, "production": "F → a", "value": "a"}, {"step": 2, "production": "T → F", "value": "a"}, {"step": 3, "production": "E → T", "value": "a"}, {"step": 4, "production": "F → b", "value": "b"}, {"step": 5, "production": "T → F", "value": "b"}, {"step": 6, "production": "F → c", "value": "c"}, {"step": 7, "production": "T → T * F", "value": "bc*"}, {"step": 8, "production": "E → E + T", "value": "abc*+"}]',
    'SDT can be used for translation tasks like converting infix to postfix notation. The code attribute accumulates the translation.',
    'medium',
    'Using SDT for code generation and translation'
);

-- =====================================================
-- SYMBOL TABLE PROBLEMS
-- =====================================================

INSERT INTO semantic_problems (topic, problem_number, question, code_snippet, expected_output, solution_steps, explanation, difficulty, learning_outcome) VALUES

-- Symbol Table Problem 1
(
    'symbol-table',
    1,
    'Create a symbol table for: int x; float y; void foo(int a) { int b; }',
    'int x;\nfloat y;\nvoid foo(int a) {\n    int b;\n}',
    '[{"name": "x", "type": "int", "scope": "global", "offset": "0"}, {"name": "y", "type": "float", "scope": "global", "offset": "4"}, {"name": "foo", "type": "function(int)→void", "scope": "global", "offset": "-"}, {"name": "a", "type": "int", "scope": "foo", "offset": "0"}, {"name": "b", "type": "int", "scope": "foo", "offset": "4"}]',
    '[{"step": 1, "action": "Insert x: int, global, offset 0"}, {"step": 2, "action": "Insert y: float, global, offset 4"}, {"step": 3, "action": "Insert foo: function, global"}, {"step": 4, "action": "Enter scope foo"}, {"step": 5, "action": "Insert a: int, foo, offset 0"}, {"step": 6, "action": "Insert b: int, foo, offset 4"}, {"step": 7, "action": "Exit scope foo"}]',
    'Symbol tables track all identifiers with their properties. Scopes are managed hierarchically, with nested scopes for functions and blocks.',
    'easy',
    'Understanding symbol table construction and scope management'
),

-- Symbol Table Problem 2
(
    'symbol-table',
    2,
    'Handle nested scopes for: int x = 1; { int x = 2; { int y = 3; } }',
    'int x = 1;\n{\n    int x = 2;\n    {\n        int y = 3;\n    }\n}',
    '[{"name": "x", "type": "int", "scope": "0", "offset": "0"}, {"name": "x", "type": "int", "scope": "1", "offset": "0"}, {"name": "y", "type": "int", "scope": "2", "offset": "0"}]',
    '[{"step": 1, "action": "Scope 0: Insert x"}, {"step": 2, "action": "Enter scope 1"}, {"step": 3, "action": "Scope 1: Insert x (shadows scope 0)"}, {"step": 4, "action": "Enter scope 2"}, {"step": 5, "action": "Scope 2: Insert y"}, {"step": 6, "action": "Exit scope 2 (remove y)"}, {"step": 7, "action": "Exit scope 1 (remove x from scope 1)"}]',
    'Nested scopes allow inner declarations to shadow outer ones. The innermost scope is searched first during lookup.',
    'medium',
    'Managing nested scopes and variable shadowing'
);

-- =====================================================
-- ATTRIBUTE GRAMMAR PROBLEMS
-- =====================================================

INSERT INTO semantic_problems (topic, problem_number, question, code_snippet, expected_output, solution_steps, explanation, difficulty, learning_outcome) VALUES

-- Attributes Problem 1
(
    'attributes',
    1,
    'Identify synthesized and inherited attributes in: D → T L { L.type = T.type }',
    'D → T L        { L.type = T.type }\nT → int        { T.type = integer }\nL → L1, id     { L1.type = L.type; addtype(id, L.type) }',
    '{"T.type": "synthesized", "L.type": "inherited"}',
    '[{"attribute": "T.type", "type": "synthesized", "reason": "Computed at T based on its production"}, {"attribute": "L.type", "type": "inherited", "reason": "Passed down from parent D to child L"}]',
    'Synthesized attributes flow upward from children to parents. Inherited attributes flow downward from parents to children.',
    'easy',
    'Distinguishing between synthesized and inherited attributes'
),

-- Attributes Problem 2
(
    'attributes',
    2,
    'Draw dependency graph for: E → E1 + E2 { E.val = E1.val + E2.val }',
    'E → E1 + E2 { E.val = E1.val + E2.val }',
    '{"dependencies": ["E.val depends on E1.val", "E.val depends on E2.val"], "type": "synthesized", "evaluation": "bottom-up"}',
    '[{"step": 1, "description": "E.val depends on E1.val"}, {"step": 2, "description": "E.val depends on E2.val"}, {"step": 3, "description": "No circular dependencies"}, {"step": 4, "description": "Can be evaluated bottom-up"}]',
    'Dependency graphs show attribute relationships. Acyclic graphs indicate the grammar is evaluable.',
    'medium',
    'Understanding attribute dependencies and evaluation order'
);

-- =====================================================
-- SEMANTIC ACTIONS PROBLEMS
-- =====================================================

INSERT INTO semantic_problems (topic, problem_number, question, code_snippet, expected_output, solution_steps, explanation, difficulty, learning_outcome) VALUES

-- Semantic Actions Problem 1
(
    'semantic-actions',
    1,
    'Write semantic actions for type checking assignment: id = E',
    'S → id = E ;\n{\n    entry = lookup(id.name);\n    if (entry == null) error("Undeclared");\n    if (entry.type != E.type) error("Type mismatch");\n}',
    '{"action": "lookup and type check", "checks": ["declaration check", "type compatibility"]}',
    '[{"step": 1, "action": "Lookup identifier in symbol table"}, {"step": 2, "action": "Check if declared"}, {"step": 3, "action": "Check type compatibility"}, {"step": 4, "action": "Generate assignment code or error"}]',
    'Semantic actions perform checks during parsing. They access symbol tables and enforce semantic rules.',
    'medium',
    'Implementing semantic actions for type checking'
),

-- Semantic Actions Problem 2
(
    'semantic-actions',
    2,
    'Create semantic actions for function call verification: id(args)',
    'C → id ( args )\n{\n    func = lookup(id.name);\n    if (func.kind != "function") error();\n    if (args.count != func.paramCount) error();\n    for each arg check type compatibility;\n}',
    '{"action": "function call validation", "checks": ["function existence", "argument count", "argument types"]}',
    '[{"step": 1, "action": "Lookup function"}, {"step": 2, "action": "Verify it is a function"}, {"step": 3, "action": "Check argument count"}, {"step": 4, "action": "Type check each argument"}, {"step": 5, "action": "Generate call or error"}]',
    'Function call verification requires multiple checks: existence, type, and parameter matching.',
    'hard',
    'Implementing complex semantic actions with multiple validation steps'
);