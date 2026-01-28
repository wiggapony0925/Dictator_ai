import React from 'react';
import { Dialog, Button, Flex, TextField, Text, IconButton } from '@radix-ui/themes';
import { Settings } from 'lucide-react';

interface SettingsDialogProps {
    apiKey: string;
    setApiKey: (key: string) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ apiKey, setApiKey }) => {
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <IconButton variant="ghost" color="gray">
                    <Settings size={20} />
                </IconButton>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Settings</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    Enter your OpenAI API key to enable text-to-speech.
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            API Key
                        </Text>
                        <TextField.Root
                            value={apiKey}
                            // Cast event target value correctly
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            type="password"
                        />
                    </label>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button>Save</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};
