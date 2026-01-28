import React from 'react';
import * as Slider from '@radix-ui/react-slider';
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
    const displayIndex = currentSegmentIndex === -1 ? 0 : currentSegmentIndex;

    return (
        <div className="floating-player">
            <div className="player-content">
                <button className="play-btn" onClick={onPlayPause}>
                    {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                </button>

                <div className="slider-container">
                    <span id="current-time">{displayIndex + 1}</span>

                    <Slider.Root
                        className="SliderRoot"
                        value={[displayIndex]}
                        max={totalSegments - 1}
                        step={1}
                        onValueChange={(vals) => onSeek(vals[0])}
                    >
                        <Slider.Track className="SliderTrack">
                            <Slider.Range className="SliderRange" />
                        </Slider.Track>
                        <Slider.Thumb className="SliderThumb" aria-label="Seek" />
                    </Slider.Root>

                    <span id="total-time">{totalSegments} segs</span>
                </div>
            </div>
        </div>
    );
};
