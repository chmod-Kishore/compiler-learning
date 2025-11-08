package com.compiler.learning.service;

import com.compiler.learning.dto.*;
import com.compiler.learning.entity.LL1ParserProblem;
import com.compiler.learning.repository.LL1ParserProblemRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class LL1ParserService {
    
    private final LL1ParserProblemRepository problemRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getTheory() {
        return "<h2>LL(1) Parser - Theory</h2>" +
            "<h3>What is an LL(1) Parser?</h3>" +
            "<p>An <strong>LL(1) parser</strong> is a type of top-down parser that reads input from <strong>Left to right</strong> " +
            "(first L) and constructs a <strong>Leftmost derivation</strong> (second L) using <strong>1 lookahead symbol</strong> (1).</p>" +
            "<p>It is also called a <strong>Predictive Parser</strong> because it predicts which production to use by looking " +
            "at the next input symbol.</p>" +
            "<h3>Characteristics</h3>" +
            "<ul>" +
            "<li><strong>L</strong> - Parses input from Left to right</li>" +
            "<li><strong>L</strong> - Produces Leftmost derivation</li>" +
            "<li><strong>1</strong> - Uses 1 lookahead symbol to make decisions</li>" +
            "<li><strong>No backtracking required</strong></li>" +
            "</ul>" +
            "<h3>Checklist before Building an LL(1) Parser</h3>" +
            "<p>For a grammar to be parsed by LL(1), it must satisfy:</p>" +
            "<ul>" +
            "<li><strong>Unambiguous Grammar</strong><br>Every input string should have only one valid parse tree.</li>" +
            "<li><strong>No Left Recursion</strong><br>Convert left recursion to right recursion if needed.</li>" +
            "<li><strong>Left Factored Grammar</strong><br>Remove common prefixes in productions to avoid confusion.</li>" +
            "<li><strong>Correct FIRST and FOLLOW sets</strong><br>Needed to construct the Parse Table.</li>" +
            "</ul>" +
            "<h3>LL(1) Parser Components</h3>" +
            "<p>An LL(1) parser uses two main components:</p>" +
            "<ul>" +
            "<li><strong>External Stack</strong> - Holds grammar symbols during parsing</li>" +
            "<li><strong>Parse Table</strong> - Guides which production rule to apply</li>" +
            "</ul>" +
            "<h2>Steps to Construct an LL(1) Parser</h2>" +
            "<h3>Step 1: Compute FIRST and FOLLOW Sets</h3>" +
            "<h4>FIRST(X):</h4>" +
            "<p>Set of terminals that begin the strings derivable from X</p>" +
            "<h4>FOLLOW(X):</h4>" +
            "<p>Set of terminals that can appear immediately to the right of X</p>" +
            "<h3>Step 2: Construct the Parse Table</h3>" +
            "<p>Create a 2D table T[Non-terminal, Terminal]</p>" +
            "<h4>Rules:</h4>" +
            "<ol>" +
            "<li>For each production, for every symbol a in FIRST, add the rule in T[A, a].</li>" +
            "<li>If ε in FIRST, then for each symbol b in FOLLOW, add the rule in T[A, b].</li>" +
            "<li>Add dollar sign at the end of input as the end-marker.</li>" +
            "</ol>" +
            "<h4>Example:</h4>" +
            "<p><strong>Grammar:</strong></p>" +
            "<pre>A -> (A) | a</pre>" +
            "<p><strong>Parse Table:</strong></p>" +
            "<table>" +
            "<tr><th>Non-Terminal</th><th>(</th><th>a</th><th>)</th><th>$</th></tr>" +
            "<tr><td>A</td><td>A -> (A)</td><td>A -> a</td><td>-</td><td>-</td></tr>" +
            "</table>" +
            "<p><strong>Explanation:</strong></p>" +
            "<ul>" +
            "<li>For production <strong>A -> (A)</strong>: FIRST(A) contains '(', so add rule to T[A, (]</li>" +
            "<li>For production <strong>A -> a</strong>: FIRST(A) contains 'a', so add rule to T[A, a]</li>" +
            "<li>Empty cells (-) indicate syntax error if that combination occurs</li>" +
            "</ul>" +
            "<h3>Step 3: Parsing Algorithm</h3>" +
            "<ol>" +
            "<li>Initialize stack with dollar and StartSymbol</li>" +
            "<li>Read the next input symbol</li>" +
            "<li>Repeat until stack top is dollar: If top equals terminal equals lookahead, pop it and advance input. " +
            "Else if top is non-terminal A, find rule from table, and replace A by RHS of that production. " +
            "Else Error.</li>" +
            "<li>If both input and stack end with dollar, then String Accepted!</li>" +
            "</ol>" +
            "<h2>Example: Parsing with LL(1)</h2>" +
            "<h3>Grammar:</h3>" +
            "<pre>E -> TE'\n" +
            "E' -> +TE' | ε\n" +
            "T -> FT'\n" +
            "T' -> *FT' | ε\n" +
            "F -> (E) | id</pre>" +
            "<h4>Input String: <code>id + id * id</code></h4>" +
            "<h3>Parse Table:</h3>" +
            "<table>" +
            "<tr><th>Non-Terminal</th><th>id</th><th>+</th><th>*</th><th>(</th><th>)</th><th>$</th></tr>" +
            "<tr><td>E</td><td>E -> TE'</td><td></td><td></td><td>E -> TE'</td><td></td><td></td></tr>" +
            "<tr><td>E'</td><td></td><td>E' -> +TE'</td><td></td><td></td><td>E' -> ε</td><td>E' -> ε</td></tr>" +
            "<tr><td>T</td><td>T -> FT'</td><td></td><td></td><td>T -> FT'</td><td></td><td></td></tr>" +
            "<tr><td>T'</td><td></td><td>T' -> ε</td><td>T' -> *FT'</td><td></td><td>T' -> ε</td><td>T' -> ε</td></tr>" +
            "<tr><td>F</td><td>F -> id</td><td></td><td></td><td>F -> (E)</td><td></td><td></td></tr>" +
            "</table>" +
            "<h3>Parsing Steps:</h3>" +
            "<table>" +
            "<tr><th>Step</th><th>Stack</th><th>Input</th><th>Action</th></tr>" +
            "<tr><td>1</td><td>E$</td><td>id+id*id$</td><td>Apply E -> TE'</td></tr>" +
            "<tr><td>2</td><td>E'T$</td><td>id+id*id$</td><td>Apply T -> FT'</td></tr>" +
            "<tr><td>3</td><td>E'T'F$</td><td>id+id*id$</td><td>Apply F -> id</td></tr>" +
            "<tr><td>4</td><td>E'T'id$</td><td>id+id*id$</td><td>Match id</td></tr>" +
            "<tr><td>5</td><td>E'T'$</td><td>+id*id$</td><td>Apply T' -> ε</td></tr>" +
            "<tr><td>6</td><td>E'$</td><td>+id*id$</td><td>Apply E' -> +TE'</td></tr>" +
            "<tr><td>7</td><td>E'T+$</td><td>+id*id$</td><td>Match +</td></tr>" +
            "<tr><td>8</td><td>E'T$</td><td>id*id$</td><td>Apply T -> FT'</td></tr>" +
            "<tr><td>9</td><td>E'T'F$</td><td>id*id$</td><td>Apply F -> id</td></tr>" +
            "<tr><td>10</td><td>E'T'id$</td><td>id*id$</td><td>Match id</td></tr>" +
            "<tr><td>11</td><td>E'T'$</td><td>*id$</td><td>Apply T' -> *FT'</td></tr>" +
            "<tr><td>12</td><td>E'T'F*$</td><td>*id$</td><td>Match *</td></tr>" +
            "<tr><td>13</td><td>E'T'F$</td><td>id$</td><td>Apply F -> id</td></tr>" +
            "<tr><td>14</td><td>E'T'id$</td><td>id$</td><td>Match id</td></tr>" +
            "<tr><td>15</td><td>E'T'$</td><td>$</td><td>Apply T' -> ε</td></tr>" +
            "<tr><td>16</td><td>E'$</td><td>$</td><td>Apply E' -> ε</td></tr>" +
            "<tr><td><strong>Final</strong></td><td>$</td><td>$</td><td><strong>ACCEPT - String is valid!</strong></td></tr>" +
            "</table>" +
            "<h2>How to Check if a Grammar is LL(1)</h2>" +
            "<h3>Condition 1:</h3>" +
            "<p>If grammar has no ε-productions, then for all productions of A, " +
            "the FIRST sets of all alternatives must be disjoint.</p>" +
            "<h3>Condition 2:</h3>" +
            "<p>If grammar has ε-productions, FIRST and FOLLOW must be disjoint.</p>" +
            "<h3>Condition 3:</h3>" +
            "<p>If each variable has only one production, grammar is LL(1).</p>" +
            "<h2>Advantages of LL(1) Parsing</h2>" +
            "<ul>" +
            "<li>Fast, no backtracking</li>" +
            "<li>Simple table-driven parsing algorithm</li>" +
            "<li>Easy to implement recursively</li>" +
            "<li>Provides immediate syntax error detection</li>" +
            "</ul>" +
            "<h2>Limitations</h2>" +
            "<ul>" +
            "<li>Cannot handle left recursion or ambiguous grammars</li>" +
            "<li>May fail for grammars needing more than one lookahead symbol</li>" +
            "<li>Requires grammar preprocessing</li>" +
            "</ul>";
    }
    
    // =====================================================
    // PROBLEM METHODS
    // =====================================================
    
    public List<LL1ParserProblem> getProblemsByLevel(Integer level) {
        return problemRepository.findByLevelOrderByProblemNumber(level);
    }
    
    public LL1ParserProblem getProblem(Integer level, Integer problemNumber) {
        return problemRepository.findByLevelAndProblemNumber(level, problemNumber)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
    }
    
    // =====================================================
    // LEVEL 1: Parse Table Validation
    // =====================================================
    
    public ParseTableValidationResponse validateParseTable(ParseTableSubmission submission) {
        LL1ParserProblem problem = getProblem(submission.getLevel(), submission.getProblemNumber());
        
        try {
            // Parse expected table from JSON
            Map<String, Map<String, String>> expectedTable = objectMapper.readValue(
                problem.getExpectedTable(), 
                new TypeReference<Map<String, Map<String, String>>>() {}
            );
            
            Map<String, Map<String, ParseTableValidationResponse.CellValidation>> cellResults = new HashMap<>();
            int correctCells = 0;
            int totalCells = 0;
            
            // Validate each cell
            for (String nonTerminal : expectedTable.keySet()) {
                Map<String, ParseTableValidationResponse.CellValidation> rowResults = new HashMap<>();
                Map<String, String> expectedRow = expectedTable.get(nonTerminal);
                Map<String, String> userRow = submission.getUserTable().getOrDefault(nonTerminal, new HashMap<>());
                
                for (String terminal : expectedRow.keySet()) {
                    totalCells++;
                    String expected = expectedRow.get(terminal);
                    String userAnswer = userRow.getOrDefault(terminal, "").trim();
                    
                    boolean isCorrect = normalizeProduction(userAnswer).equals(normalizeProduction(expected));
                    if (isCorrect) {
                        correctCells++;
                    }
                    
                    ParseTableValidationResponse.CellValidation validation = 
                        new ParseTableValidationResponse.CellValidation(
                            isCorrect,
                            userAnswer,
                            expected,
                            isCorrect ? "Correct!" : "Check FIRST/FOLLOW sets for this cell"
                        );
                    
                    rowResults.put(terminal, validation);
                }
                cellResults.put(nonTerminal, rowResults);
            }
            
            boolean allCorrect = (correctCells == totalCells);
            double score = totalCells > 0 ? (correctCells * 100.0 / totalCells) : 0;
            
            String feedback = allCorrect ? 
                "Perfect! All cells are correct. " + problem.getLearningOutcome() :
                String.format("You got %d/%d cells correct (%.1f%%). Review the incorrect cells and try again.", 
                    correctCells, totalCells, score);
            
            return new ParseTableValidationResponse(
                allCorrect, correctCells, totalCells, score, cellResults, feedback
            );
            
        } catch (Exception e) {
            throw new RuntimeException("Error validating parse table: " + e.getMessage());
        }
    }
    
    // =====================================================
    // LEVEL 2: Parsing Steps Validation
    // =====================================================
    
    public ParsingStepsValidationResponse validateParsingSteps(ParsingStepsSubmission submission) {
        LL1ParserProblem problem = getProblem(submission.getLevel(), submission.getProblemNumber());
        
        try {
            // Parse expected steps from JSON
            List<Map<String, Object>> expectedStepsList = objectMapper.readValue(
                problem.getExpectedSteps(),
                new TypeReference<List<Map<String, Object>>>() {}
            );
            
            List<ParsingStepsValidationResponse.StepValidation> stepResults = new ArrayList<>();
            int correctSteps = 0;
            int totalSteps = Math.max(expectedStepsList.size(), submission.getSteps().size());
            
            for (int i = 0; i < totalSteps; i++) {
                if (i >= expectedStepsList.size()) {
                    // User has extra steps
                    ParsingStepsSubmission.ParsingStep userStep = submission.getSteps().get(i);
                    stepResults.add(new ParsingStepsValidationResponse.StepValidation(
                        i + 1, false, false, false,
                        "", "", "",
                        userStep.getStack(), userStep.getInput(), userStep.getAction(),
                        "This step should not exist. Parsing should have completed earlier."
                    ));
                } else if (i >= submission.getSteps().size()) {
                    // User is missing steps
                    Map<String, Object> expectedStep = expectedStepsList.get(i);
                    stepResults.add(new ParsingStepsValidationResponse.StepValidation(
                        i + 1, false, false, false,
                        expectedStep.get("stack").toString(),
                        expectedStep.get("input").toString(),
                        expectedStep.get("action").toString(),
                        "", "", "",
                        "This step is missing. Continue the parsing process."
                    ));
                } else {
                    // Compare user step with expected
                    Map<String, Object> expectedStep = expectedStepsList.get(i);
                    ParsingStepsSubmission.ParsingStep userStep = submission.getSteps().get(i);
                    
                    boolean stackCorrect = normalizeString(userStep.getStack())
                        .equals(normalizeString(expectedStep.get("stack").toString()));
                    boolean inputCorrect = normalizeString(userStep.getInput())
                        .equals(normalizeString(expectedStep.get("input").toString()));
                    boolean actionCorrect = normalizeString(userStep.getAction())
                        .equals(normalizeString(expectedStep.get("action").toString()));
                    
                    if (stackCorrect && inputCorrect && actionCorrect) {
                        correctSteps++;
                    }
                    
                    String hint = "";
                    if (!stackCorrect) {
                        hint = "Check the stack content. ";
                    }
                    if (!inputCorrect) {
                        hint += "Check the remaining input. ";
                    }
                    if (!actionCorrect) {
                        hint += "Check the parse table for the correct action.";
                    }
                    if (hint.isEmpty()) {
                        hint = "Correct!";
                    }
                    
                    stepResults.add(new ParsingStepsValidationResponse.StepValidation(
                        i + 1, stackCorrect, inputCorrect, actionCorrect,
                        expectedStep.get("stack").toString(),
                        expectedStep.get("input").toString(),
                        expectedStep.get("action").toString(),
                        userStep.getStack(),
                        userStep.getInput(),
                        userStep.getAction(),
                        hint
                    ));
                }
            }
            
            boolean allCorrect = (correctSteps == expectedStepsList.size() && 
                                 submission.getSteps().size() == expectedStepsList.size());
            double score = totalSteps > 0 ? (correctSteps * 100.0 / expectedStepsList.size()) : 0;
            
            String feedback = allCorrect ?
                "Excellent! All parsing steps are correct. " + problem.getLearningOutcome() :
                String.format("You got %d/%d steps correct (%.1f%%). Review the incorrect steps.", 
                    correctSteps, expectedStepsList.size(), score);
            
            return new ParsingStepsValidationResponse(
                allCorrect, correctSteps, totalSteps, score, stepResults, feedback
            );
            
        } catch (Exception e) {
            throw new RuntimeException("Error validating parsing steps: " + e.getMessage());
        }
    }
    
    // =====================================================
    // LEVEL 3: Conflict Identification
    // =====================================================
    
    public ConflictIdentificationResponse identifyConflict(ConflictIdentificationSubmission submission) {
        LL1ParserProblem problem = getProblem(submission.getLevel(), submission.getProblemNumber());
        
        String userAnswer = submission.getConflictType().toLowerCase().trim();
        String correctAnswer = problem.getConflictType().toLowerCase().trim();
        
        boolean correct = userAnswer.equals(correctAnswer);
        
        String feedback;
        if (correct) {
            feedback = "Correct! " + problem.getLearningOutcome();
        } else {
            feedback = "Incorrect. Review the grammar and try to build the parse table. " +
                      "Look for cells that have multiple entries.";
        }
        
        return new ConflictIdentificationResponse(
            correct,
            submission.getConflictType(),
            problem.getConflictType(),
            feedback,
            problem.getSolution()
        );
    }
    
    // =====================================================
    // HELPER METHODS
    // =====================================================
    
    private String normalizeProduction(String production) {
        if (production == null) return "";
        // Normalize arrow symbols to a common format
        // Accept: ->, =>, →, or even the escaped u2192
        String normalized = production.trim()
            .replace("->", "→")
            .replace("=>", "→")
            .replace("u2192", "→")
            .replace("\u2192", "→");  // Explicit Unicode
        
        // Normalize epsilon representations to ε
        // Match whole words/symbols to avoid replacing 'e' in identifiers
        normalized = normalized.replaceAll("\\bepsilon\\b", "ε")
                              .replaceAll("\\b#\\b", "ε")
                              .replaceAll("(?<=\\s)#(?=\\s|$)", "ε")
                              .replaceAll("(?<=→\\s?)#(?=\\s|$)", "ε")
                              .replace(" # ", " ε ")
                              .replace("→#", "→ε")
                              .replace("→ #", "→ε");
        
        // Remove ALL spaces for comparison (so "A -> b A" equals "A->bA")
        normalized = normalized.replaceAll("\\s+", "");
        
        return normalized.toLowerCase();
    }
    
    private String normalizeString(String str) {
        if (str == null) return "";
        return str.trim()
            .replaceAll("\\s+", " ")
            .toLowerCase();
    }
}
