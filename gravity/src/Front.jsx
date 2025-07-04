import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Front.css";

export default function Front() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      fetch(`http://127.0.0.1:5001/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setRole(data.role);
        });
    }
  }, []);

  const isPatient = role === 'patient';
  const isCaretaker = role === 'caretaker';

  return (
    <div className="front-root">
      <div className="front-header">
        <div className="front-icon-bg">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
            <path d="M12 21s-7-5.686-7-10.5A5.5 5.5 0 0 1 12 5.5a5.5 5.5 0 0 1 7 5.0C19 15.314 12 21 12 21z" stroke="#2ecc8d" strokeWidth="2" fill="#fff"/>
          </svg>
        </div>
        <h1 className="front-title">
          Welcome to MediCare Companion
        </h1>
        <p className="front-desc">
          Your trusted partner in medication management. Choose your role to get<br />
          started with personalized features.
        </p>
      </div>
      <div className="front-cards">
        {/* Patient Card */}
        <div className="front-card">
          <div className="front-avatar-patient">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" stroke="#2563eb" strokeWidth="2" fill="#fff"/>
              <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="#2563eb" strokeWidth="2" fill="#fff"/>
            </svg>
          </div>
          <h2 className="front-card-title-patient">
            I'm a Patient
          </h2>
          <p className="front-card-desc">
            Track your medication schedule and maintain your health records
          </p>
          <ul className="front-list-patient">
            <li>Mark medications as taken</li>
            <li>Upload proof photos (optional)</li>
            <li>View your medication calendar</li>
            <li>Large, easy-to-use interface</li>
          </ul>
          <button className="front-btn-patient" onClick={() => navigate('/patient')} disabled={isCaretaker}>
            Continue as Patient
          </button>
        </div>
        {/* Caretaker Card */}
        <div className="front-card">
          <div className="front-avatar-caretaker">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" stroke="#16a34a" strokeWidth="2" fill="#fff"/>
              <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="#16a34a" strokeWidth="2" fill="#fff"/>
            </svg>
          </div>
          <h2 className="front-card-title-caretaker">
            I'm a Caretaker
          </h2>
          <p className="front-card-desc">
            Monitor and support your loved one's medication adherence
          </p>
          <ul className="front-list-caretaker">
            <li>Monitor medication compliance</li>
            <li>Set up notification preferences</li>
            <li>View detailed reports</li>
            <li>Receive email alerts</li>
          </ul>
          <button className="front-btn-caretaker" onClick={() => navigate('/caretaker')} disabled={isPatient}>
            Continue as Caretaker
          </button>
        </div>
      </div>
      <div className="front-footer">
        You can switch between roles anytime after setup
      </div>
    </div>
  );
}
