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
            <h2>LR Grammar to Reduced Regular Grammar Conversion</h2>
            
            <h3>What is Left Regular Grammar (LRG)?</h3>
            <p>A Left Regular Grammar is a type of regular grammar where all productions are of the form:</p>
            <ul>
                <li><strong>A → Ba</strong> (where A and B are non-terminals, a is a terminal)</li>
                <li><strong>A → a</strong> (where A is a non-terminal, a is a terminal)</li>
            </ul>
            
            <h3>What is Reduced Regular Grammar (RRG)?</h3>
            <p>A Reduced Regular Grammar (also called Right Regular Grammar) has productions of the form:</p>
            <ul>
                <li><strong>A → aB</strong> (where A and B are non-terminals, a is a terminal)</li>
                <li><strong>A → a</strong> (where A is a non-terminal, a is a terminal)</li>
            </ul>
            
            <h3>Conversion Algorithm</h3>
            <p>To convert an LRG to RRG, follow these steps:</p>
            <ol>
                <li><strong>Parse the Grammar:</strong> Identify all production rules</li>
                <li><strong>Reverse Productions:</strong> For each production A → Ba, create B → aA</li>
                <li><strong>Handle Start Symbol:</strong> If the original start symbol appears on the right side of any production, create a new start symbol</li>
                <li><strong>Format Output:</strong> Write the transformed grammar in standard notation</li>
            </ol>
            
            <h3>Example</h3>
            <pre>
            Input (LRG):
            S → Aa | Bb
            A → Sa | a
            B → Sb | b
            
            Output (RRG):
            S' → S
            S → aA | bB
            A → aS | a
            B → bS | b
            </pre>
            
            <p>The conversion preserves the language recognized by the grammar while changing its structural form.</p>
            """;

        return new TheoryResponse("LR Grammar to Reduced Regular Grammar", content);
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
        return answer.trim()
                .replaceAll("\\s+", " ")
                .replaceAll("\\s*->\\s*", "->")
                .replaceAll("\\s*\\|\\s*", "|")
                .toLowerCase();
    }
}