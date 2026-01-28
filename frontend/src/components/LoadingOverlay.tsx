import React from 'react';
import { Flex, Text, Box } from '@radix-ui/themes';

interface LoadingOverlayProps {
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Processing...' }) => {
    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Box style={{
                backgroundColor: 'var(--color-background)',
                padding: '2rem',
                borderRadius: 'var(--radius-4)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                border: '1px solid var(--gray-5)',
            }}>
                <Flex direction="column" gap="4" align="center">
                    <div className="spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid var(--gray-4)',
                        borderTopColor: 'var(--accent-9)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <Text size="3" weight="medium">{message}</Text>
                </Flex>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </Box>
        </div>
    );
};
