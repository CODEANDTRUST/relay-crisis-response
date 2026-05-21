import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Component as Relay } from './relay';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Relay />
  </StrictMode>,
);
