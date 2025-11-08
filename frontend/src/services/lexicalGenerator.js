// frontend/src/services/lexicalGenerator.js
// Enhanced Lexical Analysis Problem Generator
// Includes: Metadata, Display Question, Expected Answer Type, Input UI Type

// ─────────────────────────────────────────────
// 🎯 Conversion Hierarchy for Multi-Step Problems
// ─────────────────────────────────────────────
export const CONVERSION_HIERARCHY = ['RE', 'ε-NFA', 'NFA', 'DFA', 'Min DFA'];

// Get available end types based on start type
export function getAvailableEndTypes(startType) {
  const startIdx = CONVERSION_HIERARCHY.indexOf(startType);
  if (startIdx === -1 || startIdx >= CONVERSION_HIERARCHY.length - 1) {
    return [];
  }
  // Return all types after the start type
  return CONVERSION_HIERARCHY.slice(startIdx + 1);
}

// Get conversion type string for algorithm selection
export function getConversionTypeKey(startType, endType) {
  // Map type pairs to the conversion keys used in solver/helper
  const key = `${startType}-to-${endType}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  // Special mappings for existing conversion types
  const mappings = {
    're-to-ε-nfa': 'thompson',
    're-to-enfa': 'thompson',
    'ε-nfa-to-nfa': 'epsilon',
    'enfa-to-nfa': 'epsilon',
    'nfa-to-dfa': 'subset',
    'dfa-to-min-dfa': 'minimization',
    'dfa-to-mindfa': 'minimization',
    'ε-nfa-to-dfa': 'epsilon-to-dfa',
    'enfa-to-dfa': 'epsilon-to-dfa',
    'nfa-to-min-dfa': 'nfa-to-min-dfa',
    'nfa-to-mindfa': 'nfa-to-min-dfa',
    're-to-dfa': 're-to-dfa',
    're-to-min-dfa': 're-to-min-dfa',
    're-to-mindfa': 're-to-min-dfa'
  };
  
  return mappings[key] || key;
}

// ─────────────────────────────────────────────
// 🧩 1️⃣ Thompson Construction (RE → ε-NFA)
// ─────────────────────────────────────────────

export function generateThompsonProblems() {
  const list = [
    { id: 'T1', regex: '(a|b)*c', note: 'Union with star and concatenation' },
    { id: 'T2', regex: 'a(b|c)*d', note: 'Star in middle with concatenation' },
    { id: 'T3', regex: '(a|b)(c|d)', note: 'Multiple unions with concatenation' },
    { id: 'T4', regex: '(a|b)*abb', note: 'Star with suffix - classic pattern matching' },
    { id: 'T5', regex: '((a|b)c)*|d', note: 'Nested operators with union and star' }
  ];

  return list.map(p => ({
    id: p.id,
    title: `Thompson: ${p.id}`,
    type: 'thompson',
    question: `Construct the ε-NFA for the regular expression: ${p.regex}`,
    inputType: 'regex',                // what user inputs
    expectedOutputType: 'automaton',   // what user produces
    input: { regex: p.regex },
    meta: p.note
  }));
}

// ─────────────────────────────────────────────
// 🧩 2️⃣ Epsilon Closure (ε-NFA → NFA)
// ─────────────────────────────────────────────

function smallEpsilonNfa(id) {
  const base = {
    alphabet: ['a', 'b', 'ε'],
    start: 'Q0',
    accepts: ['Q6']
  };
  switch (id) {
    case 1:
      return {
        ...base,
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'],
        transitions: {
          Q0: { 'ε': ['Q1', 'Q3'] },
          Q1: { a: ['Q2'], 'ε': ['Q2'] },
          Q2: { a: ['Q2'], 'ε': ['Q5'] },
          Q3: { 'ε': ['Q4'] },
          Q4: { b: ['Q5'] },
          Q5: { 'ε': ['Q6'] },
          Q6: { b: ['Q6'] }
        },
        meta: 'Multiple ε-paths and branches with cycles.'
      };
    case 2:
      return {
        ...base,
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        alphabet: ['0', '1', 'ε'],
        transitions: {
          Q0: { 'ε': ['Q1', 'Q2'] },
          Q1: { '0': ['Q3'], 'ε': ['Q3'] },
          Q2: { '1': ['Q4'] },
          Q3: { 'ε': ['Q4', 'Q5'] },
          Q4: { '0': ['Q4'], '1': ['Q5'] },
          Q5: { 'ε': ['Q1'] }
        },
        start: 'Q0',
        accepts: ['Q5'],
        meta: 'Contains ε-cycle with mixed transitions.'
      };
    case 3:
      return {
        ...base,
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'],
        alphabet: ['a', 'b', 'ε'],
        transitions: { 
          Q0: { 'ε': ['Q1', 'Q4'] }, 
          Q1: { 'ε': ['Q2'] },
          Q2: { a: ['Q3'] }, 
          Q3: { 'ε': ['Q6'] },
          Q4: { 'ε': ['Q5'] },
          Q5: { b: ['Q6'] },
          Q6: {}
        },
        start: 'Q0',
        accepts: ['Q6'],
        meta: 'Parallel ε-paths leading to same final state.'
      };
    case 4:
      return {
        ...base,
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        alphabet: ['x', 'y', 'ε'],
        transitions: {
          Q0: { 'ε': ['Q1', 'Q2'] },
          Q1: { x: ['Q3'], 'ε': ['Q3'] },
          Q2: { 'ε': ['Q4'] },
          Q3: { 'ε': ['Q4', 'Q5'] },
          Q4: { y: ['Q5'] },
          Q5: { y: ['Q5'] }
        },
        start: 'Q0',
        accepts: ['Q5'],
        meta: 'Interleaved ε and symbol transitions with self-loop.'
      };
    default:
      return {
        ...base,
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'],
        alphabet: ['m', 'n', 'ε'],
        transitions: {
          Q0: { 'ε': ['Q1', 'Q2'] },
          Q1: { m: ['Q3'] },
          Q2: { 'ε': ['Q4'] },
          Q3: { 'ε': ['Q5'] },
          Q4: { n: ['Q5'] },
          Q5: { 'ε': ['Q6'] },
          Q6: { m: ['Q6'], n: ['Q6'] }
        },
        start: 'Q0',
        accepts: ['Q6'],
        meta: 'Complex ε-bridges with final self-loops.'
      };
  }
}

export function generateEpsilonClosureProblems() {
  return [1, 2, 3, 4, 5].map(i => {
    const p = smallEpsilonNfa(i);
    return {
      id: p.id || `E${i}`,
      title: `Epsilon Closure: ${p.id || `E${i}`}`,
      type: 'epsilon',
      question: 'Compute the ε-closure for each state in the given ε-NFA.',
      inputType: 'automaton',
      expectedOutputType: 'table',
      input: p,
      meta: p.meta
    };
  });
}

// ─────────────────────────────────────────────
// 🧩 3️⃣ Subset Construction (NFA → DFA)
// ─────────────────────────────────────────────

function sampleNfa(i) {
  switch (i) {
    case 1:
      return {
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        alphabet: ['a', 'b'],
        transitions: {
          Q0: { a: ['Q0', 'Q1'], b: ['Q0'] },
          Q1: { a: ['Q2'], b: ['Q3'] },
          Q2: { b: ['Q4'] },
          Q3: { a: ['Q4'] },
          Q4: { a: ['Q5'], b: ['Q5'] },
          Q5: {}
        },
        start: 'Q0',
        accepts: ['Q5'],
        meta: 'Nondeterministic branching with multiple paths to accept state.'
      };
    case 2:
      return {
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        alphabet: ['0', '1'],
        transitions: {
          Q0: { 0: ['Q1', 'Q2'], 1: ['Q0'] },
          Q1: { 0: ['Q3'], 1: ['Q4'] },
          Q2: { 0: ['Q4'], 1: ['Q3'] },
          Q3: { 1: ['Q5'] },
          Q4: { 0: ['Q5'] },
          Q5: {}
        },
        start: 'Q0',
        accepts: ['Q5'],
        meta: 'Multiple nondeterministic choices from start state.'
      };
    case 3:
      return {
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        alphabet: ['a', 'b'],
        transitions: { 
          Q0: { a: ['Q1', 'Q2'] }, 
          Q1: { b: ['Q3', 'Q4'] }, 
          Q2: { a: ['Q3', 'Q5'] },
          Q3: {},
          Q4: {},
          Q5: {}
        },
        start: 'Q0',
        accepts: ['Q3', 'Q4', 'Q5'],
        meta: 'Multiple final states with nondeterminism.'
      };
    case 4:
      return {
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        alphabet: ['a', 'b'],
        transitions: { 
          Q0: { a: ['Q1'] }, 
          Q1: { a: ['Q2'], b: ['Q3'] }, 
          Q2: { a: ['Q4'] },
          Q3: { b: ['Q4'] },
          Q4: { a: ['Q5'], b: ['Q5'] },
          Q5: {}
        },
        start: 'Q0',
        accepts: ['Q5'],
        meta: 'Long chain with branching paths.'
      };
    default:
      return {
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        alphabet: ['x', 'y'],
        transitions: { 
          Q0: { x: ['Q0', 'Q1'], y: ['Q2'] }, 
          Q1: { x: ['Q3'], y: ['Q4'] },
          Q2: { x: ['Q4'], y: ['Q3'] },
          Q3: { x: ['Q5'] },
          Q4: { y: ['Q5'] },
          Q5: { x: ['Q5'], y: ['Q5'] }
        },
        start: 'Q0',
        accepts: ['Q5'],
        meta: 'Self-loop at start and final state with complex branching.'
      };
  }
}

export function generateNfaToDfaProblems() {
  return [1, 2, 3, 4, 5].map(i => {
    const p = sampleNfa(i);
    return {
      id: `N${i}`,
      title: `Subset Construction: N${i}`,
      type: 'subset',
      question: 'Convert the given NFA to its equivalent DFA using subset construction.',
      inputType: 'automaton',
      expectedOutputType: 'table',
      input: p,
      meta: p.meta
    };
  });
}

// ─────────────────────────────────────────────
// 🧩 4️⃣ DFA Minimization (DFA → Min DFA)
// ─────────────────────────────────────────────

function sampleDfa(i) {
  switch (i) {
    case 1:
      return {
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4'],
        alphabet: ['0', '1'],
        transitions: { 
          Q0: { 0: 'Q1', 1: 'Q2' }, 
          Q1: { 0: 'Q1', 1: 'Q3' }, 
          Q2: { 0: 'Q3', 1: 'Q2' },
          Q3: { 0: 'Q4', 1: 'Q4' },
          Q4: { 0: 'Q4', 1: 'Q4' }
        },
        start: 'Q0',
        accepts: ['Q3'],
        meta: 'Trap state with distinguishable paths.'
      };
    case 2:
      return {
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        alphabet: ['a', 'b'],
        transitions: { 
          Q0: { a: 'Q1', b: 'Q2' }, 
          Q1: { a: 'Q3', b: 'Q4' }, 
          Q2: { a: 'Q4', b: 'Q3' },
          Q3: { a: 'Q5', b: 'Q5' },
          Q4: { a: 'Q5', b: 'Q5' },
          Q5: { a: 'Q5', b: 'Q5' }
        },
        start: 'Q0',
        accepts: ['Q5'],
        meta: 'Q3 and Q4 can be merged - similar behavior.'
      };
    case 3:
      return {
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        alphabet: ['x', 'y'],
        transitions: { 
          Q0: { x: 'Q1', y: 'Q2' }, 
          Q1: { x: 'Q3', y: 'Q4' }, 
          Q2: { x: 'Q4', y: 'Q3' },
          Q3: { x: 'Q5', y: 'Q5' },
          Q4: { x: 'Q5', y: 'Q5' },
          Q5: { x: 'Q5', y: 'Q5' }
        },
        start: 'Q0',
        accepts: ['Q5'],
        meta: 'Multiple equivalent states leading to accept.'
      };
    case 4:
      return {
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        alphabet: ['0', '1'],
        transitions: { 
          Q0: { 0: 'Q1', 1: 'Q2' }, 
          Q1: { 0: 'Q3', 1: 'Q4' }, 
          Q2: { 0: 'Q4', 1: 'Q3' },
          Q3: { 0: 'Q5', 1: 'Q5' },
          Q4: { 0: 'Q5', 1: 'Q5' },
          Q5: { 0: 'Q5', 1: 'Q5' }
        },
        start: 'Q0',
        accepts: ['Q3', 'Q5'],
        meta: 'Multiple accept states with equivalent transitions.'
      };
    default:
      return {
        states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        alphabet: ['0', '1'],
        transitions: {
          Q0: { 0: 'Q1', 1: 'Q2' },
          Q1: { 0: 'Q3', 1: 'Q4' },
          Q2: { 0: 'Q4', 1: 'Q3' },
          Q3: { 0: 'Q5', 1: 'Q0' },
          Q4: { 0: 'Q0', 1: 'Q5' },
          Q5: { 0: 'Q2', 1: 'Q1' }
        },
        start: 'Q0',
        accepts: ['Q5'],
        meta: 'Complex partitions with cyclic transitions requiring multi-step refinement.'
      };
  }
}

export function generateDfaMinimizationProblems() {
  return [1, 2, 3, 4, 5].map(i => {
    const p = sampleDfa(i);
    return {
      id: `D${i}`,
      title: `DFA Minimization: D${i}`,
      type: 'minimization',
      question: 'Minimize the given DFA using the partitioning (equivalence) method.',
      inputType: 'automaton',
      expectedOutputType: 'automaton',
      input: p,
      meta: p.meta
    };
  });
}

// ─────────────────────────────────────────────
// 🧩 5️⃣ Miscellaneous Conversions (Multi-Step)
// ─────────────────────────────────────────────
// These are composite conversions requiring intermediate steps

function generateMiscellaneousConversion(id) {
  switch (id) {
    case 1:
      // ε-NFA → DFA (via NFA)
      return {
        type: 'epsilon-to-dfa',
        title: 'ε-NFA → DFA',
        input: {
          states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4'],
          alphabet: ['a', 'b', 'ε'],
          transitions: {
            Q0: { 'ε': ['Q1', 'Q2'] },
            Q1: { a: ['Q3'] },
            Q2: { b: ['Q3'] },
            Q3: { 'ε': ['Q4'] },
            Q4: { a: ['Q4'], b: ['Q4'] }
          },
          start: 'Q0',
          accepts: ['Q4']
        },
        intermediateSteps: ['NFA'],
        description: 'Convert ε-NFA to DFA by first eliminating ε-transitions (ε-NFA → NFA), then applying subset construction (NFA → DFA).',
        meta: 'Two-step conversion: ε-NFA → NFA → DFA'
      };
    
    case 2:
      // ε-NFA → Min DFA (via NFA → DFA → Min DFA)
      return {
        type: 'epsilon-to-min-dfa',
        title: 'ε-NFA → Minimized DFA',
        input: {
          states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
          alphabet: ['0', '1', 'ε'],
          transitions: {
            Q0: { 'ε': ['Q1'] },
            Q1: { '0': ['Q2'], '1': ['Q3'] },
            Q2: { '0': ['Q4'], '1': ['Q4'] },
            Q3: { '0': ['Q4'], '1': ['Q4'] },
            Q4: { 'ε': ['Q5'] },
            Q5: {}
          },
          start: 'Q0',
          accepts: ['Q5']
        },
        intermediateSteps: ['NFA', 'DFA'],
        description: 'Convert ε-NFA to minimized DFA: (1) Eliminate ε-transitions → NFA, (2) Subset construction → DFA, (3) Minimize → Min DFA.',
        meta: 'Three-step conversion: ε-NFA → NFA → DFA → Min DFA'
      };
    
    case 3:
      // NFA → Min DFA (via DFA)
      return {
        type: 'nfa-to-min-dfa',
        title: 'NFA → Minimized DFA',
        input: {
          states: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
          alphabet: ['a', 'b'],
          transitions: {
            Q0: { a: ['Q1', 'Q2'], b: ['Q0'] },
            Q1: { a: ['Q3'], b: ['Q4'] },
            Q2: { a: ['Q4'], b: ['Q3'] },
            Q3: { a: ['Q5'], b: ['Q5'] },
            Q4: { a: ['Q5'], b: ['Q5'] },
            Q5: {}
          },
          start: 'Q0',
          accepts: ['Q5']
        },
        intermediateSteps: ['DFA'],
        description: 'Convert NFA to minimized DFA: (1) Apply subset construction → DFA, (2) Minimize using partition refinement → Min DFA.',
        meta: 'Two-step conversion: NFA → DFA → Min DFA'
      };
    
    case 4:
      // RE → DFA (via ε-NFA → NFA → DFA)
      return {
        type: 're-to-dfa',
        title: 'Regular Expression → DFA',
        input: {
          regex: '(a|b)*ab'
        },
        intermediateSteps: ['ε-NFA', 'NFA'],
        description: 'Convert RE to DFA: (1) Thompson construction → ε-NFA, (2) Eliminate ε-transitions → NFA, (3) Subset construction → DFA.',
        meta: 'Three-step conversion: RE → ε-NFA → NFA → DFA'
      };
    
    case 5:
      // RE → Min DFA (via ε-NFA → NFA → DFA → Min DFA)
      return {
        type: 're-to-min-dfa',
        title: 'Regular Expression → Minimized DFA',
        input: {
          regex: '(a|b)*abb'
        },
        intermediateSteps: ['ε-NFA', 'NFA', 'DFA'],
        description: 'Convert RE to minimized DFA: (1) Thompson → ε-NFA, (2) Eliminate ε → NFA, (3) Subset → DFA, (4) Minimize → Min DFA.',
        meta: 'Four-step conversion: RE → ε-NFA → NFA → DFA → Min DFA'
      };
    
    default:
      return generateMiscellaneousConversion(1);
  }
}

export function generateMiscellaneousProblems() {
  return [1, 2, 3, 4, 5].map(i => {
    const p = generateMiscellaneousConversion(i);
    return {
      id: `M${i}`,
      title: p.title,
      type: p.type,
      question: p.description,
      input: p.input,
      intermediateSteps: p.intermediateSteps,
      meta: p.meta
    };
  });
}

// ─────────────────────────────────────────────
// 🎯 Master Problem Generator
// ─────────────────────────────────────────────
export function generateProblemsFor(topicKey) {
  switch (topicKey) {
    case 'thompson':
      return generateThompsonProblems();
    case 'epsilon':
      return generateEpsilonClosureProblems();
    case 'subset':
      return generateNfaToDfaProblems();
    case 'minimization':
      return generateDfaMinimizationProblems();
    case 'miscellaneous':
      return generateMiscellaneousProblems();
    default:
      return [{
        id: 'invalid',
        title: 'Invalid Topic',
        question: 'No problems available for the selected topic.',
        input: {},
        meta: 'Invalid topic key.'
      }];
  }
}

const lexicalGenerator = { generateProblemsFor };
export default lexicalGenerator;
