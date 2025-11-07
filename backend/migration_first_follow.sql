-- Migration for First and Follow Problems

CREATE TABLE IF NOT EXISTS first_follow_problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    expected_first TEXT NOT NULL,
    expected_follow TEXT NOT NULL,
    explanation TEXT
);

-- Clear existing seed data (idempotent re-run safe)
DELETE FROM first_follow_problems;

-- Insert 10 tricky practice problems with detailed explanations
INSERT INTO first_follow_problems (question, expected_first, expected_follow, explanation) VALUES

-- Problem 01: Multiple epsilon productions with chaining
(
    'S -> aBDh\nB -> cC\nC -> bC | ε\nD -> EF\nE -> g | ε\nF -> f | ε',
    'FIRST(S)={a}\nFIRST(B)={c}\nFIRST(C)={b,ε}\nFIRST(D)={g,f,ε}\nFIRST(E)={g,ε}\nFIRST(F)={f,ε}',
    'FOLLOW(S)={$}\nFOLLOW(B)={g,f,h}\nFOLLOW(C)={g,f,h}\nFOLLOW(D)={h}\nFOLLOW(E)={f,h}\nFOLLOW(F)={h}',
    'Problem-01:\n\nCalculate the first and follow functions for the given grammar-\n\nS → aBDh\nB → cC\nC → bC / ε\nD → EF\nE → g / ε\nF → f / ε\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { a }\n    First(B) = { c }\n    First(C) = { b , ε }\n    First(D) = { First(E) – ε } ∪ First(F) = { g , f , ε }\n    First(E) = { g , ε }\n    First(F) = { f , ε }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(B) = { First(D) – ε } ∪ First(h) = { g , f , h }\n    Follow(C) = Follow(B) = { g , f , h }\n    Follow(D) = First(h) = { h }\n    Follow(E) = { First(F) – ε } ∪ Follow(D) = { f , h }\n    Follow(F) = Follow(D) = { h }'
),

-- Problem 02: Nested epsilon productions
(
    'S -> ABC\nA -> aA | ε\nB -> bB | ε\nC -> c',
    'FIRST(S)={a,b,c}\nFIRST(A)={a,ε}\nFIRST(B)={b,ε}\nFIRST(C)={c}',
    'FOLLOW(S)={$}\nFOLLOW(A)={b,c}\nFOLLOW(B)={c}\nFOLLOW(C)={$}',
    'Problem-02:\n\nCalculate the first and follow functions for the given grammar-\n\nS → ABC\nA → aA / ε\nB → bB / ε\nC → c\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { First(A) – ε } ∪ { First(B) – ε } ∪ First(C) = { a , b , c }\n    First(A) = { a , ε }\n    First(B) = { b , ε }\n    First(C) = { c }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(A) = { First(B) – ε } ∪ First(C) = { b , c }\n    Follow(B) = First(C) = { c }\n    Follow(C) = Follow(S) = { $ }'
),

-- Problem 03: Parenthesized lists (tricky FOLLOW propagation)
(
    'S -> (L) | a\nL -> SL''\nL'' -> ,SL'' | ε',
    'FIRST(S)={(,a}\nFIRST(L)={(,a}\nFIRST(L'')={,,ε}',
    'FOLLOW(S)={$,),,}\nFOLLOW(L)={)}\nFOLLOW(L'')={)}',
    'Problem-03:\n\nCalculate the first and follow functions for the given grammar-\n\nS → (L) / a\nL → SL''\nL'' → ,SL'' / ε\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { ( , a }\n    First(L) = First(S) = { ( , a }\n    First(L'') = { , , ε }\n\nFollow Functions-\n\n    Follow(S) = { $ } ∪ { First(L'') – ε } ∪ Follow(L) ∪ Follow(L'') = { $ , , , ) }\n    Follow(L) = { ) }\n    Follow(L'') = Follow(L) = { ) }'
),

-- Problem 04: Multiple epsilon alternatives
(
    'S -> AaAb | BbBa\nA -> ε\nB -> ε',
    'FIRST(S)={a,b}\nFIRST(A)={ε}\nFIRST(B)={ε}',
    'FOLLOW(S)={$}\nFOLLOW(A)={a,b}\nFOLLOW(B)={a,b}',
    'Problem-04:\n\nCalculate the first and follow functions for the given grammar-\n\nS → AaAb / BbBa\nA → ε\nB → ε\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { First(A) – ε } ∪ First(a) ∪ { First(B) – ε } ∪ First(b) = { a , b }\n    First(A) = { ε }\n    First(B) = { ε }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(A) = First(a) ∪ First(b) = { a , b }\n    Follow(B) = First(b) ∪ First(a) = { a , b }'
),

-- Problem 05: Complex nullable chain
(
    'S -> XYZ\nX -> aX | ε\nY -> bY | ε\nZ -> cZ | ε',
    'FIRST(S)={a,b,c,ε}\nFIRST(X)={a,ε}\nFIRST(Y)={b,ε}\nFIRST(Z)={c,ε}',
    'FOLLOW(S)={$}\nFOLLOW(X)={b,c,$}\nFOLLOW(Y)={c,$}\nFOLLOW(Z)={$}',
    'Problem-05:\n\nCalculate the first and follow functions for the given grammar-\n\nS → XYZ\nX → aX / ε\nY → bY / ε\nZ → cZ / ε\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { First(X) – ε } ∪ { First(Y) – ε } ∪ First(Z) = { a , b , c , ε }\n    First(X) = { a , ε }\n    First(Y) = { b , ε }\n    First(Z) = { c , ε }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(X) = { First(Y) – ε } ∪ { First(Z) – ε } ∪ Follow(S) = { b , c , $ }\n    Follow(Y) = { First(Z) – ε } ∪ Follow(S) = { c , $ }\n    Follow(Z) = Follow(S) = { $ }'
),

-- Problem 06: Multiple paths with epsilon
(
    'S -> ACB | CbB | Ba\nA -> da | BC\nB -> g | ε\nC -> h | ε',
    'FIRST(S)={d,g,h,b,a,ε}\nFIRST(A)={d,g,h,ε}\nFIRST(B)={g,ε}\nFIRST(C)={h,ε}',
    'FOLLOW(S)={$}\nFOLLOW(A)={h,g,$}\nFOLLOW(B)={$,a,h,g}\nFOLLOW(C)={g,$,b,h}',
    'Problem-06:\n\nCalculate the first and follow functions for the given grammar-\n\nS → ACB / CbB / Ba\nA → da / BC\nB → g / ε\nC → h / ε\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { First(A) – ε }  ∪ { First(C) – ε } ∪ First(B) ∪ First(b) ∪ { First(B) – ε } ∪ First(a) = { d , g , h , ε , b , a }\n    First(A) = First(d) ∪ { First(B) – ε } ∪ First(C) = { d , g , h , ε }\n    First(B) = { g , ε }\n    First(C) = { h , ε }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(A) = { First(C) – ε } ∪ { First(B) – ε } ∪ Follow(S) = { h , g , $ }\n    Follow(B) = Follow(S) ∪ First(a) ∪ { First(C) – ε } ∪ Follow(A) = { $ , a , h , g }\n    Follow(C) = { First(B) – ε } ∪ Follow(S) ∪ First(b) ∪ Follow(A) = { g , $ , b , h }'
),

-- Problem 07: Deeply nested epsilon chains
(
    'S -> AB\nA -> CD\nB -> EF\nC -> a | ε\nD -> b | ε\nE -> c | ε\nF -> d | ε',
    'FIRST(S)={a,b,c,d,ε}\nFIRST(A)={a,b,ε}\nFIRST(B)={c,d,ε}\nFIRST(C)={a,ε}\nFIRST(D)={b,ε}\nFIRST(E)={c,ε}\nFIRST(F)={d,ε}',
    'FOLLOW(S)={$}\nFOLLOW(A)={c,d,$}\nFOLLOW(B)={$}\nFOLLOW(C)={b,c,d,$}\nFOLLOW(D)={c,d,$}\nFOLLOW(E)={d,$}\nFOLLOW(F)={$}',
    'Problem-07:\n\nCalculate the first and follow functions for the given grammar-\n\nS → AB\nA → CD\nB → EF\nC → a / ε\nD → b / ε\nE → c / ε\nF → d / ε\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { First(A) – ε } ∪ First(B) = { a , b , c , d , ε }\n    First(A) = { First(C) – ε } ∪ First(D) = { a , b , ε }\n    First(B) = { First(E) – ε } ∪ First(F) = { c , d , ε }\n    First(C) = { a , ε }\n    First(D) = { b , ε }\n    First(E) = { c , ε }\n    First(F) = { d , ε }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(A) = { First(B) – ε } ∪ Follow(S) = { c , d , $ }\n    Follow(B) = Follow(S) = { $ }\n    Follow(C) = { First(D) – ε } ∪ Follow(A) = { b , c , d , $ }\n    Follow(D) = Follow(A) = { c , d , $ }\n    Follow(E) = { First(F) – ε } ∪ Follow(B) = { d , $ }\n    Follow(F) = Follow(B) = { $ }'
),

-- Problem 08: Alternating terminals and non-terminals with epsilon
(
    'S -> aAbAc\nA -> Bd\nB -> e | ε',
    'FIRST(S)={a}\nFIRST(A)={e,d}\nFIRST(B)={e,ε}',
    'FOLLOW(S)={$}\nFOLLOW(A)={b,c}\nFOLLOW(B)={d}',
    'Problem-08:\n\nCalculate the first and follow functions for the given grammar-\n\nS → aAbAc\nA → Bd\nB → e / ε\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { a }\n    First(A) = { First(B) – ε } ∪ First(d) = { e , d }\n    First(B) = { e , ε }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(A) = { b , c }\n    Follow(B) = First(d) = { d }'
),

-- Problem 09: Multiple epsilon productions in sequence
(
    'S -> PQR\nP -> a | ε\nQ -> b | ε\nR -> c | ε',
    'FIRST(S)={a,b,c,ε}\nFIRST(P)={a,ε}\nFIRST(Q)={b,ε}\nFIRST(R)={c,ε}',
    'FOLLOW(S)={$}\nFOLLOW(P)={b,c,$}\nFOLLOW(Q)={c,$}\nFOLLOW(R)={$}',
    'Problem-09:\n\nCalculate the first and follow functions for the given grammar-\n\nS → PQR\nP → a / ε\nQ → b / ε\nR → c / ε\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { First(P) – ε } ∪ { First(Q) – ε } ∪ First(R) = { a , b , c , ε }\n    First(P) = { a , ε }\n    First(Q) = { b , ε }\n    First(R) = { c , ε }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(P) = { First(Q) – ε } ∪ { First(R) – ε } ∪ Follow(S) = { b , c , $ }\n    Follow(Q) = { First(R) – ε } ∪ Follow(S) = { c , $ }\n    Follow(R) = Follow(S) = { $ }'
),

-- Problem 10: Complex branching with shared non-terminals
(
    'S -> MN | MO\nM -> m | ε\nN -> nN | n\nO -> oO | o',
    'FIRST(S)={m,n,o}\nFIRST(M)={m,ε}\nFIRST(N)={n}\nFIRST(O)={o}',
    'FOLLOW(S)={$}\nFOLLOW(M)={n,o}\nFOLLOW(N)={$}\nFOLLOW(O)={$}',
    'Problem-10:\n\nCalculate the first and follow functions for the given grammar-\n\nS → MN / MO\nM → m / ε\nN → nN / n\nO → oO / o\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { First(M) – ε } ∪ First(N) ∪ First(O) = { m , n , o }\n    First(M) = { m , ε }\n    First(N) = { n }\n    First(O) = { o }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(M) = First(N) ∪ First(O) = { n , o }\n    Follow(N) = Follow(S) = { $ }\n    Follow(O) = Follow(S) = { $ }'
);
