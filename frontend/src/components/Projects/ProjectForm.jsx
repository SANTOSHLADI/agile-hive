// frontend/src/components/Projects/ProjectForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Make sure Link is imported

const API_BASE_URL = 'http://localhost:5000/api';

const ProjectForm = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!name || !description) {
            setError('Project name and description are required.');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token missing. Please log in.');
                setLoading(false);
                return;
            }

            await axios.post(`${API_BASE_URL}/projects`, {
                name,
                description,
                endDate: endDate || undefined, // Send undefined if empty
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage('Project created successfully!');
            // Redirect to project list after successful creation
            navigate('/projects');
        } catch (err) {
            console.error('Project creation error:', err);
            setError(err.response?.data?.message || 'Failed to create project.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Create New Project</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Project Name:</label>
                <input
                    type="text"
                    placeholder="e.g., Website Redesign"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={styles.input}
                />
                <label style={styles.label}>Description:</label>
                <textarea
                    placeholder="Brief description of the project"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    style={styles.textarea}
                ></textarea>
                <label style={styles.label}>End Date (Optional):</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={styles.input}
                />
                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Creating...' : 'Create Project'}
                </button>
            </form>
            {message && <p style={styles.successMessage}>{message}</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}
            <p style={styles.backLink}><Link to="/projects">Back to Projects List</Link></p>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '600px',
        margin: '20px auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    header: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '25px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#555',
    },
    input: {
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
    },
    textarea: {
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        minHeight: '80px',
        resize: 'vertical',
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
        transition: 'background-color 0.3s ease',
    },
    buttonHover: {
        backgroundColor: '#0056b3',
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
    backLink: {
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '14px',
    }
};

export default ProjectForm;