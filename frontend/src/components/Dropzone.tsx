import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { UploadCloud } from 'lucide-react';

interface DropzoneProps {
    onFileSelect: (file: File) => void;
    isLoading: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, isLoading }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
        disabled: isLoading
    });

    return (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone--active' : ''}`}>
            <input {...getInputProps()} />
            <Flex direction="column" align="center" justify="center" gap="4" style={{ height: '100%', minHeight: '300px' }}>
                <div className="dropzone__icon-wrapper">
                    <UploadCloud size={48} strokeWidth={1.5} />
                </div>
                <Box style={{ textAlign: 'center' }}>
                    <Text size="5" weight="bold" as="div" mb="1">
                        {isDragActive ? "Drop text here" : "Upload a PDF"}
                    </Text>
                    <Text size="2" color="gray">
                        Drag & drop or click to browse
                    </Text>
                </Box>
                <Button size="3" variant="soft" disabled={isLoading}>
                    Select File
                </Button>
            </Flex>
        </div>
    );
};
