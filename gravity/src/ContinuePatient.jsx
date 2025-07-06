import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ContinuePatient.css";

export default function ContinuePatient() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMedicationTaken, setIsMedicationTaken] = useState(false);
    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [dayStreak, setDayStreak] = useState(0);
    const [todayStatus, setTodayStatus] = useState('○');
    const [monthlyRate, setMonthlyRate] = useState(0);
    const [takenDates, setTakenDates] = useState([]);
    const [photos, setPhotos] = useState({});
    const [medicationSchedule, setMedicationSchedule] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.id) {
            fetch(`${import.meta.env.VITE_API_URL}/medication-taken/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.taken_dates) {
                        setTakenDates(data.taken_dates);
                        if (data.photos) setPhotos(data.photos);

                        // --- Compute stats from backend data ---
                        const sortedDates = [...data.taken_dates].sort();
                        let streak = 0;
                        let current = new Date();
                        for (let i = sortedDates.length - 1; i >= 0; i--) {
                            const date = new Date(sortedDates[i]);
                            if (
                                date.getFullYear() === current.getFullYear() &&
                                date.getMonth() === current.getMonth() &&
                                date.getDate() === current.getDate()
                            ) {
                                streak++;
                                current.setDate(current.getDate() - 1);
                            } else {
                                break;
                            }
                        }
                        setDayStreak(streak);

                        const todayStr = new Date().toISOString().slice(0, 10);
                        setTodayStatus(data.taken_dates.includes(todayStr) ? '✔' : '○');

                        const thisMonth = new Date().getMonth();
                        const thisYear = new Date().getFullYear();
                        const daysThisMonth = data.taken_dates.filter(d => {
                            const dt = new Date(d);
                            return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear;
                        }).length;
                        setMonthlyRate((daysThisMonth * 100 / 30).toFixed(2));
                    }
                });
            // Fetch medication schedule for this patient
            fetch(`${import.meta.env.VITE_API_URL}/medication-schedule/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.schedules) setMedicationSchedule(data.schedules);
                });
        }
    }, []);

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

    const handleTakePhotoClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
            // ...your existing upload logic...
        }
    };

    const handleMarkAsTaken = async () => {
        setIsMedicationTaken(true);
        setSuccessMsg('Medication marked as taken!');
        setDayStreak(prev => prev + 1);
        setTodayStatus('✔');
        setMonthlyRate(prev => {
            const newRate = prev + 3.33;
            return newRate > 100 ? 100 : parseFloat(newRate.toFixed(2));
        });
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        setTakenDates(prev => prev.includes(todayStr) ? prev : [...prev, todayStr]);
        setTimeout(() => setSuccessMsg(''), 3000);

        // --- API call to save in database ---
        const user = JSON.parse(localStorage.getItem('user'));
        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('taken_date', todayStr);
        if (fileInputRef.current && fileInputRef.current.files[0]) {
            formData.append('photo', fileInputRef.current.files[0]);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/medication-taken`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Failed to save medication record.');
            } else {
                // Optionally, re-fetch the taken dates to ensure UI is in sync
                fetch(`${import.meta.env.VITE_API_URL}/medication-taken/${user.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.taken_dates) setTakenDates(data.taken_dates);
                        if (data.photos) setPhotos(data.photos);
                        // Only clear the local preview after backend photo is available
                        setPhotoPreview(null);
                        // --- Compute stats here as well (copy the same logic as above) ---
                        const sortedDates = [...data.taken_dates].sort();
                        let streak = 0;
                        let current = new Date();
                        for (let i = sortedDates.length - 1; i >= 0; i--) {
                            const date = new Date(sortedDates[i]);
                            if (
                                date.getFullYear() === current.getFullYear() &&
                                date.getMonth() === current.getMonth() &&
                                date.getDate() === current.getDate()
                            ) {
                                streak++;
                                current.setDate(current.getDate() - 1);
                            } else {
                                break;
                            }
                        }
                        setDayStreak(streak);

                        const todayStr = new Date().toISOString().slice(0, 10);
                        setTodayStatus(data.taken_dates.includes(todayStr) ? '✔' : '○');

                        const thisMonth = new Date().getMonth();
                        const thisYear = new Date().getFullYear();
                        const daysThisMonth = data.taken_dates.filter(d => {
                            const dt = new Date(d);
                            return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear;
                        }).length;
                        setMonthlyRate((daysThisMonth * 100 / 30).toFixed(2));
                    });
            }
        } catch (err) {
            alert('Network error: ' + err.message);
        }
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

    const getMedicationTitle = () => {
        if (selectedDate.toDateString() === today.toDateString()) {
            return "Today's Medication";
        }
        return `Medication for ${selectedDate.toLocaleString('default', { month: 'long' })} ${selectedDate.getDate()}`;
    };

    return (
        <div className="cp-root">
            <header className="cp-header">
                <div className="cp-header-left" onClick={() => navigate('/')}>
                    <div className="cp-logo">M</div>
                    <div>
                        <div className="cp-app-title">MediCare Companion</div>
                        <div className="cp-app-view">Patient View</div>
                    </div>
                </div>
                <button className="cp-switch-btn" aria-label="Switch to Caretaker" onClick={() => navigate('/caretaker')}>
                    <span className="cp-switch-icon">👤</span> Switch to Caretaker
                </button>
            </header>
            <main className="cp-main">
                <section className="cp-greeting-card">
                    <div className="cp-greeting-row">
                        <div className="cp-greeting-icon">
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="8" r="4" stroke="#2563eb" strokeWidth="2" fill="#fff" />
                                <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="#2563eb" strokeWidth="2" fill="#fff" />
                            </svg>
                        </div>
                        <div>
                            <div className="cp-greeting-title">Good Afternoon!</div>
                            <div className="cp-greeting-desc">Ready to stay on track with your medication?</div>
                        </div>
                    </div>
                    <div className="cp-greeting-stats">
                        <div className="cp-greeting-stat">
                            <div className="cp-greeting-stat-value">{dayStreak}</div>
                            <div className="cp-greeting-stat-label">Day Streak</div>
                        </div>
                        <div className="cp-greeting-stat">
                            <div className="cp-greeting-stat-value">{todayStatus}</div>
                            <div className="cp-greeting-stat-label">Today's Status</div>
                        </div>
                        <div className="cp-greeting-stat">
                            <div className="cp-greeting-stat-value">{monthlyRate}%</div>
                            <div className="cp-greeting-stat-label">Monthly Rate</div>
                        </div>
                    </div>
                </section>
                <div className="cp-main-content-row">
                    <section className="cp-medication-card cp-width-65">
                        {isMedicationTaken ? (
                            <div className="cp-completed-view">
                                <div className="cp-completed-banner">
                                    <div className="cp-completed-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <h2 className="cp-completed-title">Medication Completed!</h2>
                                    <p className="cp-completed-subtitle">
                                        Great job! You've taken your medication for {selectedDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}.
                                    </p>
                                </div>
                                <div className="cp-medication-set completed">
                                    <div className="cp-medication-set-circle completed">
                                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="cp-medication-set-title">Daily Medication Set</div>
                                        <div className="cp-medication-set-desc">Complete set of daily tablets</div>
                                    </div>
                                    <div className="cp-medication-set-time" title="Scheduled time">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M12 6V12L16 14" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        8:00 AM
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="cp-medication-title-row">
                                    <span className="cp-medication-title-icon" aria-hidden="true">📋</span>
                                    <span className="cp-medication-title">{getMedicationTitle()}</span>
                                </div>
                                <div className="cp-medication-set">
                                    <div className="cp-medication-set-circle">1</div>
                                    <div>
                                        <div className="cp-medication-set-title">{medicationSchedule[0]?.medication_name || 'No Medication Assigned'}</div>
                                        <div className="cp-medication-set-desc">
                                            {medicationSchedule[0] ? `${medicationSchedule[0].dosage} • ${medicationSchedule[0].frequency}` : 'No schedule set by caretaker'}
                                        </div>
                                    </div>
                                    <div className="cp-medication-set-time" title="Scheduled time">
                                        {medicationSchedule[0]?.time_of_day ? `🕗 ${medicationSchedule[0].time_of_day}` : '—'}
                                    </div>
                                </div>
                                <div className="cp-medication-photo-box">
                                    <div className="cp-medication-photo-icon">
                                        <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                                            <rect x="3" y="5" width="18" height="14" rx="3" stroke="#b0b0b0" strokeWidth="2" fill="#fff" />
                                            <circle cx="12" cy="12" r="3" stroke="#b0b0b0" strokeWidth="2" fill="#fff" />
                                        </svg>
                                    </div>
                                    <div className="cp-medication-photo-text">
                                        <div className="cp-medication-photo-title">Add Proof Photo <span className="cp-optional">(Optional)</span></div>
                                        <div className="cp-medication-photo-desc">Take a photo of your medication or pill organizer as confirmation</div>
                                        <button className="cp-photo-btn" aria-label="Take Photo" onClick={handleTakePhotoClick}>
                                            <span className="cp-photo-btn-icon" aria-hidden="true">📷</span> Take Photo
                                        </button>
                                        <input type="file" accept="image/*" className="visually-hidden" ref={fileInputRef} onChange={handlePhotoChange} />
                                    </div>
                                </div>
                                {photoPreview && (
                                    <div className="cp-photo-preview">
                                        <img src={photoPreview} style={{ maxWidth: '100%', marginTop: 8, borderRadius: 8 }} />
                                    </div>
                                )}
                                {!photoPreview && photos[
                                    `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
                                ] && (
                                    <div className="cp-photo-preview">
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${photos[
                                                `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
                                            ]}`}
                                            style={{ maxWidth: '100%', marginTop: 8, borderRadius: 8 }}
                                        />
                                    </div>
                                )}
                                {successMsg && (
                                    <div className="cp-success-msg">{successMsg}</div>
                                )}
                                <button className="cp-taken-btn" aria-label="Mark as Taken" onClick={handleMarkAsTaken}>✓ Mark as Taken</button>
                            </>
                        )}
                    </section>

                    <section className="cp-calendar-card cp-width-35">
                        <div className="cp-calendar-title">Medication Calendar</div>
                        <div className="cp-calendar-nav">
                            <button className="cp-calendar-arrow" aria-label="Previous Month" onClick={handlePrevMonth}>&#60;</button>
                            <span className="cp-calendar-month">{monthName} {year}</span>
                            <button className="cp-calendar-arrow" aria-label="Next Month" onClick={handleNextMonth}>&#62;</button>
                        </div>
                        <table className="cp-calendar-table" aria-label="Medication Calendar">
                            <thead>
                                <tr>
                                    <th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th>
                                </tr>
                            </thead>
                            <tbody>
                               {calendarWeeks.map((week, weekIndex) => (
                                <tr key={weekIndex}>
                                    {week.map((day, dayIndex) => {
                                        const classNames = [];
                                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                                        const isToday = day.toDateString() === today.toDateString();
                                        const isSelected = day.toDateString() === selectedDate.toDateString();

                                        if (!isCurrentMonth) {
                                            classNames.push("cp-calendar-next");
                                        } else {
                                            if (isToday && !isSelected) {
                                                classNames.push("cp-calendar-today");
                                            }
                                            if (day < todayDateOnly) {
                                                classNames.push("cp-calendar-missed-indicator");
                                            }
                                            if (isSelected) {
                                                classNames.push("cp-calendar-today-selected");
                                            }
                                        }

                                        return ( 
                                            <td key={dayIndex} className={classNames.join(" ")} onClick={() => isCurrentMonth && handleDateClick(day)}>
                                                {day.getDate()}
                                                {takenDates.includes(
                                                    `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
                                                ) && (
                                                    <span className="cp-calendar-dot cp-calendar-dot-green" />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                               ))}
                            </tbody>
                        </table>
                        <div className="rightcal">      
                        <div className="cp-calendar-legend">
                            <span><span className="cp-calendar-dot cp-calendar-dot-green"></span> Medication taken</span>
                            <span><span className="cp-calendar-dot cp-calendar-dot-red"></span> Missed medication</span>
                            <span><span className="cp-calendar-dot cp-calendar-dot-blue"></span> Today</span>
                        </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
