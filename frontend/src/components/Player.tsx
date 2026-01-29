import React, { useState, useEffect } from 'react';
import { Card, Flex, IconButton, Text, Box } from '@radix-ui/themes';
import { Slider } from './ui/Slider';
import { Play, Pause } from 'lucide-react';

interface PlayerProps {
    currentSegmentIndex: number;
    totalSegments: number;
    isPlaying: boolean;
    onPlayPause: () => void;
    onSeek: (value: number) => void;
}

export const Player: React.FC<PlayerProps> = ({
    currentSegmentIndex,
    totalSegments,
    isPlaying,
    onPlayPause,
    onSeek,
}) => {
    // Local state for smooth sliding without waiting for audio
    const [localValue, setLocalValue] = useState([0]);
    const [isDragging, setIsDragging] = useState(false);

    // Sync with prop when not dragging
    useEffect(() => {
        if (!isDragging && currentSegmentIndex !== -1) {
            setLocalValue([currentSegmentIndex]);
        }
    }, [currentSegmentIndex, isDragging]);

    const handleValueChange = (vals: number[]) => {
        setIsDragging(true);
        setLocalValue(vals);
    };

    const handleValueCommit = (vals: number[]) => {
        setIsDragging(false);
        onSeek(vals[0]);
    };

    return (
        <Card size="2" className="player-card" style={{ backgroundColor: '#15161cd4' }}>
            <Flex align="center" gap="4">
                <IconButton size="3" variant="soft" onClick={onPlayPause} radius="full" className="player-play-btn">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </IconButton>

                <Box style={{ flex: 1 }}>
                    <Flex justify="between" mb="1">
                        <Text size="1" color="gray" weight="medium">
                            Segment {localValue[0] + 1}
                        </Text>
                        <Text size="1" color="gray" weight="medium">
                            {totalSegments}
                        </Text>
                    </Flex>

                    {/* Radix Primitive Slider */}
                    {/* Custom Slider Component */}
                    <Slider
                        value={localValue}
                        max={Math.max(0, totalSegments - 1)}
                        step={1}
                        onValueChange={handleValueChange}
                        onValueCommit={handleValueCommit}
                    />
                </Box>
            </Flex>
        </Card>
    );
};
