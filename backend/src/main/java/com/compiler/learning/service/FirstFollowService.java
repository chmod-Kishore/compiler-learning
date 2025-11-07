package com.compiler.learning.service;

import com.compiler.learning.dto.FirstFollowResponse;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FirstFollowService {

    private static final String EPSILON = "ε";
    private static final String END_MARKER = "$";

    @Data
    public static class Grammar {
        private Map<String, List<List<String>>> productions; // non-terminal -> list of productions
        private String startSymbol;
        private Set<String> nonTerminals;
        private Set<String> terminals;
    }

    public String getTheory() {
        return """
            <h2>FIRST and FOLLOW Sets</h2>

            <h3>First Function</h3>
            <p>
                <strong>First(α)</strong> is a set of terminal symbols that begin in strings derived from α.
            </p>
            
            <h4>Example:</h4>
            <p>Consider the production rule:</p>
            <pre>A → abc | def | ghi</pre>
            <p>Then, we have:</p>
            <pre>First(A) = { a, d, g }</pre>

            <h3>Rules For Calculating First Function</h3>

            <h3>Rules For Calculating First Function</h3>

            <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #4CAF50;">
                <h4>Rule-01:</h4>
                <p>For a production rule <strong>X → ε</strong>,</p>
                <pre>First(X) = { ε }</pre>
            </div>

            <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #2196F3;">
                <h4>Rule-02:</h4>
                <p>For any terminal symbol 'a',</p>
                <pre>First(a) = { a }</pre>
            </div>

            <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #FF9800;">
                <h4>Rule-03:</h4>
                <p>For a production rule <strong>X → Y₁Y₂Y₃</strong>,</p>
                
                <p><strong>Calculating First(X):</strong></p>
                <ul>
                    <li>If ε ∉ First(Y₁), then First(X) = First(Y₁)</li>
                    <li>If ε ∈ First(Y₁), then First(X) = { First(Y₁) – ε } ∪ First(Y₂Y₃)</li>
                </ul>
                
                <p><strong>Calculating First(Y₂Y₃):</strong></p>
                <ul>
                    <li>If ε ∉ First(Y₂), then First(Y₂Y₃) = First(Y₂)</li>
                    <li>If ε ∈ First(Y₂), then First(Y₂Y₃) = { First(Y₂) – ε } ∪ First(Y₃)</li>
                </ul>
                
                <p><em>Similarly, we can make expansion for any production rule X → Y₁Y₂Y₃…..Yₙ.</em></p>
            </div>

            <h3>Follow Function</h3>
            <p>
                <strong>Follow(α)</strong> is a set of terminal symbols that appear immediately to the right of α.
            </p>

            <h3>Rules For Calculating Follow Function</h3>

            <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #4CAF50;">
                <h4>Rule-01:</h4>
                <p>For the start symbol S, place $ in Follow(S).</p>
            </div>

            <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #2196F3;">
                <h4>Rule-02:</h4>
                <p>For any production rule <strong>A → αB</strong>,</p>
                <pre>Follow(B) = Follow(A)</pre>
            </div>

            <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #FF9800;">
                <h4>Rule-03:</h4>
                <p>For any production rule <strong>A → αBβ</strong>,</p>
                <ul>
                    <li>If ε ∉ First(β), then Follow(B) = First(β)</li>
                    <li>If ε ∈ First(β), then Follow(B) = { First(β) – ε } ∪ Follow(A)</li>
                </ul>
            </div>

            <h3>Important Notes</h3>

            <div style="background: #fff3cd; padding: 15px; margin: 10px 0; border-left: 4px solid #ffc107;">
                <h4>Note-01:</h4>
                <ul>
                    <li>ε may appear in the first function of a non-terminal.</li>
                    <li>ε will never appear in the follow function of a non-terminal.</li>
                </ul>
            </div>

            <div style="background: #fff3cd; padding: 15px; margin: 10px 0; border-left: 4px solid #ffc107;">
                <h4>Note-02:</h4>
                <p>Before calculating the first and follow functions, eliminate Left Recursion from the grammar, if present.</p>
            </div>

            <div style="background: #fff3cd; padding: 15px; margin: 10px 0; border-left: 4px solid #ffc107;">
                <h4>Note-03:</h4>
                <p>We calculate the follow function of a non-terminal by looking where it is present on the RHS of a production rule.</p>
            </div>
            """;
    }

    public FirstFollowResponse computeFirstFollow(String grammarText) {
        Grammar grammar = parseGrammar(grammarText);
        List<String> steps = new ArrayList<>();

        // Compute FIRST sets
        Map<String, Set<String>> firstSets = computeFirst(grammar, steps);

        // Compute FOLLOW sets
        Map<String, Set<String>> followSets = computeFollow(grammar, firstSets, steps);

        FirstFollowResponse response = new FirstFollowResponse();
        response.setFirstSets(firstSets);
        response.setFollowSets(followSets);
        response.setSteps(steps);
        response.setGrammar(grammarText);

        return response;
    }

    private Grammar parseGrammar(String grammarText) {
        Grammar grammar = new Grammar();
        grammar.productions = new LinkedHashMap<>();
        grammar.nonTerminals = new HashSet<>();
        grammar.terminals = new HashSet<>();

        String[] lines = grammarText.trim().split("\\n");
        boolean firstProduction = true;

        // First pass: identify all non-terminals
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            String[] parts = line.split("->|→");
            if (parts.length != 2) continue;

            String nonTerminal = parts[0].trim();
            grammar.nonTerminals.add(nonTerminal);

            if (firstProduction) {
                grammar.startSymbol = nonTerminal;
                firstProduction = false;
            }
        }

        // Second pass: parse productions and identify terminals
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            String[] parts = line.split("->|→");
            if (parts.length != 2) continue;

            String nonTerminal = parts[0].trim();
            String[] productions = parts[1].split("\\|");
            List<List<String>> prodList = new ArrayList<>();

            for (String prod : productions) {
                prod = prod.trim();
                List<String> symbols = tokenizeProduction(prod);
                prodList.add(symbols);

                // Identify terminals (symbols that are not non-terminals and not epsilon)
                for (String symbol : symbols) {
                    if (!symbol.equals(EPSILON) && !grammar.nonTerminals.contains(symbol)) {
                        grammar.terminals.add(symbol);
                    }
                }
            }

            grammar.productions.put(nonTerminal, prodList);
        }

        return grammar;
    }

    private List<String> tokenizeProduction(String production) {
        if (production.equals(EPSILON) || production.equals("ε") || production.equals("epsilon") || production.equals("#")) {
            return Arrays.asList(EPSILON);
        }

        List<String> tokens = new ArrayList<>();
        int i = 0;
        while (i < production.length()) {
            char c = production.charAt(i);

            if (Character.isWhitespace(c)) {
                i++;
                continue;
            }

            // For typical grammars, treat each letter as a separate symbol
            // This handles patterns like: S -> AaAb (which should be [A, a, A, b])
            if (Character.isLetter(c)) {
                tokens.add(String.valueOf(c));
                i++;
            } else if (Character.isDigit(c)) {
                // Collect consecutive digits as one token
                StringBuilder num = new StringBuilder();
                while (i < production.length() && Character.isDigit(production.charAt(i))) {
                    num.append(production.charAt(i));
                    i++;
                }
                tokens.add(num.toString());
            } else {
                // Special characters like +, -, *, (, ), etc.
                tokens.add(String.valueOf(c));
                i++;
            }
        }

        return tokens;
    }

    private boolean isNonTerminal(String symbol, Set<String> nonTerminals) {
        // Check if it's already identified as a non-terminal
        if (nonTerminals.contains(symbol)) {
            return true;
        }
        // Non-terminals are typically single uppercase letters or defined in the grammar
        // Don't treat epsilon as a non-terminal
        if (symbol.equals(EPSILON)) {
            return false;
        }
        // Single uppercase letter is likely a non-terminal
        return symbol.length() == 1 && Character.isUpperCase(symbol.charAt(0));
    }

    private Map<String, Set<String>> computeFirst(Grammar grammar, List<String> steps) {
        Map<String, Set<String>> firstSets = new LinkedHashMap<>();

        // Initialize FIRST sets (preserve order from grammar)
        for (String nt : grammar.productions.keySet()) {
            firstSets.put(nt, new HashSet<>());
        }

        boolean changed = true;

        while (changed) {
            changed = false;

            for (Map.Entry<String, List<List<String>>> entry : grammar.productions.entrySet()) {
                String nonTerminal = entry.getKey();
                Set<String> currentFirst = firstSets.get(nonTerminal);
                int beforeSize = currentFirst.size();

                for (List<String> production : entry.getValue()) {
                    Set<String> prodFirst = computeFirstOfProduction(production, firstSets, grammar);
                    currentFirst.addAll(prodFirst);
                }

                if (currentFirst.size() > beforeSize) {
                    changed = true;
                }
            }
        }

        return firstSets;
    }

    private Set<String> computeFirstOfProduction(List<String> production, Map<String, Set<String>> firstSets, Grammar grammar) {
        Set<String> result = new HashSet<>();

        if (production.isEmpty() || production.get(0).equals(EPSILON)) {
            result.add(EPSILON);
            return result;
        }

        for (String symbol : production) {
            if (grammar.terminals.contains(symbol) || !grammar.nonTerminals.contains(symbol)) {
                // Terminal
                result.add(symbol);
                break;
            } else {
                // Non-terminal
                Set<String> symbolFirst = firstSets.getOrDefault(symbol, new HashSet<>());
                result.addAll(symbolFirst.stream()
                        .filter(s -> !s.equals(EPSILON))
                        .collect(Collectors.toSet()));

                if (!symbolFirst.contains(EPSILON)) {
                    break;
                }
            }
        }

        // Check if all symbols can derive epsilon
        boolean allDeriveEpsilon = production.stream()
                .allMatch(s -> {
                    if (s.equals(EPSILON)) return true;
                    if (grammar.terminals.contains(s)) return false;
                    return firstSets.getOrDefault(s, new HashSet<>()).contains(EPSILON);
                });

        if (allDeriveEpsilon) {
            result.add(EPSILON);
        }

        return result;
    }

    private Map<String, Set<String>> computeFollow(Grammar grammar, Map<String, Set<String>> firstSets, List<String> steps) {
        Map<String, Set<String>> followSets = new LinkedHashMap<>();

        // Initialize FOLLOW sets (preserve order from grammar)
        for (String nt : grammar.productions.keySet()) {
            followSets.put(nt, new HashSet<>());
        }

        // Add $ to start symbol
        if (grammar.startSymbol != null) {
            followSets.get(grammar.startSymbol).add(END_MARKER);
        }

        boolean changed = true;

        while (changed) {
            changed = false;

            for (Map.Entry<String, List<List<String>>> entry : grammar.productions.entrySet()) {
                String lhs = entry.getKey();

                for (List<String> production : entry.getValue()) {
                    for (int i = 0; i < production.size(); i++) {
                        String symbol = production.get(i);

                        if (!grammar.nonTerminals.contains(symbol)) {
                            continue; // Only compute FOLLOW for non-terminals
                        }

                        Set<String> followSymbol = followSets.get(symbol);
                        int beforeSize = followSymbol.size();

                        // Get remaining symbols after current symbol
                        List<String> beta = production.subList(i + 1, production.size());

                        if (beta.isEmpty()) {
                            // Symbol is at the end, add FOLLOW(lhs)
                            followSymbol.addAll(followSets.get(lhs));
                        } else {
                            // Compute FIRST(beta)
                            Set<String> firstBeta = computeFirstOfProduction(beta, firstSets, grammar);

                            // Add FIRST(beta) - {ε}
                            followSymbol.addAll(firstBeta.stream()
                                    .filter(s -> !s.equals(EPSILON))
                                    .collect(Collectors.toSet()));

                            // If ε ∈ FIRST(beta), add FOLLOW(lhs)
                            if (firstBeta.contains(EPSILON)) {
                                followSymbol.addAll(followSets.get(lhs));
                            }
                        }

                        if (followSymbol.size() > beforeSize) {
                            changed = true;
                        }
                    }
                }
            }
        }

        return followSets;
    }

    private String formatSet(Set<String> set) {
        if (set.isEmpty()) {
            return "{}";
        }
        return "{" + String.join(", ", set) + "}";
    }
}
