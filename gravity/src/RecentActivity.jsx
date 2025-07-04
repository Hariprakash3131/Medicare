import React from 'react';
import './RecentActivity.css';

// Placeholder icons - replace with an icon library if you have one
const CheckIcon = () => <span className="ra-icon-check">✓</span>;
const WarningIcon = () => <span className="ra-icon-warning">!</span>;
const PhotoIcon = () => <span className="ra-icon-photo">📷</span>;

const activityData = [
    {
        day: 'Monday, June 10',
        status: 'Taken at 8:30 AM',
        type: 'completed',
        hasPhoto: true,
    },
    {
        day: 'Sunday, June 9',
        status: 'Taken at 8:15 AM',
        type: 'completed',
        hasPhoto: false,
    },
    {
        day: 'Saturday, June 8',
        status: 'Medication missed',
        type: 'missed',
        hasPhoto: false,
    },
    {
        day: 'Friday, June 7',
        status: 'Taken at 8:45 AM',
        type: 'completed',
        hasPhoto: true,
    },
    {
        day: 'Thursday, June 6',
        status: 'Taken at 8:20 AM',
        type: 'completed',
        hasPhoto: false,
    },
];

export default function RecentActivity() {
    return (
        <div className="ra-card">
            <h2 className="ra-title">Recent Medication Activity</h2>
            <ul className="ra-activity-list">
                {activityData.map((item, index) => (
                    <li key={index} className="ra-activity-item">
                        <div className="ra-activity-main">
                            <div className="ra-activity-icon-bg" data-type={item.type}>
                                {item.type === 'completed' ? <CheckIcon /> : <WarningIcon />}
                            </div>
                            <div className="ra-activity-details">
                                <div className="ra-activity-day">{item.day}</div>
                                <div className="ra-activity-status">{item.status}</div>
                            </div>
                        </div>
                        <div className="ra-activity-actions">
                            {item.hasPhoto && (
                                <button className="ra-photo-btn">
                                    <PhotoIcon /> Photo
                                </button>
                            )}
                             <span className="ra-badge" data-type={item.type}>
                                {item.type === 'missed' ? 'Missed' : 'Completed'}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
} 