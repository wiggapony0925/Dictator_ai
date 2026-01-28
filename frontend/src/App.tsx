
import { Player } from './components/Player';
import { Reader } from './components/Reader';
import { SettingsDialog } from './components/SettingsDialog';
import { useDictator } from './hooks/useDictator';
import './global.css';

function App() {
  const {
    apiKey,
    setApiKey,
    file,
    handleFileChange,
    handleConvert,
    segments,
    pdfUrl,
    currentSegmentIndex,
    isPlaying,
    isLoading,
    error,
    setError,
    playSegment,
    togglePlay
  } = useDictator();

  return (
    <div className="app-container">
      {/* Sidebar */}
      <header className="sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="brand">
            <h1>Dictator AI</h1>
            <p>Interactive PDF Reader</p>
          </div>
          <SettingsDialog apiKey={apiKey} setApiKey={setApiKey} />
        </div>

        <div className="controls">
          <form onSubmit={handleConvert}>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="file"
                accept=".pdf"
                hidden
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="btn secondary"
                onClick={() => document.getElementById('file')?.click()}
              >
                Select PDF
              </button>
              <span id="filename">{file ? file.name : 'No file selected'}</span>
            </div>

            <button
              type="submit"
              className="btn primary"
              disabled={isLoading || !file}
            >
              Load & Read
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <Reader
        pdfUrl={pdfUrl}
        segments={segments}
        currentSegmentIndex={currentSegmentIndex}
        onSegmentClick={playSegment}
      />

      {/* Player */}
      {segments.length > 0 && (
        <Player
          currentSegmentIndex={currentSegmentIndex}
          totalSegments={segments.length}
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
          onSeek={playSegment}
        />
      )}

      {/* Overlays */}
      {isLoading && (
        <div className="overlay">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem' }}>Processing PDF...</p>
        </div>
      )}

      {error && (
        <div className="overlay">
          <div className="error-box">
            <h3>Error</h3>
            <p id="error-msg">{error}</p>
            <button
              className="btn secondary"
              onClick={() => setError(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
