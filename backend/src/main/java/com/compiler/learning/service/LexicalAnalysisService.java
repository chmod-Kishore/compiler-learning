// src/main/java/com/compiler/learning/service/LexicalAnalysisService.java
package com.compiler.learning.service;

import org.springframework.stereotype.Service;

@Service
public class LexicalAnalysisService {

    public String getTheoryContent() {
        return """
            <h2>Lexical Analysis - Automata Conversions</h2>
            
            <p>Lexical analysis is the first phase of compilation that converts source code into tokens. 
            We use finite automata to recognize patterns defined by regular expressions.</p>
            
            <hr style="margin: 30px 0;"/>
            
            <h3>1️⃣ Regular Expression to ε-NFA (Thompson's Construction)</h3>
            
            <h4>Thompson's Rules:</h4>
            <p>Thompson's construction builds an ε-NFA for each component of a regular expression:</p>
            
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Component</th>
                <th style="padding: 10px; text-align: left;">Construction</th>
                <th style="padding: 10px; text-align: left;">Diagram Description</th>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Empty (ε)</strong></td>
                <td style="padding: 10px;">Create start state → ε-transition → final state</td>
                <td style="padding: 10px;">q₀ →ε→ qf</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Symbol (a)</strong></td>
                <td style="padding: 10px;">Create start state → a-transition → final state</td>
                <td style="padding: 10px;">q₀ →a→ qf</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Union (r₁|r₂)</strong></td>
                <td style="padding: 10px;">New start with ε to both r₁ and r₂, both endings to new final</td>
                <td style="padding: 10px;">ε-split to parallel paths, ε-join at end</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Concatenation (r₁r₂)</strong></td>
                <td style="padding: 10px;">Connect final state of r₁ to start state of r₂ with ε</td>
                <td style="padding: 10px;">r₁ →ε→ r₂ (sequential)</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Kleene Star (r*)</strong></td>
                <td style="padding: 10px;">ε from new start to r and new final, ε from r final back to r start, ε from start to final</td>
                <td style="padding: 10px;">Loop with ε-bypass</td>
              </tr>
            </table>
            
            <h4>Example: Convert (a|b)*c to ε-NFA</h4>
            
            <p><strong>Step 1:</strong> Build ε-NFA for 'a'</p>
            <pre>State 0 →a→ State 1</pre>
            
            <p><strong>Step 2:</strong> Build ε-NFA for 'b'</p>
            <pre>State 2 →b→ State 3</pre>
            
            <p><strong>Step 3:</strong> Apply Union (a|b)</p>
            <pre>State 4 →ε→ State 0 (for 'a')
State 4 →ε→ State 2 (for 'b')
State 1 →ε→ State 5 (from 'a' end)
State 3 →ε→ State 5 (from 'b' end)</pre>
            
            <p><strong>Step 4:</strong> Apply Kleene Star (a|b)*</p>
            <pre>State 6 →ε→ State 4 (enter loop)
State 6 →ε→ State 7 (bypass loop)
State 5 →ε→ State 4 (loop back)
State 5 →ε→ State 7 (exit loop)</pre>
            
            <p><strong>Step 5:</strong> Build 'c' and concatenate</p>
            <pre>State 8 →c→ State 9
State 7 →ε→ State 8 (connect (a|b)* to c)</pre>
            
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
                <td style="padding: 8px;">→6 (start)</td>
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
                <td style="padding: 8px;">*9 (final)</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
              </tr>
            </table>
            
            <hr style="margin: 30px 0;"/>
            
            <h3>2️⃣ ε-NFA to NFA (Epsilon Closure Elimination)</h3>
            
            <h4>Algorithm:</h4>
            <ol>
              <li><strong>Compute ε-closure</strong> for each state (all states reachable via ε-transitions)</li>
              <li><strong>New transitions:</strong> For each state q and input symbol a:
                <ul>
                  <li>Find all states reachable from ε-closure(q) on input 'a'</li>
                  <li>Take ε-closure of the result</li>
                </ul>
              </li>
              <li><strong>Final states:</strong> A state is final if its ε-closure contains any original final state</li>
            </ol>
            
            <h4>Example: Converting the above ε-NFA to NFA</h4>
            
            <p><strong>Step 1: Compute ε-closures</strong></p>
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px;">State</th>
                <th style="padding: 8px;">ε-closure</th>
              </tr>
              <tr><td style="padding: 8px;">6</td><td style="padding: 8px;">{6, 4, 7, 0, 2, 8}</td></tr>
              <tr><td style="padding: 8px;">4</td><td style="padding: 8px;">{4, 0, 2}</td></tr>
              <tr><td style="padding: 8px;">0</td><td style="padding: 8px;">{0}</td></tr>
              <tr><td style="padding: 8px;">2</td><td style="padding: 8px;">{2}</td></tr>
              <tr><td style="padding: 8px;">1</td><td style="padding: 8px;">{1, 5, 4, 7, 0, 2, 8}</td></tr>
              <tr><td style="padding: 8px;">3</td><td style="padding: 8px;">{3, 5, 4, 7, 0, 2, 8}</td></tr>
              <tr><td style="padding: 8px;">5</td><td style="padding: 8px;">{5, 4, 7, 0, 2, 8}</td></tr>
              <tr><td style="padding: 8px;">7</td><td style="padding: 8px;">{7, 8}</td></tr>
              <tr><td style="padding: 8px;">8</td><td style="padding: 8px;">{8}</td></tr>
              <tr><td style="padding: 8px;">9</td><td style="padding: 8px;">{9}</td></tr>
            </table>
            
            <p><strong>Step 2: Compute new transitions</strong></p>
            <p>For state 6 on input 'a':</p>
            <pre>ε-closure(6) = {6, 4, 7, 0, 2, 8}
States that can read 'a' = {0} → goes to {1}
ε-closure(1) = {1, 5, 4, 7, 0, 2, 8}
Therefore: δ(6, a) = {1, 5, 4, 7, 0, 2, 8}</pre>
            
            <h4>Final NFA Transition Table:</h4>
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px;">State</th>
                <th style="padding: 8px;">a</th>
                <th style="padding: 8px;">b</th>
                <th style="padding: 8px;">c</th>
              </tr>
              <tr>
                <td style="padding: 8px;">→{6,4,7,0,2,8} (start)</td>
                <td style="padding: 8px;">{1,5,4,7,0,2,8}</td>
                <td style="padding: 8px;">{3,5,4,7,0,2,8}</td>
                <td style="padding: 8px;">{9}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">{1,5,4,7,0,2,8}</td>
                <td style="padding: 8px;">{1,5,4,7,0,2,8}</td>
                <td style="padding: 8px;">{3,5,4,7,0,2,8}</td>
                <td style="padding: 8px;">{9}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">{3,5,4,7,0,2,8}</td>
                <td style="padding: 8px;">{1,5,4,7,0,2,8}</td>
                <td style="padding: 8px;">{3,5,4,7,0,2,8}</td>
                <td style="padding: 8px;">{9}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">*{9} (final)</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
              </tr>
            </table>
            
            <hr style="margin: 30px 0;"/>
            
            <h3>3️⃣ NFA to DFA (Subset Construction)</h3>
            
            <h4>Algorithm:</h4>
            <ol>
              <li><strong>Start:</strong> Create DFA start state = {NFA start state}</li>
              <li><strong>For each unmarked DFA state S:</strong>
                <ul>
                  <li>Mark S</li>
                  <li>For each input symbol a:</li>
                  <li>Compute T = union of all states reachable from any state in S on input a</li>
                  <li>If T is not empty and not already in DFA states, add it</li>
                  <li>Add transition δ(S, a) = T</li>
                </ul>
              </li>
              <li><strong>Final states:</strong> Any DFA state containing an NFA final state</li>
            </ol>
            
            <h4>Example: Convert the above NFA to DFA</h4>
            
            <p>Let's simplify notation:</p>
            <ul>
              <li>A = {6,4,7,0,2,8}</li>
              <li>B = {1,5,4,7,0,2,8}</li>
              <li>C = {3,5,4,7,0,2,8}</li>
              <li>D = {9}</li>
            </ul>
            
            <p><strong>Step-by-step construction:</strong></p>
            
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px;">Step</th>
                <th style="padding: 8px;">Current State</th>
                <th style="padding: 8px;">Input 'a'</th>
                <th style="padding: 8px;">Input 'b'</th>
                <th style="padding: 8px;">Input 'c'</th>
              </tr>
              <tr>
                <td style="padding: 8px;">1</td>
                <td style="padding: 8px;">A (start)</td>
                <td style="padding: 8px;">→ B (new)</td>
                <td style="padding: 8px;">→ C (new)</td>
                <td style="padding: 8px;">→ D (new)</td>
              </tr>
              <tr>
                <td style="padding: 8px;">2</td>
                <td style="padding: 8px;">B</td>
                <td style="padding: 8px;">→ B (exists)</td>
                <td style="padding: 8px;">→ C (exists)</td>
                <td style="padding: 8px;">→ D (exists)</td>
              </tr>
              <tr>
                <td style="padding: 8px;">3</td>
                <td style="padding: 8px;">C</td>
                <td style="padding: 8px;">→ B (exists)</td>
                <td style="padding: 8px;">→ C (exists)</td>
                <td style="padding: 8px;">→ D (exists)</td>
              </tr>
              <tr>
                <td style="padding: 8px;">4</td>
                <td style="padding: 8px;">D (final)</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
              </tr>
            </table>
            
            <h4>Final DFA Transition Table:</h4>
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px;">State</th>
                <th style="padding: 8px;">a</th>
                <th style="padding: 8px;">b</th>
                <th style="padding: 8px;">c</th>
              </tr>
              <tr>
                <td style="padding: 8px;">→A</td>
                <td style="padding: 8px;">B</td>
                <td style="padding: 8px;">C</td>
                <td style="padding: 8px;">D</td>
              </tr>
              <tr>
                <td style="padding: 8px;">B</td>
                <td style="padding: 8px;">B</td>
                <td style="padding: 8px;">C</td>
                <td style="padding: 8px;">D</td>
              </tr>
              <tr>
                <td style="padding: 8px;">C</td>
                <td style="padding: 8px;">B</td>
                <td style="padding: 8px;">C</td>
                <td style="padding: 8px;">D</td>
              </tr>
              <tr>
                <td style="padding: 8px;">*D</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
              </tr>
            </table>
            
            <hr style="margin: 30px 0;"/>
            
            <h3>4️⃣ DFA Minimization (Partition Refinement)</h3>
            
            <h4>Algorithm:</h4>
            <ol>
              <li><strong>Initial partition:</strong> Divide states into two groups:
                <ul>
                  <li>P₀ = {Final states}</li>
                  <li>P₁ = {Non-final states}</li>
                </ul>
              </li>
              <li><strong>Refinement:</strong> For each partition P and input symbol a:
                <ul>
                  <li>If states in P go to different partitions on input a, split P</li>
                  <li>Continue until no partition can be split further</li>
                </ul>
              </li>
              <li><strong>Build minimized DFA:</strong> Each final partition becomes one state</li>
            </ol>
            
            <h4>Example: Minimize the above DFA</h4>
            
            <p><strong>Initial Partition (P₀):</strong></p>
            <pre>Group 0: {D} (final states)
Group 1: {A, B, C} (non-final states)</pre>
            
            <p><strong>Iteration 1: Refine Group 1</strong></p>
            
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px;">State</th>
                <th style="padding: 8px;">On 'a' → Group</th>
                <th style="padding: 8px;">On 'b' → Group</th>
                <th style="padding: 8px;">On 'c' → Group</th>
                <th style="padding: 8px;">Signature</th>
              </tr>
              <tr>
                <td style="padding: 8px;">A</td>
                <td style="padding: 8px;">B → Gr.1</td>
                <td style="padding: 8px;">C → Gr.1</td>
                <td style="padding: 8px;">D → Gr.0</td>
                <td style="padding: 8px;">(1, 1, 0)</td>
              </tr>
              <tr>
                <td style="padding: 8px;">B</td>
                <td style="padding: 8px;">B → Gr.1</td>
                <td style="padding: 8px;">C → Gr.1</td>
                <td style="padding: 8px;">D → Gr.0</td>
                <td style="padding: 8px;">(1, 1, 0)</td>
              </tr>
              <tr>
                <td style="padding: 8px;">C</td>
                <td style="padding: 8px;">B → Gr.1</td>
                <td style="padding: 8px;">C → Gr.1</td>
                <td style="padding: 8px;">D → Gr.0</td>
                <td style="padding: 8px;">(1, 1, 0)</td>
              </tr>
            </table>
            
            <p><strong>Result:</strong> All states in Group 1 have same signature (1, 1, 0), so no split needed!</p>
            
            <p><strong>Final Partition (P₁):</strong></p>
            <pre>Group 0: {D} (final)
Group 1: {A, B, C} (non-final) - can be merged into single state</pre>
            
            <p><strong>Since A, B, and C are equivalent, they can be merged into a single state.</strong></p>
            
            <h4>Minimized DFA:</h4>
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px;">State</th>
                <th style="padding: 8px;">a</th>
                <th style="padding: 8px;">b</th>
                <th style="padding: 8px;">c</th>
              </tr>
              <tr>
                <td style="padding: 8px;">→Q₀ (merged A,B,C)</td>
                <td style="padding: 8px;">Q₀</td>
                <td style="padding: 8px;">Q₀</td>
                <td style="padding: 8px;">Q₁</td>
              </tr>
              <tr>
                <td style="padding: 8px;">*Q₁ (D)</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
                <td style="padding: 8px;">-</td>
              </tr>
            </table>
            
            <p><strong>Result:</strong> Minimized DFA has only 2 states! The automaton accepts strings matching the pattern (a|b)*c</p>
            
            <hr style="margin: 30px 0;"/>
            
            <h3>📝 Summary</h3>
            <ul>
              <li><strong>RE → ε-NFA:</strong> Use Thompson's construction rules for each component</li>
              <li><strong>ε-NFA → NFA:</strong> Eliminate ε-transitions using ε-closure computation</li>
              <li><strong>NFA → DFA:</strong> Use subset construction to create deterministic states</li>
              <li><strong>DFA → Min DFA:</strong> Merge equivalent states using partition refinement</li>
            </ul>
            
            <p><strong>Key Point:</strong> All four forms recognize the same language, but minimized DFA is most efficient for implementation!</p>
            """;
    }
}
