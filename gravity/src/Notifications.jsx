import React, { useState } from 'react';
import './Notifications.css';

const ToggleSwitch = ({ checked, onChange }) => (
    <label className="nt-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="nt-slider"></span>
    </label>
);

const EmailNotificationsSection = ({ emailNotifs, onToggle, email, onEmailChange }) => (
    <div className="nt-section">
        <div className="nt-section-header">
            <div>
                <h3 className="nt-section-title">Email Notifications</h3>
                <p className="nt-section-desc">Receive medication alerts via email</p>
            </div>
            <ToggleSwitch checked={emailNotifs} onChange={onToggle} />
        </div>
        {emailNotifs && (
            <div className="nt-form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" value={email} onChange={onEmailChange} />
            </div>
        )}
    </div>
);

const MissedAlertsSection = ({ missedNotifs, onToggle, alertTime, onAlertTimeChange, reminderTime, onReminderTimeChange }) => (
     <div className="nt-section">
        <div className="nt-section-header">
            <div>
                <h3 className="nt-section-title">Missed Medication Alerts</h3>
                <p className="nt-section-desc">Get notified when medication is not taken on time</p>
            </div>
            <ToggleSwitch checked={missedNotifs} onChange={onToggle} />
        </div>
        {missedNotifs && (
            <>
                <div className="nt-form-group">
                    <label htmlFor="alert-time">Alert me if medication isn't taken within</label>
                    <select id="alert-time" value={alertTime} onChange={onAlertTimeChange}>
                        <option>1 hour</option>
                        <option>2 hours</option>
                        <option>4 hours</option>
                    </select>
                </div>
                <div className="nt-form-group">
                    <label htmlFor="reminder-time">Daily reminder time</label>
                    <input type="text" id="reminder-time" value={reminderTime} onChange={onReminderTimeChange} />
                    <p className="nt-input-desc">Time to check if today's medication was taken</p>
                </div>
            </>
        )}
    </div>
);

const EmailPreviewSection = ({ isMissedAlertsEnabled }) => (
    <div className="nt-card">
        <div className="nt-header">
            <span className="nt-icon">✉️</span>
            <h3 className="nt-section-title">Email Preview</h3>
        </div>
        <div className="nt-email-preview">
            <p><strong>Subject: Medication Alert - Eleanor Thompson</strong></p>
            <p>Hello,</p>
            {isMissedAlertsEnabled ? (
                <>
                    <p>This is a reminder that Eleanor Thompson has not taken her medication today.</p>
                    <p>Please check with her to ensure she takes her prescribed medication.</p>
                </>
            ) : (
                <p>Email alerts for missed medications are currently disabled.</p>
            )}
            <p>Current adherence rate: 85% (5-day streak)</p>
        </div>
    </div>
);


export default function Notifications() {
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [missedNotifs, setMissedNotifs] = useState(true);
    const [email, setEmail] = useState('caretaker@example.com');
    const [alertTime, setAlertTime] = useState('2 hours');
    const [reminderTime, setReminderTime] = useState('08:00 pm');

    return (
        <div className="nt-container">
            <div className="nt-card">
                <div className="nt-header">
                    <span className="nt-icon">🔔</span>
                    <h2 className="nt-title">Notification Preferences</h2>
                </div>

                <EmailNotificationsSection 
                    emailNotifs={emailNotifs}
                    onToggle={() => setEmailNotifs(!emailNotifs)}
                    email={email}
                    onEmailChange={e => setEmail(e.target.value)}
                />

                <MissedAlertsSection
                    missedNotifs={missedNotifs}
                    onToggle={() => setMissedNotifs(!missedNotifs)}
                    alertTime={alertTime}
                    onAlertTimeChange={e => setAlertTime(e.target.value)}
                    reminderTime={reminderTime}
                    onReminderTimeChange={e => setReminderTime(e.target.value)}
                />
            </div>

            <EmailPreviewSection isMissedAlertsEnabled={missedNotifs && emailNotifs} />

            <div className="nt-footer">
                <button className="nt-save-btn">Save Notification Settings</button>
            </div>
        </div>
    );
} 