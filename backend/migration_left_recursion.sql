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
    '🔹 Step 1: Identify the Type of Recursion\nDirect left recursion in production A → Aab\n\n🔹 Step 2: Substitute\nFor indirect recursion, substitute higher-order non-terminals in lower ones.\nNot applicable (direct recursion only)\n\n🔹 Step 3: Separate α (recursive part) and β (non-recursive part)\nα = "ab" (follows A in the recursive production)\nβ = "c" (the non-recursive production)\n\n🔹 Step 4: Create New Variable (A′)\nIntroduce A'' to handle the recursive continuation\n\n🔹 Step 5: Rewrite Final Grammar\nA → cA'' (β followed by A'')\nA'' → abA'' | ε (α followed by A'' or epsilon)'
);

-- Problem 2: Direct Left Recursion with Multiple Alternatives
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'E -> E+T | E-T | T',
    'E -> TE''\nE'' -> +TE'' | -TE'' | ε',
    '🔹 Step 1: Identify the Type of Recursion\nDirect left recursion in E → E+T and E → E-T\n\n🔹 Step 2: Substitute\nFor indirect recursion, substitute higher-order non-terminals in lower ones.\nNot applicable (direct recursion only)\n\n🔹 Step 3: Separate α (recursive part) and β (non-recursive part)\nα₁ = "+T", α₂ = "-T" (recursive parts after E)\nβ = "T" (non-recursive production)\n\n🔹 Step 4: Create New Variable (E′)\nIntroduce E'' to handle multiple recursive alternatives\n\n🔹 Step 5: Rewrite Final Grammar\nE → TE'' (start with T, continue with E'')\nE'' → +TE'' | -TE'' | ε (all α values with E'' or epsilon)'
);

-- Problem 3: Indirect Left Recursion (Simple)
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'S -> Aa | b\nA -> Sc | d',
    'S -> Aa | b\nA -> bcA'' | dA''\nA'' -> acA'' | ε',
    '🔹 Step 1: Identify the Type of Recursion\nIndirect left recursion: S → A → S (through A → Sc)\nOrder non-terminals: S, A\n\n🔹 Step 2: Substitute\nFor indirect recursion, substitute higher-order non-terminals in lower ones.\nSubstitute S in A → Sc:\nA → (Aa | b)c | d\nA → Aac | bc | d\n\n🔹 Step 3: Separate α (recursive part) and β (non-recursive part)\nAfter substitution:\nα = "ac" (recursive part)\nβ₁ = "bc", β₂ = "d" (non-recursive parts)\n\n🔹 Step 4: Create New Variable (A′)\nIntroduce A'' for handling recursion in A\n\n🔹 Step 5: Rewrite Final Grammar\nS → Aa | b (unchanged)\nA → bcA'' | dA'' (β productions with A'')\nA'' → acA'' | ε (α production with A'' or epsilon)'
);

-- Problem 4: More Complex Indirect Recursion
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'S -> Aa | bB\nA -> Ac | Sd | ε\nB -> e | f',
    'S -> Aa | bB\nA -> bBdA'' | A''\nA'' -> cA'' | adA'' | ε\nB -> e | f',
    '🔹 Step 1: Identify the Type of Recursion\nIndirect left recursion: A → S → A (through A → Sd)\nOrder non-terminals: S, A, B\n\n🔹 Step 2: Substitute\nFor indirect recursion, substitute higher-order non-terminals in lower ones.\nSubstitute S in A → Sd:\nA → (Aa | bB)d\nA → Aad | bBd\nCombine with A → Ac | ε:\nA → Ac | Aad | bBd | ε\n\n🔹 Step 3: Separate α (recursive part) and β (non-recursive part)\nAfter substitution:\nα₁ = "c", α₂ = "ad" (recursive parts)\nβ₁ = "bBd", β₂ = "ε" (non-recursive parts)\n\n🔹 Step 4: Create New Variable (A′)\nIntroduce A'' for handling recursion in A\n\n🔹 Step 5: Rewrite Final Grammar\nS → Aa | bB (unchanged)\nA → bBdA'' | A'' (when β is ε, write just A'')\nA'' → cA'' | adA'' | ε (all α values)\nB → e | f (unchanged)'
);

-- Problem 5: Direct LR with No Non-recursive Alternative
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'A -> Aa | Ab',
    'A -> A''\nA'' -> aA'' | bA'' | ε',
    '🔹 Step 1: Identify the Type of Recursion\nDirect left recursion in A → Aa and A → Ab\nEdge case: No non-recursive alternative\n\n🔹 Step 2: Substitute\nFor indirect recursion, substitute higher-order non-terminals in lower ones.\nNot applicable (direct recursion only)\n\n🔹 Step 3: Separate α (recursive part) and β (non-recursive part)\nα₁ = "a", α₂ = "b" (all productions are recursive)\nβ = (empty - no non-recursive productions)\n\n🔹 Step 4: Create New Variable (A′)\nIntroduce A'' to handle all recursive cases\n\n🔹 Step 5: Rewrite Final Grammar\nA → A'' (since no β, start directly with A'')\nA'' → aA'' | bA'' | ε (all α values with A'' or epsilon)'
);

-- Problem 6: Multiple Non-terminals with Direct LR
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'S -> Sa | Ab\nA -> Ac | d',
    'S -> AbS''\nS'' -> aS'' | ε\nA -> dA''\nA'' -> cA'' | ε',
    '🔹 Step 1: Identify the Type of Recursion\nDirect left recursion in both S and A\nS → Sa (direct)\nA → Ac (direct)\nNo indirect recursion between them\n\n🔹 Step 2: Substitute\nFor indirect recursion, substitute higher-order non-terminals in lower ones.\nNot applicable (direct recursion only)\n\n🔹 Step 3: Separate α (recursive part) and β (non-recursive part)\nFor S: α = "a", β = "Ab"\nFor A: α = "c", β = "d"\n\n🔹 Step 4: Create New Variables (S′ and A′)\nIntroduce S'' for S recursion\nIntroduce A'' for A recursion\n\n🔹 Step 5: Rewrite Final Grammar\nS → AbS'' (β followed by S'')\nS'' → aS'' | ε (α followed by S'' or epsilon)\nA → dA'' (β followed by A'')\nA'' → cA'' | ε (α followed by A'' or epsilon)'
);

-- Problem 7: Complex Indirect with Three Non-terminals
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'S -> Aa | b\nA -> Bb | c\nB -> Sc | d',
    'S -> Aa | b\nA -> Bb | c\nB -> cacB'' | bcB'' | dB''\nB'' -> bacB'' | ε',
    '🔹 Step 1: Identify the Type of Recursion\nIndirect left recursion: S → A → B → S (three-way cycle)\nOrder non-terminals: S, A, B\n\n🔹 Step 2: Substitute\nFor indirect recursion, substitute higher-order non-terminals in lower ones.\nSubstitute S in B → Sc:\nB → (Aa | b)c | d = Aac | bc | d\nSubstitute A in B → Aac:\nB → (Bb | c)ac | bc | d = Bbac | cac | bc | d\n\n🔹 Step 3: Separate α (recursive part) and β (non-recursive part)\nAfter all substitutions:\nα = "bac" (recursive part)\nβ₁ = "cac", β₂ = "bc", β₃ = "d" (non-recursive parts)\n\n🔹 Step 4: Create New Variable (B′)\nIntroduce B'' for handling recursion in B\n\n🔹 Step 5: Rewrite Final Grammar\nS → Aa | b (unchanged)\nA → Bb | c (unchanged)\nB → cacB'' | bcB'' | dB'' (all β productions with B'')\nB'' → bacB'' | ε (α production with B'' or epsilon)'
);

-- Problem 8: Tricky - Hidden Indirect Recursion
INSERT INTO problems (question, expected_output, explanation) VALUES
(
    'E -> T\nT -> F\nF -> E+F | id',
    'E -> T\nT -> F\nF -> idF''\nF'' -> +FF'' | ε',
    '🔹 Step 1: Identify the Type of Recursion\nIndirect left recursion: F → E → T → F (circular chain)\nOrder non-terminals: E, T, F\n\n🔹 Step 2: Substitute\nFor indirect recursion, substitute higher-order non-terminals in lower ones.\nSubstitute E in F → E+F:\nF → T+F (since E → T)\nSubstitute T in F → T+F:\nF → F+F (since T → F)\nCombine: F → F+F | id\n\n🔹 Step 3: Separate α (recursive part) and β (non-recursive part)\nAfter substitution:\nα = "+F" (recursive part)\nβ = "id" (non-recursive part)\n\n🔹 Step 4: Create New Variable (F′)\nIntroduce F'' for handling recursion in F\n\n🔹 Step 5: Rewrite Final Grammar\nE → T (unchanged, pass-through)\nT → F (unchanged, pass-through)\nF → idF'' (β followed by F'')\nF'' → +FF'' | ε (α followed by F'' or epsilon)'
);

-- Verify the inserted data
SELECT id, 
       LEFT(question, 50) as question_preview, 
       LEFT(expected_output, 50) as output_preview 
FROM problems
ORDER BY id;

-- Display count
SELECT COUNT(*) as total_problems FROM problems;
