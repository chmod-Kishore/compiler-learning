package com.compiler.learning.service;

import com.compiler.learning.dto.ParseTableResponse;
import com.compiler.learning.dto.ParseSimulationResponse;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LL1SolverService {
    
    private static final String EPSILON = "ε";
    private static final String END_MARKER = "$";
    
    // Parse grammar from string format
    public Map<String, List<List<String>>> parseGrammar(String grammarText) {
        Map<String, List<List<String>>> grammar = new LinkedHashMap<>();
        
        String[] lines = grammarText.trim().split("\n");
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            
            // Support both → and ->
            String[] parts = line.split("→|->", 2);
            if (parts.length != 2) continue;
            
            String nonTerminal = parts[0].trim();
            String[] productions = parts[1].trim().split("\\|");
            
            // Get existing productions or create new list
            List<List<String>> productionList = grammar.getOrDefault(nonTerminal, new ArrayList<>());
            
            for (String prod : productions) {
                String[] symbols = prod.trim().split("\\s+");
                productionList.add(Arrays.asList(symbols));
            }
            
            grammar.put(nonTerminal, productionList);
        }
        
        return grammar;
    }
    
    // Extract terminals from grammar
    public Set<String> extractTerminals(Map<String, List<List<String>>> grammar) {
        Set<String> terminals = new HashSet<>();
        Set<String> nonTerminals = grammar.keySet();
        
        for (List<List<String>> productions : grammar.values()) {
            for (List<String> production : productions) {
                for (String symbol : production) {
                    if (!nonTerminals.contains(symbol) && 
                        !symbol.equals(EPSILON) && 
                        !symbol.equals(END_MARKER)) {
                        terminals.add(symbol);
                    }
                }
            }
        }
        
        terminals.add(END_MARKER);
        return terminals;
    }
    
    // Compute FIRST sets
    public Map<String, Set<String>> computeFirstSets(Map<String, List<List<String>>> grammar) {
        Map<String, Set<String>> firstSets = new HashMap<>();
        Set<String> nonTerminals = grammar.keySet();
        
        // Initialize
        for (String nonTerminal : nonTerminals) {
            firstSets.put(nonTerminal, new HashSet<>());
        }
        
        boolean changed = true;
        while (changed) {
            changed = false;
            
            for (Map.Entry<String, List<List<String>>> entry : grammar.entrySet()) {
                String nonTerminal = entry.getKey();
                int sizeBefore = firstSets.get(nonTerminal).size();
                
                for (List<String> production : entry.getValue()) {
                    Set<String> firstOfProduction = computeFirstOfSequence(production, grammar, firstSets, nonTerminals);
                    firstSets.get(nonTerminal).addAll(firstOfProduction);
                }
                
                if (firstSets.get(nonTerminal).size() > sizeBefore) {
                    changed = true;
                }
            }
        }
        
        return firstSets;
    }
    
    // Compute FIRST of a sequence of symbols
    private Set<String> computeFirstOfSequence(List<String> sequence, 
                                                Map<String, List<List<String>>> grammar,
                                                Map<String, Set<String>> firstSets,
                                                Set<String> nonTerminals) {
        Set<String> result = new HashSet<>();
        
        for (String symbol : sequence) {
            if (symbol.equals(EPSILON)) {
                result.add(EPSILON);
                break;
            } else if (!nonTerminals.contains(symbol)) {
                // Terminal - add the complete terminal symbol
                result.add(symbol);
                break;
            } else {
                // Non-terminal
                Set<String> firstOfSymbol = new HashSet<>(firstSets.get(symbol));
                boolean hasEpsilon = firstOfSymbol.remove(EPSILON);
                result.addAll(firstOfSymbol);
                
                if (!hasEpsilon) {
                    break;
                }
            }
        }
        
        // If all symbols can derive epsilon, add epsilon
        boolean allHaveEpsilon = true;
        for (String symbol : sequence) {
            if (symbol.equals(EPSILON)) {
                continue;
            }
            if (!nonTerminals.contains(symbol)) {
                allHaveEpsilon = false;
                break;
            }
            if (!firstSets.get(symbol).contains(EPSILON)) {
                allHaveEpsilon = false;
                break;
            }
        }
        
        if (allHaveEpsilon && !sequence.isEmpty()) {
            result.add(EPSILON);
        }
        
        return result;
    }
    
    // Compute FOLLOW sets
    public Map<String, Set<String>> computeFollowSets(Map<String, List<List<String>>> grammar,
                                                       Map<String, Set<String>> firstSets) {
        Map<String, Set<String>> followSets = new HashMap<>();
        Set<String> nonTerminals = grammar.keySet();
        
        // Initialize
        for (String nonTerminal : nonTerminals) {
            followSets.put(nonTerminal, new HashSet<>());
        }
        
        // Add $ to FOLLOW of start symbol
        String startSymbol = grammar.keySet().iterator().next();
        followSets.get(startSymbol).add(END_MARKER);
        
        boolean changed = true;
        while (changed) {
            changed = false;
            
            for (Map.Entry<String, List<List<String>>> entry : grammar.entrySet()) {
                String nonTerminal = entry.getKey();
                
                for (List<String> production : entry.getValue()) {
                    for (int i = 0; i < production.size(); i++) {
                        String symbol = production.get(i);
                        
                        if (!nonTerminals.contains(symbol)) continue;
                        
                        int sizeBefore = followSets.get(symbol).size();
                        
                        // Get FIRST of remaining symbols
                        List<String> remaining = production.subList(i + 1, production.size());
                        if (remaining.isEmpty()) {
                            // Add FOLLOW(nonTerminal) to FOLLOW(symbol)
                            followSets.get(symbol).addAll(followSets.get(nonTerminal));
                        } else {
                            Set<String> firstOfRemaining = computeFirstOfSequence(remaining, grammar, firstSets, nonTerminals);
                            boolean hasEpsilon = firstOfRemaining.remove(EPSILON);
                            followSets.get(symbol).addAll(firstOfRemaining);
                            
                            if (hasEpsilon) {
                                followSets.get(symbol).addAll(followSets.get(nonTerminal));
                            }
                        }
                        
                        if (followSets.get(symbol).size() > sizeBefore) {
                            changed = true;
                        }
                    }
                }
            }
        }
        
        return followSets;
    }
    
    // Generate parse table and detect conflicts
    public ParseTableResponse generateParseTable(String grammarText) {
        try {
            Map<String, List<List<String>>> grammar = parseGrammar(grammarText);
            
            if (grammar.isEmpty()) {
                return createErrorResponse("Grammar is empty or invalid format");
            }
            
            Set<String> terminals = extractTerminals(grammar);
            Map<String, Set<String>> firstSets = computeFirstSets(grammar);
            Map<String, Set<String>> followSets = computeFollowSets(grammar, firstSets);
            
            Map<String, Map<String, String>> parseTable = new HashMap<>();
            List<ParseTableResponse.ConflictInfo> conflicts = new ArrayList<>();
            
            // Initialize parse table
            for (String nonTerminal : grammar.keySet()) {
                parseTable.put(nonTerminal, new HashMap<>());
            }
            
            // Build parse table
            for (Map.Entry<String, List<List<String>>> entry : grammar.entrySet()) {
                String nonTerminal = entry.getKey();
                
                for (List<String> production : entry.getValue()) {
                    String productionStr = nonTerminal + " → " + String.join(" ", production);
                    
                    Set<String> firstOfProduction = computeFirstOfSequence(production, grammar, firstSets, grammar.keySet());
                    
                    // Add entries for terminals in FIRST(production)
                    for (String terminal : firstOfProduction) {
                        if (!terminal.equals(EPSILON)) {
                            if (parseTable.get(nonTerminal).containsKey(terminal)) {
                                // Conflict detected
                                String existing = parseTable.get(nonTerminal).get(terminal);
                                conflicts.add(new ParseTableResponse.ConflictInfo(
                                    nonTerminal,
                                    terminal,
                                    Arrays.asList(existing, productionStr),
                                    "FIRST/FIRST"
                                ));
                            } else {
                                parseTable.get(nonTerminal).put(terminal, productionStr);
                            }
                        }
                    }
                    
                    // If production can derive epsilon, add entries for FOLLOW(nonTerminal)
                    if (firstOfProduction.contains(EPSILON)) {
                        for (String terminal : followSets.get(nonTerminal)) {
                            if (parseTable.get(nonTerminal).containsKey(terminal)) {
                                // Conflict detected
                                String existing = parseTable.get(nonTerminal).get(terminal);
                                conflicts.add(new ParseTableResponse.ConflictInfo(
                                    nonTerminal,
                                    terminal,
                                    Arrays.asList(existing, productionStr),
                                    "FIRST/FOLLOW"
                                ));
                            } else {
                                parseTable.get(nonTerminal).put(terminal, productionStr);
                            }
                        }
                    }
                }
            }
            
            boolean isLL1 = conflicts.isEmpty();
            String message = isLL1 ? "✅ Grammar is LL(1)" : "⚠️ Grammar is NOT LL(1) - Conflicts detected";
            
            // Convert sets to sorted lists for response
            Map<String, List<String>> firstSetsResponse = firstSets.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    e -> new ArrayList<>(e.getValue())
                ));
            
            Map<String, List<String>> followSetsResponse = followSets.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    e -> new ArrayList<>(e.getValue())
                ));
            
            List<String> terminalsList = new ArrayList<>(terminals);
            Collections.sort(terminalsList);
            // Ensure $ is at the end
            terminalsList.remove(END_MARKER);
            terminalsList.add(END_MARKER);
            
            List<String> nonTerminalsList = new ArrayList<>(grammar.keySet());
            
            return new ParseTableResponse(
                parseTable,
                firstSetsResponse,
                followSetsResponse,
                terminalsList,
                nonTerminalsList,
                isLL1,
                conflicts,
                message
            );
            
        } catch (Exception e) {
            return createErrorResponse("Error parsing grammar: " + e.getMessage());
        }
    }
    
    // Run parser simulation
    public ParseSimulationResponse runParser(String grammarText, String inputString) {
        try {
            ParseTableResponse tableResponse = generateParseTable(grammarText);
            
            if (!tableResponse.isLL1()) {
                return createParseErrorResponse("Cannot parse: Grammar is not LL(1)");
            }
            
            Map<String, Map<String, String>> parseTable = tableResponse.getParseTable();
            String startSymbol = tableResponse.getNonTerminals().get(0);
            
            // Parse grammar to get terminals for smart tokenization
            Map<String, List<List<String>>> grammar = parseGrammar(grammarText);
            Set<String> terminals = extractTerminals(grammar);
            Set<String> grammarNonTerminals = grammar.keySet();
            
            // Tokenize input using smart tokenization
            List<String> inputTokens = tokenizeInput(inputString.trim(), terminals, grammarNonTerminals);
            inputTokens.add(END_MARKER);
            
            // Initialize stack with start symbol and $
            Stack<String> stack = new Stack<>();
            stack.push(END_MARKER);
            stack.push(startSymbol);
            
            List<ParseSimulationResponse.ParseStep> steps = new ArrayList<>();
            List<String> derivation = new ArrayList<>();
            derivation.add(startSymbol);
            
            int stepNumber = 1;
            int inputPointer = 0;
            
            ParseSimulationResponse.ParseTreeNode root = new ParseSimulationResponse.ParseTreeNode(startSymbol, new ArrayList<>());
            Stack<ParseSimulationResponse.ParseTreeNode> treeStack = new Stack<>();
            treeStack.push(root);
            
            while (!stack.isEmpty()) {
                String top = stack.peek();
                String currentInput = inputPointer < inputTokens.size() ? inputTokens.get(inputPointer) : END_MARKER;
                
                String stackStr = stackToString(stack);
                String inputStr = tokensToString(inputTokens, inputPointer);
                
                if (top.equals(END_MARKER) && currentInput.equals(END_MARKER)) {
                    // Accept
                    steps.add(new ParseSimulationResponse.ParseStep(
                        stepNumber++,
                        stackStr,
                        inputStr,
                        "Accept",
                        ""
                    ));
                    
                    String derivationStr = String.join(" ⇒ ", derivation);
                    return new ParseSimulationResponse(
                        steps,
                        true,
                        "✅ Input String Accepted by LL(1) Parser",
                        derivationStr,
                        root
                    );
                }
                
                Set<String> nonTerminals = parseTable.keySet();
                if (!nonTerminals.contains(top)) {
                    // Terminal on stack
                    if (top.equals(currentInput)) {
                        // Match
                        steps.add(new ParseSimulationResponse.ParseStep(
                            stepNumber++,
                            stackStr,
                            inputStr,
                            "Match '" + top + "'",
                            ""
                        ));
                        stack.pop();
                        if (!treeStack.isEmpty()) {
                            treeStack.pop();
                        }
                        inputPointer++;
                    } else {
                        // Error
                        steps.add(new ParseSimulationResponse.ParseStep(
                            stepNumber++,
                            stackStr,
                            inputStr,
                            "Error",
                            "Expected '" + top + "' but found '" + currentInput + "'"
                        ));
                        return new ParseSimulationResponse(
                            steps,
                            false,
                            "❌ Error at token '" + currentInput + "' — Expected '" + top + "'",
                            String.join(" ⇒ ", derivation),
                            root
                        );
                    }
                } else {
                    // Non-terminal on stack
                    Map<String, String> row = parseTable.get(top);
                    
                    if (!row.containsKey(currentInput)) {
                        // Error - no rule
                        steps.add(new ParseSimulationResponse.ParseStep(
                            stepNumber++,
                            stackStr,
                            inputStr,
                            "Error",
                            "No rule for " + top + " under '" + currentInput + "'"
                        ));
                        return new ParseSimulationResponse(
                            steps,
                            false,
                            "❌ Error at token '" + currentInput + "' — No rule for " + top + " under '" + currentInput + "'",
                            String.join(" ⇒ ", derivation),
                            root
                        );
                    }
                    
                    String production = row.get(currentInput);
                    
                    // Check if production is null
                    if (production == null || production.trim().isEmpty()) {
                        steps.add(new ParseSimulationResponse.ParseStep(
                            stepNumber++,
                            stackStr,
                            inputStr,
                            "Error",
                            "No rule for " + top + " under '" + currentInput + "'"
                        ));
                        return new ParseSimulationResponse(
                            steps,
                            false,
                            "❌ Error: Parse table has null entry for [" + top + ", " + currentInput + "]",
                            String.join(" ⇒ ", derivation),
                            root
                        );
                    }
                    
                    String[] prodParts = production.split("→");
                    if (prodParts.length < 2) {
                        // Try with -> instead
                        prodParts = production.split("->");
                        if (prodParts.length < 2) {
                            return createParseErrorResponse("Invalid production format: " + production);
                        }
                    }
                    String[] rightSide = prodParts[1].trim().split("\\s+");
                    
                    steps.add(new ParseSimulationResponse.ParseStep(
                        stepNumber++,
                        stackStr,
                        inputStr,
                        "Apply production",
                        production
                    ));
                    
                    // Update derivation
                    String currentDerivation = derivation.get(derivation.size() - 1);
                    String newDerivation = currentDerivation.replaceFirst(top, prodParts[1].trim());
                    derivation.add(newDerivation);
                    
                    // Pop non-terminal and push production
                    stack.pop();
                    ParseSimulationResponse.ParseTreeNode parentNode = !treeStack.isEmpty() ? treeStack.pop() : null;
                    
                    // Push in reverse order
                    if (!rightSide[0].equals(EPSILON)) {
                        for (int i = rightSide.length - 1; i >= 0; i--) {
                            stack.push(rightSide[i]);
                            if (parentNode != null) {
                                ParseSimulationResponse.ParseTreeNode childNode = 
                                    new ParseSimulationResponse.ParseTreeNode(rightSide[i], new ArrayList<>());
                                parentNode.getChildren().add(0, childNode);
                                if (nonTerminals.contains(rightSide[i])) {
                                    treeStack.push(childNode);
                                }
                            }
                        }
                    } else {
                        // Epsilon production
                        if (parentNode != null) {
                            parentNode.getChildren().add(new ParseSimulationResponse.ParseTreeNode(EPSILON, new ArrayList<>()));
                        }
                    }
                }
            }
            
            return createParseErrorResponse("Unexpected end of parsing");
            
        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace
            String errorMsg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return createParseErrorResponse("Error during parsing: " + errorMsg + ". Check grammar and input format.");
        }
    }
    
    private String stackToString(Stack<String> stack) {
        return String.join("", stack);
    }
    
    private String tokensToString(List<String> tokens, int startIndex) {
        return String.join("", tokens.subList(startIndex, tokens.size()));
    }
    
    private ParseTableResponse createErrorResponse(String message) {
        return new ParseTableResponse(
            new HashMap<>(),
            new HashMap<>(),
            new HashMap<>(),
            new ArrayList<>(),
            new ArrayList<>(),
            false,
            new ArrayList<>(),
            "❌ " + message
        );
    }
    
    private ParseSimulationResponse createParseErrorResponse(String message) {
        return new ParseSimulationResponse(
            new ArrayList<>(),
            false,
            "❌ " + message,
            "",
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
