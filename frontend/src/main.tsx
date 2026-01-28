import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@radix-ui/themes/styles.css';
import './styles/main.scss';
import { Theme } from '@radix-ui/themes';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme appearance="dark" accentColor="indigo" grayColor="slate" radius="large" scaling="95%">
      <App />
    </Theme>
  </StrictMode>,
)
