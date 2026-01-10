/**
 * App.js - Main Application Component
 * 
 * PURPOSE: Root component that composes the entire application.
 * 
 * Architectural Decision (AD):
 * - Clean separation: Toolbar (top), Pipeline UI (middle), Submit (bottom)
 * - Flexbox layout for responsive sizing
 * - CSS class-based styling for consistency
 */

import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  return (
    <div className="app-container">
      <PipelineToolbar />
      <PipelineUI />
      <SubmitButton />
    </div>
  );
}

export default App;
