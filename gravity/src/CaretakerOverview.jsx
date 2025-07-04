import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

// Using placeholder icons (emojis) for now. 
// You can replace these with an icon library like react-icons.
const CalendarIcon = () => <span>📅</span>;
const MailIcon = () => <span>✉️</span>;
const BellIcon = () => <span>🔔</span>;
const FullCalendarIcon = () => <span>🗓️</span>;

export default function CaretakerOverview() {
    const [showToast, setShowToast] = useState(false);
    const [patients, setPatients] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || user.role !== 'caretaker') {
            navigate('/'); // or another appropriate page
        }
    }, [user, navigate]);

    const handleSendReminder = () => {
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000); 
    };

    useEffect(() => {
        fetch('http://127.0.0.1:5001/patients')
            .then(res => res.json())
            .then(data => {
                setPatients(data);
            });
    }, []);

    useEffect(() => {
        fetch('http://127.0.0.1:5001/all-patient-stats')
            .then(res => res.json())
            .then(data => setPatients(data));
    }, []);

    return (
        <>
            <div className="ct-cards-row">
                <section className="ct-card ct-status-card">
                    <h2 className="ct-card-title">
                        <CalendarIcon /> Today's Status
                    </h2>
                    <div className="ct-status-item">
                        <div>
                            <div className="ct-status-title">Daily Medication Set</div>
                            <div className="ct-status-time">8:00 AM</div>
                        </div>
                        <span className="ct-status-badge">Pending</span>
                    </div>
                </section>
                <section className="ct-card ct-actions-card">
                    <h2 className="ct-card-title">Quick Actions</h2>
                    <button className="ct-action-btn" onClick={handleSendReminder}>
                        <MailIcon /> Send Reminder Email
                    </button>
                    <button className="ct-action-btn" onClick={() => navigate('/caretaker/notifications')}>
                        <BellIcon /> Configure Notifications
                    </button>
                    <button className="ct-action-btn" onClick={() => navigate('/caretaker/calendar')}>
                        <FullCalendarIcon /> View Full Calendar
                    </button>
                </section>
            </div>

            {user && user.role === 'caretaker' ? (
                <section className="ct-card ct-progress-card">
                    <h2 className="ct-card-title">All Patients' Monthly Adherence Progress</h2>
                    {patients.map(patient => (
                        <div key={patient.id} className="ct-patient-progress">
                            <h3>{patient.first_name} {patient.last_name} ({patient.email})</h3>
                            <div className="ct-progress-header">
                                <span>Overall Progress</span>
                                <span>{patient.percent}%</span>
                            </div>
                            <div 
                                className="ct-progress-bar-container"
                                style={{ '--taken-width': `${patient.percent}%`, '--missed-width': `${patient.missed / (patient.taken + patient.missed + patient.remaining || 1) * 100}%` }}
                            >
                                <div className="ct-progress-bar-taken"></div>
                                <div className="ct-progress-bar-missed"></div>
                            </div>
                            <div className="ct-progress-legend">
                                <div className="ct-legend-item">
                                    <span className="ct-legend-dot taken"></span>
                                    <div><strong>{patient.taken} days</strong><br />Taken (this month)</div>
                                </div>
                                <div className="ct-legend-item">
                                    <span className="ct-legend-dot missed"></span>
                                    <div><strong>{patient.missed} days</strong><br />Missed (this month)</div>
                                </div>
                                <div className="ct-legend-item">
                                    <span className="ct-legend-dot remaining"></span>
                                    <div><strong>{patient.remaining} days</strong><br />Remaining (this month)</div>
                                </div>
                                <div className="ct-legend-item">
                                    <span className="ct-legend-dot streak"></span>
                                    <div><strong>{patient.streak} days</strong><br />Current Streak</div>
                                </div>
                                <div className="ct-legend-item">
                                    <span className="ct-legend-dot week"></span>
                                    <div><strong>{patient.taken_this_week} days</strong><br />Taken This Week</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            ) : (
                <div className="ct-card ct-progress-card">
                    <h2 className="ct-card-title">Access Denied</h2>
                    <p>Only caretakers can view all patient information.</p>
                </div>
            )}

            <section className="ct-card ct-progress-card">
                <h2 className="ct-card-title">All Patients' Medication Stats</h2>
                <div className="ct-stats-table-wrapper">
                    <table className="ct-stats-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Current Streak</th>
                                <th>Missed This Month</th>
                                <th>Taken This Week</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map(p => (
                                <tr key={p.id}>
                                    <td>{p.first_name} {p.last_name}</td>
                                    <td>{p.email}</td>
                                    <td>{p.streak}</td>
                                    <td>{p.missed_this_month}</td>
                                    <td>{p.taken_this_week}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <Toast 
                message="Reminder email has been sent!" 
                show={showToast} 
                onClose={() => setShowToast(false)} 
            />
        </>
    );
} 