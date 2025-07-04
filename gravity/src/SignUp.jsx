import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

export default function SignUp() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'patient',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:5001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        // If server returns an error, display it
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(data.message);
      // Optional: redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-root">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2 className="signup-title">Create an Account</h2>
        {error && <p className="signup-error">{error}</p>}
        {success && <p className="signup-success">{success}</p>}
        <label>
          First Name
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Last Name
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Role
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="patient">Patient</option>
            <option value="caretaker">Caretaker</option>
          </select>
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </label>
        <button className="signup-btn" type="submit">Sign Up</button>
        <div className="signup-login-link">
          Already have an account?{' '}
          <span className="login-link" onClick={() => navigate('/login')}>Login</span>
        </div>
      </form>
    </div>
  );
} 