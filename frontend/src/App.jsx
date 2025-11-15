import { useState } from 'react'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch(`${API_BASE_URL}/spectra/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          context: {}
        })
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderResponse = () => {
    if (!response) return null

    if (response.error) {
      return (
        <div className="response-container error">
          <h3>No Wake Phrase Detected</h3>
          <p>{response.message}</p>
        </div>
      )
    }

    return (
      <div className="response-container success">
        <div className="response-header">
          <span className="intent-badge">{response.intent}</span>
          <span className="extracted-message">{response.extracted_message}</span>
        </div>

        {response.intent === 'SELF_TRANSLATE' && response.response && (
          <div className="response-content">
            <h3>Translation</h3>
            <p className="main-response">{response.response.translation}</p>
            <div className="meta">
              <span>Tone: {response.response.tone}</span>
              <span>Confidence: {response.response.confidence}</span>
            </div>
            {response.response.suggestions && (
              <div className="suggestions">
                <h4>Alternative Phrasings:</h4>
                <ul>
                  {response.response.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {response.intent === 'OTHER_TRANSLATE' && response.response && (
          <div className="response-content">
            <h3>Decoded Message</h3>
            <p className="subject">Analyzing: "{response.response.subject_analyzed}"</p>

            <div className="tone-analysis">
              <h4>Tone Analysis</h4>
              <div className="meta">
                <span>Primary Tone: {response.response.tone_analysis.primary_tone}</span>
                <span>Hostility: {response.response.tone_analysis.hostility_level}</span>
                <span>Formality: {response.response.tone_analysis.formality}</span>
              </div>
            </div>

            <div className="possible-meanings">
              <h4>Possible Meanings</h4>
              <ul>
                {response.response.possible_meanings.map((meaning, idx) => (
                  <li key={idx}>{meaning}</li>
                ))}
              </ul>
            </div>

            <div className="recommendation">
              <strong>Recommendation:</strong> {response.response.recommendation}
            </div>
          </div>
        )}

        {response.intent === 'REGULATE' && response.response && (
          <div className="response-content regulate">
            <h3>Regulation Support</h3>

            <div className="distress-level">
              <span className={`level-badge ${response.response.distress_level}`}>
                {response.response.distress_level.toUpperCase()} DISTRESS
              </span>
            </div>

            <div className="validation">
              <p className="validation-text">{response.response.validation}</p>
            </div>

            <div className="grounding">
              <h4>{response.response.grounding_technique.name}</h4>
              <p className="duration">Duration: {response.response.grounding_technique.duration}</p>
              <ol>
                {response.response.grounding_technique.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="immediate-actions">
              <h4>Immediate Actions</h4>
              <ul>
                {response.response.immediate_actions.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
            </div>

            <div className="follow-up">
              <p>{response.response.follow_up}</p>
            </div>
          </div>
        )}

        {response.intent === 'UNKNOWN' && (
          <div className="response-content">
            <h3>Unknown Intent</h3>
            <p>{response.response?.message || "I heard you, but I'm not sure how to help with that yet."}</p>
            {response.response?.suggestion && (
              <p className="suggestion">{response.response.suggestion}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  const exampleCommands = [
    "Hi Spectra, what was I trying to say?",
    "Hey Spectra, what did they mean by that?",
    "High Spectra, I'm overwhelmed right now",
    "Hi Spectra, help me express this clearly"
  ]

  return (
    <div className="app">
      <header>
        <h1>Hi-Spectra</h1>
        <p className="tagline">Your continuous cognitive bridge</p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-group">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Start with 'Hi Spectra', 'High Spectra', or 'Hey Spectra'..."
              rows="4"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading || !message.trim()}>
            {loading ? 'Processing...' : 'Send to Spectra'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {renderResponse()}

        <div className="examples">
          <h3>Example Commands</h3>
          <div className="example-grid">
            {exampleCommands.map((cmd, idx) => (
              <button
                key={idx}
                className="example-button"
                onClick={() => setMessage(cmd)}
                disabled={loading}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer>
        <p>Hi-Spectra v0.1.0 - MVP</p>
      </footer>
    </div>
  )
}

export default App
