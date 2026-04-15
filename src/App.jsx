import { useState } from 'react';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const todayReference = {
  year: 2026,
  month: 3,
  day: 14,
};

const calendarNotes = {
  '2026-04-01': 'Math lesson 11, pages 61 to 62',
  '2026-04-02': 'Math lesson 12, page 65',
  '2026-04-06': 'Spring Break',
  '2026-04-07': 'Spring Break',
  '2026-04-08': 'Spring Break',
  '2026-04-09': 'Spring Break',
  '2026-04-10': 'Spring Break',
  '2026-04-13': 'Math lessons 13 and 14, pages 71 to 72 and 75',
  '2026-04-14': 'Math lesson 15, page 81',
  '2026-04-21': 'Field Trip: Oakland Zoo',
};

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildMonthDays(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.max(35, Math.ceil((firstWeekday + daysInMonth) / 7) * 7);
  const cells = [];

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - firstWeekday + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cells.push(null);
      continue;
    }

    const dateKey = formatDateKey(year, month, dayNumber);

    cells.push({
      day: dayNumber,
      note: calendarNotes[dateKey] ?? '',
      isToday:
        year === todayReference.year &&
        month === todayReference.month &&
        dayNumber === todayReference.day,
    });
  }

  return cells;
}

function App() {
  const [activeMonth, setActiveMonth] = useState({
    year: 2026,
    month: 3,
  });

  const monthDays = buildMonthDays(activeMonth.year, activeMonth.month);
  const monthTitle = `${monthNames[activeMonth.month]} ${activeMonth.year}`;

  const goToPreviousMonth = () => {
    setActiveMonth((current) => {
      if (current.month === 0) {
        return { year: current.year - 1, month: 11 };
      }

      return { year: current.year, month: current.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setActiveMonth((current) => {
      if (current.month === 11) {
        return { year: current.year + 1, month: 0 };
      }

      return { year: current.year, month: current.month + 1 };
    });
  };

  return (
    <main className="calendar-page">
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

        <div className="calendar-grid">
          {dayLabels.map((label) => (
            <div key={label} className="day-label">
              {label}
            </div>
          ))}

          {monthDays.map((day, index) => (
            <article
              key={day?.day ?? `empty-${index}`}
              className={`calendar-cell${day ? '' : ' calendar-cell-empty'}${
                day?.note === 'Spring Break' ? ' calendar-cell-highlight' : ''
              }${day?.isToday ? ' calendar-cell-today' : ''}`}
            >
              {day ? (
                <>
                  <span className="date-number">{day.day}</span>
                  {day.note ? <p className="date-note">{day.note}</p> : null}
                </>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
