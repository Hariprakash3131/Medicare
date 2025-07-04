import React, { useState, useMemo } from 'react';
import './ClenderView.css';

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function ClenderView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateClick = (day) => {
    if (day) {
        setSelectedDate(day);
    }
  };

  const handlePrevMonth = () => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  
  const calendarWeeks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const weeks = [];
    for (let i = 0; i < 6; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
            week.push(new Date(startDate));
            startDate.setDate(startDate.getDate() + 1);
        }
        weeks.push(week);
        if (startDate.getMonth() !== month && weeks.length >= 4) {
            break;
        }
    }
    return weeks;
  }, [currentDate]);

  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const getDetails = () => {
    const isToday = selectedDate.toDateString() === today.toDateString();
    const isPast = selectedDate < todayDateOnly;

    if(isToday) {
        return {
            icon: '🕒',
            title: 'Today',
            desc: "Monitor Eleanor Thompson's medication status for today.",
            color: '#2563eb',
            bg: '#eaf2fe',
        }
    }
    if(isPast) {
        return {
            icon: '⚠️',
            title: 'Missed',
            desc: 'Medication was missed on this day.',
            color: '#ef4444',
            bg: '#fee2e2',
        }
    }
    return {
        icon: '✅',
        title: 'Scheduled',
        desc: 'Medication is scheduled for this day.',
        color: '#16a34a',
        bg: '#d1fae5',
    }
  }
  const details = getDetails();

  return (
    <div className="cv-container">
      <h2 className="cv-title">Medication Calendar Overview</h2>
      <div className="cv-main">
        <div className="cv-calendar-box">
          <div className="cv-calendar-header">
            <button className="cv-arrow" onClick={handlePrevMonth}>&#60;</button>
            <span className="cv-month">{monthName} {year}</span>
            <button className="cv-arrow" onClick={handleNextMonth}>&#62;</button>
          </div>
          <table className="cv-calendar-table">
            <thead>
              <tr>
                {weekDays.map((d) => <th key={d}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {calendarWeeks.map((w, i) => (
                <tr key={i}>
                  {w.map((day, j) => {
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    const isToday = day.toDateString() === today.toDateString();
                    const isPast = day < todayDateOnly;
                    
                    let statusClass = '';
                    if (isToday) statusClass = 'today';
                    else if (isPast) statusClass = 'missed';
                    else statusClass = 'taken';

                    return (
                        <td key={j}>
                            {isCurrentMonth ? (
                            <button
                                className={`cv-day-btn${isSelected ? ' selected' : ''}`}
                                onClick={() => handleDateClick(day)}
                            >
                                <span className={`cv-dot ${statusClass}${isSelected ? ' selected' : ''}`}></span>
                                {day.getDate()}
                            </button>
                            ) : <div className="cv-day-btn-disabled">{day.getDate()}</div>}
                        </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cv-legend">
            <span><span className="cv-dot taken"></span> Medication taken</span>
            <span><span className="cv-dot missed"></span> Missed medication</span>
            <span><span className="cv-dot today"></span> Today</span>
          </div>
        </div>
        <div className="cv-details-panel">
          <div className="cv-details-title">Details for {selectedDate.toLocaleString('default', { month: 'long' })} {selectedDate.getDate()}, {selectedDate.getFullYear()}</div>
          <div className="cv-details-card" data-status={details.title.toLowerCase()}>
            <div className="cv-details-row">
              <span className="cv-details-icon">{details.icon}</span>
              <span className="cv-details-status">{details.title}</span>
            </div>
            <div className="cv-details-desc">{details.desc}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 