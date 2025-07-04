import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import SignUp from './SignUp';

const LoginIcon = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h1" />
    </svg>
);

const UserPlusIcon = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-root">
            <header className="home-header">
                <div className="home-logo">
                    MediCare Companion
                </div>
                <nav className="home-nav">
                    <button className="home-nav-btn login" onClick={() => navigate('/login')}>
                        <LoginIcon /> Login
                    </button>
                    <button className="home-nav-btn signup" onClick={() => navigate('/signup')}>
                        <UserPlusIcon /> Sign Up
                    </button>
                </nav>
            </header>
            <main className="home-hero">
                <div className="home-hero-content">
                    <h1 className="home-hero-title">Your Trusted Medicare Companion</h1>
                    <p className="home-hero-subtitle">
                        Navigate your healthcare journey with confidence. We provide personalized Medicare guidance to ensure you make informed decisions about your health coverage.
                    </p>
                    <button className="home-cta-btn" onClick={() => navigate('/login')}>
                        <CalendarIcon /> Schedule a Consultation
                    </button>
                </div>
            </main>
        </div>
    );
} 