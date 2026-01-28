import { Flex, Heading, Text, Button, Box, Card } from '@radix-ui/themes';
import { useDictator } from './hooks/useDictator';
import { Player } from './components/Player';
import { Reader } from './components/Reader';
import { SettingsDialog } from './components/SettingsDialog';
import { PDFHighlighter } from './components/PDFHighlighter';
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
    togglePlay
  } = useDictator();

  const currentSegment = currentSegmentIndex >= 0 && currentSegmentIndex < segments.length
    ? segments[currentSegmentIndex]
    : null;

  return (
    <div className="app-container">
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-content">
          <Box>
            <Heading size="5" weight="bold" highContrast>Dictator AI</Heading>
            <Text size="2" color="gray">Interactive PDF Reader</Text>
          </Box>

          <Flex className="controls" gap="3" align="center">
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

            <SettingsDialog apiKey={apiKey} setApiKey={setApiKey} />
          </Flex>
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="main-grid">
        {/* Left: PDF with Highlighter */}
        <div className="panel-left">
          {pdfUrl ? (
            <PDFHighlighter
              pdfUrl={pdfUrl}
              currentSegment={currentSegment}
            />
          ) : (
            <Flex align="center" justify="center" style={{ height: '100%' }}>
              <Text color="gray">No PDF loaded</Text>
            </Flex>
          )}
        </div>

        {/* Right: Reader */}
        <div className="panel-right">
          <Reader
            pdfUrl={pdfUrl}
            segments={segments}
            currentSegmentIndex={currentSegmentIndex}
            onSegmentClick={playSegment}
          />
        </div>
      </div>

      {/* Floating Player */}
      {segments.length > 0 && (
        <div className="player-wrapper">
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
