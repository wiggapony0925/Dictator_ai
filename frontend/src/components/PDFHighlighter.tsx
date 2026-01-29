import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Text, Flex, IconButton } from '@radix-ui/themes';
import { Minus, Plus, Maximize } from 'lucide-react';
import type { Segment } from '../types';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFHighlighterProps {
    pdfUrl: string;
    currentSegment: Segment | null;
    segments: Segment[];
    onSegmentClick: (index: number) => void;
}

export const PDFHighlighter: React.FC<PDFHighlighterProps> = ({ pdfUrl, currentSegment, segments, onSegmentClick }) => {
    // Store scaling factors per page (pageNumber -> scale)
    const [pageScales, setPageScales] = useState<Record<number, number>>({});
    const [numPages, setNumPages] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [pageWidth, setPageWidth] = useState(600);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const [zoomScale, setZoomScale] = useState(1.0);

    // For scrolling to the active page
    const activePageRef = useRef<HTMLDivElement>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Scroll active page into view
    useEffect(() => {
        if (activePageRef.current && currentSegment) {
            activePageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentSegment, currentSegment?.page]);

    // Resize Observer to adjust page width
    useEffect(() => {
        if (!containerRef.current) return;

        resizeObserverRef.current = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Subtract padding (current padding is 20px * 2 = 40px)
                // Using 40px subtraction to keep it safe inside the container
                const newWidth = entry.contentRect.width - 40;
                setPageWidth(prev => Math.abs(prev - newWidth) > 10 ? newWidth : prev);
            }
        });

        resizeObserverRef.current.observe(containerRef.current);

        return () => {
            resizeObserverRef.current?.disconnect();
        };
    }, []);

    // Zoom Handlers
    const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 2.5));
    const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.5));
    const handleFitWidth = () => setZoomScale(1.0);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Scrollable Content */}
            <Box
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    overflowY: 'auto',
                    backgroundColor: 'var(--gray-3)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}
            >
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<Text>Loading PDF...</Text>}
                    error={<Text color="red">Failed to load PDF</Text>}
                >
                    {Array.from(new Array(numPages), (_, index) => {
                        const pageNum = index + 1;
                        const isCurrentPage = currentSegment?.page === pageNum;

                        return (
                            <Box
                                key={`page_${pageNum}`}
                                style={{ position: 'relative', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                ref={isCurrentPage ? activePageRef : null}
                            >
                                <Page
                                    pageNumber={pageNum}
                                    width={pageWidth * zoomScale}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    onLoadSuccess={(page) => {
                                        // Calculate scale: Rendered Width / Original PDF Point Width
                                        // page.originalWidth is usually in points (1/72 inch)
                                        const scale = (pageWidth * zoomScale) / page.originalWidth;
                                        setPageScales(prev => ({ ...prev, [pageNum]: scale }));
                                    }}
                                />

                                {/* Highlight Overlay */}
                                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'multiply' }}>
                                    {(segments || []).filter(s => s.page === pageNum).map((seg) => {
                                        const isActive = currentSegment && currentSegment.id === seg.id;
                                        const rects = seg.rects && seg.rects.length > 0 ? seg.rects : [seg.bbox];
                                        const scale = pageScales[pageNum] || 1; // Default to 1 if not loaded yet

                                        return rects.map((box, i) => (
                                            <div
                                                key={`${seg.id}-${i}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const originalIndex = segments.findIndex(s => s === seg);
                                                    if (originalIndex !== -1) onSegmentClick(originalIndex);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    // Apply Scale to Coordinates
                                                    left: `${box[0] * scale}px`,
                                                    top: `${box[1] * scale}px`,
                                                    width: `${(box[2] - box[0]) * scale}px`,
                                                    height: `${(box[3] - box[1]) * scale}px`,

                                                    backgroundColor: isActive ? 'rgba(255, 255, 0, 0.4)' : undefined,
                                                    border: isActive ? '2px solid rgba(255, 255, 0, 0.8)' : 'none',
                                                    borderRadius: '3px',
                                                    cursor: 'pointer',
                                                    pointerEvents: 'auto',
                                                    touchAction: 'manipulation',
                                                }}
                                                className={!isActive ? "pdf-hover-highlight" : ""}
                                            />
                                        ));
                                    })}
                                    <style>{`
                                        .pdf-hover-highlight:hover {
                                            background-color: rgba(255, 220, 0, 0.2);
                                            border: 1px solid rgba(255, 220, 0, 0.5);
                                        }
                                    `}</style>
                                </div>
                            </Box>
                        );
                    })}
                </Document>
            </Box>

            {/* Floating Zoom Toolbar */}
            <Box
                style={{
                    position: 'absolute',
                    bottom: 30,
                    right: 30,
                    // left and transform removed to position in corner
                    zIndex: 200, // Above PDF, below Players/Toasts (9990+)
                }}
            >
                <Flex
                    align="center"
                    gap="3"
                    style={{
                        backgroundColor: 'grey',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '999px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '1px solid var(--gray-6)'
                    }}
                >
                    <IconButton variant="solid" highContrast color="gray" onClick={handleZoomOut} disabled={zoomScale <= 0.5}>
                        <Minus size={18} />
                    </IconButton>
                    <Text size="2" weight="bold" style={{ minWidth: 40, textAlign: 'center' }}>
                        {Math.round(zoomScale * 100)}%
                    </Text>
                    <IconButton variant="solid" highContrast color="gray" onClick={handleZoomIn} disabled={zoomScale >= 2.5}>
                        <Plus size={18} />
                    </IconButton>
                    {zoomScale !== 1.0 && (
                        <>
                            <div style={{ width: 1, height: 16, backgroundColor: 'var(--gray-6)' }} />
                            <IconButton size="1" variant="solid" highContrast color="gray" onClick={handleFitWidth} title="Fit Width">
                                <Maximize size={16} />
                            </IconButton>
                        </>
                    )}
                </Flex>
            </Box>
        </div>
    );
};
