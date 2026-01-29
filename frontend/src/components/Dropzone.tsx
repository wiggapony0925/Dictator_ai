import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { UploadCloud } from 'lucide-react';

interface DropzoneProps {
    onFileSelect: (file: File) => void;
    onError: (message: string) => void;
    isLoading: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, onError, isLoading }) => {
    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        // Handle Accepted Files
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }

        // Handle Rejected Files (Wrong Type)
        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
                onError("Sorry, we only accept PDF files. 📄");
            } else {
                onError("File upload failed. Please try again.");
            }
        }
    }, [onFileSelect, onError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
        disabled: isLoading
    });

    return (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone--active' : ''}`}>
            <input {...getInputProps()} />
            <Flex direction="column" align="center" justify="center" gap="4" style={{ height: '100%', width: '100%' }}>
                <div className="dropzone__icon-wrapper">
                    <UploadCloud size={64} strokeWidth={1.5} />
                </div>
                <Box style={{ textAlign: 'center' }}>
                    <Text size="5" weight="bold" as="div" mb="1">
                        {isDragActive ? "Drop PDF here" : "Upload a PDF"}
                    </Text>
                    <Text size="2" color="gray">
                        Drag & drop or tap to browse
                    </Text>
                </Box>
                <Button size="3" variant="soft" disabled={isLoading}>
                    Select File
                </Button>
            </Flex>
        </div>
    );
};
