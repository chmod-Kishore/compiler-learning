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

-- Insert the 6 specified practice problems with expanded explanations
INSERT INTO first_follow_problems (question, expected_first, expected_follow, explanation) VALUES

-- Problem 01
(
    'S -> aBDh\nB -> cC\nC -> bC | ∈\nD -> EF\nE -> g | ∈\nF -> f | ∈',
    'FIRST(S)={a}\nFIRST(B)={c}\nFIRST(C)={b,∈}\nFIRST(D)={g,f,∈}\nFIRST(E)={g,∈}\nFIRST(F)={f,∈}',
    'FOLLOW(S)={$}\nFOLLOW(B)={g,f,h}\nFOLLOW(C)={g,f,h}\nFOLLOW(D)={h}\nFOLLOW(E)={f,h}\nFOLLOW(F)={h}',
    'Problem-01:\n\nCalculate the first and follow functions for the given grammar-\n\nS → aBDh\nB → cC\nC → bC / ∈\nD → EF\nE → g / ∈\nF → f / ∈\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { a }\n    First(B) = { c }\n    First(C) = { b , ∈ }\n    First(D) = { First(E) – ∈ } ∪ First(F) = { g , f , ∈ }\n    First(E) = { g , ∈ }\n    First(F) = { f , ∈ }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(B) = { First(D) – ∈ } ∪ First(h) = { g , f , h }\n    Follow(C) = Follow(B) = { g , f , h }\n    Follow(D) = First(h) = { h }\n    Follow(E) = { First(F) – ∈ } ∪ Follow(D) = { f , h }\n    Follow(F) = Follow(D) = { h }'
),

-- Problem 02
(
    'S -> A\nA -> aB | Ad\nB -> b\nC -> g',
    'FIRST(S)={a}\nFIRST(A)={a}\nFIRST(A\')={d,∈}\nFIRST(B)={b}\nFIRST(C)={g}',
    'FOLLOW(S)={$}\nFOLLOW(A)={$}\nFOLLOW(A\')={$}\nFOLLOW(B)={d,$}\nFOLLOW(C)=NA',
    'Problem-02:\n\nCalculate the first and follow functions for the given grammar-\n\nS → A\nA → aB / Ad\nB → b\nC → g\n\nSolution-\n\nWe have-\n\n    The given grammar is left recursive.\n    So, we first remove left recursion from the given grammar.\n\nAfter eliminating left recursion, we get the following grammar-\n\nS → A\nA → aBA’\nA’ → dA’ / ∈\nB → b\nC → g\n\nNow, the first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = First(A) = { a }\n    First(A) = { a }\n    First(A’) = { d , ∈ }\n    First(B) = { b }\n    First(C) = { g }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(A) = Follow(S) = { $ }\n    Follow(A’) = Follow(A) = { $ }\n    Follow(B) = { First(A’) – ∈ } ∪ Follow(A) = { d , $ }\n    Follow(C) = NA'
),

-- Problem 03
(
    'S -> (L) | a\nL -> SL\'\nL\' -> ,SL\' | ∈',
    'FIRST(S)={(,a}\nFIRST(L)={(,a}\nFIRST(L\')={,,∈}',
    'FOLLOW(S)={$,),,}\nFOLLOW(L)={)}\nFOLLOW(L\')={)}',
    'Problem-03:\n\nCalculate the first and follow functions for the given grammar-\n\nS → (L) / a\nL → SL’\nL’ → ,SL’ / ∈\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { ( , a }\n    First(L) = First(S) = { ( , a }\n    First(L’) = { , , ∈ }\n\nFollow Functions-\n\n    Follow(S) = { $ } ∪ { First(L’) – ∈ } ∪ Follow(L) ∪ Follow(L’) = { $ , , , ) }\n    Follow(L) = { ) }\n    Follow(L’) = Follow(L) = { ) }'
),

-- Problem 04
(
    'S -> AaAb | BbBa\nA -> ∈\nB -> ∈',
    'FIRST(S)={a,b}\nFIRST(A)={∈}\nFIRST(B)={∈}',
    'FOLLOW(S)={$}\nFOLLOW(A)={a,b}\nFOLLOW(B)={a,b}',
    'Problem-04:\n\nCalculate the first and follow functions for the given grammar-\n\nS → AaAb / BbBa\nA → ∈\nB → ∈\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { First(A) – ∈ } ∪ First(a) ∪ { First(B) – ∈ } ∪ First(b) = { a , b }\n    First(A) = { ∈ }\n    First(B) = { ∈ }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(A) = First(a) ∪ First(b) = { a , b }\n    Follow(B) = First(b) ∪ First(a) = { a , b }'
),

-- Problem 05
(
    'E -> E+T | T\nT -> T x F | F\nF -> (E) | id',
    'FIRST(E)={(,id}\nFIRST(E\')={+,∈}\nFIRST(T)={(,id}\nFIRST(T\')={x,∈}\nFIRST(F)={(,id}',
    'FOLLOW(E)={$,)}\nFOLLOW(E\')={$,)}\nFOLLOW(T)={+,$,)}\nFOLLOW(T\')={+,$,)}\nFOLLOW(F)={x,+,$,)}',
    'Problem-05:\n\nCalculate the first and follow functions for the given grammar-\n\nE → E + T / T\nT → T x F / F\nF → (E) / id\n\nSolution-\n\nWe have-\n\n    The given grammar is left recursive.\n    So, we first remove left recursion from the given grammar.\n\nAfter eliminating left recursion, we get the following grammar-\n\nE → TE’\nE’ → + TE’ / ∈\nT → FT’\nT’ → x FT’ / ∈\nF → (E) / id\n\nNow, the first and follow functions are as follows-\n\nFirst Functions-\n\n    First(E) = First(T) = First(F) = { ( , id }\n    First(E’) = { + , ∈ }\n    First(T) = First(F) = { ( , id }\n    First(T’) = { x , ∈ }\n    First(F) = { ( , id }\n\nFollow Functions-\n\n    Follow(E) = { $ , ) }\n    Follow(E’) = Follow(E) = { $ , ) }\n    Follow(T) = { First(E’) – ∈ } ∪ Follow(E) ∪ Follow(E’) = { + , $ , ) }\n    Follow(T’) = Follow(T) = { + , $ , ) }\n    Follow(F) = { First(T’) – ∈ } ∪ Follow(T) ∪ Follow(T’) = { x , + , $ , ) }'
),

-- Problem 06
(
    'S -> ACB | CbB | Ba\nA -> da | BC\nB -> g | ∈\nC -> h | ∈',
    'FIRST(S)={d,g,h,∈,b,a}\nFIRST(A)={d,g,h,∈}\nFIRST(B)={g,∈}\nFIRST(C)={h,∈}',
    'FOLLOW(S)={$}\nFOLLOW(A)={h,g,$}\nFOLLOW(B)={$,a,h,g}\nFOLLOW(C)={g,$,b,h}',
    'Problem-06:\n\nCalculate the first and follow functions for the given grammar-\n\nS → ACB / CbB / Ba\nA → da / BC\nB → g / ∈\nC → h / ∈\n\nSolution-\n\nThe first and follow functions are as follows-\n\nFirst Functions-\n\n    First(S) = { First(A) – ∈ }  ∪ { First(C) – ∈ } ∪ First(B) ∪ First(b) ∪ { First(B) – ∈ } ∪ First(a) = { d , g , h , ∈ , b , a }\n    First(A) = First(d) ∪ { First(B) – ∈ } ∪ First(C) = { d , g , h , ∈ }\n    First(B) = { g , ∈ }\n    First(C) = { h , ∈ }\n\nFollow Functions-\n\n    Follow(S) = { $ }\n    Follow(A) = { First(C) – ∈ } ∪ { First(B) – ∈ } ∪ Follow(S) = { h , g , $ }\n    Follow(B) = Follow(S) ∪ First(a) ∪ { First(C) – ∈ } ∪ Follow(A) = { $ , a , h , g }\n    Follow(C) = { First(B) – ∈ } ∪ Follow(S) ∪ First(b) ∪ Follow(A) = { g , $ , b , h }'
);
