import { useState } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function EditNoteModal({ dateKey, currentNote, currentHighlight, onSave, onClose }) {
  const [note, setNote] = useState(currentNote);
  const [isHighlight, setIsHighlight] = useState(currentHighlight);

  const [yearStr, monthStr, dayStr] = dateKey.split('-');
  const dateLabel = `${MONTH_NAMES[parseInt(monthStr, 10) - 1]} ${parseInt(dayStr, 10)}, ${yearStr}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(dateKey, note, isHighlight);
  };

  const handleClear = () => {
    onSave(dateKey, '', false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 className="modal-title">{dateLabel}</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-label">
            Note
            <textarea
              className="modal-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note for this day…"
              autoFocus
            />
          </label>
          <label className="modal-label modal-label-checkbox">
            <input
              type="checkbox"
              checked={isHighlight}
              onChange={(e) => setIsHighlight(e.target.checked)}
            />
            Mark as special event (yellow highlight)
          </label>
          <div className="modal-actions">
            {currentNote && (
              <button type="button" className="modal-btn-clear" onClick={handleClear}>
                Clear note
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="modal-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="modal-btn-save">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
