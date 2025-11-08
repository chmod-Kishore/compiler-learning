-- LL(1) Parser Problems Migration

CREATE TABLE IF NOT EXISTS ll1_parser_problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    level INT NOT NULL,
    problem_number INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    grammar TEXT NOT NULL,
    input_string TEXT,
    terminals TEXT,
    non_terminals TEXT,
    expected_table TEXT,
    expected_steps TEXT,
    conflict_type TEXT,
    conflict_cells TEXT,
    hints TEXT,
    solution TEXT,
    learning_outcome TEXT,
    INDEX idx_level (level),
    INDEX idx_problem_number (problem_number)
);

-- Clear existing data
DELETE FROM ll1_parser_problems;

-- Problem 1: Basic LL(1) Table

INSERT INTO ll1_parser_problems (level, problem_number, type, title, description, grammar, terminals, non_terminals, expected_table, hints, solution, learning_outcome) VALUES
(1, 1, 'parse-table', 'Basic LL(1) Table', 
'Build the LL(1) parse table for this simple grammar. Focus on understanding when to use FOLLOW for ε-productions.',
'[{"lhs": "S", "rhs": ["a", "A"]}, {"lhs": "A", "rhs": ["b", "A"]}, {"lhs": "A", "rhs": ["c"]}]',
'["a", "b", "c", "$"]',
'["S", "A"]',
'{"S": {"a": "S \u2192 aA"}, "A": {"b": "A \u2192 bA", "c": "A \u2192 c"}}',
'["Start with FIRST sets for each production", "For A, you have two choices: A \u2192 bA and A \u2192 c", "The production A \u2192 bA applies when lookahead is b", "The production A \u2192 c applies when lookahead is c"]',
'<h4>Solution Explanation:</h4><p><strong>FIRST Sets:</strong></p><ul><li>FIRST(S → aA) = {a}</li><li>FIRST(A → bA) = {b}</li><li>FIRST(A → c) = {c}</li></ul><p><strong>Parse Table:</strong></p><ul><li>T[S, a] = S → aA (because a ∈ FIRST(aA))</li><li>T[A, b] = A → bA (because b ∈ FIRST(bA))</li><li>T[A, c] = A → c (because c ∈ FIRST(c))</li></ul>',
'Understand how to fill parse table cells using FIRST sets for each production.');

-- Problem 2: Grammar with epsilon
INSERT INTO ll1_parser_problems (level, problem_number, type, title, description, grammar, terminals, non_terminals, expected_table, hints, solution, learning_outcome) VALUES
(1, 2, 'parse-table', 'Parse Table with ε-production', 
'Construct the LL(1) parse table for a grammar with an epsilon production.',
'[{"lhs":"S","rhs":["a","A"]},{"lhs":"A","rhs":["b","A"]},{"lhs":"A","rhs":["ε"]}]',
'["a","b","$"]',
'["S","A"]',
'{"S":{"a":"S → aA"},"A":{"b":"A → bA","$":"A → ε"}}',
'["Compute FIRST and FOLLOW for all non-terminals","For ε-productions, use FOLLOW set"]',
'<p>When A has ε-production, use FOLLOW(A) to determine when to apply it.</p>',
'Understand when to use FOLLOW(A) for ε-productions in parse table construction.');

-- Problem 3: Expression Grammar
INSERT INTO ll1_parser_problems (level, problem_number, type, title, description, grammar, terminals, non_terminals, expected_table, hints, solution, learning_outcome) VALUES
(1, 3, 'parse-table', 'Expression Grammar Parse Table', 
'Build the complete LL(1) parse table for this classic expression grammar.',
'[{"lhs":"E","rhs":["T","Ep"]},{"lhs":"Ep","rhs":["+","T","Ep"]},{"lhs":"Ep","rhs":["ε"]},{"lhs":"T","rhs":["F","Tp"]},{"lhs":"Tp","rhs":["*","F","Tp"]},{"lhs":"Tp","rhs":["ε"]},{"lhs":"F","rhs":["(","E",")"]},{"lhs":"F","rhs":["id"]}]',
'["id","+","*","(",")","$"]',
'["E","Ep","T","Tp","F"]',
'{"E":{"id":"E → TEp","(":"E → TEp"},"Ep":{"+":"Ep → +TEp",")":"Ep → ε","$":"Ep → ε"},"T":{"id":"T → FTp","(":"T → FTp"},"Tp":{"+":"Tp → ε","*":"Tp → *FTp",")":"Tp → ε","$":"Tp → ε"},"F":{"id":"F → id","(":"F → (E)"}}',
'["E and T both start with F","Ep and Tp have ε-productions"]',
'<p>Expression grammar with operator precedence.</p>',
'Understand LL(1) grammar with operator precedence and ε-productions.');

-- Problem 4: Nested Structure
INSERT INTO ll1_parser_problems (level, problem_number, type, title, description, grammar, terminals, non_terminals, expected_table, hints, solution, learning_outcome) VALUES
(1, 4, 'parse-table', 'Nested Structure Grammar', 
'Construct the LL(1) parse table for a grammar with nested parentheses.',
'[{"lhs":"S","rhs":["(","L",")"]},{"lhs":"S","rhs":["a"]},{"lhs":"L","rhs":["S","Lp"]},{"lhs":"Lp","rhs":[",","S","Lp"]},{"lhs":"Lp","rhs":["ε"]}]',
'["a","(",")",",","$"]',
'["S","L","Lp"]',
'{"S":{"(":"S → (L)","a":"S → a"},"L":{"(":"L → SLp","a":"L → SLp"},"Lp":{",":"Lp → ,SLp",")":"Lp → ε"}}',
'["S has two alternatives","L starts with S","Lp has ε-production"]',
'<p>Nested structures with lists.</p>',
'Learn nested and recursive structures in LL(1).');


-- Problem 5: Simple Parsing Trace (Level 2)
INSERT INTO ll1_parser_problems (level, problem_number, type, title, description, grammar, input_string, terminals, non_terminals, expected_table, expected_steps, hints, solution, learning_outcome) VALUES
(2, 5, 'parsing-simulation', 'Simple Parsing Trace', 
'Simulate LL(1) parsing for the input string "a b b c $".',
'[{"lhs":"S","rhs":["a","A"]},{"lhs":"A","rhs":["b","A"]},{"lhs":"A","rhs":["c"]}]',
'a b b c',
'["a","b","c","$"]',
'["S","A"]',
'{"S":{"a":"S → aA"},"A":{"b":"A → bA","c":"A → c"}}',
'[{"step":1,"stack":"S$","input":"abbc$","action":"Apply S → aA","matched":false},{"step":2,"stack":"aA$","input":"abbc$","action":"Match a","matched":true},{"step":3,"stack":"A$","input":"bbc$","action":"Apply A → bA","matched":false},{"step":4,"stack":"bA$","input":"bbc$","action":"Match b","matched":true},{"step":5,"stack":"A$","input":"bc$","action":"Apply A → bA","matched":false},{"step":6,"stack":"bA$","input":"bc$","action":"Match b","matched":true},{"step":7,"stack":"A$","input":"c$","action":"Apply A → c","matched":false},{"step":8,"stack":"c$","input":"c$","action":"Match c","matched":true},{"step":9,"stack":"$","input":"$","action":"Accept","matched":true}]',
'["Start with S on stack","When non-terminal: use parse table","When terminal: match with input"]',
'<p>Step-by-step LL(1) parsing trace.</p>',
'Understand LL(1) parsing trace mechanics.');

-- Problem 6: Parsing with epsilon (Level 2)
INSERT INTO ll1_parser_problems (level, problem_number, type, title, description, grammar, input_string, terminals, non_terminals, expected_table, expected_steps, hints, solution, learning_outcome) VALUES
(2, 6, 'parsing-simulation', 'Parsing with ε-production', 
'Perform parsing steps for input "a b $".',
'[{"lhs":"S","rhs":["a","A"]},{"lhs":"A","rhs":["b"]},{"lhs":"A","rhs":["ε"]}]',
'a b',
'["a","b","$"]',
'["S","A"]',
'{"S":{"a":"S → aA"},"A":{"b":"A → b","$":"A → ε"}}',
'[{"step":1,"stack":"S$","input":"ab$","action":"Apply S → aA","matched":false},{"step":2,"stack":"aA$","input":"ab$","action":"Match a","matched":true},{"step":3,"stack":"A$","input":"b$","action":"Apply A → b","matched":false},{"step":4,"stack":"b$","input":"b$","action":"Match b","matched":true},{"step":5,"stack":"$","input":"$","action":"Accept","matched":true}]',
'["Parser chooses A → b when lookahead is b","ε-production used when lookahead is $"]',
'<p>ε-productions based on lookahead.</p>',
'Handling ε-productions in LL(1) parsing.');

-- Problem 7: Expression Parsing (Level 2)
INSERT INTO ll1_parser_problems (level, problem_number, type, title, description, grammar, input_string, terminals, non_terminals, expected_table, expected_steps, hints, solution, learning_outcome) VALUES
(2, 7, 'parsing-simulation', 'Expression Parsing Trace', 
'Simulate parsing for "id + id $".',
'[{"lhs":"E","rhs":["T","Ep"]},{"lhs":"Ep","rhs":["+","T","Ep"]},{"lhs":"Ep","rhs":["ε"]},{"lhs":"T","rhs":["F"]},{"lhs":"F","rhs":["id"]}]',
'id + id',
'["id","+","$"]',
'["E","Ep","T","F"]',
'{"E":{"id":"E → TEp"},"Ep":{"+":"Ep → +TEp","$":"Ep → ε"},"T":{"id":"T → F"},"F":{"id":"F → id"}}',
'[{"step":1,"stack":"E$","input":"id+id$","action":"Apply E → TEp","matched":false},{"step":2,"stack":"TEp$","input":"id+id$","action":"Apply T → F","matched":false},{"step":3,"stack":"FEp$","input":"id+id$","action":"Apply F → id","matched":false},{"step":4,"stack":"idEp$","input":"id+id$","action":"Match id","matched":true},{"step":5,"stack":"Ep$","input":"+id$","action":"Apply Ep → +TEp","matched":false},{"step":6,"stack":"+TEp$","input":"+id$","action":"Match +","matched":true},{"step":7,"stack":"TEp$","input":"id$","action":"Apply T → F","matched":false},{"step":8,"stack":"FEp$","input":"id$","action":"Apply F → id","matched":false},{"step":9,"stack":"idEp$","input":"id$","action":"Match id","matched":true},{"step":10,"stack":"Ep$","input":"$","action":"Apply Ep → ε","matched":false},{"step":11,"stack":"$","input":"$","action":"Accept","matched":true}]',
'["E expands to TEp","After first id, Ep sees + so expands","After second id, Ep sees $ so applies ε"]',
'<p>Expression parsing with operators.</p>',
'LL(1) handles operator precedence.');


-- Problem 8: FIRST/FIRST Conflict (Level 3)
INSERT INTO ll1_parser_problems (level, problem_number, type, title, description, grammar, terminals, non_terminals, conflict_type, conflict_cells, hints, solution, learning_outcome) VALUES
(3, 8, 'conflict-detection', 'FIRST/FIRST Conflict', 
'Try to build the LL(1) parse table and identify the conflict type.',
'[{"lhs":"S","rhs":["i","E","t","S"]},{"lhs":"S","rhs":["i","E","t","S","e","S"]},{"lhs":"S","rhs":["a"]},{"lhs":"E","rhs":["b"]}]',
'["i","t","e","a","b","$"]',
'["S","E"]',
'first-first',
'[{"row":"S","col":"i","conflicts":["S → iEtS","S → iEtSeS"],"reason":"Both productions start with i"}]',
'["Both S productions start with i","Parser cannot decide which to use","This is FIRST/FIRST conflict"]',
'<p><strong>FIRST/FIRST Conflict:</strong> Both S → iEtS and S → iEtSeS want cell T[S,i]. This is the dangling else problem.</p>',
'Recognizing FIRST/FIRST conflict.');

-- Problem 9: FIRST/FOLLOW Conflict (Level 3)
INSERT INTO ll1_parser_problems (level, problem_number, type, title, description, grammar, terminals, non_terminals, conflict_type, conflict_cells, hints, solution, learning_outcome) VALUES
(3, 9, 'conflict-detection', 'FIRST/FOLLOW Conflict', 
'Build parse table and identify epsilon-related conflict.',
'[{"lhs":"A","rhs":["a","A"]},{"lhs":"A","rhs":["ε"]}]',
'["a","$"]',
'["A"]',
'first-follow',
'[{"row":"A","col":"a","conflicts":["A → aA","A → ε"],"reason":"FIRST(A) ∩ FOLLOW(A) contains a"}]',
'["FIRST(A) = {a, ε}","FOLLOW(A) = {a, $}","Intersection is non-empty","FIRST/FOLLOW conflict"]',
'<p><strong>FIRST/FOLLOW Conflict:</strong> T[A,a] has two entries: A → aA (from FIRST) and A → ε (from FOLLOW). Grammar not LL(1).</p>',
'Understanding epsilon-related ambiguity.');

-- Problem 10: Grammar Correction Challenge (Level 3)
INSERT INTO ll1_parser_problems (level, problem_number, type, title, description, grammar, terminals, non_terminals, conflict_type, conflict_cells, hints, solution, learning_outcome) VALUES
(3, 10, 'conflict-detection', 'Grammar Correction Challenge', 
'Identify conflicts and suggest fixes to make grammar LL(1).',
'[{"lhs":"S","rhs":["A","a"]},{"lhs":"S","rhs":["b"]},{"lhs":"A","rhs":["A","c"]},{"lhs":"A","rhs":["S","d"]},{"lhs":"A","rhs":["ε"]}]',
'["a","b","c","d","$"]',
'["S","A"]',
'both',
'[{"row":"S","col":"a","conflicts":["multiple"],"reason":"Left recursion + epsilon"},{"row":"A","col":"a","conflicts":["multiple"],"reason":"Left recursion"}]',
'["A → Ac is left recursive","S → Aa, A → Sd creates indirect recursion","A → ε adds more ambiguity","Must eliminate left recursion first"]',
'<p><strong>Multiple Problems:</strong> Direct left recursion (A → Ac), indirect left recursion (S → Aa → Sda), and epsilon production. Fix by eliminating left recursion then checking LL(1) property.</p>',
'Repair grammars to achieve LL(1) property.');

