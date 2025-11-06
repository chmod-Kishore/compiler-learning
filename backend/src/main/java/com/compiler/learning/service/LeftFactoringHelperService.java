// src/main/java/com/compiler/learning/service/LeftFactoringHelperService.java
package com.compiler.learning.service;

import com.compiler.learning.dto.HelpRequest;
import com.compiler.learning.dto.HelpResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class LeftFactoringHelperService {

    private final LeftFactoringService factoringService;

    private static class AnalysisResult {
        String feedback;
        List<String> issues;
        boolean isCorrect;
        int progressPercentage;

        AnalysisResult() {
            this.issues = new ArrayList<>();
            this.isCorrect = false;
            this.progressPercentage = 0;
        }
    }

    public HelpResponse getHelp(HelpRequest request) {
        String grammar = request.getGrammar();
        int stuckAtStep = request.getStuckAtStep();
        String studentWork = request.getStudentWork();

        // Get the correct solution
        LeftFactoringService.FactoringResult correctResult = factoringService.performLeftFactoring(grammar);
        
        List<String> hints = new ArrayList<>();
        List<String> detectedIssues = new ArrayList<>();
        String analysis = "";
        String correctSolution = "";
        String nextStep = "";
        boolean isCorrect = false;
        int progressPercentage = 0;

        // If student provided work, analyze it
        if (studentWork != null && !studentWork.trim().isEmpty()) {
            AnalysisResult analysisResult = analyzeStudentWork(studentWork, correctResult.getTransformedGrammar(), grammar);
            detectedIssues = analysisResult.issues;
            analysis = analysisResult.feedback;
            isCorrect = analysisResult.isCorrect;
            progressPercentage = analysisResult.progressPercentage;
            
            if (!isCorrect) {
                hints = generateSmartHints(studentWork, grammar, stuckAtStep, analysisResult.issues);
                correctSolution = correctResult.getTransformedGrammar();
            }
        } else {
            // No student work provided, give general guidance
            hints = getHintsForStep(stuckAtStep, grammar);
            nextStep = getNextStepGuidance(stuckAtStep, grammar);
        }

        return new HelpResponse(
                analysis,
                correctSolution,
                nextStep,
                hints,
                new java.util.ArrayList<>(),  // mistakes
                detectedIssues,
                isCorrect,
                progressPercentage
        );
    }

    private AnalysisResult analyzeStudentWork(String studentWork, String correctGrammar, String originalGrammar) {
        AnalysisResult result = new AnalysisResult();
        StringBuilder feedback = new StringBuilder();

        // Parse both grammars
        Map<String, List<String>> studentProductions = parseGrammar(studentWork);
        Map<String, List<String>> correctProductions = parseGrammar(correctGrammar);
        Map<String, List<String>> originalProductions = parseGrammar(originalGrammar);

        int totalParts = correctProductions.size();
        int correctParts = 0;

        feedback.append("**Analysis of Your Work:**\n\n");

        // Check each non-terminal
        for (Map.Entry<String, List<String>> entry : correctProductions.entrySet()) {
            String nonTerminal = entry.getKey();
            List<String> correctProds = entry.getValue();
            
            if (studentProductions.containsKey(nonTerminal)) {
                List<String> studentProds = studentProductions.get(nonTerminal);
                
                if (normalizeProductions(studentProds).equals(normalizeProductions(correctProds))) {
                    feedback.append("✅ **").append(nonTerminal).append("**: Correct!\n");
                    correctParts++;
                } else {
                    feedback.append("⚠️  **").append(nonTerminal).append("**: Needs correction\n");
                    result.issues.add(nonTerminal + " productions are incorrect");
                }
            } else {
                feedback.append("❌ **Missing**: ").append(nonTerminal).append("\n");
                result.issues.add("Missing variable: " + nonTerminal);
            }
        }
        
        // Check for common prefix still present
        boolean stillHasCommonPrefix = checkForCommonPrefix(studentProductions, result);
        
        result.progressPercentage = (correctParts * 100) / totalParts;
        result.feedback = feedback.toString();
        
        if (result.issues.isEmpty() && !stillHasCommonPrefix) {
            result.isCorrect = true;
            result.progressPercentage = 100;
        }
        
        return result;
    }

    private boolean checkForCommonPrefix(Map<String, List<String>> productions, AnalysisResult result) {
        boolean foundCommonPrefix = false;
        
        for (Map.Entry<String, List<String>> entry : productions.entrySet()) {
            String nonTerminal = entry.getKey();
            List<String> prods = entry.getValue();
            
            if (hasCommonPrefix(prods)) {
                result.issues.add("Non-terminal " + nonTerminal + " still has common prefix!");
                foundCommonPrefix = true;
            }
        }
        
        return foundCommonPrefix;
    }

    private boolean hasCommonPrefix(List<String> productions) {
        if (productions.size() < 2) return false;
        
        for (int i = 0; i < productions.size(); i++) {
            for (int j = i + 1; j < productions.size(); j++) {
                String common = findCommonPrefix(productions.get(i), productions.get(j));
                if (common.length() > 0) {
                    return true;
                }
            }
        }
        
        return false;
    }

    private String findCommonPrefix(String s1, String s2) {
        int minLength = Math.min(s1.length(), s2.length());
        for (int i = 0; i < minLength; i++) {
            if (s1.charAt(i) != s2.charAt(i)) {
                return s1.substring(0, i);
            }
        }
        return s1.substring(0, minLength);
    }

    private List<String> generateSmartHints(String studentWork, String originalGrammar, int stuckAtStep, List<String> issues) {
        List<String> hints = new ArrayList<>();

        if (checkForMissingNewVariable(studentWork, originalGrammar)) {
            hints.add("**Hint:** Did you create a new non-terminal (like A') to hold the suffixes?");
        }

        if (checkForMissingEpsilon(studentWork)) {
            hints.add("**Hint:** When a production is exactly the common prefix, use **ε** in the new variable's productions");
        }

        if (issues.stream().anyMatch(i -> i.contains("common prefix"))) {
            hints.add("**Hint:** Look for productions that start with the same symbols. Factor out the **longest** common prefix");
        }

        // Add step-specific hints
        hints.addAll(getHintsForStep(stuckAtStep, originalGrammar));

        return hints;
    }

    private boolean checkForMissingNewVariable(String studentWork, String originalGrammar) {
        Map<String, List<String>> studentProds = parseGrammar(studentWork);
        Map<String, List<String>> originalProds = parseGrammar(originalGrammar);

        // Check if student has created any new variables (with prime marks)
        long newVarCount = studentProds.keySet().stream()
                .filter(key -> key.contains("'") || key.contains("′"))
                .count();

        return newVarCount == 0 && needsFactoring(originalProds);
    }

    private boolean checkForMissingEpsilon(String studentWork) {
        return !studentWork.contains("ε") && !studentWork.contains("#") && !studentWork.contains("epsilon");
    }

    private boolean needsFactoring(Map<String, List<String>> productions) {
        for (List<String> prods : productions.values()) {
            if (hasCommonPrefix(prods)) {
                return true;
            }
        }
        return false;
    }

    private List<String> getHintsForStep(int step, String grammar) {
        List<String> hints = new ArrayList<>();

        switch (step) {
            case 1:
                hints.add("**Step 1: Identify Common Prefixes**");
                hints.add("Look at each non-terminal's productions");
                hints.add("Compare productions character by character from left to right");
                hints.add("Find the **longest** common substring at the start");
                hints.add("Example: In 'abcd' and 'abef', the common prefix is 'ab'");
                break;
            case 2:
                hints.add("**Step 2: Group Productions**");
                hints.add("Group productions that share the same prefix together");
                hints.add("Keep productions without the prefix separate");
                hints.add("Example: For 'ab cd', 'ab ef', 'g' → Group 1: {abcd, abef}, Group 2: {g}");
                break;
            case 3:
                hints.add("**Step 3: Create New Variable**");
                hints.add("For non-terminal A, create A' (A prime)");
                hints.add("If you need multiple new variables, use A', A'', A''' etc.");
                hints.add("This new variable will hold the remaining parts after the common prefix");
                break;
            case 4:
                hints.add("**Step 4: Rewrite Productions**");
                hints.add("Original: A → αβ₁ | αβ₂ | γ");
                hints.add("New: A → αA' | γ");
                hints.add("And: A' → β₁ | β₂");
                hints.add("If α is exactly one of the productions, use **ε** for that case");
                hints.add("Example: 'ab' and 'abc' becomes A → abA' where A' → ε | c");
                break;
            case 5:
                hints.add("**Step 5: Verify Final Grammar**");
                hints.add("Check that no two productions of the same non-terminal share a common prefix");
                hints.add("Ensure all original productions are preserved (just reorganized)");
                hints.add("Verify new variables have correct suffixes");
                hints.add("Make sure ε is used where needed");
                break;
        }

        return hints;
    }

    private String getNextStepGuidance(int currentStep, String grammar) {
        switch (currentStep) {
            case 1:
                return "**Next:** Once you've identified the common prefixes, group the productions that share each prefix together.";
            case 2:
                return "**Next:** Create a new non-terminal variable (like A') to represent the remaining parts after factoring.";
            case 3:
                return "**Next:** Rewrite the original productions using the common prefix followed by the new variable.";
            case 4:
                return "**Next:** Define the new variable's productions with the suffixes (parts after the common prefix).";
            case 5:
                return "**Next:** Double-check your final grammar to ensure no common prefixes remain!";
            default:
                return "Continue working through the left factoring process step by step.";
        }
    }

    private List<String> getCommonMistakesForStep(int step) {
        List<String> mistakes = new ArrayList<>();

        switch (step) {
            case 1:
                mistakes.add("Not finding the **longest** common prefix");
                mistakes.add("Missing common prefixes in some productions");
                mistakes.add("Confusing terminal and non-terminal symbols");
                break;
            case 2:
                mistakes.add("Grouping productions incorrectly");
                mistakes.add("Forgetting productions without common prefixes");
                mistakes.add("Mixing different prefixes in the same group");
                break;
            case 3:
                mistakes.add("Not creating new variables for all non-terminals that need factoring");
                mistakes.add("Using incorrect naming for new variables (should be A', not A1)");
                mistakes.add("Reusing existing variable names");
                break;
            case 4:
                mistakes.add("Forgetting to add **ε** when a production is exactly the prefix");
                mistakes.add("Not including all suffixes in the new variable");
                mistakes.add("Losing productions that don't have the common prefix");
                mistakes.add("Incorrect syntax in rewritten productions");
                break;
            case 5:
                mistakes.add("Not checking if further factoring is needed");
                mistakes.add("Missing ε productions");
                mistakes.add("Incorrect final grammar format");
                mistakes.add("Still having common prefixes in some productions");
                break;
        }

        return mistakes;
    }

    private Map<String, List<String>> parseGrammar(String grammar) {
        Map<String, List<String>> productions = new LinkedHashMap<>();
        String[] lines = grammar.trim().split("\\n");
        
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            
            String[] parts = line.split("->|→");
            if (parts.length == 2) {
                String nonTerminal = parts[0].trim();
                String[] prods = parts[1].trim().split("\\|");
                
                List<String> prodList = new ArrayList<>();
                for (String prod : prods) {
                    prodList.add(prod.trim());
                }
                
                productions.put(nonTerminal, prodList);
            }
        }
        
        return productions;
    }

    private Set<String> normalizeProductions(List<String> productions) {
        Set<String> normalized = new HashSet<>();
        for (String prod : productions) {
            String norm = prod.replace(" ", "")
                             .replace("ε", "#")
                             .replace("epsilon", "#");
            normalized.add(norm);
        }
        return normalized;
    }
}
