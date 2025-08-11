import React from 'react';
import  {useAuth}  from '../../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">ExamApp</h1>
          {isAuthenticated && (
            <div className="header-actions">
              <span className="welcome-text">Welcome, {user?.username}</span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; 2024 ExamApp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;