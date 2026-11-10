'use client';

import { useState } from 'react';

export type NotepadTab = {
  id: string;
  title: string;
  content: string;
};

type NotepadWindowProps = {
  tabs: NotepadTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onUpdateTab: (id: string, content: string) => void;
  onAddTab: (title?: string, content?: string) => void;
  onSendToOpenCode: (text: string) => void;
};

export function NotepadWindow({
  tabs,
  activeTabId,
  onSelectTab,
  onUpdateTab,
  onAddTab,
  onSendToOpenCode,
}: NotepadWindowProps) {
  const [newName, setNewName] = useState('');
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  const downloadTab = () => {
    if (!activeTab) return;
    const blob = new Blob([activeTab.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeTab.title;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="notepad-win">
      <div className="notepad-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`notepad-tab ${tab.id === activeTab?.id ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            {tab.title}
          </button>
        ))}
        <div className="notepad-new">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="new-file.txt"
            aria-label="New file name"
          />
          <button
            type="button"
            className="win-btn small"
            onClick={() => {
              onAddTab(newName.trim() || `note-${tabs.length + 1}.txt`, '');
              setNewName('');
            }}
          >
            + Tab
          </button>
        </div>
      </div>

      {activeTab && (
        <>
          <textarea
            className="notepad-editor"
            value={activeTab.content}
            onChange={(event) => onUpdateTab(activeTab.id, event.target.value)}
            spellCheck={false}
            aria-label={activeTab.title}
          />
          <div className="notepad-foot">
            <span className="muted-sm">
              {activeTab.content.split('\n').length} lines · {activeTab.content.length} chars
            </span>
            <div className="btn-row">
              <button type="button" className="win-btn small" onClick={downloadTab}>
                Download file
              </button>
              <button
                type="button"
                className="win-btn small primary"
                onClick={() => onSendToOpenCode(`Please review this note (${activeTab.title}):\n\n${activeTab.content}`)}
                disabled={!activeTab.content.trim()}
              >
                Send to OpenCode
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
