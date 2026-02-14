import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, CornerDownLeft } from 'lucide-react';

export const CommandPalette = ({
  open,
  query,
  setQuery,
  groups,
  onClose,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const filteredGroups = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return groups;

    return (groups || [])
      .map((g) => ({
        ...g,
        items: (g.items || []).filter((item) => {
          const hay = [
            item.label,
            item.description,
            ...(item.keywords || []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return hay.includes(q);
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="palette"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          >
            <div className="palette-search">
              <Search size={16} className="palette-search-icon" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search nodes, templates, actions…"
                className="palette-input"
              />
              <div className="palette-hint">
                <CornerDownLeft size={14} />
                <span>Enter</span>
              </div>
            </div>

            <div className="palette-results">
              {filteredGroups.length === 0 ? (
                <div className="palette-empty">No matches.</div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.id} className="palette-group">
                    <div className="palette-group-title">{group.title}</div>
                    <div className="palette-group-items">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="palette-item"
                          role="button"
                          tabIndex={0}
                          onClick={() => item.onSelect?.()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              item.onSelect?.();
                            }
                          }}
                          title={item.tooltip || item.description || item.label}
                        >
                          <span className="palette-item-icon">{item.icon}</span>
                          <span className="palette-item-main">
                            <span className="palette-item-label">{item.label}</span>
                            {item.description ? (
                              <span className="palette-item-desc">{item.description}</span>
                            ) : null}
                          </span>

                          {Array.isArray(item.actions) && item.actions.length > 0 ? (
                            <span className="palette-item-actions" onClick={(e) => e.stopPropagation()}>
                              {item.actions.map((action) => (
                                <button
                                  key={action.id}
                                  type="button"
                                  className={`palette-item-action ${action.variant === 'danger' ? 'danger' : ''}`}
                                  title={action.tooltip || action.label}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    action.onSelect?.();
                                  }}
                                >
                                  {action.icon}
                                </button>
                              ))}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="palette-footer">
              <span className="palette-footer-kbd">Ctrl/Cmd+K</span> to open ·{' '}
              <span className="palette-footer-kbd">N</span> add node ·{' '}
              <span className="palette-footer-kbd">Del</span> delete selected
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
