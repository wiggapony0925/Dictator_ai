import React, { useEffect, useRef } from 'react';
import { Box, Card, Text, Skeleton, Flex } from '@radix-ui/themes';

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

    // Early return handled in render now to support loading state

    return (
        <Box p="4">
            {segments.length > 0 ? (
                segments.map((seg, index) => {
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
                })
            ) : pdfUrl ? (
                <Box style={{ padding: '1rem' }}>
                    <Flex direction="column" gap="4">
                        <Skeleton loading={true}>
                            <Text size="3" style={{ lineHeight: '1.6' }}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque felis tellus,
                                efficitur id convallis a, viverra eget libero. Nam magna erat, fringilla sed commodo sed,
                                aliquet nec magna.
                            </Text>
                        </Skeleton>
                        <Skeleton loading={true}>
                            <Text size="3" style={{ lineHeight: '1.6' }}>
                                Suspendisse potenti. Cras mollis, ipsum et maximus efficitur, ex augue rhoncus elit,
                                eget sagittis nulla augue eu mauris.
                            </Text>
                        </Skeleton>
                        <Skeleton loading={true}>
                            <Text size="3" style={{ lineHeight: '1.6' }}>
                                Short segment loading placeholder.
                            </Text>
                        </Skeleton>
                        <Skeleton loading={true} style={{ width: '60%' }}>
                            <Text size="3" style={{ lineHeight: '1.6' }}>
                                Another partial line.
                            </Text>
                        </Skeleton>
                    </Flex>
                    <Text size="2" color="gray" mt="5" align="center">Analyzing document structure...</Text>
                </Box>
            ) : (
                <Box p="5">
                    <Text color="gray" size="2" align="center">Upload a PDF to see text segments here.</Text>
                </Box>
            )}
            {/* Spacer for player */}
            <Box height="100px" />
        </Box>
    );
};
