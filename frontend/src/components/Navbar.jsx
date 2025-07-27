// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token from local storage
        onLogout(); // Update parent component's state
        navigate('/login'); // Redirect to login page
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.brand}>
                <Link to="/" style={styles.brandLink}>AgileHive</Link>
            </div>
            <ul style={styles.navList}>
                {isAuthenticated ? (
                    <>
                        <li style={styles.navItem}><Link to="/dashboard" style={styles.navLink}>Dashboard</Link></li>
                        <li style={styles.navItem}><Link to="/projects" style={styles.navLink}>Projects</Link></li>
                        <li style={styles.navItem}>
                            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                        </li>
                    </>
                ) : (
                    <>
                        <li style={styles.navItem}><Link to="/login" style={styles.navLink}>Login</Link></li>
                        <li style={styles.navItem}><Link to="/signup" style={styles.navLink}>Sign Up</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

const styles = {
    navbar: {
        backgroundColor: '#333',
        padding: '15px 20px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brand: {
        fontSize: '24px',
        fontWeight: 'bold',
    },
    brandLink: {
        color: 'white',
        textDecoration: 'none',
    },
    navList: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
    },
    navItem: {
        marginLeft: '20px',
    },
    navLink: {
        color: 'white',
        textDecoration: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        transition: 'background-color 0.3s ease',
        '&:hover': {
            backgroundColor: '#555',
        },
    },
    logoutButton: {
        background: 'none',
        border: '1px solid white',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease',
        '&:hover': {
            backgroundColor: '#dc3545',
            borderColor: '#dc3545',
        },
    }
};

export default Navbar;