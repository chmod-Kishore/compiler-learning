package com.compiler.learning.service;

import com.compiler.learning.dto.FirstFollowHelperResponse;
import com.compiler.learning.dto.FirstFollowHelperResponse.FeedbackDetail;
import com.compiler.learning.dto.FirstFollowRequest;
import com.compiler.learning.dto.FirstFollowResponse;
import com.compiler.learning.dto.HelpRequest;
import com.compiler.learning.dto.HelpResponse;
import com.compiler.learning.entity.FirstFollowProblem;
import com.compiler.learning.repository.FirstFollowProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FirstFollowHelperService {

    private final FirstFollowService firstFollowService;
    private final FirstFollowProblemRepository firstFollowProblemRepository;
    private static final String EPSILON = "ε";
    private static final String END_MARKER = "$";

    public HelpResponse getHelp(HelpRequest request) {
        String grammar = request.getGrammar();
        int stuckAtStep = request.getStuckAtStep();
        String studentWork = request.getStudentWork() != null ? request.getStudentWork().trim() : "";

        // Compute correct answer
        FirstFollowResponse correctAnswer = firstFollowService.computeFirstFollow(grammar);
        Map<String, Set<String>> correctFirst = correctAnswer.getFirstSets();
        Map<String, Set<String>> correctFollow = correctAnswer.getFollowSets();

        HelpResponse response = new HelpResponse();
        response.setHints(new ArrayList<>());
        response.setMistakes(new ArrayList<>());
        response.setDetectedIssues(new ArrayList<>());

        // Parse student work based on step
        Map<String, Set<String>> studentFirst = new LinkedHashMap<>();
        Map<String, Set<String>> studentFollow = new LinkedHashMap<>();
        
        if (!studentWork.isEmpty()) {
            parseStudentWork(studentWork, studentFirst, studentFollow, stuckAtStep);
        }

        if (stuckAtStep == 1) {
            // Step 1: Compute FIRST Sets
            analyzeFirstSets(correctFirst, studentFirst, studentWork, response);
        } else if (stuckAtStep == 2) {
            // Step 2: Compute FOLLOW Sets
            analyzeFirstAndFollowSets(correctFirst, correctFollow, studentFirst, studentFollow, studentWork, response);
        } else {
            // Step 3: Verify Results
            response.setAnalysis("**Step 3: Verify Results**\n\n" +
                    "Make sure all your FIRST and FOLLOW sets are complete and correctly computed.\n\n" +
                    "✓ Check that FIRST sets contain all possible starting terminals\n" +
                    "✓ Check that FOLLOW sets contain all possible following terminals\n" +
                    "✓ Verify $ is in FOLLOW of start symbol\n" +
                    "✓ Ensure ε never appears in FOLLOW sets");
            response.getHints().add("Double-check your FIRST sets before verifying FOLLOW sets");
            response.getHints().add("Use the Solver tab to compute the correct sets and compare");
        }

        return response;
    }

    private void parseStudentWork(String studentWork, Map<String, Set<String>> studentFirst, 
                                  Map<String, Set<String>> studentFollow, int step) {
        if (studentWork == null || studentWork.trim().isEmpty()) {
            return;
        }

        String[] lines = studentWork.split("\\n");
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            // Parse FIRST(X) = {...} or FOLLOW(X) = {...}
            if (line.toUpperCase().startsWith("FIRST")) {
                parseSetLine(line, studentFirst, "FIRST");
            } else if (line.toUpperCase().startsWith("FOLLOW") && step >= 2) {
                parseSetLine(line, studentFollow, "FOLLOW");
            }
        }
    }

    private void parseSetLine(String line, Map<String, Set<String>> targetMap, String setType) {
        try {
            int openParen = line.indexOf('(');
            int closeParen = line.indexOf(')');
            int equalSign = line.indexOf('=');
            
            if (openParen == -1 || closeParen == -1 || equalSign == -1) return;
            
            String nonTerminal = line.substring(openParen + 1, closeParen).trim();
            String setContent = line.substring(equalSign + 1).trim();
            
            // Remove braces and parse
            setContent = setContent.replaceAll("[{}\\[\\]]", "").trim();
            Set<String> symbols = new LinkedHashSet<>();
            
            if (!setContent.isEmpty()) {
                String[] parts = setContent.split("[,\\s]+");
                for (String part : parts) {
                    String trimmed = part.trim();
                    if (!trimmed.isEmpty()) {
                        if (trimmed.equals("#") || trimmed.equals("epsilon")) {
                            symbols.add(EPSILON);
                        } else {
                            symbols.add(trimmed);
                        }
                    }
                }
            }
            
            targetMap.put(nonTerminal, symbols);
        } catch (Exception e) {
            // Ignore malformed lines
        }
    }

    private void analyzeFirstSets(Map<String, Set<String>> correctFirst, 
                                  Map<String, Set<String>> studentFirst,
                                  String studentWork, HelpResponse response) {
        StringBuilder analysis = new StringBuilder();
        List<String> issues = response.getDetectedIssues();
        List<String> hints = response.getHints();
        
        int totalTerminals = correctFirst.values().stream()
                .mapToInt(Set::size)
                .sum();
        int correctTerminals = 0;

        if (studentWork.isEmpty()) {
            response.setAnalysis("**Step 1: Compute FIRST Sets**\n\n" +
                    "You haven't entered your work yet. Please enter your FIRST sets in the format:\n\n" +
                    "FIRST(S) = {a, b}\n" +
                    "FIRST(A) = {c, ε}\n" +
                    "...");
            hints.add("Start by identifying all non-terminals in the grammar");
            hints.add("For each terminal 'a', FIRST(a) = {a}");
            hints.add("For production X → Y₁Y₂...Yₙ, add FIRST(Y₁) to FIRST(X)");
            hints.add("If ε ∈ FIRST(Y₁), also add FIRST(Y₂), and so on");
            response.setProgressPercentage(0);
            return;
        }

        analysis.append("**Analysis of Your Work:**\n\n");
        
        // Check each non-terminal
        for (Map.Entry<String, Set<String>> entry : correctFirst.entrySet()) {
            String nt = entry.getKey();
            Set<String> correct = entry.getValue();
            Set<String> student = studentFirst.getOrDefault(nt, new HashSet<>());
            
            Set<String> missing = new HashSet<>(correct);
            missing.removeAll(student);
            
            Set<String> extra = new HashSet<>(student);
            extra.removeAll(correct);
            
            if (missing.isEmpty() && extra.isEmpty()) {
                analysis.append("✅ **").append(nt).append("**: Correct!\n");
                correctTerminals += correct.size();
            } else {
                if (!student.isEmpty()) {
                    analysis.append("⚠️ **").append(nt).append("**: Needs correction\n");
                    
                    // Count partially correct
                    Set<String> intersection = new HashSet<>(correct);
                    intersection.retainAll(student);
                    correctTerminals += intersection.size();
                } else {
                    analysis.append("❌ **Missing**: ").append(nt).append("\n");
                }
                
                if (!missing.isEmpty()) {
                    issues.add("FIRST(" + nt + ") is missing: " + String.join(", ", missing));
                    // Detect specific mistakes for missing symbols
                    detectFirstMistakes(nt, missing, extra, correct, student, hints);
                }
                if (!extra.isEmpty()) {
                    issues.add("FIRST(" + nt + ") has extra symbols: " + String.join(", ", extra));
                    // Detect specific mistakes for extra symbols
                    detectFirstMistakes(nt, missing, extra, correct, student, hints);
                }
            }
        }
        
        // Check for non-terminals in student work that shouldn't be there
        for (String nt : studentFirst.keySet()) {
            if (!correctFirst.containsKey(nt)) {
                issues.add("'" + nt + "' is not a non-terminal in this grammar");
            }
        }
        
        int progressPercentage = totalTerminals > 0 ? (correctTerminals * 100 / totalTerminals) : 0;
        response.setProgressPercentage(progressPercentage);
        response.setAnalysis(analysis.toString());
        
        // Generate correct solution
        StringBuilder solution = new StringBuilder();
        for (Map.Entry<String, Set<String>> entry : correctFirst.entrySet()) {
            solution.append("FIRST(").append(entry.getKey()).append(") = {")
                    .append(String.join(", ", entry.getValue()))
                    .append("}\n");
        }
        response.setCorrectSolution(solution.toString());
        
        // Add helpful hints
        hints.add("Remember: FIRST(X) contains all terminals that can start strings derived from X");
        hints.add("If X → ε, then ε ∈ FIRST(X)");
        hints.add("If X → Y₁Y₂...Yₙ and all Yᵢ can derive ε, then ε ∈ FIRST(X)");
        
        if (!issues.isEmpty()) {
            response.setNextStep("Review the detected issues and compare with the correct solution. " +
                    "Pay attention to epsilon (ε) handling and productions that can derive empty strings.");
        } else {
            response.setCorrect(true);
            response.setNextStep("Excellent! Now proceed to Step 2: Compute FOLLOW Sets");
        }
    }

    private void analyzeFirstAndFollowSets(Map<String, Set<String>> correctFirst,
                                          Map<String, Set<String>> correctFollow,
                                          Map<String, Set<String>> studentFirst,
                                          Map<String, Set<String>> studentFollow,
                                          String studentWork, HelpResponse response) {
        StringBuilder analysis = new StringBuilder();
        List<String> issues = response.getDetectedIssues();
        List<String> hints = response.getHints();
        
        int totalTerminals = correctFirst.values().stream().mapToInt(Set::size).sum() +
                           correctFollow.values().stream().mapToInt(Set::size).sum();
        int correctTerminals = 0;

        if (studentWork.isEmpty()) {
            response.setAnalysis("**Step 2: Compute FOLLOW Sets**\n\n" +
                    "You haven't entered your work yet. Please enter both FIRST and FOLLOW sets:\n\n" +
                    "FIRST(S) = {a, b}\n" +
                    "FIRST(A) = {c}\n" +
                    "...\n\n" +
                    "FOLLOW(S) = {$}\n" +
                    "FOLLOW(A) = {a, b}\n" +
                    "...");
            hints.add("First, ensure all FIRST sets are correct");
            hints.add("FOLLOW(StartSymbol) always contains $");
            hints.add("For A → αBβ, add FIRST(β) - {ε} to FOLLOW(B)");
            hints.add("If A → αB or ε ∈ FIRST(β), add FOLLOW(A) to FOLLOW(B)");
            response.setProgressPercentage(0);
            return;
        }

        analysis.append("**Analysis of Your Work:**\n\n");
        
        // Check FIRST sets first
        analysis.append("**FIRST Sets:**\n");
        for (Map.Entry<String, Set<String>> entry : correctFirst.entrySet()) {
            String nt = entry.getKey();
            Set<String> correct = entry.getValue();
            Set<String> student = studentFirst.getOrDefault(nt, new HashSet<>());
            
            Set<String> intersection = new HashSet<>(correct);
            intersection.retainAll(student);
            correctTerminals += intersection.size();
            
            Set<String> missing = new HashSet<>(correct);
            missing.removeAll(student);
            
            Set<String> extra = new HashSet<>(student);
            extra.removeAll(correct);
            
            if (correct.equals(student)) {
                analysis.append("✅ ").append(nt).append(": Correct!\n");
            } else {
                analysis.append("⚠️ ").append(nt).append(": Has issues\n");
                if (!missing.isEmpty()) {
                    issues.add("FIRST(" + nt + ") missing: " + String.join(", ", missing));
                    // Detect specific FIRST mistakes
                    detectFirstMistakes(nt, missing, extra, correct, student, hints);
                }
                if (!extra.isEmpty()) {
                    issues.add("FIRST(" + nt + ") has extra: " + String.join(", ", extra));
                    // Detect specific FIRST mistakes
                    detectFirstMistakes(nt, missing, extra, correct, student, hints);
                }
            }
        }
        
        analysis.append("\n**FOLLOW Sets:**\n");
        
        // Determine start symbol (first non-terminal in grammar)
        String startSymbol = correctFollow.keySet().iterator().hasNext() 
            ? correctFollow.keySet().iterator().next() 
            : "";
        
        for (Map.Entry<String, Set<String>> entry : correctFollow.entrySet()) {
            String nt = entry.getKey();
            Set<String> correct = entry.getValue();
            Set<String> student = studentFollow.getOrDefault(nt, new HashSet<>());
            
            Set<String> intersection = new HashSet<>(correct);
            intersection.retainAll(student);
            correctTerminals += intersection.size();
            
            Set<String> missing = new HashSet<>(correct);
            missing.removeAll(student);
            
            Set<String> extra = new HashSet<>(student);
            extra.removeAll(correct);
            
            if (missing.isEmpty() && extra.isEmpty()) {
                analysis.append("✅ ").append(nt).append(": Correct!\n");
            } else {
                if (!student.isEmpty()) {
                    analysis.append("⚠️ ").append(nt).append(": Needs correction\n");
                } else {
                    analysis.append("❌ **Missing**: ").append(nt).append("\n");
                }
                
                if (!missing.isEmpty()) {
                    issues.add("FOLLOW(" + nt + ") missing: " + String.join(", ", missing));
                    // Detect specific FOLLOW mistakes
                    detectFollowMistakes(nt, missing, extra, correct, student, hints, nt.equals(startSymbol));
                }
                if (!extra.isEmpty()) {
                    issues.add("FOLLOW(" + nt + ") has extra: " + String.join(", ", extra));
                    // Detect specific FOLLOW mistakes
                    detectFollowMistakes(nt, missing, extra, correct, student, hints, nt.equals(startSymbol));
                }
            }
        }
        
        int progressPercentage = totalTerminals > 0 ? (correctTerminals * 100 / totalTerminals) : 0;
        response.setProgressPercentage(progressPercentage);
        response.setAnalysis(analysis.toString());
        
        // Generate correct solution
        StringBuilder solution = new StringBuilder();
        solution.append("FIRST Sets:\n");
        for (Map.Entry<String, Set<String>> entry : correctFirst.entrySet()) {
            solution.append("FIRST(").append(entry.getKey()).append(") = {")
                    .append(String.join(", ", entry.getValue()))
                    .append("}\n");
        }
        solution.append("\nFOLLOW Sets:\n");
        for (Map.Entry<String, Set<String>> entry : correctFollow.entrySet()) {
            solution.append("FOLLOW(").append(entry.getKey()).append(") = {")
                    .append(String.join(", ", entry.getValue()))
                    .append("}\n");
        }
        response.setCorrectSolution(solution.toString());
        
        // Add helpful hints
        hints.add("FOLLOW sets contain terminals that can appear immediately AFTER a non-terminal");
        hints.add("$ appears in FOLLOW of the start symbol");
        hints.add("ε NEVER appears in FOLLOW sets");
        hints.add("You may need multiple iterations to compute FOLLOW correctly");
        
        if (!issues.isEmpty()) {
            response.setNextStep("Fix the issues in your FIRST and FOLLOW sets. " +
                    "Make sure FIRST sets are correct before computing FOLLOW.");
        } else {
            response.setCorrect(true);
            response.setNextStep("Perfect! Your FIRST and FOLLOW sets are all correct. " +
                    "Proceed to Step 3 to verify and use them.");
        }
    }

    private void detectFirstMistakes(String nt, Set<String> missing, Set<String> extra, 
                                     Set<String> correct, Set<String> student, 
                                     List<String> hints) {
        // Mistake 1: Missing ε (epsilon)
        if (missing.contains(EPSILON)) {
            hints.add("🧠 **Missing ε for " + nt + "**: Check if this non-terminal can derive ε through any sequence of productions. You might have missed including ε in its FIRST set.");
        }
        
        // Mistake 2: Extra ε included
        if (extra.contains(EPSILON)) {
            hints.add("🧠 **Extra ε for " + nt + "**: It seems ε was added where it shouldn't be. Verify if every production of this non-terminal can actually derive ε.");
        }
        
        // Mistake 4: Forgetting terminal-only FIRST
        if (!missing.isEmpty() && !missing.contains(EPSILON)) {
            boolean hasMissingTerminals = missing.stream()
                .anyMatch(s -> !s.equals(EPSILON) && s.length() == 1 && Character.isLowerCase(s.charAt(0)));
            if (hasMissingTerminals) {
                hints.add("🧠 **Missing terminal for " + nt + "**: You missed the terminal that starts a production directly. Terminals are always added to FIRST immediately.");
            }
        }
        
        // Mistake 3: Ignoring FIRST from chained non-terminals
        if (!missing.isEmpty() && student.contains(EPSILON)) {
            hints.add("🧠 **Chained non-terminals for " + nt + "**: When the first symbol in a production can derive ε, remember to also include FIRST of the next symbol.");
        }
        
        // Mistake 5: Not merging FIRST sets across multiple productions
        if (!missing.isEmpty() && !extra.isEmpty()) {
            hints.add("🧠 **Multiple productions for " + nt + "**: Make sure you consider all alternate productions for this non-terminal. FIRST(" + nt + ") should be the union of FIRST from each production.");
        }
    }

    private void detectFollowMistakes(String nt, Set<String> missing, Set<String> extra,
                                      Set<String> correct, Set<String> student,
                                      List<String> hints, boolean isStartSymbol) {
        // Mistake 6: Missing $ for Start Symbol
        if (isStartSymbol && missing.contains(END_MARKER)) {
            hints.add("🧠 **Missing $ for start symbol " + nt + "**: The start symbol's FOLLOW must always contain $ — it marks the end of input.");
        }
        
        // Mistake 8: Not including FIRST of next symbol
        if (!missing.isEmpty() && !missing.contains(END_MARKER)) {
            hints.add("🧠 **Missing FIRST of next symbol for " + nt + "**: When a non-terminal is followed by another symbol, add FIRST of that symbol (excluding ε) to FOLLOW.");
        }
        
        // Mistake 7: Not propagating FOLLOW when symbol appears at the end
        if (!missing.isEmpty()) {
            hints.add("🧠 **Missing FOLLOW propagation for " + nt + "**: If a non-terminal appears at the end of a production, remember to add FOLLOW of the left-hand side non-terminal.");
        }
        
        // Mistake 9: Missing propagation of FOLLOW when ε is in next symbol
        if (!missing.isEmpty() && correct.size() > student.size()) {
            hints.add("🧠 **Missing epsilon propagation for " + nt + "**: If the following symbol can derive ε, also include FOLLOW of the left-hand side non-terminal.");
        }
        
        // Critical: ε should never be in FOLLOW
        if (extra.contains(EPSILON)) {
            hints.add("🧠 **CRITICAL ERROR for " + nt + "**: ε (epsilon) should NEVER appear in FOLLOW sets. FOLLOW contains terminals that can appear AFTER a non-terminal, not what it derives.");
        }
        
        // Mistake 10: Formatting errors
        if (!extra.isEmpty() && !extra.contains(EPSILON)) {
            boolean hasWeirdChars = extra.stream()
                .anyMatch(s -> s.contains("{") || s.contains("}") || s.contains("(") && s.length() > 1);
            if (hasWeirdChars) {
                hints.add("🧠 **Formatting issue for " + nt + "**: There seems to be a formatting or duplication issue. Ensure sets are written as comma-separated values like: a, b, $");
            }
        }
    }

    public FirstFollowHelperResponse checkAnswer(FirstFollowRequest request) {
        // Find the problem in database by matching grammar
        Map<String, Set<String>> correctFirstSets;
        Map<String, Set<String>> correctFollowSets;
        
        Optional<FirstFollowProblem> problemOpt = findProblemByGrammar(request.getGrammar());
        
        if (problemOpt.isPresent()) {
            // Use expected values from database
            FirstFollowProblem problem = problemOpt.get();
            correctFirstSets = parseExpectedSets(problem.getExpectedFirst());
            correctFollowSets = parseExpectedSets(problem.getExpectedFollow());
        } else {
            // Fallback to computed values (shouldn't happen in normal flow)
            FirstFollowResponse computedAnswer = firstFollowService.computeFirstFollow(request.getGrammar());
            correctFirstSets = computedAnswer.getFirstSets();
            correctFollowSets = computedAnswer.getFollowSets();
        }

        // Parse user's answers
        Map<String, Set<String>> userFirstSets = parseUserSets(request.getFirstSets());
        Map<String, Set<String>> userFollowSets = parseUserSets(request.getFollowSets());

        // Compare and generate feedback
        Map<String, FeedbackDetail> firstFeedback = new HashMap<>();
        Map<String, FeedbackDetail> followFeedback = new HashMap<>();

        boolean allCorrect = true;

        // Check FIRST sets
        for (Map.Entry<String, Set<String>> entry : correctFirstSets.entrySet()) {
            String nonTerminal = entry.getKey();
            Set<String> correctSet = entry.getValue();
            Set<String> userSet = userFirstSets.getOrDefault(nonTerminal, new HashSet<>());

            FeedbackDetail feedback = compareAndGenerateFeedback(
                    nonTerminal, correctSet, userSet, "FIRST");
            firstFeedback.put(nonTerminal, feedback);

            if (!feedback.isCorrect()) {
                allCorrect = false;
            }
        }

        // Check FOLLOW sets
        for (Map.Entry<String, Set<String>> entry : correctFollowSets.entrySet()) {
            String nonTerminal = entry.getKey();
            Set<String> correctSet = entry.getValue();
            Set<String> userSet = userFollowSets.getOrDefault(nonTerminal, new HashSet<>());

            FeedbackDetail feedback = compareAndGenerateFeedback(
                    nonTerminal, correctSet, userSet, "FOLLOW");
            followFeedback.put(nonTerminal, feedback);

            if (!feedback.isCorrect()) {
                allCorrect = false;
            }
        }

        // Generate overall message
        String overallMessage = generateOverallMessage(allCorrect, firstFeedback, followFeedback);

        FirstFollowHelperResponse response = new FirstFollowHelperResponse();
        response.setCorrect(allCorrect);
        response.setFirstFeedback(firstFeedback);
        response.setFollowFeedback(followFeedback);
        response.setOverallMessage(overallMessage);

        return response;
    }

    private Optional<FirstFollowProblem> findProblemByGrammar(String grammar) {
        // Normalize the grammar for comparison
        String normalizedGrammar = normalizeGrammar(grammar);
        
        List<FirstFollowProblem> allProblems = firstFollowProblemRepository.findAll();
        
        return allProblems.stream()
                .filter(p -> normalizeGrammar(p.getQuestion()).equals(normalizedGrammar))
                .findFirst();
    }

    private String normalizeGrammar(String grammar) {
        // Remove extra whitespace and normalize arrows
        return grammar.trim()
                .replaceAll("\\s+", " ")
                .replace("→", "->")
                .replaceAll("\\s*->\\s*", "->")
                .replaceAll("\\s*\\|\\s*", "|");
    }

    private Map<String, Set<String>> parseExpectedSets(String expectedText) {
        // Parse format: FIRST(S)={a}\nFIRST(B)={c}\n...
        Map<String, Set<String>> result = new HashMap<>();
        
        if (expectedText == null || expectedText.trim().isEmpty()) {
            return result;
        }

        String[] lines = expectedText.split("\\n");
        
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            
            // Match pattern: FIRST(X)={...} or FOLLOW(X)={...}
            int openParen = line.indexOf('(');
            int closeParen = line.indexOf(')');
            int openBrace = line.indexOf('{');
            int closeBrace = line.indexOf('}');
            
            if (openParen != -1 && closeParen != -1 && openBrace != -1 && closeBrace != -1) {
                String nonTerminal = line.substring(openParen + 1, closeParen).trim();
                String setContent = line.substring(openBrace + 1, closeBrace).trim();
                
                Set<String> symbols = new HashSet<>();
                if (!setContent.isEmpty()) {
                    String[] parts = setContent.split(",");
                    for (String part : parts) {
                        String symbol = part.trim();
                        if (!symbol.isEmpty()) {
                            symbols.add(symbol);
                        }
                    }
                }
                
                result.put(nonTerminal, symbols);
            }
        }
        
        return result;
    }

    private Map<String, Set<String>> parseUserSets(Map<String, String> userInput) {
        Map<String, Set<String>> result = new HashMap<>();

        if (userInput == null) {
            return result;
        }

        for (Map.Entry<String, String> entry : userInput.entrySet()) {
            String nonTerminal = entry.getKey();
            String setValue = entry.getValue();

            Set<String> symbols = parseSet(setValue);
            result.put(nonTerminal, symbols);
        }

        return result;
    }

    private Set<String> parseSet(String setValue) {
        Set<String> symbols = new HashSet<>();

        if (setValue == null || setValue.trim().isEmpty()) {
            return symbols;
        }

        // Remove braces and split by comma
        String cleaned = setValue.replaceAll("[{}\\[\\]]", "").trim();
        if (cleaned.isEmpty()) {
            return symbols;
        }

        String[] parts = cleaned.split("[,\\s]+");
        for (String part : parts) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                // Normalize # to ε for epsilon
                if (trimmed.equals("#")) {
                    symbols.add(EPSILON);
                } else {
                    symbols.add(trimmed);
                }
            }
        }

        return symbols;
    }

    private FeedbackDetail compareAndGenerateFeedback(
            String nonTerminal, 
            Set<String> correctSet, 
            Set<String> userSet,
            String setType) {

        FeedbackDetail feedback = new FeedbackDetail();
        feedback.setHints(new ArrayList<>());

        // Find missing and extra symbols
        Set<String> missing = new HashSet<>(correctSet);
        missing.removeAll(userSet);

        Set<String> extra = new HashSet<>(userSet);
        extra.removeAll(correctSet);

        feedback.setMissing(new ArrayList<>(missing));
        feedback.setExtra(new ArrayList<>(extra));

        if (missing.isEmpty() && extra.isEmpty()) {
            feedback.setCorrect(true);
            feedback.setEmoji("✅");
            feedback.getHints().add("Perfect! Your " + setType + " set is correct.");
        } else {
            feedback.setCorrect(false);

            if (!missing.isEmpty() && !extra.isEmpty()) {
                feedback.setEmoji("🚫");
            } else {
                feedback.setEmoji("⚠️");
            }

            // Generate specific hints
            generateHints(feedback, nonTerminal, missing, extra, setType);
        }

        return feedback;
    }

    private void generateHints(
            FeedbackDetail feedback,
            String nonTerminal,
            Set<String> missing,
            Set<String> extra,
            String setType) {

        List<String> hints = feedback.getHints();

        if (setType.equals("FIRST")) {
            generateFirstHints(hints, nonTerminal, missing, extra);
        } else {
            generateFollowHints(hints, nonTerminal, missing, extra);
        }
    }

    private void generateFirstHints(
            List<String> hints,
            String nonTerminal,
            Set<String> missing,
            Set<String> extra) {

        // Check for missing epsilon
        if (missing.contains(EPSILON)) {
            hints.add("❌ **Missing ε**: You missed ε in FIRST(" + nonTerminal + 
                     "). This happens when " + nonTerminal + " → ε is a production, " +
                     "or when all symbols in a production can derive ε.");
            hints.add("💡 **Rule**: If X → Y₁Y₂...Yₙ and ε ∈ FIRST(Yᵢ) for all i, then ε ∈ FIRST(X)");
        }

        // Check for extra epsilon
        if (extra.contains(EPSILON)) {
            hints.add("❌ **Extra ε**: You incorrectly added ε to FIRST(" + nonTerminal + 
                     "). Check if " + nonTerminal + " can actually derive ε (empty string).");
            hints.add("💡 **Tip**: Only add ε if there's a production " + nonTerminal + " → ε, " +
                     "or all symbols in a production can derive ε.");
        }

        // Check for missing terminals
        for (String symbol : missing) {
            if (!symbol.equals(EPSILON)) {
                hints.add("❌ **Missing terminal '" + symbol + "'**: This should be in FIRST(" + nonTerminal + 
                         "). Look for productions starting with '" + symbol + "' or non-terminals whose FIRST contains '" + symbol + "'.");
                hints.add("💡 **Trace**: Find production " + nonTerminal + " → α where α starts with '" + 
                         symbol + "' or derives strings starting with '" + symbol + "'.");
            }
        }

        // Check for extra terminals
        for (String symbol : extra) {
            if (!symbol.equals(EPSILON)) {
                hints.add("❌ **Extra terminal '" + symbol + "'**: You incorrectly added '" + symbol + 
                         "' to FIRST(" + nonTerminal + "). This symbol doesn't appear at the start of any derivation from " + 
                         nonTerminal + ".");
                hints.add("💡 **Review**: Check all productions of " + nonTerminal + 
                         " - none should start with or derive strings starting with '" + symbol + "'.");
            }
        }

        // General hint
        if (!missing.isEmpty() || !extra.isEmpty()) {
            hints.add("📘 **Remember**: FIRST(X) contains all terminals that can appear at the **beginning** of strings derived from X.");
        }
    }

    private void generateFollowHints(
            List<String> hints,
            String nonTerminal,
            Set<String> missing,
            Set<String> extra) {

        // Check for missing $
        if (missing.contains(END_MARKER)) {
            hints.add("❌ **Missing $**: You missed $ in FOLLOW(" + nonTerminal + 
                     "). This likely means " + nonTerminal + " is the start symbol, or FOLLOW propagates from another non-terminal that has $.");
            hints.add("💡 **Rule 1**: The start symbol always has $ in its FOLLOW set.");
            hints.add("💡 **Rule 3**: If A → αB or A → αBβ where ε ∈ FIRST(β), then FOLLOW(A) ⊆ FOLLOW(B)");
        }

        // Check for extra $
        if (extra.contains(END_MARKER)) {
            hints.add("❌ **Extra $**: You incorrectly added $ to FOLLOW(" + nonTerminal + 
                     "). Check if this is really the start symbol or if $ propagates from another FOLLOW set.");
        }

        // Check for epsilon in FOLLOW (common mistake)
        if (extra.contains(EPSILON)) {
            hints.add("❌ **ε in FOLLOW**: FOLLOW sets **NEVER** contain ε (epsilon). " +
                     "ε only appears in FIRST sets, not FOLLOW sets.");
            hints.add("💡 **Important**: FOLLOW(A) contains terminals that can appear **after** A, not what A derives.");
        }

        // Check for missing terminals
        for (String symbol : missing) {
            if (!symbol.equals(END_MARKER) && !symbol.equals(EPSILON)) {
                hints.add("❌ **Missing terminal '" + symbol + "'**: This should be in FOLLOW(" + nonTerminal + 
                         "). Look for productions where " + nonTerminal + " is followed by a symbol whose FIRST contains '" + symbol + "'.");
                hints.add("💡 **Rule 2**: If A → α" + nonTerminal + "β, then FIRST(β) - {ε} ⊆ FOLLOW(" + nonTerminal + ")");
            }
        }

        // Check for extra terminals
        for (String symbol : extra) {
            if (!symbol.equals(END_MARKER) && !symbol.equals(EPSILON)) {
                hints.add("❌ **Extra terminal '" + symbol + "'**: You incorrectly added '" + symbol + 
                         "' to FOLLOW(" + nonTerminal + "). This symbol doesn't appear after " + nonTerminal + 
                         " in any sentential form.");
                hints.add("💡 **Review**: Check all productions containing " + nonTerminal + 
                         " - is '" + symbol + "' really in FIRST of what follows?");
            }
        }

        // General hint
        if (!missing.isEmpty() || !extra.isEmpty()) {
            hints.add("📘 **Remember**: FOLLOW(A) contains all terminals that can appear **immediately after** A in some sentential form.");
            hints.add("📘 **Three Rules**: (1) $ in FOLLOW of start symbol, " +
                     "(2) If A → αBβ, add FIRST(β)-{ε} to FOLLOW(B), " +
                     "(3) If A → αB or ε ∈ FIRST(β), add FOLLOW(A) to FOLLOW(B)");
        }
    }

    private String generateOverallMessage(
            boolean allCorrect,
            Map<String, FeedbackDetail> firstFeedback,
            Map<String, FeedbackDetail> followFeedback) {

        if (allCorrect) {
            return "🎉 **Excellent!** All your FIRST and FOLLOW sets are correct! You've mastered this concept.";
        }

        long firstErrors = firstFeedback.values().stream().filter(f -> !f.isCorrect()).count();
        long followErrors = followFeedback.values().stream().filter(f -> !f.isCorrect()).count();

        StringBuilder message = new StringBuilder();
        message.append("📊 **Results Summary:**\n\n");

        if (firstErrors > 0) {
            message.append("⚠️ You have errors in **").append(firstErrors)
                   .append("** FIRST set(s). Review the hints below.\n");
        } else {
            message.append("✅ All FIRST sets are correct!\n");
        }

        if (followErrors > 0) {
            message.append("⚠️ You have errors in **").append(followErrors)
                   .append("** FOLLOW set(s). Review the hints below.\n");
        } else {
            message.append("✅ All FOLLOW sets are correct!\n");
        }

        message.append("\n💡 **Tip**: Remember to:\n");
        message.append("  • Compute FIRST sets completely before FOLLOW\n");
        message.append("  • Add $ only to FOLLOW of start symbol (and propagate)\n");
        message.append("  • Never put ε in FOLLOW sets\n");
        message.append("  • Keep iterating until no changes occur\n");

        return message.toString();
    }
}
