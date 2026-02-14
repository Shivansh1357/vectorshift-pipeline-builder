/**
 * SubmitButton.js - Pipeline Submission Component
 * 
 * PURPOSE: Handles submission of the pipeline to the backend for analysis.
 * Displays results in a modal showing node count, edge count, and DAG status.
 * 
 * Architectural Decision (AD-4): Backend Integration
 * ==================================================
 * 
 * WHY THIS APPROACH:
 * 1. Separation of Concerns: UI logic in React, DAG analysis in Python
 * 2. RESTful API: Standard POST request with JSON payload
 * 3. User Feedback: Modal shows analysis results clearly
 * 4. Error Handling: Graceful handling of network/server errors
 * 
 * The backend endpoint /pipelines/parse:
 * - Receives: { nodes: [...], edges: [...] }
 * - Returns: { num_nodes: int, num_edges: int, is_dag: bool }
 */

import { useEffect, useState } from 'react';
import { useStore } from './store';
import {
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  GitBranch,
  Check,
  X,
  PartyPopper,
  AlertCircle,
  Send,
  Loader2
} from 'lucide-react';
import { useToast } from './components/ui/ToastProvider';

// Backend URL - can be configured via environment variable
const API_BASE_URL = 'http://localhost:8000';

/**
 * ResultModal Component
 * Displays the pipeline analysis results in a modal dialog
 */
const ResultModal = ({ result, onClose }) => {
  if (!result) return null;

  const { num_nodes, num_edges, is_dag } = result;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <span className="modal-icon" style={{ color: is_dag ? '#10B981' : '#F59E0B' }}>
            {is_dag ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
          </span>
          <h2 className="modal-title">Pipeline Analysis</h2>
        </div>

        {/* Body - Statistics */}
        <div className="modal-body">
          <div className="modal-stat">
            <span className="modal-stat-label">
              <BarChart3 size={14} />
              <span>Total Nodes</span>
            </span>
            <span className="modal-stat-value">{num_nodes}</span>
          </div>

          <div className="modal-stat">
            <span className="modal-stat-label">
              <GitBranch size={14} />
              <span>Total Edges</span>
            </span>
            <span className="modal-stat-value">{num_edges}</span>
          </div>

          <div className={`modal-stat ${is_dag ? 'success' : 'error'}`}>
            <span className="modal-stat-label">
              {is_dag ? <Check size={14} /> : <X size={14} />}
              <span>Valid DAG</span>
            </span>
            <span className="modal-stat-value">
              {is_dag ? 'Yes' : 'No'}
            </span>
          </div>

          {/* Additional info about DAG */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: is_dag ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            fontSize: '13px',
            color: is_dag ? '#10B981' : '#EF4444',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            {is_dag ? <PartyPopper size={16} style={{ marginTop: '2px', flexShrink: 0 }} /> : <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />}
            <span>
              {is_dag
                ? 'Your pipeline is a valid Directed Acyclic Graph! It can be executed without circular dependencies.'
                : 'Your pipeline contains cycles. Please remove circular connections to create a valid pipeline.'
              }
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * SubmitButton Component
 * Main export - handles pipeline submission and result display
 */
export const SubmitButton = () => {
  // Use individual selectors to prevent infinite re-renders
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const lastRun = useStore((state) => state.lastRun);
  const setLastRun = useStore((state) => state.setLastRun);

  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [, setError] = useState(null);

  /**
   * Submit pipeline to backend for analysis
   */
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare payload
      // We need to serialize nodes and edges for the backend
      const payload = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          data: node.data,
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
      };

      // Send to backend
      const response = await fetch(`${API_BASE_URL}/pipelines/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setLastRun({ ...data, at: Date.now() });

      // Show success toast
      if (data.is_dag) {
        addToast("Pipeline parsed successfully! It is a valid DAG.", "success");
      } else {
        addToast("Pipeline parsed successfully, but cycles were detected.", "error");
      }
    } catch (err) {
      console.error('Pipeline submission error:', err);
      setError(err.message);

      // Show error in toast
      addToast(`Failed to analyze pipeline: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      const isEnter = event.key === 'Enter';
      if (!isCmdOrCtrl || !isEnter) return;

      const tag = String(document.activeElement?.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;
      if (isTyping) return;

      event.preventDefault();
      handleSubmit();
    };

    const onSubmitEvent = () => {
      handleSubmit();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pipeline:submit', onSubmitEvent);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pipeline:submit', onSubmitEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  /**
   * Close the result modal
   */
  const handleCloseModal = () => {
    setResult(null);
  };

  return (
    <>
      <div className="submit-section">
        <div className="submit-section-left" />

        <div className="submit-section-center">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="submit-button-icon">
                  <Loader2 size={16} className="animate-spin" />
                </span>
                Analyzing...
              </>
            ) : (
              <>
                <span className="submit-button-icon">
                  <Send size={16} />
                </span>
                Submit Pipeline
              </>
            )}
          </button>
        </div>

        <div className="submit-section-right">
          {lastRun ? (
            <button
              className={`run-pill ${lastRun.is_dag ? 'success' : 'error'}`}
              onClick={() => setResult(lastRun)}
              title="View last run details"
              type="button"
            >
              <span className="run-pill-icon">
                {lastRun.is_dag ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              </span>
              <span className="run-pill-text">
                {lastRun.is_dag ? 'DAG' : 'Cycle'} · {lastRun.num_nodes} nodes · {lastRun.num_edges} edges
              </span>
              <span className="run-pill-hint">Details</span>
            </button>
          ) : (
            <div className="run-pill-placeholder" title="Tip: Press Ctrl/Cmd+Enter to submit">
              Ctrl/Cmd+Enter to run
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {result && (
        <ResultModal result={result} onClose={handleCloseModal} />
      )}
    </>
  );
};
