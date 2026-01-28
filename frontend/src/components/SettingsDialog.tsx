import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Settings, X } from 'lucide-react';
import './SettingsDialog.css';

interface SettingsDialogProps {
    apiKey: string;
    setApiKey: (key: string) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ apiKey, setApiKey }) => {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="icon-btn" aria-label="Settings">
                    <Settings size={20} color="#94a3b8" />
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <Dialog.Title className="DialogTitle">Settings</Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="icon-btn" aria-label="Close">
                                <X size={20} color="#94a3b8" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <Dialog.Description className="DialogDescription">
                        Enter your OpenAI API key to enable text-to-speech.
                    </Dialog.Description>

                    <fieldset className="Fieldset">
                        <label className="Label" htmlFor="apiKey">
                            API Key
                        </label>
                        <input
                            className="Input"
                            id="apiKey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                        />
                    </fieldset>

                    <div style={{ display: 'flex', marginTop: 25, justifyContent: 'flex-end' }}>
                        <Dialog.Close asChild>
                            <button className="btn primary">Save changes</button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
