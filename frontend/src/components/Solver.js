import React, { useState } from 'react';

const Solver = () => {
  const [grammar, setGrammar] = useState(`E → T E'
E' → + T E' | ε
T → F T'
T' → * F T' | ε
F → ( E ) | id`);
  
  const [inputString, setInputString] = useState('id + id * id');
  const [parseTable, setParseTable] = useState(null);
  const [parseSteps, setParseSteps] = useState([]);
  const [firstSets, setFirstSets] = useState(null);
  const [followSets, setFollowSets] = useState(null);
  const [outputMessage, setOutputMessage] = useState('');
  const [derivation, setDerivation] = useState('');
  const [conflicts, setConflicts] = useState([]);
  const [isLL1, setIsLL1] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFirstFollow, setShowFirstFollow] = useState(false);

  const handleGenerateTable = async () => {
    if (!grammar.trim()) {
      setOutputMessage('❌ Please enter a grammar');
      return;
    }

    setLoading(true);
    setOutputMessage('');
    setParseSteps([]);
    setDerivation('');
    setCurrentStep(0);

    try {
      const response = await fetch('http://localhost:8080/api/ll1-solver/generate-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grammar })
      });

      const data = await response.json();
      
      setParseTable(data.parseTable);
      setFirstSets(data.firstSets);
      setFollowSets(data.followSets);
      // Handle both isLL1 and ll1 property names
      const isGrammarLL1 = data.isLL1 !== undefined ? data.isLL1 : data.ll1;
      setIsLL1(isGrammarLL1);
      setConflicts(data.conflicts || []);
      setOutputMessage(data.message);

      if (!isGrammarLL1 && data.conflicts && data.conflicts.length > 0) {
        const conflictDetails = data.conflicts.map(c => 
          `⚠️ Conflict at [${c.nonTerminal}, ${c.terminal}]: ${c.conflictType} - Multiple rules: ${c.conflictingProductions.join(' vs ')}`
        ).join('\n');
        setOutputMessage(data.message + '\n\n' + conflictDetails);
      }
    } catch (error) {
      setOutputMessage('❌ Error generating parse table: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunParser = async () => {
    if (!parseTable) {
      setOutputMessage('❌ Please generate parse table first');
      return;
    }

    if (!inputString.trim()) {
      setOutputMessage('❌ Please enter an input string');
      return;
    }

    if (!isLL1) {
      setOutputMessage('❌ Cannot parse: Grammar is not LL(1). Please fix conflicts first.');
      return;
    }

    setLoading(true);
    setOutputMessage('');
    setCurrentStep(0);
    setIsAnimating(false);

    try {
      const response = await fetch('http://localhost:8080/api/ll1-solver/run-parser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grammar, inputString })
      });

      const data = await response.json();
      
      setParseSteps(data.steps || []);
      setOutputMessage(data.message);
      setDerivation(data.derivation || '');
    } catch (error) {
      setOutputMessage('❌ Error running parser: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStepForward = () => {
    if (currentStep < parseSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAutoRun = () => {
    setIsAnimating(true);
    setCurrentStep(0);
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      
      if (step >= parseSteps.length - 1) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 1000);
  };

  const handleReset = () => {
    setParseTable(null);
    setParseSteps([]);
    setFirstSets(null);
    setFollowSets(null);
    setOutputMessage('');
    setDerivation('');
    setConflicts([]);
    setIsLL1(true);
    setCurrentStep(0);
    setIsAnimating(false);
  };

  const renderParseTable = () => {
    if (!parseTable) return null;

    const nonTerminals = Object.keys(parseTable);
    const terminals = [...new Set(
      Object.values(parseTable).flatMap(row => Object.keys(row))
    )].sort((a, b) => {
      if (a === '$') return 1;
      if (b === '$') return -1;
      return a.localeCompare(b);
    });

    const hasConflict = (nonTerminal, terminal) => {
      return conflicts.some(c => c.nonTerminal === nonTerminal && c.terminal === terminal);
    };

    return (
      <div className="parse-table-container">
        <h3>📊 LL(1) Parse Table</h3>
        <div className="table-wrapper">
          <table className="parse-table">
            <thead>
              <tr>
                <th className="table-header-cell">Non-Terminal</th>
                {terminals.map(terminal => (
                  <th key={terminal} className="table-header-cell terminal-header">
                    {terminal}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nonTerminals.map(nonTerminal => (
                <tr key={nonTerminal}>
                  <td className="nonterminal-cell">{nonTerminal}</td>
                  {terminals.map(terminal => {
                    const production = parseTable[nonTerminal][terminal];
                    const isConflict = hasConflict(nonTerminal, terminal);
                    return (
                      <td 
                        key={terminal} 
                        className={`table-cell ${production ? 'filled-cell' : 'empty-cell'} ${isConflict ? 'conflict-cell' : ''}`}
                        title={isConflict ? 'Conflict detected in this cell' : production || ''}
                      >
                        {production || ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFirstFollowSets = () => {
    if (!firstSets || !followSets) return null;

    return (
      <div className="first-follow-container">
        <button 
          className="toggle-button"
          onClick={() => setShowFirstFollow(!showFirstFollow)}
        >
          {showFirstFollow ? '▼' : '▶'} FIRST & FOLLOW Sets
        </button>
        
        {showFirstFollow && (
          <div className="sets-content">
            <div className="sets-column">
              <h4>FIRST Sets</h4>
              <table className="sets-table">
                <tbody>
                  {Object.entries(firstSets).map(([nonTerminal, symbols]) => (
                    <tr key={nonTerminal}>
                      <td className="set-nonterminal">FIRST({nonTerminal})</td>
                      <td className="set-values">= {`{ ${symbols.join(', ')} }`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="sets-column">
              <h4>FOLLOW Sets</h4>
              <table className="sets-table">
                <tbody>
                  {Object.entries(followSets).map(([nonTerminal, symbols]) => (
                    <tr key={nonTerminal}>
                      <td className="set-nonterminal">FOLLOW({nonTerminal})</td>
                      <td className="set-values">= {`{ ${symbols.join(', ')} }`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderParsingSteps = () => {
    if (parseSteps.length === 0) return null;

    const stepsToShow = parseSteps.slice(0, currentStep + 1);

    return (
      <div className="parsing-steps-container">
        <h3>🔍 Parsing Simulation</h3>
        
        <div className="step-controls">
          <button 
            onClick={handleStepBackward} 
            disabled={currentStep === 0 || isAnimating}
            className="control-button"
          >
            ⏮ Previous
          </button>
          <span className="step-counter">
            Step {currentStep + 1} / {parseSteps.length}
          </span>
          <button 
            onClick={handleStepForward} 
            disabled={currentStep >= parseSteps.length - 1 || isAnimating}
            className="control-button"
          >
            Next ⏭
          </button>
          <button 
            onClick={handleAutoRun} 
            disabled={isAnimating || currentStep >= parseSteps.length - 1}
            className="control-button auto-button"
          >
            ⏩ Auto Run
          </button>
          <button 
            onClick={() => setCurrentStep(0)} 
            disabled={currentStep === 0 || isAnimating}
            className="control-button"
          >
            🔁 Restart
          </button>
        </div>

        <div className="table-wrapper">
          <table className="steps-table">
            <thead>
              <tr>
                <th>Step</th>
                <th>Stack</th>
                <th>Input</th>
                <th>Action</th>
                <th>Production</th>
              </tr>
            </thead>
            <tbody>
              {stepsToShow.map((step, index) => (
                <tr 
                  key={index} 
                  className={`step-row ${index === currentStep ? 'current-step' : ''} ${step.action === 'Error' ? 'error-step' : ''} ${step.action === 'Accept' ? 'accept-step' : ''}`}
                >
                  <td className="step-number">{step.stepNumber}</td>
                  <td className="stack-cell">{step.stack}</td>
                  <td className="input-cell">{step.input}</td>
                  <td className="action-cell">{step.action}</td>
                  <td className="production-cell">{step.production || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {derivation && (
          <div className="derivation-container">
            <h4>📝 Derivation:</h4>
            <div className="derivation-text">{derivation}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="solver-container">
      <h1 className="main-title">⚙️ LL(1) Parser Solver</h1>
      <p className="subtitle">
        Automatically generate parse tables and simulate LL(1) parsing with step-by-step visualization
      </p>

      <div className="input-section">
        <div className="input-group grammar-input">
          <label className="input-label">
            <span className="label-icon">1️⃣</span> Grammar Input
            <span className="label-hint">(Use → or -&gt; and | for alternatives)</span>
          </label>
          <textarea
            className="grammar-textarea"
            value={grammar}
            onChange={(e) => setGrammar(e.target.value)}
            placeholder="Enter grammar rules, one per line&#10;Example:&#10;E → T E'&#10;E' → + T E' | ε"
            rows={8}
          />
        </div>

        <div className="input-group string-input">
          <label className="input-label">
            <span className="label-icon">2️⃣</span> Input String
            <span className="label-hint">(Tokens separated by spaces)</span>
          </label>
          <input
            type="text"
            className="string-input-field"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            placeholder="id + id * id"
          />
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="action-btn generate-btn"
          onClick={handleGenerateTable}
          disabled={loading}
        >
          🧮 {loading && !parseTable ? 'Generating...' : 'Compute LL(1) Table'}
        </button>
        <button 
          className="action-btn run-btn"
          onClick={handleRunParser}
          disabled={loading || !parseTable}
        >
          ▶️ {loading && parseTable ? 'Running...' : 'Run Parser'}
        </button>
        <button 
          className="action-btn reset-btn"
          onClick={handleReset}
          disabled={loading}
        >
          🔄 Reset
        </button>
      </div>

      {outputMessage && (
        <div className={`output-message ${outputMessage.includes('✅') ? 'success-message' : outputMessage.includes('❌') ? 'error-message' : 'warning-message'}`}>
          <pre>{outputMessage}</pre>
        </div>
      )}

      {renderFirstFollowSets()}
      {renderParseTable()}
      {renderParsingSteps()}

      <div className="info-section">
        <h3>💡 How to Use</h3>
        <ol className="info-list">
          <li><strong>Enter Grammar:</strong> Write your CFG with each production on a new line</li>
          <li><strong>Generate Table:</strong> Click "Compute LL(1) Table" to see FIRST/FOLLOW sets and parse table</li>
          <li><strong>Check for Conflicts:</strong> If grammar is not LL(1), conflicts will be highlighted in red</li>
          <li><strong>Enter Input String:</strong> Type the string you want to parse (tokens separated by spaces)</li>
          <li><strong>Run Parser:</strong> Watch step-by-step parsing simulation with stack and input visualization</li>
          <li><strong>Step Through:</strong> Use Previous/Next buttons to analyze each parsing step individually</li>
        </ol>
      </div>

      <style jsx>{`
        .solver-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .main-title {
          text-align: center;
          color: #2c3e50;
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .subtitle {
          text-align: center;
          color: #7f8c8d;
          font-size: 1.1em;
          margin-bottom: 30px;
        }

        .input-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-label {
          font-weight: 600;
          color: #34495e;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .label-icon {
          font-size: 1.2em;
        }

        .label-hint {
          font-size: 0.85em;
          color: #95a5a6;
          font-weight: normal;
          margin-left: auto;
        }

        .grammar-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #dfe6e9;
          border-radius: 8px;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 1em;
          line-height: 1.6;
          resize: vertical;
          transition: border-color 0.3s;
        }

        .grammar-textarea:focus {
          outline: none;
          border-color: #3498db;
        }

        .string-input-field {
          padding: 12px;
          border: 2px solid #dfe6e9;
          border-radius: 8px;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 1.1em;
          transition: border-color 0.3s;
        }

        .string-input-field:focus {
          outline: none;
          border-color: #3498db;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 12px 30px;
          font-size: 1.1em;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .generate-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
        }

        .run-btn {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .run-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(245, 87, 108, 0.4);
        }

        .reset-btn {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .reset-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(79, 172, 254, 0.4);
        }

        .output-message {
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
          white-space: pre-wrap;
        }

        .success-message {
          background: #d4edda;
          border: 2px solid #c3e6cb;
          color: #155724;
        }

        .error-message {
          background: #f8d7da;
          border: 2px solid #f5c6cb;
          color: #721c24;
        }

        .warning-message {
          background: #fff3cd;
          border: 2px solid #ffeaa7;
          color: #856404;
        }

        .first-follow-container {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .toggle-button {
          background: transparent;
          border: none;
          font-size: 1.1em;
          font-weight: 600;
          color: #2c3e50;
          cursor: pointer;
          padding: 10px;
          width: 100%;
          text-align: left;
          transition: color 0.3s;
        }

        .toggle-button:hover {
          color: #3498db;
        }

        .sets-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 15px;
        }

        .sets-column h4 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .sets-table {
          width: 100%;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .sets-table tr {
          border-bottom: 1px solid #dee2e6;
        }

        .set-nonterminal {
          padding: 8px;
          font-weight: 600;
          color: #8e44ad;
        }

        .set-values {
          padding: 8px;
          color: #2c3e50;
        }

        .parse-table-container {
          margin-bottom: 30px;
        }

        .parse-table-container h3 {
          color: #2c3e50;
          margin-bottom: 15px;
        }

        .table-wrapper {
          overflow-x: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .parse-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .table-header-cell {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px;
          font-weight: 600;
          border: 1px solid #5a67d8;
        }

        .terminal-header {
          text-align: center;
          min-width: 120px;
        }

        .nonterminal-cell {
          background: #f8f9fa;
          font-weight: 600;
          padding: 10px;
          color: #8e44ad;
          border: 1px solid #dee2e6;
        }

        .table-cell {
          padding: 10px;
          border: 1px solid #dee2e6;
          font-size: 0.9em;
        }

        .filled-cell {
          background: #e3f2fd;
          color: #1565c0;
        }

        .empty-cell {
          background: #fafafa;
          text-align: center;
          color: #bdc3c7;
        }

        .conflict-cell {
          background: #ffebee !important;
          color: #c62828 !important;
          font-weight: 600;
          border: 2px solid #ef5350 !important;
        }

        .parsing-steps-container {
          margin-bottom: 30px;
        }

        .parsing-steps-container h3 {
          color: #2c3e50;
          margin-bottom: 15px;
        }

        .step-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
        }

        .control-button {
          padding: 8px 16px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .control-button:hover:not(:disabled) {
          background: #2980b9;
          transform: translateY(-1px);
        }

        .control-button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .auto-button {
          background: #e74c3c;
        }

        .auto-button:hover:not(:disabled) {
          background: #c0392b;
        }

        .step-counter {
          font-weight: 600;
          color: #2c3e50;
          padding: 0 15px;
        }

        .steps-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .steps-table th {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 12px;
          font-weight: 600;
          border: 1px solid #f5576c;
        }

        .step-row {
          border-bottom: 1px solid #dee2e6;
          transition: background 0.3s;
        }

        .current-step {
          background: #fff9c4 !important;
          font-weight: 600;
        }

        .error-step {
          background: #ffebee;
          color: #c62828;
        }

        .accept-step {
          background: #e8f5e9;
          color: #2e7d32;
          font-weight: 600;
        }

        .step-row td {
          padding: 10px;
          border: 1px solid #dee2e6;
        }

        .step-number {
          text-align: center;
          font-weight: 600;
          color: #7f8c8d;
        }

        .stack-cell, .input-cell {
          font-weight: 600;
          color: #2c3e50;
        }

        .action-cell {
          color: #27ae60;
          font-weight: 600;
        }

        .production-cell {
          color: #8e44ad;
          font-style: italic;
        }

        .derivation-container {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #3498db;
        }

        .derivation-container h4 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .derivation-text {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          color: #34495e;
          line-height: 1.8;
          overflow-x: auto;
        }

        .info-section {
          background: #ecf0f1;
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
        }

        .info-section h3 {
          color: #2c3e50;
          margin-bottom: 15px;
        }

        .info-list {
          color: #34495e;
          line-height: 1.8;
          padding-left: 20px;
        }

        .info-list li {
          margin-bottom: 10px;
        }

        .info-list strong {
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .input-section {
            grid-template-columns: 1fr;
          }

          .sets-content {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Solver;
