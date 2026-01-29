import React from 'react';
import { Dialog, Button, Flex, Text, TextField, Select, RadioCards, Box } from '@radix-ui/themes';
import { Settings, Mic2, Gauge, Cpu } from 'lucide-react';
import { Slider } from './ui/Slider';

interface SettingsDialogProps {
    apiKey: string;
    setApiKey: (key: string) => void;
    voice: string;
    setVoice: (v: string) => void;
    speed: number;
    setSpeed: (s: number) => void;
    modelStrategy: 'auto' | 'quality' | 'standard' | 'mini';
    setModelStrategy: (s: 'auto' | 'quality' | 'standard' | 'mini') => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
    apiKey, setApiKey,
    voice, setVoice,
    speed, setSpeed,
    modelStrategy, setModelStrategy
}) => {
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button variant="soft"><Settings size={16} /></Button>
            </Dialog.Trigger>

            <Dialog.Content style={{ maxWidth: 500 }}>
                <Dialog.Title>Settings</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    Configure OpenAI API and audio preferences.
                </Dialog.Description>

                <Flex direction="column" gap="4">
                    {/* API Key */}
                    <Box>
                        <Text as="div" size="2" mb="1" weight="bold">OpenAI API Key</Text>
                        <TextField.Root
                            placeholder="sk-..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            type="password"
                        />
                    </Box>

                    {/* Voice Selection */}
                    <Box>
                        <Flex gap="2" align="center" mb="1">
                            <Mic2 size={16} />
                            <Text size="2" weight="bold">Voice</Text>
                        </Flex>
                        <Select.Root value={voice} onValueChange={setVoice}>
                            <Select.Trigger style={{ width: '100%' }} />
                            <Select.Content>
                                <Select.Item value="alloy">Alloy (Neutral)</Select.Item>
                                <Select.Item value="echo">Echo (Male)</Select.Item>
                                <Select.Item value="fable">Fable (British-ish)</Select.Item>
                                <Select.Item value="onyx">Onyx (Deep Male)</Select.Item>
                                <Select.Item value="nova">Nova (Female)</Select.Item>
                                <Select.Item value="shimmer">Shimmer (Fem. Raspy)</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </Box>

                    {/* Speed Slider */}
                    <Box>
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
                    </Box>

                    {/* Smart Model Strategy */}
                    <Box>
                        <Flex gap="2" align="center" mb="2">
                            <Cpu size={16} />
                            <Text size="2" weight="bold">Model Strategy</Text>
                        </Flex>
                        <Text size="1" color="gray" mb="2">
                            Auto uses Mini for speed/cost and HD for quality on large docs.
                        </Text>
                        <RadioCards.Root value={modelStrategy} onValueChange={(v) => setModelStrategy(v as 'auto' | 'quality' | 'standard' | 'mini')} columns={{ initial: '1', sm: '2' }}>
                            <RadioCards.Item value="auto">
                                <Flex direction="column" width="100%">
                                    <Text weight="bold">Auto (Smart)</Text>
                                    <Text size="1" color="gray">Mini for small, HD for big</Text>
                                </Flex>
                            </RadioCards.Item>
                            <RadioCards.Item value="mini">
                                <Flex direction="column" width="100%">
                                    <Text weight="bold">Mini (Fastest)</Text>
                                    <Text size="1" color="gray">gpt-4o-mini-tts</Text>
                                </Flex>
                            </RadioCards.Item>
                            <RadioCards.Item value="standard">
                                <Flex direction="column" width="100%">
                                    <Text weight="bold">Standard</Text>
                                    <Text size="1" color="gray">tts-1</Text>
                                </Flex>
                            </RadioCards.Item>
                            <RadioCards.Item value="quality">
                                <Flex direction="column" width="100%">
                                    <Text weight="bold">Best Quality</Text>
                                    <Text size="1" color="gray">tts-1-hd</Text>
                                </Flex>
                            </RadioCards.Item>
                        </RadioCards.Root>
                    </Box>

                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="solid" highContrast>Close</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};
