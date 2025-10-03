// src/main/java/com/compiler/learning/service/GrammarConversionService.java
package com.compiler.learning.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GrammarConversionService {

    /**
     * Converts Left Regular Grammar (LRG) to Reduced Regular Grammar (RRG)
     * LRG: Productions of form A -> Ba or A -> a
     * RRG: Productions of form A -> aB or A -> a
     */
    public ConversionResult convertLRGtoRRG(String inputGrammar) {
        List<String> steps = new ArrayList<>();
        Map<String, List<String>> productions = parseGrammar(inputGrammar);

        steps.add("Step 1: Parse the input Left Regular Grammar (LRG)");
        steps.add("Identified productions: " + formatProductions(productions));

        // Step 2: Create reverse productions
        steps.add("Step 2: Reverse the production rules");
        Map<String, List<String>> reversedProductions = reverseProductions(productions);
        steps.add("After reversal: " + formatProductions(reversedProductions));

        // Step 3: Create new start symbol if needed
        String originalStart = findStartSymbol(productions);
        String newStart = originalStart;

        if (hasProductionsToStart(reversedProductions, originalStart)) {
            newStart = "S'";
            reversedProductions.put(newStart, Arrays.asList(originalStart));
            steps.add("Step 3: Original start symbol '" + originalStart +
                    "' appears on RHS, creating new start symbol '" + newStart + "'");
        } else {
            steps.add("Step 3: No need for new start symbol");
        }

        // Step 4: Format as Reduced Regular Grammar
        steps.add("Step 4: Format as Reduced Regular Grammar (RRG)");
        String rrg = formatAsRRG(reversedProductions, newStart);

        return new ConversionResult(rrg, steps);
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
                prods.add(prod.trim());
            }

            productions.put(nonTerminal, prods);
        }

        return productions;
    }

    private Map<String, List<String>> reverseProductions(Map<String, List<String>> productions) {
        Map<String, List<String>> reversed = new LinkedHashMap<>();

        for (Map.Entry<String, List<String>> entry : productions.entrySet()) {
            String lhs = entry.getKey();

            for (String production : entry.getValue()) {
                String reversedProd = new StringBuilder(production).reverse().toString();

                // Extract non-terminal if exists (should be first char after reversal)
                if (reversedProd.length() > 1 && Character.isUpperCase(reversedProd.charAt(0))) {
                    String newLhs = String.valueOf(reversedProd.charAt(0));
                    String terminal = reversedProd.substring(1);

                    reversed.computeIfAbsent(newLhs, k -> new ArrayList<>())
                            .add(terminal + lhs);
                } else {
                    // Terminal only production
                    reversed.computeIfAbsent(lhs, k -> new ArrayList<>())
                            .add(reversedProd);
                }
            }
        }

        return reversed;
    }

    private String findStartSymbol(Map<String, List<String>> productions) {
        return productions.keySet().iterator().next();
    }

    private boolean hasProductionsToStart(Map<String, List<String>> productions, String startSymbol) {
        for (Map.Entry<String, List<String>> entry : productions.entrySet()) {
            if (entry.getKey().equals(startSymbol)) continue;

            for (String prod : entry.getValue()) {
                if (prod.contains(startSymbol)) {
                    return true;
                }
            }
        }
        return false;
    }

    private String formatAsRRG(Map<String, List<String>> productions, String startSymbol) {
        StringBuilder sb = new StringBuilder();

        // Put start symbol first
        if (productions.containsKey(startSymbol)) {
            sb.append(startSymbol).append(" -> ");
            sb.append(String.join(" | ", productions.get(startSymbol)));
            sb.append("\n");
        }

        // Add other productions
        for (Map.Entry<String, List<String>> entry : productions.entrySet()) {
            if (entry.getKey().equals(startSymbol)) continue;

            sb.append(entry.getKey()).append(" -> ");
            sb.append(String.join(" | ", entry.getValue()));
            sb.append("\n");
        }

        return sb.toString().trim();
    }

    private String formatProductions(Map<String, List<String>> productions) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, List<String>> entry : productions.entrySet()) {
            sb.append(entry.getKey()).append(" -> ");
            sb.append(String.join(" | ", entry.getValue()));
            sb.append("; ");
        }
        return sb.toString();
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