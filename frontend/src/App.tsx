import { useState, useEffect } from 'react';
import { Heading, Text, Button, Box, Card, Flex } from '@radix-ui/themes';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { useDictator } from './hooks/useDictator';
import { Player } from './components/Player';
import { Reader } from './components/Reader';
import { SettingsDialog } from './components/SettingsDialog';
import { PDFHighlighter } from './components/PDFHighlighter';
import { Dropzone } from './components/Dropzone';
import { Upload } from 'lucide-react';

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
    togglePlay,
    voice, setVoice,
    speed, setSpeed,
    modelStrategy, setModelStrategy,

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
          <Box>
            <Heading size="5" weight="bold" highContrast>Dictator AI</Heading>
            <Text size="2" color="gray">Interactive PDF Reader</Text>
          </Box>

          <Flex className="app-navbar__controls" gap="3" align="center">
            <form onSubmit={handleConvert} style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
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
              >
                <Upload size={16} />
                {file ? file.name : 'Select PDF'}
              </Button>

              <Button type="submit" disabled={!file || isLoading}>
                {isLoading ? 'Processing...' : 'Read'}
              </Button>
            </form>

            <SettingsDialog
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

      {/* Main Content: Split View / Droppable Panel */}
      <div className="split-view">
        {pdfUrl ? (
          <PanelGroup orientation={isMobile ? "vertical" : "horizontal"}>
            {/* Left: PDF */}
            <Panel defaultSize={50} minSize={20} className="split-view__panel--left">
              <PDFHighlighter
                pdfUrl={pdfUrl}
                currentSegment={currentSegment}
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
        ) : (
          <div style={{ height: '100%', padding: '2rem' }}>
            <Dropzone onFileSelect={(f) => {
              const dt = new DataTransfer();
              dt.items.add(f);
              const input = document.getElementById('file') as HTMLInputElement;
              if (input) {
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }} isLoading={isLoading} />
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
      {error && (
        <Box position="absolute" top="5" right="5" style={{ zIndex: 20 }}>
          <Card style={{ backgroundColor: 'var(--red-3)', color: 'var(--red-11)' }}>
            <Flex gap="3" align="center">
              <Text>{error}</Text>
              <Button size="1" color="red" variant="soft" onClick={() => setError(null)}>X</Button>
            </Flex>
          </Card>
        </Box>
      )}
    </div>
  );
}

export default App;
