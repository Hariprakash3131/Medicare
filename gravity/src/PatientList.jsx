import React, { useEffect, useState } from 'react';
import './PatientList.css';

const MEDICATIONS = [
  {
    name: 'Paracetamol',
    dosage: '500 mg',
    frequency: 'Every 6 hrs',
  },
  {
    name: 'Amoxicillin',
    dosage: '250 mg',
    frequency: '3 times/day',
  },
  {
    name: 'Insulin',
    dosage: '10 units',
    frequency: 'Once daily',
  },
  {
    name: 'Vitamin D',
    dosage: '1 tablet',
    frequency: 'Weekly',
  },
  {
    name: 'BP Tablet',
    dosage: '5 mg',
    frequency: 'Daily',
  },
];

const DEFAULT_SCHEDULE = [
  {
    medication: 'Paracetamol',
    dosage: '500 mg',
    frequency: 'Every 6 hrs',
    time: '8am, 2pm, 8pm, 2am',
    notes: 'For fever',
  },
  {
    medication: 'Amoxicillin',
    dosage: '250 mg',
    frequency: '3 times/day',
    time: 'After meals (9am, 1pm, 8pm)',
    notes: '7-day course',
  },
  {
    medication: 'Insulin',
    dosage: '10 units',
    frequency: 'Once daily',
    time: '7am (before breakfast)',
    notes: 'Check sugar before',
  },
  {
    medication: 'Vitamin D',
    dosage: '1 tablet',
    frequency: 'Weekly',
    time: 'Sunday morning',
    notes: 'With milk',
  },
  {
    medication: 'BP Tablet',
    dosage: '5 mg',
    frequency: 'Daily',
    time: '9am',
    notes: 'Monitor BP before dose',
  },
];

function UserGroupIcon() {
  return <span style={{ fontSize: 24, color: '#16a34a', marginRight: 8 }}>👥</span>;
}

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    medication: MEDICATIONS[0].name,
    dosage: MEDICATIONS[0].dosage,
    frequency: MEDICATIONS[0].frequency,
    time: '',
    notes: '',
  });
  const [alert, setAlert] = useState({ type: '', message: '' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
            fetch(`${import.meta.env.VITE_API_URL}/all-patient-stats`)
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
        if (data.length > 0) setForm(f => ({ ...f, patientId: data[0].id }));
        setSchedule(
          data.flatMap(p =>
            DEFAULT_SCHEDULE.map(med => ({
              patientId: p.id,
              patientName: p.first_name + ' ' + p.last_name,
              ...med,
            }))
          )
        );
      })
      .catch(() => {
        setError('Failed to fetch patients');
        setLoading(false);
      });
  }, []);

  function handleMedChange(e) {
    const med = MEDICATIONS.find(m => m.name === e.target.value);
    setForm(f => ({
      ...f,
      medication: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
    }));
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleAdd(e) {
    e.preventDefault();
    const patient = patients.find(p => p.id === Number(form.patientId));
    // Send to backend
            fetch(`${import.meta.env.VITE_API_URL}/medication-schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: form.patientId,
        medication_name: form.medication,
        dosage: form.dosage,
        frequency: form.frequency,
        time_of_day: form.time,
        notes: form.notes,
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setAlert({ type: 'success', message: 'Medication schedule added!' });
          setSchedule(sch => [
            ...sch,
            {
              patientId: form.patientId,
              patientName: patient ? patient.first_name + ' ' + patient.last_name : '',
              medication: form.medication,
              dosage: form.dosage,
              frequency: form.frequency,
              time: form.time,
              notes: form.notes,
            },
          ]);
          setForm(f => ({ ...f, time: '', notes: '' }));
        } else {
          setAlert({ type: 'error', message: data.error || 'Failed to add schedule.' });
        }
        setTimeout(() => setAlert({ type: '', message: '' }), 3000);
      })
      .catch(() => {
        setAlert({ type: 'error', message: 'Network error. Please try again.' });
        setTimeout(() => setAlert({ type: '', message: '' }), 3000);
      });
  }

  if (!user || user.role !== 'caretaker') {
    return (
      <div className="ct-card" style={{ maxWidth: 500, margin: '48px auto' }}>
        <h2 className="ct-card-title"><UserGroupIcon />Access Denied</h2>
        <p style={{ color: '#dc2626', fontWeight: 500 }}>Only caretakers can view and manage the patient list.</p>
      </div>
    );
  }

  if (loading) return <div className="patient-list-loading">Loading...</div>;
  if (error) return <div className="patient-list-error">{error}</div>;

  return (
    <div className="ct-card" style={{ maxWidth: 1100, margin: '40px auto', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <UserGroupIcon />
        <div>
          <h2 className="ct-card-title" style={{ marginBottom: 0 }}>Caretaker Dashboard</h2>
          <div style={{ color: '#2563eb', fontSize: 15, fontWeight: 500 }}>Welcome! Manage all patient medications in one place.</div>
        </div>
      </div>

      <div className="patient-list-card" style={{ boxShadow: 'none', border: 'none', margin: 0, marginBottom: 32 }}>
        <h2 className="patient-list-title">Add Medication Schedule</h2>
        {alert.message && (
          <div className={`patient-list-alert ${alert.type}`}>{alert.message}</div>
        )}
        <form className="patient-list-form" onSubmit={handleAdd}>
          <div className="patient-list-form-row">
            <select name="patientId" value={form.patientId} onChange={handleFormChange} required>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
            <select name="medication" value={form.medication} onChange={handleMedChange} required>
              {MEDICATIONS.map(med => (
                <option key={med.name} value={med.name}>{med.name}</option>
              ))}
            </select>
            <select name="dosage" value={form.dosage} onChange={handleFormChange} required>
              {MEDICATIONS.filter(m => m.name === form.medication).map(med => (
                <option key={med.dosage} value={med.dosage}>{med.dosage}</option>
              ))}
            </select>
            <select name="frequency" value={form.frequency} onChange={handleFormChange} required>
              {MEDICATIONS.filter(m => m.name === form.medication).map(med => (
                <option key={med.frequency} value={med.frequency}>{med.frequency}</option>
              ))}
            </select>
            <input name="time" value={form.time} onChange={handleFormChange} placeholder="Time of Day" required className="patient-list-input" />
            <input name="notes" value={form.notes} onChange={handleFormChange} placeholder="Notes" className="patient-list-input" />
            <button className="patient-list-add-btn" type="submit">Add</button>
          </div>
        </form>
      </div>

      <div className="patient-list-card" style={{ boxShadow: 'none', border: 'none', margin: 0 }}>
        <h2 className="patient-list-title">Medication Schedule</h2>
        <div className="patient-list-table-wrapper">
          <table className="patient-list-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Medication Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Time of Day</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, idx) => (
                <tr key={row.patientId + '-' + row.medication + '-' + idx}>
                  <td>{row.patientName}</td>
                  <td>{row.medication}</td>
                  <td>{row.dosage}</td>
                  <td>{row.frequency}</td>
                  <td>{row.time}</td>
                  <td>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
