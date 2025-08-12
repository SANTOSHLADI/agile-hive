// frontend/src/components/Projects/ProjectList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError('');
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No authentication token found. Please log in.');
                    setLoading(false);
                    return;
                }

                // CRITICAL FIX: The API call now correctly includes the '/api' prefix.
                const response = await axios.get(`${API_BASE_URL}/api/projects`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProjects(response.data);
            } catch (err) {
                console.error('Error fetching projects:', err);
                setError(err.response?.data?.message || 'Failed to fetch projects.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return <div style={styles.message}>Loading projects...</div>;
    }

    if (error) {
        return <div style={styles.errorMessage}>Error: {error}</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>All Projects</h2>
            <Link to="/projects/new" style={styles.createButton}>Create New Project</Link>
            {projects.length === 0 ? (
                <p style={styles.message}>No projects found. Start by creating one!</p>
            ) : (
                <ul style={styles.list}>
                    {projects.map(project => (
                        <li key={project._id} style={styles.listItem}>
                            <div style={styles.projectHeader}>
                                <h3 style={styles.projectName}>{project.name}</h3>
                                <span style={styles.projectStatus}>Status: {project.status}</span>
                            </div>
                            <p style={styles.projectDescription}>{project.description}</p>
                            <p style={styles.projectDates}>
                                Start: {new Date(project.startDate).toLocaleDateString()} |
                                End: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                            </p>
                            <Link to={`/projects/${project._id}`} style={styles.viewDetailsButton}>View Details</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '900px',
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
    createButton: {
        display: 'block',
        width: '200px',
        padding: '10px 15px',
        backgroundColor: '#28a745',
        color: 'white',
        textAlign: 'center',
        textDecoration: 'none',
        borderRadius: '5px',
        margin: '0 auto 20px auto',
        transition: 'background-color 0.3s ease',
        cursor: 'pointer',
    },
    createButtonHover: {
        backgroundColor: '#218838',
    },
    message: {
        textAlign: 'center',
        color: '#666',
        marginTop: '20px',
    },
    errorMessage: {
        textAlign: 'center',
        color: 'red',
        marginTop: '20px',
        fontWeight: 'bold',
    },
    list: {
        listStyle: 'none',
        padding: 0,
    },
    listItem: {
        backgroundColor: '#f9f9f9',
        border: '1px solid #eee',
        borderRadius: '5px',
        padding: '15px',
        marginBottom: '10px',
        transition: 'box-shadow 0.2s ease',
    },
    listItemHover: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    projectHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    projectName: {
        margin: 0,
        color: '#007bff',
        fontSize: '20px',
    },
    projectStatus: {
        backgroundColor: '#e9ecef',
        padding: '5px 10px',
        borderRadius: '15px',
        fontSize: '12px',
        color: '#555',
    },
    projectDescription: {
        color: '#666',
        marginBottom: '10px',
        lineHeight: '1.5',
    },
    projectDates: {
        fontSize: '13px',
        color: '#888',
        marginBottom: '15px',
    },
    viewDetailsButton: {
        display: 'inline-block',
        padding: '8px 12px',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        transition: 'background-color 0.3s ease',
    },
    viewDetailsButtonHover: {
        backgroundColor: '#0056b3',
    }
};

export default ProjectList;