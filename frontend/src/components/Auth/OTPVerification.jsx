// frontend/src/components/Auth/OTPVerification.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Base URL for your backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OTPVerification = ({ email, password, onVerificationSuccess }) => {
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            // CRITICAL FIX: Added '/api' prefix to the URL
            const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
                email,
                otp,
                password,
            });
            setMessage(response.data.message);
            localStorage.setItem('token', response.data.token);
            onVerificationSuccess();
            navigate('/dashboard');
        } catch (err) {
            console.error('OTP verification error:', err);
            setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setMessage('');
        setLoading(true);
        try {
            // CRITICAL FIX: Added '/api' prefix to the URL
            await axios.post(`${API_BASE_URL}/api/auth/register-otp-request`, { email, password });
            setMessage('New OTP sent to your email.');
            setResendTimer(60);
            setCanResend(false);
        } catch (err) {
            console.error('Resend OTP error:', err);
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Verify Your Email</h2>
            <p style={styles.text}>An OTP has been sent to **{email}**.</p>
            <form onSubmit={handleVerify} style={styles.form}>
                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
            </form>
            <p style={styles.resendText}>
                Didn't receive the OTP? {' '}
                <button
                    onClick={handleResendOtp}
                    disabled={!canResend || loading}
                    style={canResend ? styles.resendButton : styles.resendButtonDisabled}
                >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
            </p>
            {message && <p style={styles.successMessage}>{message}</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}
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
    text: {
        marginBottom: '15px',
        textAlign: 'center',
        color: '#555',
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
    resendText: {
        marginTop: '20px',
        fontSize: '14px',
        color: '#555',
        textAlign: 'center',
    },
    resendButton: {
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        textDecoration: 'underline',
        fontSize: '14px',
        padding: '0',
    },
    resendButtonDisabled: {
        background: 'none',
        border: 'none',
        color: '#999',
        cursor: 'not-allowed',
        fontSize: '14px',
        padding: '0',
    }
};

export default OTPVerification;