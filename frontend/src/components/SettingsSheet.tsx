import React from 'react';
import { Dialog, Button, Flex, Text, TextField, Select, RadioCards, Box, IconButton } from '@radix-ui/themes';
import { Slider } from './ui/Slider';
import { Settings, Mic2, Gauge, Cpu, X } from 'lucide-react';

interface SettingsSheetProps {
    apiKey: string;
    setApiKey: (key: string) => void;
    voice: string;
    setVoice: (v: string) => void;
    speed: number;
    setSpeed: (s: number) => void;
    modelStrategy: 'auto' | 'quality' | 'standard' | 'mini';
    setModelStrategy: (s: 'auto' | 'quality' | 'standard' | 'mini') => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
    apiKey, setApiKey,
    voice, setVoice,
    speed, setSpeed,
    modelStrategy, setModelStrategy
}) => {
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button variant="ghost" size="3" highContrast style={{ borderRadius: '50%', width: 40, height: 40, padding: 0 }}>
                    <Settings size={22} />
                </Button>
            </Dialog.Trigger>

            {/* Content styled as a Sidebar Sheet */}
            <Dialog.Content
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    maxWidth: '400px',
                    height: '100dvh', // dynamic viewport height
                    borderTopLeftRadius: '16px',
                    borderBottomLeftRadius: '16px',
                    padding: '24px',
                    margin: 0,
                    animation: 'slideIn 0.3s ease-out',
                    transform: 'none', // Override default centering
                }}
            >
                <style>{`
                    @keyframes slideIn {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                `}</style>

                <Flex justify="between" align="center" mb="5">
                    <Dialog.Title size="6" weight="bold">Settings</Dialog.Title>
                    <Dialog.Close>
                        <IconButton variant="ghost" color="gray" size="3">
                            <X size={24} />
                        </IconButton>
                    </Dialog.Close>
                </Flex>

                <Flex direction="column" gap="6" style={{ height: 'calc(100% - 60px)', overflowY: 'auto', paddingBottom: 40 }}>

                    {/* API Key */}
                    <Box>
                        <Text as="div" size="2" mb="2" weight="bold" color="gray">API CONFIGURATION</Text>
                        <div style={{ background: 'var(--gray-3)', padding: 16, borderRadius: 12 }}>
                            <Text size="2" weight="medium" mb="2" as="div">OpenAI API Key</Text>
                            <TextField.Root
                                size="3"
                                placeholder="sk-..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                type="password"
                                variant="soft"
                            />
                            <Text size="1" color="gray" mt="2" as="div">
                                Your key is stored locally in your browser.
                            </Text>
                        </div>
                    </Box>

                    {/* Voice Selection */}
                    <Box>
                        <Text as="div" size="2" mb="2" weight="bold" color="gray">AUDIO PREFERENCES</Text>
                        <div style={{ background: 'var(--gray-3)', padding: 16, borderRadius: 12 }}>
                            <Flex gap="2" align="center" mb="3">
                                <Mic2 size={18} />
                                <Text size="3" weight="bold">Voice</Text>
                            </Flex>
                            <Select.Root value={voice} onValueChange={setVoice} size="3">
                                <Select.Trigger variant="surface" style={{ width: '100%' }} />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label>Neutral</Select.Label>
                                        <Select.Item value="alloy">Alloy (Versatile)</Select.Item>
                                        <Select.Item value="fable">Fable (Storyteller)</Select.Item>
                                    </Select.Group>
                                    <Select.Group>
                                        <Select.Label>Male</Select.Label>
                                        <Select.Item value="echo">Echo (Warm)</Select.Item>
                                        <Select.Item value="onyx">Onyx (Deep)</Select.Item>
                                    </Select.Group>
                                    <Select.Group>
                                        <Select.Label>Female</Select.Label>
                                        <Select.Item value="nova">Nova (Energetic)</Select.Item>
                                        <Select.Item value="shimmer">Shimmer (Clear)</Select.Item>
                                    </Select.Group>
                                </Select.Content>
                            </Select.Root>
                            <Text size="1" color="gray" mt="2" as="div">
                                Choose a voice that matches your reading style.
                            </Text>
                        </div>
                    </Box>

                    {/* Speed Slider */}
                    <Box>
                        <div style={{ background: 'var(--gray-3)', padding: 16, borderRadius: 12 }}>
                            <Flex gap="2" align="center" mb="2" justify="between">
                                <Flex gap="2" align="center">
                                    <Gauge size={16} />
                                    <Text size="2" weight="bold">Speed: {speed}x</Text>
                                </Flex>
                            </Flex>
                            <Slider
                                value={[speed]}
                                min={0.25}
                                max={4.0}
                                step={0.25}
                                onValueChange={(vals) => setSpeed(vals[0])}
                            />
                        </div>
                    </Box>

                    {/* Smart Model Strategy */}
                    <Box>
                        <Text as="div" size="2" mb="2" weight="bold" color="gray">MODEL INTELLIGENCE</Text>
                        <div style={{ background: 'var(--gray-3)', padding: 16, borderRadius: 12 }}>
                            <Flex gap="2" align="center" mb="3">
                                <Cpu size={18} />
                                <Text size="3" weight="bold">Strategy</Text>
                            </Flex>

                            <RadioCards.Root value={modelStrategy} onValueChange={(v: any) => setModelStrategy(v)} columns={{ initial: '1', sm: '2' }} gap="2">
                                <RadioCards.Item value="auto" style={{ padding: 12 }}>
                                    <Flex direction="column" width="100%">
                                        <Text weight="bold" size="2">Auto</Text>
                                        <Text size="1" color="gray">Smart Balance</Text>
                                    </Flex>
                                </RadioCards.Item>
                                <RadioCards.Item value="standard" style={{ padding: 12 }}>
                                    <Flex direction="column" width="100%">
                                        <Text weight="bold" size="2">Standard</Text>
                                        <Text size="1" color="gray">Normal Cost</Text>
                                    </Flex>
                                </RadioCards.Item>
                                <RadioCards.Item value="quality" style={{ padding: 12 }}>
                                    <Flex direction="column" width="100%">
                                        <Text weight="bold" size="2">HD</Text>
                                        <Text size="1" color="gray">High Quality</Text>
                                    </Flex>
                                </RadioCards.Item>
                                <RadioCards.Item value="mini" style={{ padding: 12 }}>
                                    <Flex direction="column" width="100%">
                                        <Text weight="bold" size="2">Fast</Text>
                                        <Text size="1" color="gray">Low Latency</Text>
                                    </Flex>
                                </RadioCards.Item>
                            </RadioCards.Root>
                        </div>
                    </Box>

                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};
