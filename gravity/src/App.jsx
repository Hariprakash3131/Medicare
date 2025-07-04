import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Front from './Front';
import ContinuePatient from './ContinuePatient';
import CareTacker from './CareTacker';
import CaretakerOverview from './CaretakerOverview';
import RecentActivity from './RecentActivity';
import ClenderView from './ClenderView';
import Notifications from './Notifications';
import SignUp from './SignUp';
import Login from './Login';
import PatientList from './PatientList';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/front" element={<Front />} />
      <Route path="/patient" element={<ContinuePatient />} />
      <Route path="/caretaker" element={<CareTacker />}>
        <Route index element={<CaretakerOverview />} />
        <Route path="overview" element={<CaretakerOverview />} />
        <Route path="activity" element={<RecentActivity />} />
        <Route path="calendar" element={<ClenderView />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="patient-list" element={<PatientList />} />
      </Route>
    </Routes>
  )
}

export default App
