// src/main/java/com/compiler/learning/service/GrammarConversionService.java
package com.compiler.learning.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GrammarConversionService {

    /**
     * Eliminates Left Recursion from a Context-Free Grammar (CFG)
     * Handles both Direct and Indirect Left Recursion
     */
    public ConversionResult convertLRGtoRRG(String inputGrammar) {
        List<String> steps = new ArrayList<>();
        Map<String, List<String>> productions = parseGrammar(inputGrammar);
        List<String> nonTerminals = new ArrayList<>(productions.keySet());

        // Step 1: Identify recursion type
        steps.add("🔹 Step 1: Identify the Type of Recursion");
        steps.add("Original Grammar: " + formatGrammar(productions));
        
        boolean hasIndirectRecursion = checkForIndirectRecursion(productions, nonTerminals);
        boolean hasDirectRecursion = false;
        
        for (String nt : nonTerminals) {
            if (hasDirectLeftRecursion(nt, productions.get(nt))) {
                hasDirectRecursion = true;
                steps.add("Direct left recursion found in: " + nt);
            }
        }
        
        if (hasIndirectRecursion) {
            steps.add("Indirect left recursion detected");
        }

        // Step 2: Substitute (for indirect recursion)
        List<String> step2Content = new ArrayList<>();
        step2Content.add("🔹 Step 2: Substitute");
        step2Content.add("For indirect recursion, substitute higher-order non-terminals in lower ones.");
        
        // Step 3: Separate α and β
        List<String> step3Content = new ArrayList<>();
        step3Content.add("🔹 Step 3: Separate α (recursive part) and β (non-recursive part)");
        
        // Step 4: Create New Variable
        List<String> step4Content = new ArrayList<>();
        step4Content.add("🔹 Step 4: Create New Variable (A′ or similar)");
        
        boolean hadSubstitution = false;
        
        // Process each non-terminal in order
        for (int i = 0; i < nonTerminals.size(); i++) {
            String Ai = nonTerminals.get(i);
            
            // Eliminate indirect left recursion
            for (int j = 0; j < i; j++) {
                String Aj = nonTerminals.get(j);
                
                List<String> newProductions = new ArrayList<>();
                boolean substituted = false;
                
                for (String production : productions.get(Ai)) {
                    if (production.length() > 0 && production.startsWith(Aj) && 
                        (production.length() == Aj.length() || !Character.isUpperCase(production.charAt(Aj.length())))) {
                        
                        substituted = true;
                        hadSubstitution = true;
                        String alpha = production.substring(Aj.length());
                        
                        step2Content.add("Substitute " + Aj + " in " + Ai + " → " + production + ":");
                        
                        // Replace Ai -> Aj α with Ai -> δ1 α | δ2 α | ...
                        for (String ajProduction : productions.get(Aj)) {
                            String newProd = ajProduction + alpha;
                            newProductions.add(newProd);
                        }
                        
                        step2Content.add(Ai + " → " + String.join(" | ", newProductions));
                    } else {
                        newProductions.add(production);
                    }
                }
                
                if (substituted) {
                    productions.put(Ai, newProductions);
                }
            }
            
            // Eliminate direct left recursion for Ai
            if (hasDirectLeftRecursion(Ai, productions.get(Ai))) {
                eliminateDirectLeftRecursion(Ai, productions, step3Content, step4Content);
            }
        }

        // Add Step 2 content (Substitution)
        if (hadSubstitution) {
            steps.addAll(step2Content);
        } else {
            steps.add("🔹 Step 2: Substitute");
            steps.add("For indirect recursion, substitute higher-order non-terminals in lower ones.");
            steps.add("Not applicable (direct recursion only)");
        }
        
        // Add Step 3 content (Separate α and β)
        steps.addAll(step3Content);
        
        // Add Step 4 content (Create new variable)
        steps.addAll(step4Content);

        // Step 5: Final Grammar
        steps.add("🔹 Step 5: Rewrite Final Grammar");
        String result = formatGrammar(productions);
        steps.add(result);

        return new ConversionResult(result, steps);
    }
    
    private boolean checkForIndirectRecursion(Map<String, List<String>> productions, List<String> nonTerminals) {
        // Simple check: if we have multiple non-terminals, there might be indirect recursion
        if (nonTerminals.size() <= 1) return false;
        
        for (int i = 0; i < nonTerminals.size(); i++) {
            String Ai = nonTerminals.get(i);
            for (int j = 0; j < i; j++) {
                String Aj = nonTerminals.get(j);
                for (String production : productions.get(Ai)) {
                    if (production.startsWith(Aj)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private Map<String, List<String>> parseGrammar(String grammar) {
        Map<String, List<String>> productions = new LinkedHashMap<>();
        String[] lines = grammar.trim().split("\n");

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            String[] parts = line.split("->");
            if (parts.length != 2) continue;

            String nonTerminal = parts[0].trim();
            String[] productionList = parts[1].split("\\|");

            List<String> prods = new ArrayList<>();
            for (String prod : productionList) {
                String p = prod.trim();
                // Normalize epsilon representations
                if (p.equals("ε") || p.equals("epsilon") || p.equals("#")) {
                    prods.add("ε");
                } else {
                    prods.add(p);
                }
            }

            productions.put(nonTerminal, prods);
        }

        return productions;
    }

    private boolean hasDirectLeftRecursion(String nonTerminal, List<String> productionList) {
        for (String production : productionList) {
            if (production.length() > 0 && production.startsWith(nonTerminal)) {
                return true;
            }
        }
        return false;
    }

    private void eliminateDirectLeftRecursion(String A, Map<String, List<String>> productions, 
                                              List<String> step3Content, List<String> step4Content) {
        List<String> alphaProductions = new ArrayList<>(); // A -> Aα (left recursive)
        List<String> betaProductions = new ArrayList<>();  // A -> β (non-left recursive)

        for (String production : productions.get(A)) {
            if (production.startsWith(A)) {
                // Left recursive production A -> Aα
                String alpha = production.substring(A.length());
                if (!alpha.isEmpty()) {
                    alphaProductions.add(alpha);
                }
            } else {
                // Non-left recursive production A -> β
                betaProductions.add(production);
            }
        }

        if (alphaProductions.isEmpty()) {
            return; // No direct left recursion
        }

        // Add Step 3 details: Separate α and β
        step3Content.add("For " + A + ":");
        step3Content.add("α (recursive parts): " + String.join(", ", alphaProductions));
        step3Content.add("β (non-recursive parts): " + (betaProductions.isEmpty() ? "ε" : String.join(", ", betaProductions)));

        // Create new non-terminal A'
        String APrime = A + "'";
        int counter = 1;
        while (productions.containsKey(APrime)) {
            APrime = A + "'" + counter++;
        }

        // Add Step 4 details: Create new variable
        step4Content.add("Introduce " + APrime + " to handle the recursive continuation");

        // New productions for A: A -> β1A' | β2A' | ...
        List<String> newAProductions = new ArrayList<>();
        for (String beta : betaProductions) {
            // If beta is epsilon, just add A' (not εA')
            if (beta.equals("ε")) {
                newAProductions.add(APrime);
            } else {
                newAProductions.add(beta + APrime);
            }
        }
        
        // If there are no beta productions, add epsilon
        if (betaProductions.isEmpty()) {
            newAProductions.add(APrime);
        }

        // New productions for A': A' -> α1A' | α2A' | ... | ε
        List<String> newAPrimeProductions = new ArrayList<>();
        for (String alpha : alphaProductions) {
            newAPrimeProductions.add(alpha + APrime);
        }
        newAPrimeProductions.add("ε");

        productions.put(A, newAProductions);
        productions.put(APrime, newAPrimeProductions);
    }

    private String formatGrammar(Map<String, List<String>> productions) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, List<String>> entry : productions.entrySet()) {
            sb.append(entry.getKey()).append(" -> ");
            sb.append(String.join(" | ", entry.getValue()));
            sb.append("\n");
        }
        return sb.toString().trim();
    }

    public static class ConversionResult {
        public final String transformedGrammar;
        public final List<String> steps;

        public ConversionResult(String transformedGrammar, List<String> steps) {
            this.transformedGrammar = transformedGrammar;
            this.steps = steps;
        }
    }
}