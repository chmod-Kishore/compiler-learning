package com.compiler.learning.service;

import com.compiler.learning.dto.HelpRequest;
import com.compiler.learning.dto.HelpResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class HelperService {

    @Autowired
    private GrammarConversionService grammarService;

    public HelpResponse getHelp(HelpRequest request) {
        String grammar = request.getGrammar();
        int stuckAtStep = request.getStuckAtStep();
        String studentWork = request.getStudentWork();

        // Get the correct solution
        GrammarConversionService.ConversionResult correctResult = grammarService.convertLRGtoRRG(grammar);
        
        List<String> hints = new ArrayList<>();
        List<String> detectedIssues = new ArrayList<>();
        String analysis = "";
        String correctSolution = "";
        String nextStep = "";
        boolean isCorrect = false;
        int progressPercentage = 0;

        // If student provided work, analyze it
        if (studentWork != null && !studentWork.trim().isEmpty()) {
            AnalysisResult analysisResult = analyzeStudentWork(studentWork, correctResult.transformedGrammar, grammar);
            detectedIssues = analysisResult.issues;
            analysis = analysisResult.feedback;
            isCorrect = analysisResult.isCorrect;
            progressPercentage = analysisResult.progressPercentage;
            
            if (!isCorrect) {
                hints = generateSmartHints(analysisResult, stuckAtStep, grammar);
                nextStep = generateNextStep(analysisResult, correctResult, stuckAtStep);
            } else {
                analysis = "🎉 Perfect! Your solution is correct!";
                hints.add("Great work! You've successfully eliminated the left recursion.");
                hints.add("Your answer matches the expected solution.");
            }
        } else {
            // No student work provided, give step-specific guidance
            hints = getHintsForStep(stuckAtStep, grammar);
            nextStep = getNextStepGuidance(stuckAtStep, correctResult);
        }

        // Get correct solution for the current step
        correctSolution = getCorrectSolutionForStep(stuckAtStep, correctResult);
        
        List<String> commonMistakes = getCommonMistakesForStep(stuckAtStep);

        return new HelpResponse(analysis, correctSolution, nextStep, hints, commonMistakes, 
                               detectedIssues, isCorrect, progressPercentage);
    }

    private AnalysisResult analyzeStudentWork(String studentWork, String correctGrammar, String originalGrammar) {
        AnalysisResult result = new AnalysisResult();
        result.issues = new ArrayList<>();
        result.isCorrect = false;
        result.progressPercentage = 0;
        
        // Normalize both grammars for comparison
        String normalizedStudent = normalizeGrammar(studentWork);
        String normalizedCorrect = normalizeGrammar(correctGrammar);
        
        // Check if completely correct
        if (normalizedStudent.equals(normalizedCorrect)) {
            result.isCorrect = true;
            result.progressPercentage = 100;
            result.feedback = "✅ Perfect! Your solution is completely correct!";
            return result;
        }

        // Parse student's grammar
        Map<String, List<String>> studentProductions = parseGrammarToMap(studentWork);
        Map<String, List<String>> correctProductions = parseGrammarToMap(correctGrammar);
        
        int correctParts = 0;
        int totalParts = correctProductions.size();
        
        StringBuilder feedback = new StringBuilder();
        feedback.append("📊 **Analysis of Your Solution:**\n\n");
        
        // Check for missing epsilon
        boolean hasEpsilonIssue = checkForMissingEpsilon(studentProductions, correctProductions, result);
        
        // Check for missing auxiliary variables
        boolean hasMissingVariable = checkForMissingAuxiliaryVariable(studentProductions, correctProductions, result);
        
        // Check each production
        for (String nonTerminal : correctProductions.keySet()) {
            if (studentProductions.containsKey(nonTerminal)) {
                List<String> studentRules = studentProductions.get(nonTerminal);
                List<String> correctRules = correctProductions.get(nonTerminal);
                
                if (normalizeProductions(studentRules).equals(normalizeProductions(correctRules))) {
                    correctParts++;
                    feedback.append("✅ **").append(nonTerminal).append("** is correct\n");
                } else {
                    feedback.append("⚠️  **").append(nonTerminal).append("** needs correction\n");
                    result.issues.add(nonTerminal + " productions are incomplete or incorrect");
                }
            } else {
                feedback.append("❌ **Missing**: ").append(nonTerminal).append("\n");
                result.issues.add("Missing variable: " + nonTerminal);
            }
        }
        
        // Check for left recursion still present
        boolean stillHasLeftRecursion = checkForLeftRecursion(studentProductions, result);
        
        result.progressPercentage = (correctParts * 100) / totalParts;
        result.feedback = feedback.toString();
        
        if (result.issues.isEmpty() && !stillHasLeftRecursion) {
            result.isCorrect = true;
            result.progressPercentage = 100;
        }
        
        return result;
    }

    private boolean checkForMissingEpsilon(Map<String, List<String>> student, 
                                          Map<String, List<String>> correct,
                                          AnalysisResult result) {
        for (String var : correct.keySet()) {
            if (var.contains("'") || var.contains("′")) {
                List<String> correctRules = correct.get(var);
                List<String> studentRules = student.getOrDefault(var, new ArrayList<>());
                
                boolean correctHasEpsilon = correctRules.stream().anyMatch(r -> r.equals("ε") || r.equals("epsilon"));
                boolean studentHasEpsilon = studentRules.stream().anyMatch(r -> r.equals("ε") || r.equals("epsilon"));
                
                if (correctHasEpsilon && !studentHasEpsilon) {
                    result.issues.add("Missing ε (epsilon) in " + var + " to terminate recursion");
                    return true;
                }
            }
        }
        return false;
    }

    private boolean checkForMissingAuxiliaryVariable(Map<String, List<String>> student,
                                                     Map<String, List<String>> correct,
                                                     AnalysisResult result) {
        for (String var : correct.keySet()) {
            if ((var.contains("'") || var.contains("′")) && !student.containsKey(var)) {
                result.issues.add("Missing auxiliary variable " + var);
                return true;
            }
        }
        return false;
    }

    private boolean checkForLeftRecursion(Map<String, List<String>> productions, AnalysisResult result) {
        for (Map.Entry<String, List<String>> entry : productions.entrySet()) {
            String nonTerminal = entry.getKey();
            for (String production : entry.getValue()) {
                if (production.startsWith(nonTerminal) && !nonTerminal.contains("'") && !nonTerminal.contains("′")) {
                    result.issues.add("Left recursion still exists in " + nonTerminal + " → " + production);
                    return true;
                }
            }
        }
        return false;
    }

    private List<String> generateSmartHints(AnalysisResult analysis, int step, String grammar) {
        List<String> hints = new ArrayList<>();
        
        for (String issue : analysis.issues) {
            if (issue.contains("Missing ε")) {
                hints.add("Remember: Auxiliary variables (like A') must include ε to allow recursion to terminate.");
                hints.add("The format should be: A' → αA' | ε");
            } else if (issue.contains("Missing auxiliary variable")) {
                hints.add("You need to create a new variable (typically A') to handle the recursive part.");
                hints.add("This new variable transforms left recursion into right recursion.");
            } else if (issue.contains("Left recursion still exists")) {
                hints.add("Your solution still contains left recursion. Make sure no production starts with the same non-terminal.");
                hints.add("Check the pattern: A → Aα should become A → βA' and A' → αA' | ε");
            } else if (issue.contains("incomplete or incorrect")) {
                hints.add("Double-check the productions. Make sure you've included all α and β parts correctly.");
            }
        }
        
        if (hints.isEmpty()) {
            hints.addAll(getHintsForStep(step, grammar));
        }
        
        return hints;
    }

    private String generateNextStep(AnalysisResult analysis, GrammarConversionService.ConversionResult correct, int step) {
        if (analysis.issues.isEmpty()) {
            return "You're on the right track! Review your work and compare with the correct solution.";
        }
        
        String firstIssue = analysis.issues.get(0);
        
        if (firstIssue.contains("Missing ε")) {
            String varName = firstIssue.substring(firstIssue.indexOf("in ") + 3, firstIssue.indexOf(" to"));
            return "Add ε (epsilon) to " + varName + " productions. Example: " + varName + " → ... | ε";
        } else if (firstIssue.contains("Missing auxiliary variable")) {
            return "Create the auxiliary variable mentioned in the hint. Use the prime notation (A').";
        } else if (firstIssue.contains("Left recursion still exists")) {
            return "Remove the left recursion by separating recursive (α) and non-recursive (β) parts, then create A' variable.";
        }
        
        return "Review Step " + step + " and check the correct format for that step.";
    }

    private String getNextStepGuidance(int step, GrammarConversionService.ConversionResult correct) {
        switch (step) {
            case 1:
                return "Start by examining each production rule to identify if left recursion exists.";
            case 2:
                return "For indirect recursion, substitute higher-order non-terminals in lower ones. Example: If A → Bc and B → d, substitute to get A → dc.";
            case 3:
                return "Separate the productions into α (recursive parts after the non-terminal) and β (non-recursive parts).";
            case 4:
                return "Create a new variable (usually A') that will handle the recursive continuation.";
            case 5:
                return "Write the final grammar with A → βA' and A' → αA' | ε format.";
            default:
                return "Continue to the next step of the elimination process.";
        }
    }

    private Map<String, List<String>> parseGrammarToMap(String grammar) {
        Map<String, List<String>> productions = new LinkedHashMap<>();
        String[] lines = grammar.trim().split("\n");
        
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            
            String[] parts = line.split("->");
            if (parts.length != 2) continue;
            
            String nonTerminal = parts[0].trim();
            String[] prods = parts[1].split("\\|");
            
            List<String> productionList = new ArrayList<>();
            for (String prod : prods) {
                productionList.add(prod.trim());
            }
            
            productions.put(nonTerminal, productionList);
        }
        
        return productions;
    }

    private String normalizeGrammar(String grammar) {
        return grammar.replaceAll("\\s+", " ")
                     .replaceAll("′", "'")
                     .replaceAll("epsilon", "ε")
                     .replaceAll("#", "ε")
                     .trim();
    }

    private String normalizeProductions(List<String> productions) {
        List<String> normalized = new ArrayList<>(productions);
        normalized.replaceAll(p -> p.replaceAll("′", "'").replaceAll("epsilon", "ε").replaceAll("#", "ε"));
        Collections.sort(normalized);
        return String.join("|", normalized);
    }

    // Existing helper methods with minor updates
    private String getCorrectSolutionForStep(int step, GrammarConversionService.ConversionResult result) {
        if (step == 5) {
            return result.transformedGrammar;
        }
        
        StringBuilder sb = new StringBuilder();
        boolean collecting = false;
        String stepMarker = "🔹 Step " + step;
        String nextStepMarker = "🔹 Step " + (step + 1);
        
        for (String line : result.steps) {
            if (line.contains(stepMarker)) {
                collecting = true;
                continue;
            }
            if (line.contains(nextStepMarker)) {
                break;
            }
            if (collecting && !line.trim().isEmpty()) {
                sb.append(line).append("\n");
            }
        }
        
        return sb.toString().trim();
    }

    private List<String> getHintsForStep(int step, String grammar) {
        List<String> hints = new ArrayList<>();
        
        switch (step) {
            case 1:
                hints.add("Look for productions where a non-terminal appears at the start of its own right side.");
                hints.add("Direct: A → Aα means A calls itself directly.");
                hints.add("Indirect: Check if non-terminals reference each other in a cycle.");
                break;
            case 2:
                hints.add("For indirect recursion: substitute earlier non-terminals into later ones.");
                hints.add("For direct recursion: this step is not needed.");
                hints.add("Example: If A → Bc and B → d, substitute to get A → dc.");
                break;
            case 3:
                hints.add("α (alpha) = everything AFTER the non-terminal in recursive productions (A → Aα).");
                hints.add("β (beta) = all non-recursive productions (ones that don't start with the same non-terminal).");
                hints.add("Example: A → Aab | Acd | e | f gives α = {ab, cd} and β = {e, f}.");
                break;
            case 4:
                hints.add("Create a new variable using prime notation: A becomes A'.");
                hints.add("This variable will handle the recursive continuation.");
                hints.add("You need one new variable for each non-terminal with left recursion.");
                break;
            case 5:
                hints.add("Final format: A → βA' (non-recursive parts with A' appended).");
                hints.add("And: A' → αA' | ε (recursive parts with A' appended, plus epsilon).");
                hints.add("Don't forget the ε at the end of A' productions!");
                break;
        }
        
        return hints;
    }

    private List<String> getCommonMistakesForStep(int step) {
        List<String> mistakes = new ArrayList<>();
        
        switch (step) {
            case 1:
                mistakes.add("Confusing right recursion (A → aA) with left recursion (A → Aa).");
                mistakes.add("Missing indirect recursion when multiple non-terminals interact.");
                break;
            case 2:
                mistakes.add("Trying to substitute when only direct recursion exists.");
                mistakes.add("Substituting in the wrong order.");
                break;
            case 3:
                mistakes.add("Including the non-terminal itself in α (should only be what follows).");
                mistakes.add("Forgetting some non-recursive productions in β.");
                break;
            case 4:
                mistakes.add("Not creating a unique name for the new variable.");
                mistakes.add("Creating too many or too few auxiliary variables.");
                break;
            case 5:
                mistakes.add("Forgetting ε (epsilon) in auxiliary variable productions.");
                mistakes.add("Writing βA' as Aβ' (wrong order).");
                mistakes.add("Missing some recursive or non-recursive productions.");
                break;
        }
        
        return mistakes;
    }

    private static class AnalysisResult {
        String feedback;
        List<String> issues;
        boolean isCorrect;
        int progressPercentage;
    }
}
