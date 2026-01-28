import React, { useEffect, useRef } from 'react';

interface Segment {
    id: number;
    text: string;
}

interface ReaderProps {
    pdfUrl: string;
    segments: Segment[];
    currentSegmentIndex: number;
    onSegmentClick: (index: number) => void;
}

export const Reader: React.FC<ReaderProps> = ({
    pdfUrl,
    segments,
    currentSegmentIndex,
    onSegmentClick,
}) => {
    const activeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentSegmentIndex]);

    return (
        <main className="split-view" id="main-view">
            {/* Left: PDF Viewer */}
            <div className="panel pdf-panel">
                <h2 className="panel-title">Original Document</h2>
                <iframe id="pdf-frame" src={pdfUrl} title="PDF Viewer" />
            </div>

            {/* Right: Reader Mode */}
            <div className="panel reader-panel">
                <h2 className="panel-title">Reader View</h2>
                <div id="segments-container" className="segments-list">
                    {segments.length === 0 ? (
                        <div className="placeholder" style={{ padding: '2rem', color: '#94a3b8' }}>
                            Upload a PDF to start reading...
                        </div>
                    ) : (
                        <>
                            {segments.map((seg, index) => (
                                <div
                                    key={index}
                                    ref={index === currentSegmentIndex ? activeRef : null}
                                    className={`segment ${index === currentSegmentIndex ? 'active' : ''}`}
                                    onClick={() => onSegmentClick(index)}
                                >
                                    {seg.text}
                                </div>
                            ))}
                            {/* Padding for player */}
                            <div style={{ height: '100px' }} />
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};
