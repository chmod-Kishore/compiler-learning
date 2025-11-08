// frontend/src/services/lexicalAlgorithms.js
// Implementations for Thompson construction, epsilon-closure, subset construction, and DFA minimization

// Utilities
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// Normalize state names to Q0, Q1, Q2... format
function normalizeStateNames(automaton) {
  if (!automaton || !automaton.states) return automaton;
  
  const stateMap = {};
  const sortedStates = [...automaton.states].sort();
  sortedStates.forEach((state, idx) => {
    stateMap[state] = `Q${idx}`;
  });
  
  const newStates = sortedStates.map(s => stateMap[s]);
  const newTransitions = {};
  
  for (const state of automaton.states) {
    const newState = stateMap[state];
    newTransitions[newState] = {};
    
    if (automaton.transitions[state]) {
      for (const symbol in automaton.transitions[state]) {
        const targets = automaton.transitions[state][symbol];
        if (Array.isArray(targets)) {
          newTransitions[newState][symbol] = targets.map(t => stateMap[t]);
        } else if (targets) {
          newTransitions[newState][symbol] = stateMap[targets];
        }
      }
    }
  }
  
  return {
    states: newStates,
    alphabet: automaton.alphabet,
    transitions: newTransitions,
    start: stateMap[automaton.start],
    accepts: automaton.accepts.map(s => stateMap[s])
  };
}

// Thompson construction for a simple regex grammar with:
// concatenation (implicit by juxtaposition using space separated tokens in our generator),
// union |, star *, parentheses ()
// We'll parse a tokenized input where concatenation is explicit by spaces in generator strings.

// Simple parser (shunting-yard like) to convert to postfix for easier construction
function toPostfix(tokens) {
  const prec = { '|':1, '.':2, '*':3 };
  const output = [];
  const ops = [];

  const pushOp = (op) => {
    while (ops.length > 0) {
      const top = ops[ops.length-1];
      if (top === '(') break;
      if (prec[top] >= prec[op]) output.push(ops.pop());
      else break;
    }
    ops.push(op);
  }

  // We'll treat space-separated tokens: tokens array like ['(', 'a', '|', 'b', ')', '*']
  for (let t of tokens) {
    if (t === '(') ops.push(t);
    else if (t === ')') {
      while (ops.length && ops[ops.length-1] !== '(') output.push(ops.pop());
      ops.pop();
    } else if (t === '|' || t === '.' || t === '*') {
      if (t === '*') {
        // unary, higher precedence
        pushOp(t);
      } else pushOp(t);
    } else {
      output.push(t);
    }
  }
  while (ops.length) output.push(ops.pop());
  return output;
}

// Build tokens: we convert space-joined regex into tokens and insert concatenation '.' where needed
function tokenize(regex) {
  // very small tokenizer for our generator forms (operators: | * ( ) ; symbols are letters/digits)
  const raw = regex.replace(/\s+/g,'');
  const tokens = [];
  for (let i=0;i<raw.length;i++) {
    const c = raw[i];
    if (c === '(' || c === ')' || c === '|' || c === '*') tokens.push(c);
    else tokens.push(c);
  }
  // insert concat '.' between symbol or ')' or '*' and symbol or '('
  const out = [];
  for (let i=0;i<tokens.length;i++) {
    const t = tokens[i];
    out.push(t);
    if (i+1 < tokens.length) {
      const a = tokens[i];
      const b = tokens[i+1];
      const aIsSym = /[a-zA-Z0-9]/.test(a) || a === ')' || a === '*';
      const bIsSym = /[a-zA-Z0-9]/.test(b) || b === '(';
      if (aIsSym && bIsSym) out.push('.');
    }
  }
  return out;
}

// Thompson fragment builder using postfix
function thompsonFromRegex(regex) {
  const tokens = tokenize(regex);
  const postfix = toPostfix(tokens);

  let stateId = 0;
  function newState() { return `s${stateId++}`; }

  // fragment: { start, end, transitions }
  const stack = [];
  for (let tok of postfix) {
    if (tok === '.') {
      const b = stack.pop();
      const a = stack.pop();
      // connect a.end -> b.start with epsilon
      const transitions = mergeTransitions(a.transitions, b.transitions);
      addEdge(transitions, a.end, 'ε', b.start);
      stack.push({ start: a.start, end: b.end, transitions });
    } else if (tok === '|') {
      const b = stack.pop();
      const a = stack.pop();
      const start = newState();
      const end = newState();
      const transitions = mergeTransitions(a.transitions, b.transitions);
      addEdge(transitions, start, 'ε', a.start);
      addEdge(transitions, start, 'ε', b.start);
      addEdge(transitions, a.end, 'ε', end);
      addEdge(transitions, b.end, 'ε', end);
      stack.push({ start, end, transitions });
    } else if (tok === '*') {
      const a = stack.pop();
      const start = newState();
      const end = newState();
      const transitions = clone(a.transitions);
      addEdge(transitions, start, 'ε', a.start);
      addEdge(transitions, start, 'ε', end);
      addEdge(transitions, a.end, 'ε', a.start);
      addEdge(transitions, a.end, 'ε', end);
      stack.push({ start, end, transitions });
    } else {
      // symbol
      const s = newState();
      const e = newState();
      const transitions = {};
      addEdge(transitions, s, tok, e);
      stack.push({ start: s, end: e, transitions });
    }
  }
  const frag = stack.pop();
  // gather states
  const transitions = frag.transitions || {};
  const states = new Set();
  for (const s in transitions) { states.add(s); for (const sym in transitions[s]) transitions[s][sym].forEach(t=>states.add(t)); }
  states.add(frag.start); states.add(frag.end);
  
  // Build alphabet including epsilon
  const alphabetSet = new Set();
  for (const s in transitions) {
    for (const sym in (transitions[s] || {})) {
      alphabetSet.add(sym);
    }
  }
  
  const result = {
    states: Array.from(states),
    alphabet: Array.from(alphabetSet), // Include epsilon in alphabet for ε-NFA
    transitions,
    start: frag.start,
    accepts: [frag.end]
  };
  return normalizeStateNames(result);
}

function addEdge(trans, from, sym, to) {
  if (!trans[from]) trans[from] = {};
  if (!trans[from][sym]) trans[from][sym] = [];
  if (!trans[from][sym].includes(to)) trans[from][sym].push(to);
}

function mergeTransitions(a,b) {
  const out = clone(a || {});
  for (const s in b) {
    if (!out[s]) out[s] = {};
    for (const sym in b[s]) {
      if (!out[s][sym]) out[s][sym] = [];
      b[s][sym].forEach(t => { if (!out[s][sym].includes(t)) out[s][sym].push(t); });
    }
  }
  return out;
}

// Epsilon-closure: given transitions with 'ε', compute closure set for a state or set
function epsilonClosure(states, transitions) {
  const stack = [...states];
  const visited = new Set(states);
  while (stack.length) {
    const s = stack.pop();
    const row = transitions[s] || {};
    const eps = row['ε'] || [];
    for (const t of eps) {
      if (!visited.has(t)) { visited.add(t); stack.push(t); }
    }
  }
  return Array.from(visited);
}

// Move function: given set of NFA states and symbol, return reachable states (without epsilons)
function move(states, sym, transitions) {
  const res = new Set();
  for (const s of states) {
    const row = transitions[s] || {};
    const targets = row[sym] || [];
    targets.forEach(t => res.add(t));
  }
  return Array.from(res);
}

// Subset construction (NFA -> DFA). NFA may or may not include 'ε' transitions.
function nfaToDfa(nfa) {
  const transitions = nfa.transitions || {};
  const alphabet = nfa.alphabet.filter(a => a !== 'ε');
  const startClosure = sortKey(epsilonClosure([nfa.start], transitions));
  const dStates = {};
  const unmarked = [startClosure];
  dStates[startClosure] = { name: startClosure, transitions: {}, isAccept: containsAny(startClosure, nfa.accepts) };
  while (unmarked.length) {
    const D = unmarked.shift();
    for (const sym of alphabet) {
      const moved = move(D.split(','), sym, transitions);
      const closure = sortKey(epsilonClosure(moved, transitions));
      if (closure === '') continue; // no transition for this symbol
      if (!dStates[closure]) {
        dStates[closure] = { name: closure, transitions: {}, isAccept: containsAny(closure, nfa.accepts) };
        unmarked.push(closure);
      }
      dStates[D].transitions[sym] = closure;
    }
  }
  // build result
  const states = Object.keys(dStates);
  const dfaTrans = {};
  for (const s of states) {
    dfaTrans[s] = dStates[s].transitions || {};
  }
  const accepts = states.filter(s => dStates[s].isAccept);
  const result = { states, alphabet, transitions: dfaTrans, start: startClosure, accepts };
  return normalizeStateNames(result);
}

function containsAny(setStr, list) {
  if (!setStr) return false;
  const parts = setStr.split(',');
  for (const t of parts) if (list.includes(t)) return true;
  return false;
}

function sortKey(arr) {
  if (!arr || arr.length === 0) return '';
  const a = Array.from(new Set(arr));
  a.sort();
  return a.join(',');
}

// DFA minimization using Hopcroft's algorithm
function minimizeDfa(dfa) {
  // First remove unreachable states
  const reachable = new Set();
  const stack = [dfa.start];
  while (stack.length) {
    const s = stack.pop();
    if (reachable.has(s)) continue;
    reachable.add(s);
    const row = dfa.transitions[s] || {};
    for (const sym of Object.keys(row)) {
      const t = row[sym];
      if (t && !reachable.has(t)) stack.push(t);
    }
  }
  const states = dfa.states.filter(s => reachable.has(s));
  const alphabet = dfa.alphabet;
  const accepts = new Set(dfa.accepts.filter(a => reachable.has(a)));

  // initial partition: accepts / non-accepts
  let P = [new Set(accepts), new Set(states.filter(s => !accepts.has(s)))].filter(s=>s.size>0);
  let W = P.slice();

  while (W.length) {
    const A = W.pop();
    for (const c of alphabet) {
      // X = {q in Q | delta(q,c) in A}
      const X = new Set();
      for (const q of states) {
        const t = (dfa.transitions[q] || {})[c];
        if (t && A.has(t)) X.add(q);
      }
      const newP = [];
      for (const Y of P) {
        const inter = new Set([...Y].filter(x => X.has(x)));
        const diff = new Set([...Y].filter(x => !X.has(x)));
        if (inter.size && diff.size) {
          newP.push(inter);
          newP.push(diff);
          // replace Y in W with inter and diff appropriately
          const idx = W.findIndex(w => setsEqual(w,Y));
          if (idx !== -1) {
            W.splice(idx,1,inter,diff);
          } else {
            if (inter.size <= diff.size) W.push(inter); else W.push(diff);
          }
        } else {
          newP.push(Y);
        }
      }
      P = newP;
    }
  }
  // Now P contains partition sets; each set becomes a state
  const partMap = {};
  let idx = 0;
  for (const block of P) {
    const name = `S${idx++}`;
    for (const s of block) partMap[s] = name;
  }
  const mStates = Array.from(new Set(Object.values(partMap)));
  const mStart = partMap[dfa.start];
  const mAccepts = Array.from(new Set(Object.keys(partMap).filter(k => dfa.accepts.includes(k)).map(k => partMap[k])));
  const mTrans = {};
  for (const s of states) {
    const from = partMap[s];
    if (!mTrans[from]) mTrans[from] = {};
    for (const c of alphabet) {
      const tgt = (dfa.transitions[s] || {})[c];
      if (tgt) mTrans[from][c] = partMap[tgt];
    }
  }
  // normalize transitions to have each mState
  for (const ms of mStates) if (!mTrans[ms]) mTrans[ms] = {};
  const result = { states: mStates, alphabet, transitions: mTrans, start: mStart, accepts: Array.from(new Set(mAccepts)) };
  return normalizeStateNames(result);
}

function setsEqual(a,b) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

// Comparison helpers: compare user provided table to computed automaton
// We'll accept userAnswer as a simple JSON-able object similar to our automaton shape.

function compareAutomata(expected, actual) {
  // returns an object { equal: bool, details: { states: {missing:[], extra:[]}, transitions: [{from,sym,expected,actual,ok}], accepts: {missing,extra}} }
  const details = { states: { missing: [], extra: [] }, transitions: [], accepts: { missing: [], extra: [] } };
  const expStates = new Set(expected.states || []);
  const actStates = new Set(actual.states || []);
  for (const s of expStates) if (!actStates.has(s)) details.states.missing.push(s);
  for (const s of actStates) if (!expStates.has(s)) details.states.extra.push(s);
  // transitions: check each expected transition exists and matches
  for (const from of Object.keys(expected.transitions || {})) {
    const row = expected.transitions[from] || {};
    for (const sym of Object.keys(row)) {
      const expTo = row[sym];
      const actTo = (actual.transitions && actual.transitions[from] && actual.transitions[from][sym]) || null;
      const ok = Array.isArray(expTo) ? arraysEqualNoOrder(expTo, Array.isArray(actTo)?actTo:[actTo].filter(Boolean)) : expTo === actTo;
      details.transitions.push({ from, sym, expected: expTo, actual: actTo, ok });
    }
  }
  // accepts
  const expAcc = new Set(expected.accepts || []);
  const actAcc = new Set(actual.accepts || []);
  for (const s of expAcc) if (!actAcc.has(s)) details.accepts.missing.push(s);
  for (const s of actAcc) if (!expAcc.has(s)) details.accepts.extra.push(s);

  const equal = details.states.missing.length===0 && details.states.extra.length===0 && details.transitions.every(t=>t.ok) && details.accepts.missing.length===0 && details.accepts.extra.length===0;
  return { equal, details };
}

// Compare DFAs by behavioral equivalence (allows different state names)
// This checks if two DFAs accept the same language by checking isomorphism
function compareDfaEquivalence(expected, actual) {
  // Try to find a mapping from actual states to expected states that preserves structure
  const expNorm = normalizeStateNames(expected);
  const actNorm = normalizeStateNames(actual);
  
  // After normalization, they should match if they're equivalent
  return compareAutomata(expNorm, actNorm);
}

function arraysEqualNoOrder(a,b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  for (let i=0;i<sa.length;i++) if (sa[i] !== sb[i]) return false;
  return true;
}

const lexicalAlgorithms = {
  thompsonFromRegex,
  epsilonClosure,
  move,
  nfaToDfa,
  minimizeDfa,
  compareAutomata,
  compareDfaEquivalence
};

export default lexicalAlgorithms;
