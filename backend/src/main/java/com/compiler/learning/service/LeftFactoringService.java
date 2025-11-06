// src/main/java/com/compiler/learning/service/LeftFactoringService.java
package com.compiler.learning.service;

import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class LeftFactoringService {

    @Data
    public static class FactoringResult {
        private String transformedGrammar;
        private List<String> steps;
        private boolean hadLeftFactoring;
    }

    public String getTheory() {
        return """
            <h2>Left Factoring (Grammar Simplification)</h2>

            <h3>What is Left Factoring?</h3>
            <p>
                <strong>Left Factoring</strong> is a grammar transformation technique used to eliminate 
                <strong>common prefixes</strong> in productions of the same non-terminal. This is essential for:
            </p>
            <ul>
                <li>✅ Making grammars suitable for predictive parsing (LL(1))</li>
                <li>✅ Removing ambiguity in grammar productions</li>
                <li>✅ Enabling efficient top-down parsing</li>
                <li>✅ Improving parser performance</li>
            </ul>

            <h3>🎯 When is Left Factoring Needed?</h3>
            <p>Left factoring is needed when a non-terminal has two or more productions that begin with the same prefix:</p>
            <pre>A → αβ₁ | αβ₂ | αβ₃ | ... | αβₙ | γ</pre>
            <p>Where:</p>
            <ul>
                <li><strong>α</strong> = Common prefix (left factor)</li>
                <li><strong>β₁, β₂, ..., βₙ</strong> = Different suffixes</li>
                <li><strong>γ</strong> = Production(s) without the common prefix</li>
            </ul>

            <h3>📋 Step-by-Step Algorithm</h3>

            <h4>Step 1: Identify Common Prefixes</h4>
            <p>For each non-terminal, examine all its productions and find the longest common prefix shared by two or more productions.</p>
            <pre>Example:
A → abcd | abef | g | h
     ↑↑ (common prefix: ab)</pre>

            <h4>Step 2: Group Productions by Prefix</h4>
            <p>Group productions that share the same prefix together:</p>
            <pre>Productions with prefix "ab": abcd, abef
Productions without prefix: g, h</pre>

            <h4>Step 3: Create New Non-Terminal</h4>
            <p>Introduce a new non-terminal (usually A') to represent the remaining parts after factoring out the common prefix:</p>
            <pre>A → αA' | γ
A' → β₁ | β₂ | ... | βₙ</pre>

            <h4>Step 4: Rewrite Productions</h4>
            <p>Replace the original productions with the factored versions:</p>
            <pre>Original:  A → abcd | abef | g | h
Factored:  A → abA' | g | h
           A' → cd | ef</pre>

            <h4>Step 5: Handle ε (Epsilon)</h4>
            <p>If one of the productions is exactly the common prefix (with nothing after it), use ε in the new production:</p>
            <pre>Example:
A → ab | abc
Becomes:
A → abA'
A' → ε | c</pre>

            <h3>🔢 Worked Example</h3>

            <h4>Example 1: Simple Left Factoring</h4>
            <pre><strong>Original Grammar:</strong>
S → iEtS | iEtSeS | a
E → b

<strong>🔹 Step 1: Identify Common Prefix</strong>
Productions for S: iEtS, iEtSeS, a
Common prefix: iEtS

<strong>🔹 Step 2: Group Productions</strong>
With prefix "iEtS": iEtS, iEtSeS
Without prefix: a

<strong>🔹 Step 3: Extract Remaining Parts</strong>
After "iEtS":
  • First production: ε (nothing remains)
  • Second production: eS

<strong>🔹 Step 4: Create New Variable</strong>
Introduce S' for the remaining parts

<strong>🔹 Step 5: Rewrite Grammar</strong>
S → iEtSS' | a
S' → ε | eS
E → b</pre>

            <h4>Example 2: Multiple Common Prefixes</h4>
            <pre><strong>Original Grammar:</strong>
A → abcd | abef | abgh | xyz

<strong>🔹 Step 1: Identify Common Prefix</strong>
Common prefix for first 3 productions: ab

<strong>🔹 Step 2: Extract Suffixes</strong>
After "ab": cd, ef, gh

<strong>🔹 Step 3: Factor Out</strong>
A → abA' | xyz
A' → cd | ef | gh</pre>

            <h4>Example 3: Nested Factoring</h4>
            <pre><strong>Original Grammar:</strong>
A → abcd | abce | abcf | adg

<strong>First Pass:</strong>
Common prefix "ab" in first 3:
A → abA' | adg
A' → cd | ce | cf

<strong>Second Pass on A':</strong>
Common prefix "c" in all 3:
A' → cA''
A'' → d | e | f

<strong>Final Grammar:</strong>
A → abcA'' | adg
A'' → d | e | f</pre>

            <h3>⚠️ Common Mistakes</h3>
            <ul>
                <li>❌ <strong>Not finding the longest common prefix</strong> - Always find the maximum common substring</li>
                <li>❌ <strong>Forgetting ε productions</strong> - When a production is exactly the prefix, add ε to the new variable</li>
                <li>❌ <strong>Missing productions without the prefix</strong> - Keep productions that don't share the prefix</li>
                <li>❌ <strong>Not iterating</strong> - After first factoring, check if new productions need more factoring</li>
                <li>❌ <strong>Incorrect new variable naming</strong> - Use A', A'', etc. in sequence</li>
            </ul>

            <h3>🔄 Left Factoring vs Left Recursion</h3>
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px;">Aspect</th>
                <th style="padding: 10px;">Left Factoring</th>
                <th style="padding: 10px;">Left Recursion</th>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Problem</strong></td>
                <td style="padding: 10px;">Common prefixes in productions</td>
                <td style="padding: 10px;">Variable appears leftmost in its own production</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Pattern</strong></td>
                <td style="padding: 10px;">A → αβ | αγ</td>
                <td style="padding: 10px;">A → Aα | β</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Solution</strong></td>
                <td style="padding: 10px;">Factor out common prefix</td>
                <td style="padding: 10px;">Convert to right recursion</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Result</strong></td>
                <td style="padding: 10px;">A → αA'<br/>A' → β | γ</td>
                <td style="padding: 10px;">A → βA'<br/>A' → αA' | ε</td>
              </tr>
            </table>

            <h3>✅ Practice Tips</h3>
            <ul>
                <li>🎯 Always scan from left to right to find common prefixes</li>
                <li>🎯 Compare productions character by character</li>
                <li>🎯 Factor out the <strong>longest</strong> common prefix</li>
                <li>🎯 After factoring, check if further factoring is needed</li>
                <li>🎯 Maintain all non-terminals that don't need factoring</li>
            </ul>

            <hr style="margin: 30px 0;"/>

            <h3>📝 Summary</h3>
            <p><strong>Left Factoring transforms:</strong></p>
            <pre>A → α β₁ | α β₂ | ... | α βₙ | γ

Into:

A → αA' | γ
A' → β₁ | β₂ | ... | βₙ</pre>
            <p>This makes the grammar suitable for <strong>predictive parsing</strong> and eliminates ambiguity!</p>
            """;
    }

    public FactoringResult performLeftFactoring(String grammar) {
        FactoringResult result = new FactoringResult();
        result.steps = new ArrayList<>();
        result.hadLeftFactoring = false;

        // Parse grammar
        Map<String, List<String>> productions = parseGrammar(grammar);
        
        // Step 1: Identify non-terminals needing factoring
        result.steps.add("🔹 Step 1: Identify Common Prefixes");
        
        StringBuilder step1Content = new StringBuilder();
        Set<String> needsFactoring = new HashSet<>();
        
        for (Map.Entry<String, List<String>> entry : productions.entrySet()) {
            String nonTerminal = entry.getKey();
            List<String> prods = entry.getValue();
            
            if (hasCommonPrefix(prods)) {
                needsFactoring.add(nonTerminal);
                String longestPrefix = findLongestCommonPrefix(prods);
                step1Content.append("Non-terminal **").append(nonTerminal)
                           .append("** has common prefix: \"").append(longestPrefix).append("\"\n");
                result.hadLeftFactoring = true;
            }
        }
        
        if (!result.hadLeftFactoring) {
            step1Content.append("No common prefixes found. Grammar doesn't need left factoring!\n");
            result.steps.add(step1Content.toString());
            result.transformedGrammar = grammar;
            return result;
        }
        
        result.steps.add(step1Content.toString());

        // Step 2: Group productions by common prefix
        result.steps.add("🔹 Step 2: Group Productions by Common Prefix");
        StringBuilder step2Content = new StringBuilder();
        
        Map<String, Map<String, List<String>>> groupedProductions = new HashMap<>();
        
        for (String nonTerminal : needsFactoring) {
            List<String> prods = productions.get(nonTerminal);
            Map<String, List<String>> groups = groupByPrefix(prods);
            groupedProductions.put(nonTerminal, groups);
            
            step2Content.append("**").append(nonTerminal).append("**:\n");
            for (Map.Entry<String, List<String>> group : groups.entrySet()) {
                String prefix = group.getKey();
                List<String> groupProds = group.getValue();
                if (!prefix.isEmpty()) {
                    step2Content.append("  Prefix \"").append(prefix).append("\": ")
                              .append(String.join(", ", groupProds)).append("\n");
                } else {
                    step2Content.append("  No prefix: ")
                              .append(String.join(", ", groupProds)).append("\n");
                }
            }
            step2Content.append("\n");
        }
        
        result.steps.add(step2Content.toString());

        // Step 3: Create new non-terminals
        result.steps.add("🔹 Step 3: Create New Variables");
        StringBuilder step3Content = new StringBuilder();
        
        Map<String, String> newVariables = new HashMap<>();
        int primeCount = 1;
        
        for (String nonTerminal : needsFactoring) {
            String newVar = nonTerminal + "'".repeat(primeCount);
            newVariables.put(nonTerminal, newVar);
            step3Content.append("For **").append(nonTerminal)
                       .append("**, create new variable: **").append(newVar).append("**\n");
            if (needsFactoring.size() > 1) primeCount++;
        }
        
        result.steps.add(step3Content.toString());

        // Step 4: Rewrite productions
        result.steps.add("🔹 Step 4: Rewrite Productions");
        StringBuilder step4Content = new StringBuilder();
        
        Map<String, List<String>> factoredGrammar = new LinkedHashMap<>();
        
        for (Map.Entry<String, List<String>> entry : productions.entrySet()) {
            String nonTerminal = entry.getKey();
            
            if (needsFactoring.contains(nonTerminal)) {
                Map<String, List<String>> groups = groupedProductions.get(nonTerminal);
                String newVar = newVariables.get(nonTerminal);
                
                List<String> newProductions = new ArrayList<>();
                List<String> newVarProductions = new ArrayList<>();
                
                for (Map.Entry<String, List<String>> group : groups.entrySet()) {
                    String prefix = group.getKey();
                    List<String> groupProds = group.getValue();
                    
                    if (!prefix.isEmpty() && groupProds.size() > 1) {
                        // Factor out the prefix
                        newProductions.add(prefix + newVar);
                        
                        for (String prod : groupProds) {
                            String suffix = prod.substring(prefix.length());
                            if (suffix.isEmpty()) {
                                suffix = "ε";
                            }
                            newVarProductions.add(suffix);
                        }
                    } else {
                        // No factoring needed for this group
                        newProductions.addAll(groupProds);
                    }
                }
                
                factoredGrammar.put(nonTerminal, newProductions);
                if (!newVarProductions.isEmpty()) {
                    factoredGrammar.put(newVar, newVarProductions);
                }
                
                step4Content.append("**").append(nonTerminal).append("** → ")
                           .append(String.join(" | ", newProductions)).append("\n");
                if (!newVarProductions.isEmpty()) {
                    step4Content.append("**").append(newVar).append("** → ")
                               .append(String.join(" | ", newVarProductions)).append("\n");
                }
            } else {
                factoredGrammar.put(nonTerminal, entry.getValue());
                step4Content.append("**").append(nonTerminal).append("** → ")
                           .append(String.join(" | ", entry.getValue()))
                           .append(" (no change)\n");
            }
        }
        
        result.steps.add(step4Content.toString());

        // Step 5: Final factored grammar
        result.steps.add("🔹 Step 5: Final Factored Grammar");
        StringBuilder finalGrammar = new StringBuilder();
        
        for (Map.Entry<String, List<String>> entry : factoredGrammar.entrySet()) {
            finalGrammar.append(entry.getKey()).append(" -> ")
                       .append(String.join(" | ", entry.getValue()))
                       .append("\n");
        }
        
        result.steps.add(finalGrammar.toString());
        result.transformedGrammar = finalGrammar.toString().trim();
        
        return result;
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
                
                List<String> prodList = Arrays.stream(prods)
                        .map(String::trim)
                        .collect(Collectors.toList());
                
                productions.put(nonTerminal, prodList);
            }
        }
        
        return productions;
    }

    private boolean hasCommonPrefix(List<String> productions) {
        if (productions.size() < 2) return false;
        
        for (int i = 0; i < productions.size(); i++) {
            for (int j = i + 1; j < productions.size(); j++) {
                if (findCommonPrefix(productions.get(i), productions.get(j)).length() > 0) {
                    return true;
                }
            }
        }
        
        return false;
    }

    private String findLongestCommonPrefix(List<String> productions) {
        if (productions.isEmpty()) return "";
        
        String shortest = productions.stream()
                .min(Comparator.comparingInt(String::length))
                .orElse("");
        
        for (int i = shortest.length(); i > 0; i--) {
            String prefix = shortest.substring(0, i);
            long count = productions.stream()
                    .filter(p -> p.startsWith(prefix))
                    .count();
            
            if (count >= 2) {
                return prefix;
            }
        }
        
        return "";
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

    private Map<String, List<String>> groupByPrefix(List<String> productions) {
        Map<String, List<String>> groups = new LinkedHashMap<>();
        Set<String> processed = new HashSet<>();
        
        // Find longest common prefix for groups
        for (int i = 0; i < productions.size(); i++) {
            if (processed.contains(productions.get(i))) continue;
            
            String current = productions.get(i);
            String longestPrefix = "";
            List<String> group = new ArrayList<>();
            group.add(current);
            processed.add(current);
            
            for (int j = i + 1; j < productions.size(); j++) {
                String other = productions.get(j);
                if (processed.contains(other)) continue;
                
                String prefix = findCommonPrefix(current, other);
                if (prefix.length() > 0) {
                    if (group.size() == 1) {
                        longestPrefix = prefix;
                    } else {
                        // Update prefix to be common among all in group
                        longestPrefix = findCommonPrefix(longestPrefix, prefix);
                    }
                    group.add(other);
                    processed.add(other);
                }
            }
            
            if (group.size() > 1 && longestPrefix.length() > 0) {
                groups.put(longestPrefix, group);
            } else {
                groups.put("", group);
            }
        }
        
        return groups;
    }
}
