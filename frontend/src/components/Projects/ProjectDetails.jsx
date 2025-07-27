// frontend/src/components/Projects/ProjectDetails.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useParams to get project ID from URL
import TaskForm from '../Tasks/TaskForm'; // Will create this soon
// import TaskList from '../Tasks/TaskList'; // Can use a dedicated TaskList component if desired

//const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProjectDetails = () => {
    const { id: projectId } = useParams(); // Get project ID from URL parameter
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]); // To populate assignee dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch project details and its tasks
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token missing. Please log in.');
                    setLoading(false);
                    return;
                }

                // Fetch Project Details
                const projectResponse = await axios.get(`${API_BASE_URL}/projects/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProject(projectResponse.data);

                // Fetch Tasks for this project
                const tasksResponse = await axios.get(`${API_BASE_URL}/tasks/projects/${projectId}/tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(tasksResponse.data);

                // Fetch all users to populate assignee dropdown in TaskForm
                // This route (GET /api/users) needs to be implemented on backend later for Admin only
                // For now, we'll fetch them (or simplify assignee selection)
                const usersResponse = await axios.get(`${API_BASE_URL}/users`, { // This route needs backend implementation for Admin users
                     headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(usersResponse.data);


            } catch (err) {
                console.error('Error fetching project details or tasks:', err);
                setError(err.response?.data?.message || 'Failed to load project details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId]); // Re-fetch if projectId changes

    const handleTaskCreated = async (newTask) => {
        // Add new task to the list and potentially update UI for assignee name
        // To update assignee name: find user in `users` state
        const assignedUser = users.find(u => u._id === newTask.assignee);
        if (assignedUser) {
            newTask.assignee = { _id: assignedUser._id, name: assignedUser.name, email: assignedUser.email };
        }
        setTasks(prevTasks => [newTask, ...prevTasks]); // Add new task to the top
        // You could also re-fetch all tasks: fetchData();
    };

    const handleTaskUpdateStatus = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(prevTasks =>
                prevTasks.map(task => (task._id === taskId ? response.data : task))
            );
        } catch (err) {
            console.error('Error updating task status:', err);
            setError(err.response?.data?.message || 'Failed to update task status.');
        }
    };

    const handleTaskDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
                // setMessage('Task deleted successfully!'); // You might want a transient message
            } catch (err) {
                console.error('Error deleting task:', err);
                setError(err.response?.data?.message || 'Failed to delete task.');
            }
        }
    };


    if (loading) {
        return <div style={styles.message}>Loading project details...</div>;
    }

    if (error) {
        return <div style={styles.errorMessage}>Error: {error}</div>;
    }

    if (!project) {
        return <div style={styles.message}>Project not found.</div>;
    }

    return (
        <div style={styles.container}>
            <Link to="/projects" style={styles.backButton}>&larr; Back to All Projects</Link>
            <h2 style={styles.header}>{project.name}</h2>
            <p style={styles.description}>{project.description}</p>
            <p style={styles.dates}>
                **Start Date:** {new Date(project.startDate).toLocaleDateString()} |
                **End Date:** {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
            </p>
            <p style={styles.manager}>**Manager:** {project.manager?.name || project.manager?.email || 'N/A'}</p>
            <p style={styles.members}>
                **Members:** {project.members && project.members.length > 0
                    ? project.members.map(member => member.name || member.email).join(', ')
                    : 'No members assigned'}
            </p>

            <hr style={styles.separator} />

            <h3 style={styles.subHeader}>Tasks</h3>
            <TaskForm projectId={projectId} onTaskCreated={handleTaskCreated} users={users} />

            {tasks.length === 0 ? (
                <p style={styles.message}>No tasks for this project yet. Add one above!</p>
            ) : (
                <div style={styles.taskListContainer}>
                    {/* Simple Kanban Board Layout */}
                    <div style={styles.kanbanColumn}>
                        <h4 style={styles.columnHeader}>To Do</h4>
                        {tasks.filter(task => task.status === 'to-do').map(task => (
                            <div key={task._id} style={styles.taskCard}>
                                <h5 style={styles.taskTitle}>{task.title}</h5>
                                <p style={styles.taskAssignee}>Assignee: {task.assignee?.name || task.assignee?.email || 'Unassigned'}</p>
                                <p style={styles.taskPriority}>Priority: {task.priority}</p>
                                <p style={styles.taskDueDate}>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                                <div style={styles.taskActions}>
                                    <button onClick={() => handleTaskUpdateStatus(task._id, 'in-progress')} style={{...styles.actionButton, backgroundColor: '#ffc107'}}>Start</button>
                                    <button onClick={() => handleTaskUpdateStatus(task._id, 'done')} style={{...styles.actionButton, backgroundColor: '#28a745'}}>Complete</button>
                                    <button onClick={() => handleTaskDelete(task._id)} style={{...styles.actionButton, backgroundColor: '#dc3545'}}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.kanbanColumn}>
                        <h4 style={styles.columnHeader}>In Progress</h4>
                        {tasks.filter(task => task.status === 'in-progress').map(task => (
                            <div key={task._id} style={styles.taskCard}>
                                <h5 style={styles.taskTitle}>{task.title}</h5>
                                <p style={styles.taskAssignee}>Assignee: {task.assignee?.name || task.assignee?.email || 'Unassigned'}</p>
                                <p style={styles.taskPriority}>Priority: {task.priority}</p>
                                <p style={styles.taskDueDate}>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                                <div style={styles.taskActions}>
                                    <button onClick={() => handleTaskUpdateStatus(task._id, 'done')} style={{...styles.actionButton, backgroundColor: '#28a745'}}>Complete</button>
                                    <button onClick={() => handleTaskUpdateStatus(task._id, 'to-do')} style={{...styles.actionButton, backgroundColor: '#6c757d'}}>Revert</button>
                                    <button onClick={() => handleTaskDelete(task._id)} style={{...styles.actionButton, backgroundColor: '#dc3545'}}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.kanbanColumn}>
                        <h4 style={styles.columnHeader}>Done</h4>
                        {tasks.filter(task => task.status === 'done').map(task => (
                            <div key={task._id} style={styles.taskCard}>
                                <h5 style={styles.taskTitle}>{task.title}</h5>
                                <p style={styles.taskAssignee}>Assignee: {task.assignee?.name || task.assignee?.email || 'Unassigned'}</p>
                                <p style={styles.taskPriority}>Priority: {task.priority}</p>
                                <p style={styles.taskDueDate}>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                                <div style={styles.taskActions}>
                                    <button onClick={() => handleTaskUpdateStatus(task._id, 'to-do')} style={{...styles.actionButton, backgroundColor: '#6c757d'}}>Reopen</button>
                                    <button onClick={() => handleTaskDelete(task._id)} style={{...styles.actionButton, backgroundColor: '#dc3545'}}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '20px auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    backButton: {
        display: 'inline-block',
        marginBottom: '20px',
        textDecoration: 'none',
        color: '#007bff',
        fontWeight: 'bold',
    },
    header: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '15px',
    },
    description: {
        color: '#555',
        lineHeight: '1.6',
        marginBottom: '10px',
    },
    dates: {
        fontSize: '14px',
        color: '#777',
        marginBottom: '5px',
    },
    manager: {
        fontSize: '14px',
        color: '#777',
        marginBottom: '5px',
    },
    members: {
        fontSize: '14px',
        color: '#777',
        marginBottom: '20px',
    },
    separator: {
        border: '0',
        borderTop: '1px solid #eee',
        margin: '30px 0',
    },
    subHeader: {
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center',
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
    taskListContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Responsive columns
        gap: '20px',
        marginTop: '20px',
    },
    kanbanColumn: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.05)',
        minHeight: '200px', // Ensure columns have some height
    },
    columnHeader: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '15px',
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px',
    },
    taskCard: {
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        padding: '15px',
        marginBottom: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    taskTitle: {
        fontSize: '18px',
        margin: '0 0 8px 0',
        color: '#007bff',
    },
    taskAssignee: {
        fontSize: '14px',
        color: '#6c757d',
        marginBottom: '5px',
    },
    taskPriority: {
        fontSize: '14px',
        color: '#6c757d',
        marginBottom: '5px',
    },
    taskDueDate: {
        fontSize: '14px',
        color: '#6c757d',
        marginBottom: '10px',
    },
    taskActions: {
        display: 'flex',
        gap: '5px',
        marginTop: '10px',
    },
    actionButton: {
        padding: '6px 10px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'background-color 0.2s ease',
    }
};

export default ProjectDetails;