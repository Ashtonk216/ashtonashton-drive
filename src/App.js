import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Register from './Register';
import FileUpload from './FileUpload';
import FileList from './FileList';
import ChangePassword from './ChangePassword';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [usage, setUsage] = useState({ current_usage: 0, capacity: 0 });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch usage info
  const fetchUsage = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('https://api.ashtonashton.net/usage', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.ok) {
      const data = await response.json();
      setUsage(data);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsage();
    }
  }, [isAuthenticated, refreshTrigger]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  const handleUploadSuccess = () => {
    // Trigger FileList to refresh and usage to update
    setRefreshTrigger(prev => prev + 1);
  };

  const username = localStorage.getItem('username');

  // Drive interface component
  const DriveInterface = () => {
    const navigate = useNavigate();

    return (
      <div className="App" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #dee2e6',
          paddingBottom: '10px'
        }}>
          <h1>My Drive</h1>

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0 }}>
              Storage: {(usage.current_usage / (1024 ** 3)).toFixed(2)} GB / {(usage.capacity / (1024 ** 3)).toFixed(2)} GB
            </p>
            <div style={{
              height: '10px',
              backgroundColor: '#e9ecef',
              borderRadius: '5px',
              width: '200px',
              marginTop: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(usage.current_usage / usage.capacity) * 100}%`,
                backgroundColor: '#007bff',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ marginRight: '5px' }}>Welcome, {username}!</span>
            <button
              onClick={() => navigate('/change-password')}
              style={{
                padding: '8px 15px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <FileUpload onUploadSuccess={handleUploadSuccess} />
        <FileList refreshTrigger={refreshTrigger} />
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/drive" replace /> : 
            <Login onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
            <Navigate to="/drive" replace /> : 
            <Register />
          } 
        />
        <Route
          path="/drive"
          element={
            isAuthenticated ?
            <DriveInterface /> :
            <Navigate to="/login" replace />
          }
        />
        <Route
          path="/change-password"
          element={
            isAuthenticated ?
            <ChangePassword /> :
            <Navigate to="/login" replace />
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/drive" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;