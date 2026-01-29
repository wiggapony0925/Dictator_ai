import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import '../../styles/components/_slider.scss';

interface SliderProps {
    value?: number[];
    defaultValue?: number[];
    min?: number;
    max?: number;
    step?: number;
    onValueChange?: (value: number[]) => void;
    onValueCommit?: (value: number[]) => void;
    disabled?: boolean;
    name?: string;
    className?: string;
}

export const Slider: React.FC<SliderProps> = ({
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    onValueChange,
    onValueCommit,
    disabled,
    name,
    className = '',
    ...props
}) => {
    return (
        <SliderPrimitive.Root
            className={`slider ${className}`}
            value={value}
            defaultValue={defaultValue}
            min={min}
            max={max}
            step={step}
            onValueChange={onValueChange}
            onValueCommit={onValueCommit}
            disabled={disabled}
            name={name}
            {...props}
        >
            <SliderPrimitive.Track className="slider__track">
                <SliderPrimitive.Range className="slider__range" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="slider__thumb" aria-label="Slider Value" />
        </SliderPrimitive.Root>
    );
};
