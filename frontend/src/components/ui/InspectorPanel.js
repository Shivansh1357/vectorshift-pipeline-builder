import React, { useMemo } from 'react';
import { Copy, Trash2, X, CopyPlus } from 'lucide-react';

const safeStringify = (value) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export const InspectorPanel = ({
  node,
  edge,
  onClose,
  onDeleteSelected,
  onDuplicateNode,
  onToast,
}) => {
  const title = node ? 'Node Inspector' : edge ? 'Edge Inspector' : 'Inspector';
  const payload = useMemo(() => (node ? node : edge ? edge : null), [node, edge]);
  const json = useMemo(() => safeStringify(payload), [payload]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      onToast?.('Copied to clipboard.', 'success');
    } catch {
      onToast?.('Copy failed (clipboard not available).', 'error');
    }
  };

  return (
    <div className="inspector">
      <div className="inspector-header">
        <div className="inspector-title">{title}</div>
        <button className="inspector-icon-btn" type="button" onClick={onClose} aria-label="Close inspector">
          <X size={16} />
        </button>
      </div>

      {node && (
        <div className="inspector-meta">
          <div className="inspector-chip">id: {node.id}</div>
          <div className="inspector-chip">type: {node.type}</div>
        </div>
      )}
      {edge && (
        <div className="inspector-meta">
          <div className="inspector-chip">id: {edge.id}</div>
          <div className="inspector-chip">
            {edge.source} → {edge.target}
          </div>
        </div>
      )}

      <div className="inspector-actions">
        <button className="inspector-btn" type="button" onClick={copy}>
          <Copy size={14} />
          Copy JSON
        </button>
        {node && (
          <button className="inspector-btn" type="button" onClick={onDuplicateNode}>
            <CopyPlus size={14} />
            Duplicate
          </button>
        )}
        <button className="inspector-btn danger" type="button" onClick={onDeleteSelected}>
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      <pre className="inspector-json">{json}</pre>

      <div className="inspector-footer">
        Tip: Press <span className="palette-footer-kbd">Del</span> to delete selected.
      </div>
    </div>
  );
};

