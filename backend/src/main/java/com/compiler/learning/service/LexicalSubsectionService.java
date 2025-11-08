// src/main/java/com/compiler/learning/service/LexicalSubsectionService.java
package com.compiler.learning.service;

import com.compiler.learning.dto.Subsection;
import com.compiler.learning.dto.SubsectionContent;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class LexicalSubsectionService {
    
    private final Map<String, Subsection> subsections = new HashMap<>();
    
    public LexicalSubsectionService() {
        initializeSubsections();
    }
    
    private void initializeSubsections() {
        subsections.put("1.1", createSubsection11());
        subsections.put("1.2", createSubsection12());
        subsections.put("1.3", createSubsection13());
        subsections.put("1.4", createSubsection14());
        subsections.put("1.5", createSubsection15());
    }
    
    public Subsection getSubsection(String id) {
        return subsections.getOrDefault(id, createPlaceholder(id));
    }
    
    private Subsection createPlaceholder(String id) {
        return new Subsection(id, "Coming Soon", 
            new SubsectionContent("Content under development", "", ""));
    }
    
    private Subsection createSubsection11() {
        String concept = getSubsection11Concept();
        String example = getSubsection11Example();
        String doubtClearer = getSubsection11DoubtClearer();
        
        return new Subsection("1.1", "Regular Expression to ε-NFA (Thompson's Construction)",
            new SubsectionContent(concept, example, doubtClearer));
    }
    
    private String getSubsection11Concept() {
        return """
            <h3>🎯 Concept: Thompson's Construction</h3>
            <p>Thompson's construction converts a regular expression into an ε-NFA by building small automata 
            for basic components and combining them using structural rules.</p>
            
            <h4>Step-by-Step Process:</h4>
            <ol style="line-height: 2;">
                <li><strong>Step 1: Identify components</strong> - Break the regular expression into basic components 
                (symbols, union |, concatenation, Kleene star *)</li>
                <li><strong>Step 2: Build basic automata</strong> - Create ε-NFA for each symbol</li>
                <li><strong>Step 3: Apply Thompson's rules</strong> based on operators:
                    <ul>
                        <li><strong>Union (r₁|r₂):</strong> Create new start → ε to both r₁ and r₂, both finals → ε to new final</li>
                        <li><strong>Concatenation (r₁r₂):</strong> Connect final of r₁ → ε to start of r₂</li>
                        <li><strong>Kleene Star (r*):</strong> Add ε-loop from final back to start, add ε-bypass</li>
                    </ul>
                </li>
                <li><strong>Step 4: Construct transition table</strong> - Document all states and transitions</li>
            </ol>
            
            <h4>📋 Thompson's Rules Reference Table:</h4>
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #e3f2fd;">
                <th style="padding: 10px; text-align: left;">Component</th>
                <th style="padding: 10px; text-align: left;">Construction Rule</th>
                <th style="padding: 10px; text-align: left;">Visual Pattern</th>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Symbol (a)</strong></td>
                <td style="padding: 10px;">Create start → a-transition → final</td>
                <td style="padding: 10px;">q₀ →a→ qf</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Empty (ε)</strong></td>
                <td style="padding: 10px;">Create start → ε-transition → final</td>
                <td style="padding: 10px;">q₀ →ε→ qf</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Union (r₁|r₂)</strong></td>
                <td style="padding: 10px;">New start with ε to both, both endings to new final</td>
                <td style="padding: 10px;">ε-split → parallel paths → ε-join</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Concatenation (r₁r₂)</strong></td>
                <td style="padding: 10px;">Connect final of r₁ to start of r₂ with ε</td>
                <td style="padding: 10px;">r₁ →ε→ r₂ (sequential)</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Kleene Star (r*)</strong></td>
                <td style="padding: 10px;">ε from new start to r and new final, ε from r final back to r start</td>
                <td style="padding: 10px;">Loop with ε-bypass</td>
              </tr>
            </table>
            """;
    }
    
    private String getSubsection11Example() {
        return """
            <h3>📝 Problem Example: Convert (a|b)*c to ε-NFA</h3>
            
            <div style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0;">
                <h4>Solution with Detailed Steps:</h4>
            </div>
            
            <p><strong>Step 1: Build ε-NFA for symbol 'a'</strong></p>
            <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">State 0 →a→ State 1</pre>
            <p style="color: #666; font-style: italic; margin-left: 20px;">
            ✓ Creates a simple two-state automaton that accepts only 'a'
            </p>
            
            <p><strong>Step 2: Build ε-NFA for symbol 'b'</strong></p>
            <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">State 2 →b→ State 3</pre>
            <p style="color: #666; font-style: italic; margin-left: 20px;">
            ✓ Creates another two-state automaton that accepts only 'b'
            </p>
            
            <p><strong>Step 3: Apply Union rule for (a|b)</strong></p>
            <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">State 4 →ε→ State 0 (enters 'a' path)
State 4 →ε→ State 2 (enters 'b' path)
State 1 →ε→ State 5 (exits from 'a')
State 3 →ε→ State 5 (exits from 'b')</pre>
            <p style="color: #666; font-style: italic; margin-left: 20px;">
            ✓ New start state (4) splits into two parallel paths<br/>
            ✓ New final state (5) where both paths merge
            </p>
            
            <p><strong>Step 4: Apply Kleene Star for (a|b)*</strong></p>
            <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">State 6 →ε→ State 4 (enter the loop)
State 6 →ε→ State 7 (bypass loop - zero repetitions)
State 5 →ε→ State 4 (loop back for more repetitions)
State 5 →ε→ State 7 (exit the loop)</pre>
            <p style="color: #666; font-style: italic; margin-left: 20px;">
            ✓ Allows zero or more repetitions via loop-back<br/>
            ✓ Bypass allows accepting zero occurrences
            </p>
            
            <p><strong>Step 5: Build 'c' and apply Concatenation</strong></p>
            <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">State 8 →c→ State 9 (the 'c' automaton)
State 7 →ε→ State 8 (connect (a|b)* to c)</pre>
            <p style="color: #666; font-style: italic; margin-left: 20px;">
            ✓ Concatenates the Kleene star result with symbol 'c'
            </p>
            
            <h4>Final ε-NFA Transition Table:</h4>
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px;">State</th>
                <th style="padding: 8px;">a</th>
                <th style="padding: 8px;">b</th>
                <th style="padding: 8px;">c</th>
                <th style="padding: 8px;">ε</th>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>→6 (start)</strong></td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">{4, 7}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">4</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">{0, 2}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">0</td>
                <td style="padding: 8px;">{1}</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
              </tr>
              <tr>
                <td style="padding: 8px;">2</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">{3}</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
              </tr>
              <tr>
                <td style="padding: 8px;">1</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">{5}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">3</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">{5}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">5</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">{4, 7}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">7</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">{8}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">8</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">{9}</td>
                <td style="padding: 8px;">-</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>*9 (final)</strong></td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
              </tr>
            </table>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0;">
                <p><strong>✅ Result:</strong> The ε-NFA accepts any string with zero or more occurrences of 'a' or 'b', followed by exactly one 'c'</p>
                <p><strong>Example accepted strings:</strong> c, ac, bc, abc, aac, bbc, ababc, aaabbbaaac, etc.</p>
                <p><strong>Example rejected strings:</strong> a, b, ab, cc, ca, etc.</p>
            </div>
            """;
    }
    
    private String getSubsection11DoubtClearer() {
        return """
            <h3>💡 Universal Doubt Clearer</h3>
            
            <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0;">
                <h4>Common Doubts & Clear Answers:</h4>
                
                <p><strong>Q1: Why do we use ε-transitions at all?</strong></p>
                <p><strong>A:</strong> ε-transitions allow state changes without consuming input. They're essential for:
                <ul>
                    <li>Union operations (splitting into multiple paths)</li>
                    <li>Kleene star (looping back without reading input)</li>
                    <li>Concatenation (connecting automata seamlessly)</li>
                </ul>
                Without ε-transitions, Thompson's construction would be impossible!
                </p>
                
                <p><strong>Q2: How do I number states systematically?</strong></p>
                <p><strong>A:</strong> Follow this strategy:
                <ul>
                    <li>Start numbering from <strong>innermost expressions</strong> outward</li>
                    <li>For each basic symbol, use <strong>consecutive numbers</strong> (0-1 for 'a', 2-3 for 'b')</li>
                    <li>When combining with operators, use <strong>next available numbers</strong></li>
                    <li>Write down state assignments as you build to avoid confusion</li>
                </ul>
                </p>
                
                <p><strong>Q3: What if I have nested operators like ((a|b)*c)*?</strong></p>
                <p><strong>A:</strong> Apply Thompson's rules <strong>recursively from inside out:</strong>
                <ol>
                    <li>Build (a|b) using union rule</li>
                    <li>Apply star to get (a|b)*</li>
                    <li>Concatenate with c to get (a|b)*c</li>
                    <li>Apply star again to the entire result</li>
                </ol>
                Each step creates a complete ε-NFA that becomes input for the next step.
                </p>
                
                <p><strong>Q4: Can two different states have the same ε-transitions?</strong></p>
                <p><strong>A:</strong> Yes! This is very common. For example, in Kleene star:
                <ul>
                    <li>The new start state has ε-transitions to {inner_start, bypass_final}</li>
                    <li>The inner final also has ε-transitions to {inner_start, bypass_final}</li>
                </ul>
                This creates the looping behavior we need.
                </p>
                
                <p><strong>Q5: How do I handle multi-character sequences like "ab|cd"?</strong></p>
                <p><strong>A:</strong> Treat concatenation as implicit:
                <ol>
                    <li>Build automata for 'a', 'b', 'c', 'd' individually</li>
                    <li><strong>Concatenate 'a' with 'b'</strong> to get 'ab'</li>
                    <li><strong>Concatenate 'c' with 'd'</strong> to get 'cd'</li>
                    <li><strong>Apply union</strong> to combine 'ab' and 'cd'</li>
                </ol>
                </p>
                
                <p><strong>Q6: Why does my ε-NFA have so many states?</strong></p>
                <p><strong>A:</strong> Thompson's construction prioritizes <strong>correctness and simplicity</strong> over efficiency. 
                It creates many states and ε-transitions, but that's okay! Later conversions (ε-NFA → NFA → DFA → Min DFA) 
                will optimize and reduce the state count significantly.</p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0;">
                <h4>🎓 Pro Tips for Success:</h4>
                <ul>
                    <li><strong>Always start with innermost parentheses</strong> when dealing with complex expressions</li>
                    <li><strong>Draw state diagrams</strong> while building - visual representation prevents mistakes</li>
                    <li><strong>Mark start (→) and final (*) states clearly</strong> in your diagrams and tables</li>
                    <li><strong>Double-check ε-transition destinations</strong> - they're the #1 source of errors</li>
                    <li><strong>Remember the mnemonic:</strong> Union Splits, Concatenation Connects, Star Loops</li>
                    <li><strong>Verify your final automaton</strong> by tracing a few example strings through it</li>
                </ul>
            </div>
            
            <div style="background-color: #fce4ec; padding: 15px; border-left: 4px solid #e91e63; margin: 15px 0;">
                <h4>⚠️ Common Mistakes to Avoid:</h4>
                <ul>
                    <li>❌ Forgetting the ε-bypass in Kleene star (must allow zero repetitions!)</li>
                    <li>❌ Creating multiple final states instead of merging them properly</li>
                    <li>❌ Applying operators in wrong order for nested expressions</li>
                    <li>❌ Using same state numbers for different automata components</li>
                    <li>❌ Missing ε-transitions when concatenating automata</li>
                </ul>
            </div>
            """;
    }
    
    private Subsection createSubsection12() {
        String concept = getSubsection12Concept();
        String example = getSubsection12Example();
        String doubtClearer = getSubsection12DoubtClearer();
        
        return new Subsection("1.2", "ε-NFA to NFA (Epsilon Closure Elimination)",
            new SubsectionContent(concept, example, doubtClearer));
    }
    
    private String getSubsection12Concept() {
        return """
            <h3>🎯 Concept: Epsilon Closure Elimination</h3>
            <p>Convert ε-NFA to NFA by eliminating all ε-transitions using ε-closure computation.</p>
            
            <h4>Step-by-Step Process:</h4>
            <ol style="line-height: 2;">
                <li><strong>Step 1: Compute ε-closure for each state</strong>
                    <ul>
                        <li>ε-closure(q) = set of all states reachable from q using only ε-transitions (including q itself)</li>
                        <li>Use BFS or DFS to find all ε-reachable states</li>
                    </ul>
                </li>
                <li><strong>Step 2: Construct new transition function</strong>
                    <p>For each state q and input symbol a:</p>
                    <ul>
                        <li>Find all states in ε-closure(q)</li>
                        <li>Determine which states can be reached on input 'a' from these states</li>
                        <li>Compute ε-closure of the resulting states</li>
                        <li>This becomes δ'(q, a) in the new NFA</li>
                    </ul>
                </li>
                <li><strong>Step 3: Determine final states</strong>
                    <ul>
                        <li>A state q is final if ε-closure(q) contains any final state from the ε-NFA</li>
                    </ul>
                </li>
                <li><strong>Step 4: Build the transition table</strong>
                    <ul>
                        <li>Create NFA transition table with no ε column</li>
                        <li>All transitions are now on actual input symbols</li>
                    </ul>
                </li>
            </ol>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Mathematical Formula:</strong></p>
                <p style="font-family: monospace; font-size: 1.1em;">δ'(q, a) = ε-closure(δ(ε-closure(q), a))</p>
                <p style="margin-top: 10px; color: #666;">
                    <em>Translation:</em> From state q, first find all ε-reachable states, then follow 'a' transitions, 
                    then find all ε-reachable states from those destinations.
                </p>
            </div>
            """;
    }
    
    private String getSubsection12Example() {
        return """
            <h3>📝 Problem: Convert ε-NFA from 1.1 to NFA</h3>
            
            <div style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0;">
                <h4>Solution Steps:</h4>
            </div>
            
            <p><strong>Step 1: Compute ε-closures for each state</strong></p>
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px;">State</th>
                <th style="padding: 8px;">ε-closure</th>
                <th style="padding: 8px;">Calculation</th>
              </tr>
              <tr>
                <td style="padding: 8px;">6</td>
                <td style="padding: 8px;">{6, 4, 7, 0, 2, 8}</td>
                <td style="padding: 8px;">6 →ε {4,7} →ε {0,2,8}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">4</td>
                <td style="padding: 8px;">{4, 0, 2}</td>
                <td style="padding: 8px;">4 →ε {0,2}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">0</td>
                <td style="padding: 8px;">{0}</td>
                <td style="padding: 8px;">No ε-transitions</td>
              </tr>
              <tr>
                <td style="padding: 8px;">2</td>
                <td style="padding: 8px;">{2}</td>
                <td style="padding: 8px;">No ε-transitions</td>
              </tr>
              <tr>
                <td style="padding: 8px;">1</td>
                <td style="padding: 8px;">{1, 5, 4, 7, 0, 2, 8}</td>
                <td style="padding: 8px;">1 →ε 5 →ε {4,7} →ε {0,2,8}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">3</td>
                <td style="padding: 8px;">{3, 5, 4, 7, 0, 2, 8}</td>
                <td style="padding: 8px;">3 →ε 5 →ε {4,7} →ε {0,2,8}</td>
              </tr>
            </table>
            
            <p><strong>Step 2: Compute new transitions for state 6 (start state)</strong></p>
            
            <div style="background-color: #fff9e6; padding: 10px; margin: 10px 0; border-left: 3px solid #ffc107;">
                <p><strong>For input 'a' from state 6:</strong></p>
                <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">1. ε-closure(6) = {6, 4, 7, 0, 2, 8}
2. Which states can read 'a'? Only state 0
3. δ(0, a) = {1}
4. ε-closure(1) = {1, 5, 4, 7, 0, 2, 8}
∴ δ'(6, a) = {1, 5, 4, 7, 0, 2, 8}</pre>
            </div>
            
            <div style="background-color: #fff9e6; padding: 10px; margin: 10px 0; border-left: 3px solid #ffc107;">
                <p><strong>For input 'b' from state 6:</strong></p>
                <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">1. ε-closure(6) = {6, 4, 7, 0, 2, 8}
2. Which states can read 'b'? Only state 2
3. δ(2, b) = {3}
4. ε-closure(3) = {3, 5, 4, 7, 0, 2, 8}
∴ δ'(6, b) = {3, 5, 4, 7, 0, 2, 8}</pre>
            </div>
            
            <div style="background-color: #fff9e6; padding: 10px; margin: 10px 0; border-left: 3px solid #ffc107;">
                <p><strong>For input 'c' from state 6:</strong></p>
                <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">1. ε-closure(6) = {6, 4, 7, 0, 2, 8}
2. Which states can read 'c'? Only state 8
3. δ(8, c) = {9}
4. ε-closure(9) = {9}
∴ δ'(6, c) = {9}</pre>
            </div>
            
            <p><strong>Step 3: Simplified NFA (using notation A, B, C, D)</strong></p>
            <ul>
              <li>A = {6,4,7,0,2,8} (start)</li>
              <li>B = {1,5,4,7,0,2,8}</li>
              <li>C = {3,5,4,7,0,2,8}</li>
              <li>D = {9} (final - contains original final state 9)</li>
            </ul>
            
            <h4>Final NFA Transition Table:</h4>
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px;">State</th>
                <th style="padding: 8px;">a</th>
                <th style="padding: 8px;">b</th>
                <th style="padding: 8px;">c</th>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>→A</strong></td>
                <td>B</td><td>C</td><td>D</td>
              </tr>
              <tr>
                <td style="padding: 8px;">B</td>
                <td>B</td><td>C</td><td>D</td>
              </tr>
              <tr>
                <td style="padding: 8px;">C</td>
                <td>B</td><td>C</td><td>D</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>*D</strong></td>
                <td>-</td><td>-</td><td>-</td>
              </tr>
            </table>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0;">
                <p><strong>✅ Result:</strong> NFA with no ε-transitions! Ready for DFA conversion.</p>
            </div>
            """;
    }
    
    private String getSubsection12DoubtClearer() {
        return """
            <h3>💡 Universal Doubt Clearer</h3>
            
            <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0;">
                <h4>Common Doubts & Clear Answers:</h4>
                
                <p><strong>Q1: How to compute ε-closure efficiently?</strong></p>
                <p><strong>A:</strong> Use BFS or DFS algorithm:
                <ol>
                    <li>Start with state q, add it to closure set</li>
                    <li>Follow all ε-transitions from q, add destinations to closure</li>
                    <li>Recursively follow ε-transitions from new states</li>
                    <li>Stop when no new states are found</li>
                </ol>
                </p>
                
                <p><strong>Q2: Why do some states have large ε-closures?</strong></p>
                <p><strong>A:</strong> Due to ε-loops (from Kleene star) and ε-splits (from union operations). 
                These create many reachable states without consuming input. This is normal and expected!</p>
                
                <p><strong>Q3: Must I always include the state itself in its ε-closure?</strong></p>
                <p><strong>A:</strong> Yes! ε-closure(q) always includes q, because you can "stay" at state q without reading anything. 
                This is a fundamental property.</p>
                
                <p><strong>Q4: Can two different states have the same ε-closure?</strong></p>
                <p><strong>A:</strong> No. Each state has a unique ε-closure based on which states it can reach via ε-transitions. 
                If two states had identical ε-closures, they would be equivalent.</p>
                
                <p><strong>Q5: Do I need to recompute ε-closure for every transition?</strong></p>
                <p><strong>A:</strong> No! Compute ε-closure once for each state and store it in a table. 
                Then reuse these values when calculating new transitions. Much more efficient!</p>
                
                <p><strong>Q6: How do I know which states become final in the NFA?</strong></p>
                <p><strong>A:</strong> A state in the new NFA is final if its ε-closure contains any final state 
                from the original ε-NFA. Check the ε-closure table!</p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0;">
                <h4>🎓 Pro Tips:</h4>
                <ul>
                    <li><strong>Make an ε-closure table first</strong> - compute all closures before building transitions</li>
                    <li><strong>Follow the formula systematically</strong> - don't skip steps in δ'(q, a) calculation</li>
                    <li><strong>Use clear notation</strong> - write state sets clearly with braces {}</li>
                    <li><strong>Verify each transition</strong> - trace through the formula for each entry</li>
                    <li><strong>Check for final states</strong> - mark any state whose ε-closure includes original finals</li>
                </ul>
            </div>
            
            <div style="background-color: #fce4ec; padding: 15px; border-left: 4px solid #e91e63; margin: 15px 0;">
                <h4>⚠️ Common Mistakes to Avoid:</h4>
                <ul>
                    <li>❌ Forgetting to include the state itself in its ε-closure</li>
                    <li>❌ Missing transitive ε-transitions (following ε paths only one step)</li>
                    <li>❌ Not computing ε-closure of destination states in Step 2</li>
                    <li>❌ Forgetting to mark final states properly</li>
                    <li>❌ Confusing ε-NFA states with NFA state sets</li>
                </ul>
            </div>
            """;
    }
    
    private Subsection createSubsection13() {
        return new Subsection("1.3", "NFA to DFA (Subset Construction)",
            new SubsectionContent(getSubsection13Concept(), getSubsection13Example(), getSubsection13DoubtClearer()));
    }
    
    private Subsection createSubsection14() {
        return new Subsection("1.4", "DFA Minimization (Partition Refinement)",
            new SubsectionContent(getSubsection14Concept(), "", ""));
    }
    
    private Subsection createSubsection15() {
        return new Subsection("1.5", "Miscellaneous Conversions",
            new SubsectionContent(getSubsection15Concept(), "", ""));
    }
    
    private String getSubsection13Concept() {
        return """
            <h3>🎯 Concept: Subset Construction</h3>
            <p>Convert NFA to DFA by creating DFA states as subsets of NFA states.</p>
            <h4>Step-by-Step Process:</h4>
            <ol style="line-height: 2;">
                <li><strong>Step 1:</strong> Start state = {NFA start state}</li>
                <li><strong>Step 2:</strong> For each unmarked DFA state S and input a:
                    <ul><li>Compute T = union of δ(q,a) for all q in S</li>
                    <li>Add T as new state if not exists</li></ul></li>
                <li><strong>Step 3:</strong> Repeat until all states marked</li>
                <li><strong>Step 4:</strong> Final states contain NFA final states</li>
            </ol>
            """;
    }
    
    private String getSubsection13Example() {
        return """
            <h3>📝 Problem: Convert NFA to DFA</h3>
            <p><strong>Given NFA from 1.2:</strong> A→B,C,D | B→B,C,D | C→B,C,D | D (final)</p>
            <p><strong>Result:</strong> Same 4-state DFA (already deterministic!)</p>
            <table border="1" style="width:100%;margin:15px 0;">
              <tr style="background:#f5f5f5;"><th>State</th><th>a</th><th>b</th><th>c</th></tr>
              <tr><td>→A</td><td>B</td><td>C</td><td>D</td></tr>
              <tr><td>B</td><td>B</td><td>C</td><td>D</td></tr>
              <tr><td>C</td><td>B</td><td>C</td><td>D</td></tr>
              <tr><td>*D</td><td>-</td><td>-</td><td>-</td></tr>
            </table>
            """;
    }
    
    private String getSubsection13DoubtClearer() {
        return """
            <h3>💡 Doubt Clearer</h3>
            <div style="background:#fff3e0;padding:15px;border-left:4px solid #ff9800;margin:15px 0;">
                <p><strong>Q: Why state sets?</strong></p>
                <p>A: NFA can be in multiple states; DFA must be in one. Group simultaneous NFA states into one DFA state.</p>
                <p><strong>Q: When to stop?</strong></p>
                <p>A: When all DFA states are marked and no new states discovered.</p>
                <p><strong>Q: Can DFA be bigger than NFA?</strong></p>
                <p>A: Yes, worst case 2^n states, but usually much smaller in practice.</p>
            </div>
            """;
    }
    
    private String getSubsection14Concept() {
        return """
            <h3>🎯 Concept: Partition Refinement</h3>
            <p>Minimize DFA by merging equivalent states.</p>
            <h4>Step-by-Step Process:</h4>
            <ol style="line-height: 2;">
                <li><strong>Step 1:</strong> Initial partition: {Finals}, {Non-finals}</li>
                <li><strong>Step 2:</strong> For each partition P and input a:
                    <ul><li>Split if states go to different partitions</li></ul></li>
                <li><strong>Step 3:</strong> Repeat until no splits</li>
                <li><strong>Step 4:</strong> Each partition → one state</li>
            </ol>
            """;
    }
    
    private String getSubsection15Concept() {
        return """
            <h3>🔄 Miscellaneous: Composite Conversions</h3>
            <p>Combine standard conversions for direct transformations:</p>
            <div style="background:#e3f2fd;padding:20px;margin:20px 0;">
                <h5>1. RE → NFA</h5>
                <p>Path: RE → ε-NFA (1.1) → NFA (1.2)</p>
                
                <h5>2. RE → DFA</h5>
                <p>Path: RE → ε-NFA (1.1) → NFA (1.2) → DFA (1.3)</p>
                
                <h5>3. RE → Min DFA</h5>
                <p>Path: RE → ε-NFA (1.1) → NFA (1.2) → DFA (1.3) → Min DFA (1.4)</p>
                <p><strong>Most common in compilers!</strong></p>
                
                <h5>4. ε-NFA → DFA</h5>
                <p>Path: ε-NFA → NFA (1.2) → DFA (1.3)</p>
                
                <h5>5. NFA → Min DFA</h5>
                <p>Path: NFA → DFA (1.3) → Min DFA (1.4)</p>
            </div>
            <div style="background:#e8f5e9;padding:15px;margin:15px 0;">
                <p><strong>💡 Key Point:</strong> No new algorithms needed! Just apply conversions 1.1-1.4 in sequence.</p>
            </div>
            """;
    }
}
