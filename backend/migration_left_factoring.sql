-- Migration for Left Factoring Problems
-- Create table for left factoring problems

CREATE TABLE IF NOT EXISTS left_factoring_problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert tricky left factoring problems with detailed step-by-step explanations

-- Problem 1: Simple if-then-else statement (Classic Example)
INSERT INTO left_factoring_problems (question, expected_output, explanation) VALUES (
'S -> iEtS | iEtSeS | a
E -> b',
'S -> iEtSS\' | a
S\' -> ε | eS
E -> b',
'🔹 Step 1: Identify Common Prefixes
Non-terminal **S** has productions: iEtS, iEtSeS, a
Common prefix found: **iEtS**

🔹 Step 2: Group Productions by Common Prefix
Productions with prefix "iEtS": iEtS, iEtSeS
Productions without prefix: a

🔹 Step 3: Extract Remaining Parts
After removing "iEtS":
• First production (iEtS): **ε** (nothing remains)
• Second production (iEtSeS): **eS** (remaining part)

🔹 Step 4: Create New Variable
For S, create **S\'** to hold the suffixes

🔹 Step 5: Rewrite Final Grammar
Original S productions become:
S → iEtS**S\'** | a
New variable S\' holds the suffixes:
S\' → **ε** | **eS**
E remains unchanged: E → b'
);

-- Problem 2: Multiple common prefixes
INSERT INTO left_factoring_problems (question, expected_output, explanation) VALUES (
'A -> abcd | abce | abcf | xyz',
'A -> abcA\' | xyz
A\' -> d | e | f',
'🔹 Step 1: Identify Common Prefixes
Non-terminal **A** has productions: abcd, abce, abcf, xyz
Common prefix in first 3 productions: **abc**

🔹 Step 2: Group Productions
With prefix "abc": abcd, abce, abcf
Without prefix: xyz

🔹 Step 3: Extract Suffixes
After "abc":
• d (from abcd)
• e (from abce)
• f (from abcf)

🔹 Step 4: Create New Variable A\'
A\' will hold the three suffixes

🔹 Step 5: Final Factored Grammar
A → abc**A\'** | xyz
A\' → **d** | **e** | **f**'
);

-- Problem 3: Nested left factoring
INSERT INTO left_factoring_problems (question, expected_output, explanation) VALUES (
'S -> abc | abd | abe | f',
'S -> abS\' | f
S\' -> c | d | e',
'🔹 Step 1: Identify Common Prefixes
S has productions: abc, abd, abe, f
Common prefix: **ab** (in first 3 productions)

🔹 Step 2: Group Productions
With prefix "ab": abc, abd, abe
Without prefix: f

🔹 Step 3: Extract Suffixes
After "ab":
• c, d, e

🔹 Step 4: Create New Variable S\'
S → ab**S\'** | f
S\' → c | d | e

🔹 Step 5: Final Grammar
S → abS\' | f
S\' → c | d | e'
);

-- Problem 4: Exact prefix match (requires epsilon)
INSERT INTO left_factoring_problems (question, expected_output, explanation) VALUES (
'A -> ab | abc | abd',
'A -> abA\'
A\' -> ε | c | d',
'🔹 Step 1: Identify Common Prefixes
All productions start with **ab**

🔹 Step 2: Group and Extract Suffixes
After "ab":
• First production (ab): **ε** (nothing remains)
• Second (abc): c
• Third (abd): d

🔹 Step 3: Create New Variable A\'

🔹 Step 4: Handle Epsilon
Since one production is exactly "ab", we need **ε** in A\'

🔹 Step 5: Final Grammar
A → ab**A\'**
A\' → **ε** | c | d

**Key Point:** When a production equals the common prefix exactly, use ε!'
);

-- Problem 5: Multiple non-terminals needing factoring
INSERT INTO left_factoring_problems (question, expected_output, explanation) VALUES (
'S -> aAd | aAb | aBe | aBa
A -> c | d',
'S -> aS\' | aBe | aBa
S\' -> Ad | Ab
A -> c | d',
'🔹 Step 1: Identify Common Prefixes
S productions: aAd, aAb, aBe, aBa
First group prefix: **aA** (in aAd, aAb)

🔹 Step 2: Group Productions
Prefix "aA": aAd, aAb
Different prefix "aB": aBe, aBa (keep separate)

🔹 Step 3: Extract Suffixes
After "aA": d, b

🔹 Step 4: Create New Variable S\'
For the aA group only

🔹 Step 5: Final Grammar
S → a**S\'** | aBe | aBa
S\' → **Ad** | **Ab**
A → c | d (unchanged)

**Note:** aBe and aBa are NOT factored together because they differ in the next symbol (B vs A)'
);

-- Problem 6: Three-way common prefix
INSERT INTO left_factoring_problems (question, expected_output, explanation) VALUES (
'E -> T+E | T-E | T
T -> int | (E)',
'E -> TE\'
E\' -> +E | -E | ε
T -> int | (E)',
'🔹 Step 1: Identify Common Prefixes
E productions: T+E, T-E, T
All start with **T**

🔹 Step 2: Group All Expressions
With prefix "T": All three productions

🔹 Step 3: Extract Suffixes
After "T":
• +E
• -E
• **ε** (for production "T")

🔹 Step 4: Create New Variable E\'

🔹 Step 5: Final Grammar
E → T**E\'**
E\' → **+E** | **-E** | **ε**
T → int | (E)

**Important:** The production "T" becomes ε in E\''
);

-- Problem 7: Complex nested factoring
INSERT INTO left_factoring_problems (question, expected_output, explanation) VALUES (
'S -> aSb | aSc | aT | a
T -> d | e',
'S -> aS\'
S\' -> Sb | Sc | T | ε
T -> d | e',
'🔹 Step 1: Identify Common Prefixes
All S productions start with **a**

🔹 Step 2: Group Productions
All start with "a": aSb, aSc, aT, a

🔹 Step 3: Extract Suffixes
After "a":
• Sb
• Sc
• T
• **ε** (from production "a")

🔹 Step 4: Create S\'

🔹 Step 5: Final Grammar
S → a**S\'**
S\' → **Sb** | **Sc** | **T** | **ε**
T → d | e

**Key:** Production "a" results in ε in S\''
);

-- Problem 8: Tricky partial overlap
INSERT INTO left_factoring_problems (question, expected_output, explanation) VALUES (
'A -> xyz | xyab | xyw | pq',
'A -> xyA\' | pq
A\' -> z | ab | w',
'🔹 Step 1: Identify Common Prefixes
Productions: xyz, xyab, xyw, pq
First 3 share prefix: **xy**

🔹 Step 2: Group Productions
With prefix "xy": xyz, xyab, xyw
Without prefix: pq

🔹 Step 3: Extract Suffixes
After "xy":
• z
• ab
• w

🔹 Step 4: Create A\'

🔹 Step 5: Final Grammar
A → xy**A\'** | pq
A\' → **z** | **ab** | **w**

**Note:** "pq" doesn\'t share the prefix, so it stays unchanged'
);

-- Problem 9: Statement list with common prefix
INSERT INTO left_factoring_problems (question, expected_output, explanation) VALUES (
'S -> begin L end | begin end
L -> S | L;S',
'S -> beginS\'
S\' -> L end | end
L -> S | L;S',
'🔹 Step 1: Identify Common Prefixes
S productions: begin L end, begin end
Common prefix: **begin**

🔹 Step 2: Extract Suffixes
After "begin":
• L end
• end

🔹 Step 3: Create S\'

🔹 Step 4: Final Grammar
S → begin**S\'**
S\' → **L end** | **end**
L → S | L;S

**Analysis:** Both productions start with "begin", so we factor it out'
);

-- Problem 10: Multiple levels with different prefixes
INSERT INTO left_factoring_problems (question, expected_output, explanation) VALUES (
'A -> abcX | abcY | abcZ | adP | adQ | b
X -> m
Y -> n
Z -> o
P -> p
Q -> q',
'A -> aA\'\' | b
A\'\' -> bcA\'\'\'\' | dA\'\'\'\'\'
A\'\'\'\' -> X | Y | Z
A\'\'\'\'\' -> P | Q
X -> m
Y -> n
Z -> o
P -> p
Q -> q',
'🔹 Step 1: Identify Common Prefixes (First Pass)
Productions: abcX, abcY, abcZ, adP, adQ, b
Group 1 prefix: **a** (in first 5)

🔹 Step 2: First Factoring
A → a**A\'\'** | b

🔹 Step 3: Factor A\'\' Productions
A\'\' has: bcX, bcY, bcZ, dP, dQ
Two subgroups:
• Prefix "bc": bcX, bcY, bcZ
• Prefix "d": dP, dQ

🔹 Step 4: Second Level Factoring
A\'\' → bc**A\'\'\'\'** | d**A\'\'\'\'\'**
A\'\'\'\' → X | Y | Z
A\'\'\'\'\' -> P | Q

🔹 Step 5: Final Multi-Level Grammar
A → aA\'\' | b
A\'\' → bcA\'\'\'\' | dA\'\'\'\'\'
A\'\'\'\' → X | Y | Z
A\'\'\'\'\' → P | Q
(X, Y, Z, P, Q unchanged)

**Key Learning:** Sometimes multiple rounds of factoring are needed!'
);

COMMIT;
