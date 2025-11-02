-- Migration Script: Convert from Regular Grammar to Left Recursion Elimination
-- This script replaces old problems with new Left Recursion Elimination problems

USE compiler_learning;

-- Delete old problems (Regular Grammar conversion problems)
DELETE FROM problems;

-- Reset auto-increment counter
ALTER TABLE problems AUTO_INCREMENT = 1;

-- Insert new Left Recursion Elimination problems
-- Problem 1: Simple Direct Left Recursion
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'A -> Aab | c',
    'A -> cA''\nA'' -> abA'' | ε',
    'Direct left recursion elimination:\n1. Identify: A -> Aab (left recursive), A -> c (non-recursive)\n2. α = "ab", β = "c"\n3. Create A'' for recursion\n4. A -> cA'' (β followed by A'')\n5. A'' -> abA'' | ε (α followed by A'' or epsilon)'
);

-- Problem 2: Direct Left Recursion with Multiple Alternatives
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'E -> E+T | E-T | T',
    'E -> TE''\nE'' -> +TE'' | -TE'' | ε',
    'Classic expression grammar with direct left recursion:\n1. Left recursive: E -> E+T, E -> E-T\n2. Non-recursive: E -> T\n3. α₁ = "+T", α₂ = "-T", β = "T"\n4. E -> TE'' (start with T, continue with E'')\n5. E'' -> +TE'' | -TE'' | ε'
);

-- Problem 3: Indirect Left Recursion (Simple)
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'S -> Aa | b\nA -> Sc | d',
    'S -> Aa | b\nA -> bcA'' | dA''\nA'' -> acA'' | ε',
    'Indirect left recursion through S and A:\n1. Order: S, A\n2. Process A: substitute S in A -> Sc\n3. A -> (Aa | b)c | d = Aac | bc | d\n4. Eliminate direct recursion from A\n5. A -> bcA'' | dA'', A'' -> acA'' | ε\n6. S remains unchanged'
);

-- Problem 4: More Complex Indirect Recursion
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'S -> Aa | bB\nA -> Ac | Sd | ε\nB -> e | f',
    'S -> Aa | bB\nA -> bBdA'' | A''\nA'' -> cA'' | adA'' | ε\nB -> e | f',
    'Multi-step indirect recursion:\n1. Order: S, A, B\n2. Process A (i=2): substitute S in A -> Sd\n3. A -> Ac | Aad | bBd | ε\n4. Eliminate direct recursion from A\n5. β = "bBd", "ε" and α = "c", "ad"\n6. A -> bBdA'' | A'' (ε becomes just A'')\n7. A'' -> cA'' | adA'' | ε\n8. B has no left recursion'
);

-- Problem 5: Direct LR with No Non-recursive Alternative
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'A -> Aa | Ab',
    'A -> A''\nA'' -> aA'' | bA'' | ε',
    'Edge case: no β productions\n1. All productions are left recursive\n2. α₁ = "a", α₂ = "b"\n3. Since no β, A -> A'' (just the prime)\n4. A'' -> aA'' | bA'' | ε'
);

-- Problem 6: Multiple Non-terminals with Direct LR
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'S -> Sa | Ab\nA -> Ac | d',
    'S -> AbS''\nS'' -> aS'' | ε\nA -> dA''\nA'' -> cA'' | ε',
    'Two non-terminals each with direct LR:\n1. S: α="a", β="Ab" → S -> AbS'', S'' -> aS'' | ε\n2. A: α="c", β="d" → A -> dA'', A'' -> cA'' | ε\n3. No indirect recursion between them'
);

-- Problem 7: Complex Indirect with Three Non-terminals
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'S -> Aa | b\nA -> Bb | c\nB -> Sc | d',
    'S -> Aa | b\nA -> Bb | c\nB -> cacB'' | bcB'' | dB''\nB'' -> bacB'' | ε',
    'Three-way indirect recursion S→A→B→S:\n1. Order: S, A, B\n2. Process B: substitute S in B -> Sc\n3. B -> (Aa | b)c | d = Aac | bc | d\n4. Substitute A: B -> (Bb | c)ac | bc | d = Bbac | cac | bc | d\n5. Eliminate direct recursion from B\n6. B -> cacB'' | bcB'' | dB'', B'' -> bacB'' | ε\n7. S and A remain unchanged'
);

-- Problem 8: Tricky - Hidden Indirect Recursion
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'E -> T\nT -> F\nF -> E+F | id',
    'E -> T\nT -> F\nF -> idF''\nF'' -> +FF'' | ε',
    'Looks like indirect but simplifies:\n1. F -> E+F has potential for indirect recursion\n2. Substituting: F -> T+F -> F+F\n3. Direct recursion appears: F -> F+F | id\n4. Eliminate: F -> idF'', F'' -> +FF'' | ε\n5. E and T remain unchanged as pass-through'
);

-- Verify the inserted data
SELECT id, 
       LEFT(question, 50) as question_preview, 
       LEFT(expected_output, 50) as output_preview 
FROM problems
ORDER BY id;

-- Display count
SELECT COUNT(*) as total_problems FROM problems;
