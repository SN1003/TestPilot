import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ExamProvider } from './contexts/ExamContext';
import Layout from './components/Common/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Exam from './components/Exam/Exam';
import Results from './components/Results/Results';
import './App.css';

console.log('Layout:', Layout);
console.log('ProtectedRoute:', ProtectedRoute);
console.log('Login:', Login);
console.log('Register:', Register);
console.log('Dashboard:', Dashboard);
console.log('Exam:', Exam);
console.log('Results:', Results);

function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <Router>
          <div className="App">
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/exam" 
                  element={
                    <ProtectedRoute>
                      <Exam />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/results" 
                  element={
                    <ProtectedRoute>
                      <Results />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Default Route */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </ExamProvider>
    </AuthProvider>
  );
}

export default App;