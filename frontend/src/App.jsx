// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Signup from './components/Auth/Signup';
import OTPVerification from './components/Auth/OTPVerification';
import Login from './components/Auth/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProjectList from './components/Projects/ProjectList';
import ProjectForm from './components/Projects/ProjectForm';
import TaskForm from './components/Tasks/TaskForm'; // For creating new tasks
import ProjectDetails from './components/Projects/ProjectDetails'; // For viewing project details

// Main App component responsible for routing and global auth state
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tempEmail, setTempEmail] = useState('');
    const [tempPassword, setTempPassword] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleOtpSent = (email, password) => {
        setTempEmail(email);
        setTempPassword(password);
    };

    const handleVerificationSuccess = () => {
        setIsAuthenticated(true);
        setTempEmail('');
        setTempPassword('');
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };

    return (
        <Router>
            <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
            <Routes>
                {/* Public Routes */}
                <Route path="/signup" element={<Signup onOtpSent={handleOtpSent} />} />
                <Route
                    path="/verify-otp"
                    element={
                        tempEmail && tempPassword ? (
                            <OTPVerification
                                email={tempEmail}
                                password={tempPassword}
                                onVerificationSuccess={handleVerificationSuccess}
                            />
                        ) : (
                            <Login onLoginSuccess={handleLoginSuccess} />
                        )
                    }
                />
                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<ProjectList />} />
                    <Route path="/projects/new" element={<ProjectForm />} />
                    {/* CRITICAL CHANGE: Ensure this dynamic route uses :id consistently and is before more general dynamic routes if any */}
                    {/* We're changing :projectId to :id for consistency with useParams in ProjectDetails */}
                    <Route path="/projects/:id" element={<ProjectDetails />} /> {/* <--- UPDATED THIS LINE */}

                    {/* TaskForm here is a standalone route, not inside a project path */}
                    <Route path="/tasks/new" element={<TaskForm />} />
                    {/* Other protected routes like /tasks etc. will go here later */}
                </Route>
            </Routes>
        </Router>
    );
}

export default App;