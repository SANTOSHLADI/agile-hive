// frontend/src/components/Auth/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

const Login = ({ onLoginSuccess }) => { // onLoginSuccess prop from App.jsx
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });
            setMessage(response.data.message);
            // Store JWT token
            localStorage.setItem('token', response.data.token);
            // Call parent function for global state update/redirection
            onLoginSuccess(response.data.user); // Pass user data up
            navigate('/dashboard'); // Redirect to dashboard
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Login to AgileHive</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {message && <p style={styles.successMessage}>{message}</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}
            <p style={styles.text}>Don't have an account? <a href="/signup">Sign up here</a></p>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f4f7f6',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '400px',
        margin: '50px auto',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    header: {
        color: '#333',
        marginBottom: '20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    input: {
        padding: '12px',
        margin: '8px 0',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
    },
    button: {
        padding: '12px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
    },
    successMessage: {
        color: 'green',
        marginTop: '15px',
        textAlign: 'center',
    },
    errorMessage: {
        color: 'red',
        marginTop: '15px',
        textAlign: 'center',
    },
    text: {
        marginTop: '20px',
        fontSize: '14px',
        color: '#555',
    }
};

export default Login;