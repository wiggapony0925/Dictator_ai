import React, { useEffect, useRef } from 'react';
import { Box, Card, Text } from '@radix-ui/themes';

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

    if (segments.length === 0) {
        return (
            <Box p="5">
                <Text color="gray" size="2">Upload a PDF to see text segments here.</Text>
            </Box>
        )
    }

    return (
        <Box p="4">
            {segments.map((seg, index) => {
                const isActive = index === currentSegmentIndex;
                return (
                    <Box
                        key={index}
                        ref={isActive ? activeRef : null}
                        onClick={() => onSegmentClick(index)}
                        mb="3"
                        style={{ cursor: 'pointer' }}
                    >
                        <Card variant={isActive ? "classic" : "ghost"} style={{ transition: 'all 0.2s', backgroundColor: isActive ? 'var(--accent-a3)' : 'transparent' }}>
                            <Text
                                size="3"
                                style={{
                                    lineHeight: '1.6',
                                    color: isActive ? 'var(--accent-11)' : 'var(--gray-11)',
                                    fontWeight: isActive ? 500 : 400
                                }}
                            >
                                {seg.text}
                            </Text>
                        </Card>
                    </Box>
                );
            })}
            {/* Spacer for player */}
            <Box height="100px" />
        </Box>
    );
};
