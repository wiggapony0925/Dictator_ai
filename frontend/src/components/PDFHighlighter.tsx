import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Text } from '@radix-ui/themes';
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
    }, [currentSegment?.page]);

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

    return (
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
                                width={pageWidth}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                onLoadSuccess={(page) => {
                                    // Calculate scale: Rendered Width / Original PDF Point Width
                                    // page.originalWidth is usually in points (1/72 inch)
                                    const scale = pageWidth / page.originalWidth;
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
    );
};
