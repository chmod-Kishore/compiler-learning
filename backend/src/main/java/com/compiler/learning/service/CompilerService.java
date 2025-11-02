// src/main/java/com/compiler/learning/service/CompilerService.java
package com.compiler.learning.service;

import com.compiler.learning.dto.*;
import com.compiler.learning.entity.Problem;
import com.compiler.learning.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompilerService {

    private final ProblemRepository problemRepository;
    private final GrammarConversionService grammarConversionService;

    public TheoryResponse getTheory() {
        String content = """
            <h2>Left Recursion Elimination</h2>
            
            <h3>What is Left Recursion?</h3>
            <p>Left recursion occurs when a non-terminal A has a production of the form <strong>A → Aα</strong>, 
            where α is any string of grammar symbols. Left recursion can be:</p>
            <ul>
                <li><strong>Direct Left Recursion:</strong> A → Aα | β (A directly references itself as the first symbol)</li>
                <li><strong>Indirect Left Recursion:</strong> A → Bα, B → Aβ (A references itself through other non-terminals)</li>
            </ul>
            
            <h3>Why Eliminate Left Recursion?</h3>
            <p>Top-down parsers (like Recursive Descent Parsers and LL parsers) cannot handle left recursion as it leads to 
            infinite recursion. Converting to right recursion makes the grammar suitable for these parsers.</p>
            
            <h3>Algorithm for Eliminating Direct Left Recursion</h3>
            <p>For a production with direct left recursion:</p>
            <pre>A → Aα₁ | Aα₂ | ... | Aαₘ | β₁ | β₂ | ... | βₙ</pre>
            <p>Where no βᵢ starts with A, replace with:</p>
            <pre>A → β₁A' | β₂A' | ... | βₙA'
A' → α₁A' | α₂A' | ... | αₘA' | ε</pre>
            
            <h3>Algorithm for Eliminating Indirect Left Recursion</h3>
            <ol>
                <li><strong>Order non-terminals:</strong> Arrange non-terminals as A₁, A₂, ..., Aₙ</li>
                <li><strong>For each i from 1 to n:</strong>
                    <ul>
                        <li>For each j from 1 to i-1:</li>
                        <li>Replace productions of form Aᵢ → Aⱼγ with Aᵢ → δ₁γ | δ₂γ | ... where Aⱼ → δ₁ | δ₂ | ...</li>
                    </ul>
                </li>
                <li><strong>Eliminate direct left recursion</strong> from Aᵢ productions</li>
            </ol>
            
            <h3>Example 1: Direct Left Recursion</h3>
            <pre>
Input:
A → Aab | c

Output:
A → cA'
A' → abA' | ε

Explanation:
- α = "ab" (recursive part)
- β = "c" (non-recursive part)
- Create A' for the recursive continuation
            </pre>
            
            <h3>Example 2: Indirect Left Recursion</h3>
            <pre>
Input:
S → Aa | bB
A → Ac | Sd | ε
B → e | f

Step 1: Order non-terminals: S, A, B

Step 2: Process A (i=2, j=1):
- Replace A → Sd with productions of S
- A → Aad | bBd (after substitution)
- A → Ac | Aad | bBd | ε

Step 3: Eliminate direct left recursion from A:
- α = "c", "ad" (left recursive parts)
- β = "bBd", "ε" (non-recursive parts)
- Note: When β is ε, we write just A' (not εA')

Output:
S → Aa | bB
A → bBdA' | A'
A' → cA' | adA' | ε
B → e | f

Note: ε (epsilon) represents empty string. You can also use # as epsilon.
When ε is a beta production, write A' instead of εA'.
            </pre>
            
            <h3>Practice Tips</h3>
            <ul>
                <li>Always identify which non-terminal has left recursion first</li>
                <li>For indirect recursion, follow the substitution order carefully</li>
                <li>Remember: A' productions always end with ε (epsilon)</li>
                <li>The new non-terminal (A', Z, etc.) represents "zero or more" repetitions</li>
            </ul>
            """;

        return new TheoryResponse("Left Recursion Elimination", content);
    }

    public List<ProblemResponse> getProblems() {
        List<Problem> problems = problemRepository.findAll();

        return problems.stream()
                .map(p -> new ProblemResponse(p.getId(), p.getQuestion(), p.getExpectedOutput()))
                .collect(Collectors.toList());
    }

    public VerifyResponse verifyAnswer(VerifyRequest request) {
        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        String userAnswer = normalizeAnswer(request.getUserAnswer());
        String expectedAnswer = normalizeAnswer(problem.getExpectedOutput());

        boolean isCorrect = userAnswer.equals(expectedAnswer);

        if (isCorrect) {
            return new VerifyResponse(true, null, null);
        } else {
            return new VerifyResponse(false, problem.getExplanation(), problem.getExpectedOutput());
        }
    }

    public UniversalResponse generateUniversal(UniversalRequest request) {
        GrammarConversionService.ConversionResult result =
                grammarConversionService.convertLRGtoRRG(request.getGrammar());

        return new UniversalResponse(result.transformedGrammar, result.steps);
    }

    private String normalizeAnswer(String answer) {
        // Remove extra whitespace, normalize line breaks, and make case-insensitive comparison
        // Normalize epsilon representations: #, epsilon, ε all become ε
        return answer.trim()
                .replaceAll("\\s+", " ")
                .replaceAll("\\s*->\\s*", "->")
                .replaceAll("\\s*\\|\\s*", "|")
                .replaceAll("#", "ε")
                .replaceAll("epsilon", "ε")
                .toLowerCase();
    }
}