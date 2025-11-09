package com.compiler.learning.service;

import com.compiler.learning.dto.HelperAnalysisRequest;
import com.compiler.learning.dto.HelperAnalysisResponse;
import com.compiler.learning.dto.HelperAnalysisResponse.DiagnosticInfo;
import com.compiler.learning.dto.HelperAnalysisResponse.ExplanationInfo;
import com.compiler.learning.dto.HelperAnalysisResponse.SuggestionInfo;
import com.compiler.learning.dto.ParseTableResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class LL1HelperService {
    
    private final LL1SolverService solverService;
    private static final String EPSILON = "ε";
    private static final String END_MARKER = "$";
    
    public HelperAnalysisResponse analyzeParsingState(HelperAnalysisRequest request) {
        try {
            // Parse grammar and generate parse table
            Map<String, List<List<String>>> grammar = solverService.parseGrammar(request.getGrammar());
            Map<String, Set<String>> firstSets = solverService.computeFirstSets(grammar);
            Map<String, Set<String>> followSets = solverService.computeFollowSets(grammar, firstSets);
            
            // Generate parse table
            var tableResponse = solverService.generateParseTable(request.getGrammar());
            
            if (!tableResponse.isLL1()) {
                return createConflictResponse(tableResponse);
            }
            
            Map<String, Map<String, String>> parseTable = tableResponse.getParseTable();
            
            // Extract terminals from grammar
            Set<String> terminals = solverService.extractTerminals(grammar);
            Set<String> nonTerminals = grammar.keySet();
            
            // Parse current state - smart tokenization handles both spaced and concatenated input
            String stack = request.getCurrentStack().trim();
            String input = request.getRemainingInput().trim();
            
            if (stack.isEmpty() || input.isEmpty()) {
                return createInvalidInputResponse();
            }
            
            // Tokenize stack and input using smart tokenization
            List<String> stackTokens = tokenizeInput(stack, terminals, nonTerminals);
            List<String> inputTokens = tokenizeInput(input, terminals, nonTerminals);
            
            if (stackTokens.isEmpty() || inputTokens.isEmpty()) {
                return createInvalidInputResponse();
            }
            
            // Get top of stack and lookahead (first token)
            String topSymbol = stackTokens.get(0);
            String lookahead = inputTokens.get(0);
            
            // Validate multi-character symbols
            // Multi-character symbols can be either non-terminals or multi-char terminals (like "id")
            if (topSymbol.length() > 1 && !topSymbol.equals(END_MARKER) && 
                !nonTerminals.contains(topSymbol) && !terminals.contains(topSymbol)) {
                return createErrorResponse("Invalid symbol '" + topSymbol + "' on stack.\n\n" +
                    "Valid non-terminals: " + String.join(", ", nonTerminals) + "\n" +
                    "Valid terminals: " + String.join(", ", terminals));
            }
            
            if (lookahead.length() > 1 && !lookahead.equals(END_MARKER) && 
                !nonTerminals.contains(lookahead) && !terminals.contains(lookahead)) {
                return createErrorResponse("Invalid input symbol '" + lookahead + "'.\n\n" +
                    "Valid non-terminals: " + String.join(", ", nonTerminals) + "\n" +
                    "Valid terminals: " + String.join(", ", terminals));
            }
            
            // Check if parsing is complete
            if (topSymbol.equals(END_MARKER) && lookahead.equals(END_MARKER)) {
                return createSuccessResponse();
            }
            
            // Analyze current step
            if (nonTerminals.contains(topSymbol)) {
                // Non-terminal on top of stack
                return analyzeNonTerminalStep(topSymbol, lookahead, parseTable, 
                    firstSets, followSets, stackTokens, inputTokens, request);
            } else {
                // Terminal on top of stack
                return analyzeTerminalStep(topSymbol, lookahead, stackTokens, inputTokens);
            }
            
        } catch (Exception e) {
            return createErrorResponse("Error analyzing parsing state: " + e.getMessage());
        }
    }
    
    private HelperAnalysisResponse analyzeNonTerminalStep(
            String topSymbol, 
            String lookahead,
            Map<String, Map<String, String>> parseTable,
            Map<String, Set<String>> firstSets,
            Map<String, Set<String>> followSets,
            List<String> stackTokens,
            List<String> inputTokens,
            HelperAnalysisRequest request) {
        
        Map<String, String> row = parseTable.get(topSymbol);
        
        if (row == null || !row.containsKey(lookahead)) {
            // No valid production for this (topSymbol, lookahead) combination
            return createNoRuleError(topSymbol, lookahead, firstSets, followSets, parseTable);
        }
        
        String production = row.get(lookahead);
        
        // Check if user's last action matches the correct production
        if (request.getLastAction() != null && !request.getLastAction().isEmpty()) {
            if (!request.getLastAction().contains(production)) {
                return createWrongProductionError(topSymbol, lookahead, production, 
                    request.getLastAction(), firstSets, followSets);
            }
        }
        
        // Correct step
        return createCorrectStepResponse(topSymbol, lookahead, production, stackTokens, inputTokens, firstSets, followSets);
    }
    
    private HelperAnalysisResponse analyzeTerminalStep(
            String topSymbol,
            String lookahead,
            List<String> stackTokens,
            List<String> inputTokens) {
        
        if (topSymbol.equals(lookahead)) {
            // Correct match - rebuild stack and input without first token
            String newStack = stackTokens.size() > 1 ? 
                String.join(" ", stackTokens.subList(1, stackTokens.size())) : "";
            String newInput = inputTokens.size() > 1 ? 
                String.join(" ", inputTokens.subList(1, inputTokens.size())) : "";
            
            ExplanationInfo explanation = new ExplanationInfo(
                "You correctly matched terminal '" + topSymbol + "'",
                "In LL(1) parsing, when a terminal is on top of the stack and matches the lookahead, we perform a MATCH operation",
                "This removes both the top of stack and the current input symbol",
                Arrays.asList(
                    "Match operation consumes one symbol from both stack and input",
                    "The parser advances to the next input symbol",
                    "Continue with the new stack top and lookahead"
                )
            );
            
            SuggestionInfo suggestion = new SuggestionInfo(
                "Match '" + topSymbol + "'",
                newStack.isEmpty() ? "$" : newStack,
                newInput.isEmpty() ? "$" : newInput,
                "Pop '" + topSymbol + "' from stack and consume it from input",
                Arrays.asList(
                    "1. Pop '" + topSymbol + "' from the stack",
                    "2. Move to next input symbol",
                    "3. Continue parsing with new state"
                )
            );
            
            return new HelperAnalysisResponse(
                true,
                "CORRECT",
                "✅ Correct! Match terminal '" + topSymbol + "' and continue.",
                null,
                explanation,
                suggestion,
                null,
                null,
                null
            );
        } else {
            // Mismatch
            String stack = String.join(" ", stackTokens);
            String input = String.join(" ", inputTokens);
            
            ExplanationInfo explanation = new ExplanationInfo(
                "Terminal mismatch: Expected '" + topSymbol + "' but found '" + lookahead + "'",
                "In LL(1) parsing, terminals must match exactly. This indicates an error in a previous step",
                "The parser expected '" + topSymbol + "' because of earlier production choices",
                Arrays.asList(
                    "Terminals on stack must match input symbols exactly",
                    "A mismatch indicates wrong production was used earlier",
                    "Review previous steps to find where derivation went wrong"
                )
            );
            
            SuggestionInfo suggestion = new SuggestionInfo(
                "Review previous steps",
                stack,
                input,
                "This error usually comes from choosing the wrong production in an earlier step",
                Arrays.asList(
                    "1. Go back to previous non-terminal expansions",
                    "2. Check if correct productions were chosen",
                    "3. Verify FIRST and FOLLOW sets were used properly"
                )
            );
            
            DiagnosticInfo diagnostic = new DiagnosticInfo(
                "TERMINAL_MISMATCH",
                topSymbol,
                lookahead,
                "Match '" + topSymbol + "'",
                "Found '" + lookahead + "' instead",
                new ArrayList<>()
            );
            
            return new HelperAnalysisResponse(
                false,
                "ERROR",
                "❌ Error: Expected '" + topSymbol + "' but found '" + lookahead + "'",
                diagnostic,
                explanation,
                suggestion,
                null,
                null,
                null
            );
        }
    }
    
    private HelperAnalysisResponse createCorrectStepResponse(
            String topSymbol,
            String lookahead,
            String production,
            List<String> stackTokens,
            List<String> inputTokens,
            Map<String, Set<String>> firstSets,
            Map<String, Set<String>> followSets) {
        
        // Parse production to get right-hand side
        String[] parts = production.split("→");
        String rhs = parts.length > 1 ? parts[1].trim() : "";
        
        // Calculate next stack - remove topSymbol and add production RHS
        List<String> newStackTokens = new ArrayList<>(stackTokens.subList(1, stackTokens.size()));
        String newStack;
        
        if (rhs.equals(EPSILON)) {
            // Epsilon production - just remove the non-terminal
            newStack = newStackTokens.isEmpty() ? "" : String.join(" ", newStackTokens);
        } else {
            // Replace non-terminal with production RHS (already in correct order)
            String[] symbols = rhs.split("\\s+");
            List<String> allTokens = new ArrayList<>(Arrays.asList(symbols));
            allTokens.addAll(newStackTokens);
            newStack = String.join(" ", allTokens);
        }
        
        String input = String.join(" ", inputTokens);
        
        // Create explanation
        String whyThisProduction = explainProductionChoice(topSymbol, lookahead, production, firstSets, followSets);
        
        ExplanationInfo explanation = new ExplanationInfo(
            "You correctly applied production: " + production,
            whyThisProduction,
            "The LL(1) parser chooses productions based on FIRST and FOLLOW sets",
            Arrays.asList(
                "If lookahead ∈ FIRST(production), choose that production",
                "If ε ∈ FIRST and lookahead ∈ FOLLOW(non-terminal), choose ε-production",
                "LL(1) parsers make decisions using only one lookahead symbol"
            )
        );
        
        SuggestionInfo suggestion = new SuggestionInfo(
            "Apply: " + production,
            newStack.isEmpty() ? "$" : newStack,
            input,
            rhs.equals(EPSILON) ? "Pop " + topSymbol + " without pushing anything" : 
                "Pop " + topSymbol + " and push " + rhs + " (in reverse order)",
            generateExpansionSteps(topSymbol, rhs, String.join(" ", newStackTokens))
        );
        
        return new HelperAnalysisResponse(
            true,
            "CORRECT",
            "✅ Correct! Apply production: " + production,
            null,
            explanation,
            suggestion,
            convertSetsToLists(firstSets),
            convertSetsToLists(followSets),
            null
        );
    }
    
    private HelperAnalysisResponse createWrongProductionError(
            String topSymbol,
            String lookahead,
            String correctProduction,
            String userAction,
            Map<String, Set<String>> firstSets,
            Map<String, Set<String>> followSets) {
        
        String whyCorrect = explainProductionChoice(topSymbol, lookahead, correctProduction, firstSets, followSets);
        
        ExplanationInfo explanation = new ExplanationInfo(
            "Wrong production applied for (" + topSymbol + ", '" + lookahead + "')",
            whyCorrect,
            "LL(1) parsers use FIRST and FOLLOW sets to choose the correct production deterministically",
            Arrays.asList(
                "Check FIRST(" + topSymbol + ") for the lookahead symbol",
                "If production has ε, check if lookahead ∈ FOLLOW(" + topSymbol + ")",
                "Only one production should be valid for each (non-terminal, terminal) pair"
            )
        );
        
        DiagnosticInfo diagnostic = new DiagnosticInfo(
            "WRONG_PRODUCTION",
            topSymbol,
            lookahead,
            correctProduction,
            userAction,
            Arrays.asList(correctProduction)
        );
        
        SuggestionInfo suggestion = new SuggestionInfo(
            "Use: " + correctProduction,
            null,
            null,
            whyCorrect,
            Arrays.asList(
                "1. Check which production has '" + lookahead + "' in its FIRST set",
                "2. Apply that production to expand " + topSymbol,
                "3. Continue parsing with new stack"
            )
        );
        
        return new HelperAnalysisResponse(
            false,
            "ERROR",
            "❌ Wrong production! Expected: " + correctProduction,
            diagnostic,
            explanation,
            suggestion,
            convertSetsToLists(firstSets),
            convertSetsToLists(followSets),
            null
        );
    }
    
    private HelperAnalysisResponse createNoRuleError(
            String topSymbol,
            String lookahead,
            Map<String, Set<String>> firstSets,
            Map<String, Set<String>> followSets,
            Map<String, Map<String, String>> parseTable) {
        
        Set<String> firstOfTop = firstSets.get(topSymbol);
        Set<String> followOfTop = followSets.get(topSymbol);
        
        Map<String, String> row = parseTable.get(topSymbol);
        List<String> validLookaheads = row != null ? new ArrayList<>(row.keySet()) : new ArrayList<>();
        
        String reason = "The lookahead '" + lookahead + "' is not valid for non-terminal '" + topSymbol + "'";
        if (firstOfTop != null) {
            reason += "\nFIRST(" + topSymbol + ") = { " + String.join(", ", firstOfTop) + " }";
        }
        if (followOfTop != null && firstOfTop != null && firstOfTop.contains(EPSILON)) {
            reason += "\nFOLLOW(" + topSymbol + ") = { " + String.join(", ", followOfTop) + " }";
        }
        
        ExplanationInfo explanation = new ExplanationInfo(
            "No valid production for (" + topSymbol + ", '" + lookahead + "')",
            "This usually means an error occurred in a previous step",
            reason,
            Arrays.asList(
                "Valid lookaheads for " + topSymbol + ": " + String.join(", ", validLookaheads),
                "The current lookahead suggests wrong production was chosen earlier",
                "Review previous non-terminal expansions"
            )
        );
        
        DiagnosticInfo diagnostic = new DiagnosticInfo(
            "STACK_INPUT_MISMATCH",
            topSymbol,
            lookahead,
            "No valid production",
            "Trying to parse '" + lookahead + "'",
            new ArrayList<>()
        );
        
        SuggestionInfo suggestion = new SuggestionInfo(
            "Review earlier steps",
            null,
            null,
            "Check if previous production choices were correct",
            Arrays.asList(
                "1. Verify earlier non-terminal expansions",
                "2. Ensure correct productions were chosen based on lookahead",
                "3. Rebuild parse table if uncertain"
            )
        );
        
        return new HelperAnalysisResponse(
            false,
            "ERROR",
            "❌ No rule for " + topSymbol + " under '" + lookahead + "'",
            diagnostic,
            explanation,
            suggestion,
            convertSetsToLists(firstSets),
            convertSetsToLists(followSets),
            parseTable
        );
    }
    
    private String explainProductionChoice(
            String nonTerminal,
            String lookahead,
            String production,
            Map<String, Set<String>> firstSets,
            Map<String, Set<String>> followSets) {
        
        String[] parts = production.split("→");
        if (parts.length < 2) return "Production chosen based on parse table";
        
        String rhs = parts[1].trim();
        Set<String> firstOfNT = firstSets.get(nonTerminal);
        Set<String> followOfNT = followSets.get(nonTerminal);
        
        if (rhs.equals(EPSILON)) {
            return "Since " + production + " and lookahead '" + lookahead + "' is in FOLLOW(" + 
                   nonTerminal + ") = { " + String.join(", ", followOfNT) + " }, we use the ε-production";
        } else {
            if (firstOfNT != null && firstOfNT.contains(lookahead)) {
                return "Since lookahead '" + lookahead + "' ∈ FIRST(" + nonTerminal + "), we choose " + production;
            }
            return "The production " + production + " is chosen because '" + lookahead + 
                   "' can be derived from it";
        }
    }
    
    private List<String> generateExpansionSteps(String nonTerminal, String rhs, String restOfStack) {
        List<String> steps = new ArrayList<>();
        
        if (rhs.equals(EPSILON)) {
            steps.add("1. Pop '" + nonTerminal + "' from stack (ε-production)");
            steps.add("2. Stack becomes: " + (restOfStack.isEmpty() ? "$" : restOfStack));
            steps.add("3. Continue with next symbol on stack");
        } else {
            steps.add("1. Pop '" + nonTerminal + "' from stack");
            steps.add("2. Push '" + rhs + "' onto stack (in reverse order)");
            String[] symbols = rhs.split("\\s+");
            StringBuilder newStack = new StringBuilder();
            // RHS is already in top-to-bottom order for the stack
            for (int i = 0; i < symbols.length; i++) {
                newStack.append(symbols[i]);
                if (i < symbols.length - 1 || !restOfStack.isEmpty()) {
                    newStack.append(" ");
                }
            }
            if (!restOfStack.isEmpty()) {
                newStack.append(restOfStack);
            }
            steps.add("3. Stack becomes: " + newStack.toString().trim());
            steps.add("4. Continue with top of new stack");
        }
        
        return steps;
    }
    
    private Map<String, List<String>> convertSetsToLists(Map<String, Set<String>> sets) {
        Map<String, List<String>> result = new HashMap<>();
        for (Map.Entry<String, Set<String>> entry : sets.entrySet()) {
            result.put(entry.getKey(), new ArrayList<>(entry.getValue()));
        }
        return result;
    }
    
    private HelperAnalysisResponse createSuccessResponse() {
        ExplanationInfo explanation = new ExplanationInfo(
            "Parsing completed successfully!",
            "Both stack and input contain only $, indicating successful parse",
            "The input string belongs to the language defined by the grammar",
            Arrays.asList(
                "Stack: $ means all non-terminals expanded",
                "Input: $ means all input consumed",
                "String is accepted by the LL(1) parser"
            )
        );
        
        return new HelperAnalysisResponse(
            true,
            "CORRECT",
            "✅ Success! Parsing completed. String accepted.",
            null,
            explanation,
            null,
            null,
            null,
            null
        );
    }
    
    private HelperAnalysisResponse createConflictResponse(ParseTableResponse tableResponse) {
        StringBuilder conflictDetails = new StringBuilder();
        for (var conflict : tableResponse.getConflicts()) {
            conflictDetails.append("\n⚠️ Conflict at [")
                .append(conflict.getNonTerminal())
                .append(", ")
                .append(conflict.getTerminal())
                .append("]: ")
                .append(String.join(" vs ", conflict.getConflictingProductions()));
        }
        
        ExplanationInfo explanation = new ExplanationInfo(
            "Grammar has LL(1) conflicts",
            "The grammar is not LL(1) because multiple productions exist for the same (non-terminal, terminal) pair",
            conflictDetails.toString(),
            Arrays.asList(
                "LL(1) requires exactly one production per (non-terminal, terminal) pair",
                "Conflicts must be resolved through left-factoring or left-recursion removal",
                "Fix grammar before attempting to parse"
            )
        );
        
        return new HelperAnalysisResponse(
            false,
            "ERROR",
            "❌ Grammar is not LL(1) - Contains conflicts",
            null,
            explanation,
            null,
            null,
            null,
            null
        );
    }
    
    private HelperAnalysisResponse createInvalidInputResponse() {
        return new HelperAnalysisResponse(
            false,
            "ERROR",
            "❌ Invalid input: Stack and remaining input cannot be empty",
            null,
            null,
            null,
            null,
            null,
            null
        );
    }
    
    private HelperAnalysisResponse createErrorResponse(String message) {
        return new HelperAnalysisResponse(
            false,
            "ERROR",
            "❌ " + message,
            null,
            null,
            null,
            null,
            null,
            null
        );
    }
    
    /**
     * Tokenization that treats non-terminals as complete units and terminals as single characters
     */
    private List<String> tokenizeInput(String input, Set<String> terminals, Set<String> nonTerminals) {
        input = input.trim();
        
        // If input contains spaces, split by spaces (return mutable list)
        if (input.contains(" ")) {
            return new ArrayList<>(Arrays.asList(input.split("\\s+")));
        }
        
        // For concatenated input, use longest match for non-terminals, single chars for terminals
        List<String> tokens = new ArrayList<>();
        int i = 0;
        
        while (i < input.length()) {
            boolean matched = false;
            
            // Try to match non-terminals first (sorted by length descending to match longest first)
            List<String> sortedNonTerminals = new ArrayList<>(nonTerminals);
            sortedNonTerminals.sort((a, b) -> b.length() - a.length());
            
            for (String nonTerminal : sortedNonTerminals) {
                if (input.startsWith(nonTerminal, i)) {
                    tokens.add(nonTerminal);
                    i += nonTerminal.length();
                    matched = true;
                    break;
                }
            }
            
            // If no non-terminal matched, treat as single-character terminal
            if (!matched) {
                tokens.add(String.valueOf(input.charAt(i)));
                i++;
            }
        }
        
        return tokens;
    }
}
