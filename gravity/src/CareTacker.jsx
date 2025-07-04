import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './CareTacker.css';

// Using placeholder icons (emojis) for now. 
// You can replace these with an icon library like react-icons.
const UserGroupIcon = () => <span>👥</span>;
const CalendarIcon = () => <span>📅</span>;
const MailIcon = () => <span>✉️</span>;
const BellIcon = () => <span>🔔</span>;
const FullCalendarIcon = () => <span>🗓️</span>;
const SwitchIcon = () => <span>👤</span>;

export default function CareTacker() {
    const navigate = useNavigate();

    return (
        <div className="ct-root">
            <header className="ct-header">
                <div className="ct-header-left" onClick={() => navigate('/')}>
                    <div className="ct-logo">M</div>
                    <div>
                        <div className="ct-app-title">MediCare Companion</div>
                        <div className="ct-app-view">Caretaker View</div>
                    </div>
                </div>
                <button className="ct-switch-btn" onClick={() => navigate('/patient')}>
                    <SwitchIcon /> Switch to Patient
                </button>
            </header>

            <main className="ct-main">
                <section className="ct-dashboard-card">
                    <div className="ct-dashboard-header">
                        <div className="ct-dashboard-icon-bg">
                            <UserGroupIcon />
                        </div>
                        <div>
                            <h1 className="ct-dashboard-title">Caretaker Dashboard</h1>
                            <p className="ct-dashboard-subtitle">Monitoring Eleanor Thompson's medication adherence</p>
                        </div>
                    </div>
                    <div className="ct-dashboard-stats">
                        <div className="ct-stat-item">
                            <div className="ct-stat-value">85%</div>
                            <div className="ct-stat-label">Adherence Rate</div>
                        </div>
                        <div className="ct-stat-item">
                            <div className="ct-stat-value">5</div>
                            <div className="ct-stat-label">Current Streak</div>
                        </div>
                        <div className="ct-stat-item">
                            <div className="ct-stat-value">3</div>
                            <div className="ct-stat-label">Missed This Month</div>
                        </div>
                        <div className="ct-stat-item">
                            <div className="ct-stat-value">4</div>
                            <div className="ct-stat-label">Taken This Week</div>
                        </div>
                    </div>
                </section>

                <nav className="ct-tabs">
                    <NavLink to="/caretaker/overview" className={({ isActive }) => isActive ? "ct-tab active" : "ct-tab"} end>Overview</NavLink>
                    <NavLink to="/caretaker/patient-list" className={({ isActive }) => isActive ? "ct-tab active" : "ct-tab"}>Patient List</NavLink>
                    <NavLink to="/caretaker/activity" className={({ isActive }) => isActive ? "ct-tab active" : "ct-tab"}>Recent Activity</NavLink>
                    <NavLink to="/caretaker/calendar" className={({ isActive }) => isActive ? "ct-tab active" : "ct-tab"}>Calendar View</NavLink>
                    <NavLink to="/caretaker/notifications" className={({ isActive }) => isActive ? "ct-tab active" : "ct-tab"}>Notifications</NavLink>
                </nav>

                <Outlet />
                
            </main>
        </div>
    );
}
