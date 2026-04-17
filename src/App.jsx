import { useState, useEffect } from 'react';
import AuthModal from './AuthModal.jsx';
import EditNoteModal from './EditNoteModal.jsx';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const now = new Date();
const TODAY = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildMonthDays(year, month, notes) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const cells = [];

  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - firstWeekday + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cells.push(null);
      continue;
    }
    const dateKey = formatDateKey(year, month, dayNumber);
    const noteData = notes[dateKey];
    cells.push({
      day: dayNumber,
      dateKey,
      note: noteData?.note ?? '',
      isHighlight: noteData?.is_highlight ?? false,
      isToday: year === TODAY.year && month === TODAY.month && dayNumber === TODAY.day,
    });
  }

  return cells;
}

function App() {
  const [activeMonth, setActiveMonth] = useState({ year: 2026, month: 3 });
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [showAuth, setShowAuth] = useState(false);
  const [editCell, setEditCell] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/calendar/notes`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const map = {};
        for (const n of data.notes) {
          map[n.date_key] = { note: n.note, is_highlight: n.is_highlight };
        }
        setNotes(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleCellClick = (cell) => {
    if (!cell) return;
    if (user) {
      setEditCell(cell.dateKey);
      setSelectedDay(null);
    } else if (cell.note) {
      setSelectedDay((prev) => (prev === cell.dateKey ? null : cell.dateKey));
    }
  };

  const handleSaveNote = async (dateKey, note, isHighlight) => {
    const prevNotes = { ...notes };
    if (note.trim()) {
      setNotes((n) => ({ ...n, [dateKey]: { note: note.trim(), is_highlight: isHighlight } }));
    } else {
      setNotes((n) => {
        const copy = { ...n };
        delete copy[dateKey];
        return copy;
      });
    }
    setEditCell(null);

    try {
      const opts = { headers: { Authorization: `Bearer ${token}` } };
      if (note.trim()) {
        opts.method = 'PUT';
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify({ note: note.trim(), is_highlight: isHighlight });
      } else {
        opts.method = 'DELETE';
      }
      const r = await fetch(`${API_BASE}/api/calendar/notes/${dateKey}`, opts);
      if (!r.ok) throw new Error();
    } catch {
      setNotes(prevNotes);
    }
  };

  const goToPreviousMonth = () => {
    setActiveMonth((cur) =>
      cur.month === 0 ? { year: cur.year - 1, month: 11 } : { ...cur, month: cur.month - 1 }
    );
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setActiveMonth((cur) =>
      cur.month === 11 ? { year: cur.year + 1, month: 0 } : { ...cur, month: cur.month + 1 }
    );
    setSelectedDay(null);
  };

  const monthDays = buildMonthDays(activeMonth.year, activeMonth.month, notes);
  const monthTitle = `${MONTH_NAMES[activeMonth.month]} ${activeMonth.year}`;
  const selectedDayData = selectedDay ? monthDays.find((d) => d?.dateKey === selectedDay) : null;

  return (
    <main className="calendar-page">
      <div className="auth-bar">
        {user ? (
          <>
            <span className="auth-email">{user.email}</span>
            <button className="auth-btn" type="button" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <button className="auth-btn auth-btn-primary" type="button" onClick={() => setShowAuth(true)}>
            Log in to edit
          </button>
        )}
      </div>

      <section className="calendar-shell" aria-label={`${monthTitle} calendar`}>
        <header className="calendar-header">
          <div className="header-controls">
            <button
              className="month-nav"
              type="button"
              onClick={goToPreviousMonth}
              aria-label="Go to previous month"
            >
              <span aria-hidden="true">‹</span>
            </button>

            <div className="header-copy">
              <p className="calendar-kicker">MONTHLY VIEW FOR B10 (JOHN GREEN ELEMENTARY)</p>
              <div className="title-row">
                <div className="tulip tulip-left" aria-hidden="true">
                  <span className="petal petal-left" />
                  <span className="petal petal-center" />
                  <span className="petal petal-right" />
                  <span className="stem" />
                  <span className="tulip-leaf tulip-leaf-left" />
                  <span className="tulip-leaf tulip-leaf-right" />
                </div>
                <h1>{monthTitle}</h1>
                <div className="tulip tulip-right" aria-hidden="true">
                  <span className="petal petal-left" />
                  <span className="petal petal-center" />
                  <span className="petal petal-right" />
                  <span className="stem" />
                  <span className="tulip-leaf tulip-leaf-left" />
                  <span className="tulip-leaf tulip-leaf-right" />
                </div>
              </div>
            </div>

            <button
              className="month-nav"
              type="button"
              onClick={goToNextMonth}
              aria-label="Go to next month"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="calendar-loading" aria-live="polite">
            Loading calendar…
          </div>
        ) : (
          <div className="calendar-grid">
            {DAY_LABELS.map((label) => (
              <div key={label} className="day-label">
                {label}
              </div>
            ))}

            {monthDays.map((day, index) => {
              const isSelected = day?.dateKey === selectedDay;
              const cellClass = [
                'calendar-cell',
                !day && 'calendar-cell-empty',
                day?.isHighlight && 'calendar-cell-highlight',
                day?.isToday && 'calendar-cell-today',
                day?.note && !day?.isHighlight && 'calendar-cell-has-note',
                isSelected && 'calendar-cell-selected',
                user && day && 'calendar-cell-editable',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <article
                  key={day?.dateKey ?? `empty-${index}`}
                  className={cellClass}
                  onClick={() => handleCellClick(day)}
                  role={day && (user || day.note) ? 'button' : undefined}
                  tabIndex={day && (user || day.note) ? 0 : undefined}
                  onKeyDown={(e) => e.key === 'Enter' && handleCellClick(day)}
                  aria-label={
                    day
                      ? `${MONTH_NAMES[activeMonth.month]} ${day.day}${day.note ? `: ${day.note}` : ''}`
                      : undefined
                  }
                >
                  {day ? (
                    <>
                      <span className="date-number">{day.day}</span>
                      {day.note ? (
                        <>
                          <p className="date-note">{day.note}</p>
                          <span className="note-dot" aria-hidden="true" />
                        </>
                      ) : null}
                      {user && !day.note ? (
                        <span className="edit-hint" aria-hidden="true">
                          +
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}

        {selectedDayData && (
          <div className="day-detail-panel" role="region" aria-label="Day detail">
            <div className="day-detail-header">
              <strong className="day-detail-date">
                {MONTH_NAMES[activeMonth.month]} {selectedDayData.day}
              </strong>
              <button
                className="day-detail-close"
                type="button"
                onClick={() => setSelectedDay(null)}
                aria-label="Close detail"
              >
                ×
              </button>
            </div>
            <p className="day-detail-note">
              {selectedDayData.note || 'No events for this day'}
            </p>
          </div>
        )}
      </section>

      {showAuth && (
        <AuthModal onLogin={handleLogin} onClose={() => setShowAuth(false)} apiBase={API_BASE} />
      )}
      {editCell && (
        <EditNoteModal
          dateKey={editCell}
          currentNote={notes[editCell]?.note ?? ''}
          currentHighlight={notes[editCell]?.is_highlight ?? false}
          onSave={handleSaveNote}
          onClose={() => setEditCell(null)}
        />
      )}
    </main>
  );
}

export default App;
