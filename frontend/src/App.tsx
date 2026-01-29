import { useState, useEffect } from 'react';
import { Heading, Text, Button, Box, Card, Flex } from '@radix-ui/themes';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { useDictator } from './hooks/useDictator';
import { LoadingOverlay } from './components/LoadingOverlay';
import { Player } from './components/Player';
import { Reader } from './components/Reader';
import { SettingsSheet } from './components/SettingsSheet';
import { PDFHighlighter } from './components/PDFHighlighter';
import { Dropzone } from './components/Dropzone';
import { Upload, Trash2 } from 'lucide-react';
import './styles/main.scss';

function App() {
  const {
    apiKey,
    setApiKey,
    file,
    handleFileChange,
    handleConvert,
    resetState,
    segments,
    pdfUrl,
    currentSegmentIndex,
    isPlaying,
    isLoading,
    error,
    setError,
    playSegment,
    togglePlay,
    voice, setVoice,
    speed, setSpeed,
    modelStrategy, setModelStrategy,
    hasStartedReading,

  } = useDictator();

  // Mobile Responsive Check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentSegment = currentSegmentIndex >= 0 && currentSegmentIndex < segments.length
    ? segments[currentSegmentIndex]
    : null;

  return (
    <div className="app-shell">
      {/* Navbar */}
      <div className="app-navbar">
        <div className="app-navbar__content">
          <Flex align="center" gap="3">
            <img src="/logo.png" alt="Dictator AI Logo" style={{ height: 32, width: 'auto' }} />
            {!isMobile && (
              <Box>
                <Heading size="4" weight="bold" highContrast>Dictator AI</Heading>
              </Box>
            )}
          </Flex>

          <Flex className="app-navbar__controls" gap="3" align="center">
            <form onSubmit={handleConvert} style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
              {/* Hidden Input */}
              <input
                type="file"
                id="file"
                accept=".pdf"
                hidden
                onChange={handleFileChange}
              />

              <Button
                variant="surface"
                type="button"
                onClick={() => document.getElementById('file')?.click()}
                style={isMobile ? { padding: '0 8px' } : {}}
              >
                <Upload size={16} />
                {!isMobile && (file ? (file.name.length > 20 ? file.name.substring(0, 18) + '...' : file.name) : 'Select PDF')}
              </Button>

              {file && (
                <Button
                  type="button"
                  color="red"
                  variant="soft"
                  onClick={resetState}
                  title="Remove PDF"
                  style={{ padding: '0 8px' }}
                >
                  <Trash2 size={16} />
                </Button>
              )}

              <Button
                type="button"
                disabled={!file || isLoading || hasStartedReading || segments.length === 0 || !apiKey}
                onClick={() => {
                  if (segments.length > 0) playSegment(0);
                }}
                color={!apiKey && file ? "gray" : "blue"}
                style={isMobile ? { padding: '0 12px' } : {}}
              >
                {!apiKey ? (isMobile ? "Key" : "Enter API Key") :
                  (hasStartedReading ? (isMobile ? "..." : "Reading...") : (isMobile ? "Read" : "Start Reading"))}
              </Button>
            </form>

            {/* Navbar Controls */}
            <SettingsSheet
              apiKey={apiKey}
              setApiKey={setApiKey}
              voice={voice}
              setVoice={setVoice}
              speed={speed}
              setSpeed={setSpeed}
              modelStrategy={modelStrategy}
              setModelStrategy={setModelStrategy}
            />
          </Flex>
        </div>
      </div>

      {/* Main Content */}
      <div className="split-view">
        {pdfUrl ? (
          isMobile ? (
            /* Mobile Layout: Stacked Layers using BEM */
            <div className="mobile-layout">
              {/* Layer 1: PDF (Full Screen Background) */}
              <div className="mobile-layout__pdf-layer">
                <PDFHighlighter
                  pdfUrl={pdfUrl}
                  currentSegment={currentSegment}
                  segments={segments}
                  onSegmentClick={playSegment}
                />
              </div>

              {/* Layer 2: Reader (Bottom Sheet) */}
              <div className="mobile-layout__bottom-sheet">
                {/* Handle */}
                <div className="mobile-layout__bottom-sheet-handle-area">
                  <div className="mobile-layout__bottom-sheet-handle-bar"></div>
                </div>

                <div className="mobile-layout__bottom-sheet-content">
                  <Reader
                    pdfUrl={pdfUrl}
                    segments={segments}
                    currentSegmentIndex={currentSegmentIndex}
                    onSegmentClick={playSegment}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Layout: Resizable Horizontal Split */
            <PanelGroup orientation="horizontal" style={{ height: '100%' }}>
              {/* Left: PDF */}
              <Panel defaultSize={50} minSize={20} className="split-view__panel--left">
                <PDFHighlighter
                  pdfUrl={pdfUrl}
                  currentSegment={currentSegment}
                  segments={segments}
                  onSegmentClick={playSegment}
                />
              </Panel>

              <PanelResizeHandle className="resize-handle">
                <div className="resize-handle__bar" />
              </PanelResizeHandle>

              {/* Right: Reader */}
              <Panel defaultSize={50} minSize={20} className="split-view__panel--right">
                <Reader
                  pdfUrl={pdfUrl}
                  segments={segments}
                  currentSegmentIndex={currentSegmentIndex}
                  onSegmentClick={playSegment}
                />
              </Panel>
            </PanelGroup>
          )
        ) : (
          <div style={{ height: '100%', padding: '2rem' }}>
            <Dropzone
              onFileSelect={(f) => {
                const dt = new DataTransfer();
                dt.items.add(f);
                const input = document.getElementById('file') as HTMLInputElement;
                if (input) {
                  input.files = dt.files;
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }}
              onError={(msg) => setError(msg)}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Floating Player */}
      {segments.length > 0 && (
        <div className="audio-player-wrapper">
          <Player
            currentSegmentIndex={currentSegmentIndex}
            totalSegments={segments.length}
            isPlaying={isPlaying}
            onPlayPause={togglePlay}
            onSeek={playSegment}
          />
        </div>
      )}

      {/* Error Toast */}
      {/* Error Toast */}
      {error && (
        <Box position="absolute" top="5" right="5" style={{ zIndex: 9999 }}>
          <Card style={{ backgroundColor: 'var(--red-3)', color: 'var(--red-11)' }}>
            <Flex gap="3" align="center">
              <Text>{error}</Text>
              <Button size="1" color="red" variant="soft" onClick={() => setError(null)}>X</Button>
            </Flex>
          </Card>
        </Box>
      )}

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay message="Analyzing PDF..." />}
    </div>
  );
}

export default App;
