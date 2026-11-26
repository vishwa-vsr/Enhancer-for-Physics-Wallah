import '@shared/tokens.css';
import { render } from 'preact';
import { App } from './App';

// Suppress benign browser ResizeObserver notification loop warnings from causing Chrome extension error badges
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

render(<App />, document.getElementById('app')!);
