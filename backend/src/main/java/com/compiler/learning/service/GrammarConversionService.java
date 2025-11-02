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

        steps.add("Step 1: Parse the input grammar");
        steps.add("Original Grammar: " + formatGrammar(productions));

        // Get ordered list of non-terminals
        List<String> nonTerminals = new ArrayList<>(productions.keySet());
        
        steps.add("Step 2: Eliminate indirect left recursion by substitution");
        
        // Eliminate indirect left recursion
        for (int i = 0; i < nonTerminals.size(); i++) {
            String Ai = nonTerminals.get(i);
            
            for (int j = 0; j < i; j++) {
                String Aj = nonTerminals.get(j);
                
                List<String> newProductions = new ArrayList<>();
                boolean substituted = false;
                
                for (String production : productions.get(Ai)) {
                    if (production.length() > 0 && production.charAt(0) == Aj.charAt(0) && 
                        (production.length() == 1 || !Character.isLetter(production.charAt(1)) || 
                         Character.isLowerCase(production.charAt(1)))) {
                        
                        // This production starts with Aj
                        substituted = true;
                        String alpha = production.substring(Aj.length());
                        
                        // Replace Ai -> Aj α with Ai -> δ1 α | δ2 α | ... for all Aj -> δ
                        for (String ajProduction : productions.get(Aj)) {
                            newProductions.add(ajProduction + alpha);
                        }
                        
                        steps.add("   Substituting " + Aj + " in " + Ai + " -> " + production);
                    } else {
                        newProductions.add(production);
                    }
                }
                
                if (substituted) {
                    productions.put(Ai, newProductions);
                    steps.add("   After substitution: " + Ai + " -> " + String.join(" | ", newProductions));
                }
            }
            
            // Eliminate direct left recursion for Ai
            if (hasDirectLeftRecursion(Ai, productions.get(Ai))) {
                steps.add("Step 3: Eliminate direct left recursion for " + Ai);
                eliminateDirectLeftRecursion(Ai, productions, steps);
            }
        }

        steps.add("Step 4: Final grammar without left recursion");
        String result = formatGrammar(productions);

        return new ConversionResult(result, steps);
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

    private void eliminateDirectLeftRecursion(String A, Map<String, List<String>> productions, List<String> steps) {
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

        // Create new non-terminal A'
        String APrime = A + "'";
        int counter = 1;
        while (productions.containsKey(APrime)) {
            APrime = A + "'" + counter++;
        }

        steps.add("   Creating new non-terminal: " + APrime);

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

        steps.add("   " + A + " -> " + String.join(" | ", newAProductions));
        steps.add("   " + APrime + " -> " + String.join(" | ", newAPrimeProductions));
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