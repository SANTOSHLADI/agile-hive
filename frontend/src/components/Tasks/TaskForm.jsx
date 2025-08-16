// frontend/src/components/Tasks/TaskForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TaskForm = ({ projectId, onTaskCreated, users }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('to-do');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [assignee, setAssignee] = useState('');
    const [documents, setDocuments] = useState([]); // Store selected files
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!title) {
            setError('Task title is required.');
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

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('status', status);
            formData.append('priority', priority);
            if (dueDate) formData.append('dueDate', dueDate);
            if (assignee) formData.append('assignee', assignee);

            // Attach documents
            for (let i = 0; i < documents.length; i++) {
                formData.append('documents', documents[i]);
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/tasks/projects/${projectId}/tasks`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setMessage('Task created successfully!');
            setTitle('');
            setDescription('');
            setStatus('to-do');
            setPriority('medium');
            setDueDate('');
            setAssignee('');
            setDocuments([]);
            onTaskCreated(response.data);
        } catch (err) {
            console.error('Task creation error:', err);
            setError(err.response?.data?.message || 'Failed to create task.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.header}>Add New Task</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Title:</label>
                <input
                    type="text"
                    placeholder="e.g., Implement Login Feature"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={styles.input}
                />

                <label style={styles.label}>Description:</label>
                <textarea
                    placeholder="Detailed task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.textarea}
                ></textarea>

                <label style={styles.label}>Status:</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
                    <option value="to-do">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>

                <label style={styles.label}>Priority:</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={styles.select}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                <label style={styles.label}>Due Date:</label>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={styles.input}
                />

                <label style={styles.label}>Assignee:</label>
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)} style={styles.select}>
                    <option value="">Unassigned</option>
                    {users.map(user => (
                        <option key={user._id} value={user._id}>
                            {user.name || user.email}
                        </option>
                    ))}
                </select>

                <label style={styles.label}>Documents (PDF only, max 3):</label>
                <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => setDocuments(e.target.files)}
                    style={styles.input}
                />

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Adding...' : 'Add Task'}
                </button>
            </form>
            {message && <p style={styles.successMessage}>{message}</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.05)',
        marginBottom: '30px',
    },
    header: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#555',
        fontSize: '14px',
    },
    input: {
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '15px',
    },
    textarea: {
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '15px',
        minHeight: '60px',
        resize: 'vertical',
    },
    select: {
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '15px',
        backgroundColor: '#fff',
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
    successMessage: {
        color: 'green',
        marginTop: '15px',
        textAlign: 'center',
    },
    errorMessage: {
        color: 'red',
        marginTop: '15px',
        textAlign: 'center',
    }
};

export default TaskForm;
