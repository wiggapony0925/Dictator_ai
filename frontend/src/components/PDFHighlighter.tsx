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
}

export const PDFHighlighter: React.FC<PDFHighlighterProps> = ({ pdfUrl, currentSegment }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [pageWidth] = useState(600); // Default, will update on resize?

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
                            />

                            {/* Highlight Overlay */}
                            {isCurrentPage && currentSegment && (
                                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'multiply' }}>
                                    {/* Render multiple rects if available, else fallback to bbox */}
                                    {(currentSegment.rects && currentSegment.rects.length > 0 ? currentSegment.rects : [currentSegment.bbox]).map((box, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                position: 'absolute',
                                                left: `${box[0]}px`,
                                                top: `${box[1]}px`,
                                                width: `${box[2] - box[0]}px`,
                                                height: `${box[3] - box[1]}px`,
                                                backgroundColor: 'rgba(255, 255, 0, 0.4)',
                                                border: '2px solid rgba(255, 255, 0, 0.8)',
                                                borderRadius: '4px',
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </Box>
                    );
                })}
            </Document>
        </Box>
    );
};
