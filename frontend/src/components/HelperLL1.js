import React, { useState } from 'react';

const HelperLL1 = () => {
  const [grammar, setGrammar] = useState('');
  
  const [inputString, setInputString] = useState('');
  const [currentStack, setCurrentStack] = useState('');
  const [remainingInput, setRemainingInput] = useState('');
  const [lastAction, setLastAction] = useState('');
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFirstFollow, setShowFirstFollow] = useState(false);

  const handleAnalyze = async () => {
    if (!grammar.trim() || !currentStack.trim() || !remainingInput.trim()) {
      setAnalysis({
        status: 'ERROR',
        mainMessage: '❌ Please fill in grammar, stack, and remaining input'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/ll1-helper/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grammar,
          inputString,
          currentStack,
          remainingInput,
          lastAction: lastAction || null
        })
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      setAnalysis({
        status: 'ERROR',
        mainMessage: '❌ Error analyzing parsing state: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCurrentStack('');
    setRemainingInput('');
    setLastAction('');
    setAnalysis(null);
  };

  const applySuggestion = () => {
    if (analysis?.suggestion) {
      if (analysis.suggestion.nextStack) {
        setCurrentStack(analysis.suggestion.nextStack);
      }
      if (analysis.suggestion.nextInput) {
        setRemainingInput(analysis.suggestion.nextInput);
      }
      setLastAction('');
      setAnalysis(null);
    }
  };

  const renderAnalysisResult = () => {
    if (!analysis) return null;

    const statusColors = {
      'CORRECT': '#d4edda',
      'ERROR': '#f8d7da',
      'WARNING': '#fff3cd'
    };

    const statusBorders = {
      'CORRECT': '#c3e6cb',
      'ERROR': '#f5c6cb',
      'WARNING': '#ffeaa7'
    };

    const statusTextColors = {
      'CORRECT': '#155724',
      'ERROR': '#721c24',
      'WARNING': '#856404'
    };

    return (
      <div className="analysis-result" style={{
        background: statusColors[analysis.status] || '#f8f9fa',
        border: `2px solid ${statusBorders[analysis.status] || '#dee2e6'}`,
        color: statusTextColors[analysis.status] || '#2c3e50',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>{analysis.mainMessage}</h3>

        {/* Diagnostic Info */}
        {analysis.diagnostic && (
          <div className="diagnostic-section" style={{
            background: 'rgba(255,255,255,0.6)',
            padding: '15px',
            borderRadius: '6px',
            marginTop: '15px'
          }}>
            <h4 style={{ color: '#e74c3c' }}>🔍 Diagnostic</h4>
            <div style={{ fontFamily: 'Consolas, Monaco, monospace' }}>
              <p><strong>Error Type:</strong> {analysis.diagnostic.errorType}</p>
              <p><strong>Top Symbol:</strong> {analysis.diagnostic.topSymbol}</p>
              <p><strong>Lookahead:</strong> {analysis.diagnostic.lookahead}</p>
              {analysis.diagnostic.expectedProduction && (
                <p><strong>Expected:</strong> {analysis.diagnostic.expectedProduction}</p>
              )}
              {analysis.diagnostic.actualAction && (
                <p><strong>Your Action:</strong> {analysis.diagnostic.actualAction}</p>
              )}
            </div>
          </div>
        )}

        {/* Explanation */}
        {analysis.explanation && (
          <div className="explanation-section" style={{
            background: 'rgba(255,255,255,0.6)',
            padding: '15px',
            borderRadius: '6px',
            marginTop: '15px'
          }}>
            <h4 style={{ color: '#3498db' }}>💡 Explanation</h4>
            
            {analysis.explanation.procedural && (
              <div style={{ marginBottom: '10px' }}>
                <strong>What Happened:</strong>
                <p>{analysis.explanation.procedural}</p>
              </div>
            )}
            
            {analysis.explanation.conceptual && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Why This Matters:</strong>
                <p>{analysis.explanation.conceptual}</p>
              </div>
            )}
            
            {analysis.explanation.ruleExplanation && (
              <div style={{ marginBottom: '10px' }}>
                <strong>The Rule:</strong>
                <p>{analysis.explanation.ruleExplanation}</p>
              </div>
            )}
            
            {analysis.explanation.keyPoints && analysis.explanation.keyPoints.length > 0 && (
              <div>
                <strong>Key Learning Points:</strong>
                <ul style={{ marginTop: '8px' }}>
                  {analysis.explanation.keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Suggestion */}
        {analysis.suggestion && (
          <div className="suggestion-section" style={{
            background: 'rgba(255,255,255,0.6)',
            padding: '15px',
            borderRadius: '6px',
            marginTop: '15px'
          }}>
            <h4 style={{ color: '#27ae60' }}>✅ Suggestion</h4>
            
            {analysis.suggestion.correctedAction && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Correct Action:</strong>
                <p style={{
                  fontFamily: 'Consolas, Monaco, monospace',
                  background: '#e8f5e9',
                  padding: '8px',
                  borderRadius: '4px',
                  color: '#2e7d32'
                }}>{analysis.suggestion.correctedAction}</p>
              </div>
            )}
            
            {analysis.suggestion.reasoning && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Why:</strong>
                <p>{analysis.suggestion.reasoning}</p>
              </div>
            )}
            
            {analysis.suggestion.steps && analysis.suggestion.steps.length > 0 && (
              <div>
                <strong>Next Steps:</strong>
                <ol style={{ marginTop: '8px' }}>
                  {analysis.suggestion.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            
            {(analysis.suggestion.nextStack || analysis.suggestion.nextInput) && (
              <button
                onClick={applySuggestion}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1em',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🔄 Continue from Fixed State
              </button>
            )}
          </div>
        )}

        {/* FIRST & FOLLOW Sets */}
        {(analysis.firstSets || analysis.followSets) && (
          <div className="sets-section" style={{ marginTop: '20px' }}>
            <button
              onClick={() => setShowFirstFollow(!showFirstFollow)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.1em',
                fontWeight: '600',
                color: '#2c3e50',
                cursor: 'pointer',
                padding: '10px',
                width: '100%',
                textAlign: 'left'
              }}
            >
              {showFirstFollow ? '▼' : '▶'} FIRST & FOLLOW Sets
            </button>
            
            {showFirstFollow && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginTop: '10px',
                background: 'rgba(255,255,255,0.6)',
                padding: '15px',
                borderRadius: '6px'
              }}>
                {analysis.firstSets && (
                  <div>
                    <h5>FIRST Sets</h5>
                    {Object.entries(analysis.firstSets).map(([nt, symbols]) => (
                      <div key={nt} style={{ fontFamily: 'Consolas, Monaco, monospace', marginBottom: '5px' }}>
                        <strong>FIRST({nt})</strong> = {`{ ${symbols.join(', ')} }`}
                      </div>
                    ))}
                  </div>
                )}
                
                {analysis.followSets && (
                  <div>
                    <h5>FOLLOW Sets</h5>
                    {Object.entries(analysis.followSets).map(([nt, symbols]) => (
                      <div key={nt} style={{ fontFamily: 'Consolas, Monaco, monospace', marginBottom: '5px' }}>
                        <strong>FOLLOW({nt})</strong> = {`{ ${symbols.join(', ')} }`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="helper-container" style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '10px' }}>
        💡 LL(1) Parser Helper
      </h1>
      <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '30px' }}>
        Get intelligent help with your LL(1) parsing — understand your mistakes and learn the concepts
      </p>

      {/* Grammar Input */}
      <div className="input-section" style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: '600', color: '#34495e', marginBottom: '8px', display: 'block' }}>
          🔹 Grammar Input
        </label>
        <textarea
          value={grammar}
          onChange={(e) => setGrammar(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #dfe6e9',
            borderRadius: '8px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '1em',
            lineHeight: '1.6',
            resize: 'vertical',
            minHeight: '120px'
          }}
          placeholder="Enter your grammar..."
        />
      </div>

      {/* Input String */}
      <div className="input-section" style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: '600', color: '#34495e', marginBottom: '8px', display: 'block' }}>
          🔹 Full Input String
        </label>
        <input
          type="text"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #dfe6e9',
            borderRadius: '8px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '1.1em'
          }}
          placeholder="e.g., id + id * id"
        />
      </div>

      {/* Current Parsing State */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '2px solid #e9ecef'
      }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>📊 Current Parsing State</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ fontWeight: '600', color: '#34495e', marginBottom: '8px', display: 'block' }}>
              Stack (top-to-bottom):
            </label>
            <input
              type="text"
              value={currentStack}
              onChange={(e) => setCurrentStack(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #dfe6e9',
                borderRadius: '8px',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '1.1em',
                background: 'white'
              }}
              placeholder="e.g., E'T$"
            />
          </div>
          
          <div>
            <label style={{ fontWeight: '600', color: '#34495e', marginBottom: '8px', display: 'block' }}>
              Remaining Input:
            </label>
            <input
              type="text"
              value={remainingInput}
              onChange={(e) => setRemainingInput(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #dfe6e9',
                borderRadius: '8px',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '1.1em',
                background: 'white'
              }}
              placeholder="e.g., +id*id$"
            />
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ fontWeight: '600', color: '#34495e', marginBottom: '8px', display: 'block' }}>
            Last Action (optional):
          </label>
          <input
            type="text"
            value={lastAction}
            onChange={(e) => setLastAction(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #dfe6e9',
              borderRadius: '8px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '1em',
              background: 'white'
            }}
            placeholder="e.g., Applied E' → ε"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        marginBottom: '30px'
      }}>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            padding: '12px 30px',
            fontSize: '1.1em',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#bdc3c7' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            transition: 'all 0.3s'
          }}
        >
          {loading ? '⏳ Analyzing...' : '🔍 Analyze My Progress'}
        </button>
        
        <button
          onClick={handleClear}
          style={{
            padding: '12px 30px',
            fontSize: '1.1em',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            transition: 'all 0.3s'
          }}
        >
          🧹 Clear All
        </button>
      </div>

      {/* Analysis Result */}
      {renderAnalysisResult()}

      {/* Help Info */}
      <div style={{
        background: '#ecf0f1',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '30px'
      }}>
        <h3 style={{ color: '#2c3e50' }}>💡 How to Use the Helper</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.8' }}>
          <li><strong>Enter your grammar</strong> and the <strong>full input string</strong> you're trying to parse</li>
          <li><strong>Fill in your current parsing state:</strong> Stack (top-to-bottom) and Remaining Input</li>
          <li><strong>Optionally</strong> describe what action you just took or are trying to take</li>
          <li>Click <strong>"Analyze My Progress"</strong> to get intelligent feedback</li>
          <li>The Helper will:
            <ul style={{ marginTop: '8px' }}>
              <li>✅ Confirm if you're on the right track</li>
              <li>❌ Identify mistakes and explain <em>why</em> they're wrong</li>
              <li>💡 Teach you the underlying LL(1) concepts</li>
              <li>🔄 Suggest the correct action and help you continue</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HelperLL1;
