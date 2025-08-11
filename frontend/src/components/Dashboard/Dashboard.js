import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { examAPI } from '../../services/api';
import Loading from '../Common/Loading';
import './Dashboard.css';

const Dashboard = () => {
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExamHistory();
  }, []);

  const fetchExamHistory = async () => {
    try {
      const response = await examAPI.getResults();
      setExamHistory(response.data);
    } catch (error) {
      console.error('Error fetching exam history:', error);
      setError('Failed to load exam history');
    } finally {
      setLoading(false);
    }
  };

  const startNewExam = () => {
    navigate('/exam');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#28a745';
    if (percentage >= 60) return '#ffc107';
    return '#dc3545';
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}!</h1>
        <p className="dashboard-subtitle">Ready to take your next exam?</p>
      </div>

      <div className="dashboard-actions">
        <button 
          className="start-exam-btn"
          onClick={startNewExam}
        >
          🎯 Start New Exam
        </button>
      </div>

      <div className="exam-history-section">
        <h2>Your Exam History</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {examHistory.length === 0 ? (
          <div className="no-history">
            <div className="no-history-icon">📝</div>
            <h3>No exams taken yet</h3>
            <p>Start your first exam to see your results here!</p>
          </div>
        ) : (
          <div className="history-grid">
            {examHistory.map((result, index) => (
              <div key={result.id} className="history-card">
                <div className="history-header">
                  <span className="exam-number">Exam #{examHistory.length - index}</span>
                  <span className="exam-date">{formatDate(result.submitted_at)}</span>
                </div>
                
                <div className="score-section">
                  <div 
                    className="score-circle"
                    style={{ borderColor: getScoreColor(result.percentage) }}
                  >
                    <span 
                      className="score-percentage"
                      style={{ color: getScoreColor(result.percentage) }}
                    >
                      {result.percentage}%
                    </span>
                  </div>
                  
                  <div className="score-details">
                    <p className="score-text">
                      {result.score} out of {result.total_questions} correct
                    </p>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${result.percentage}%`,
                          backgroundColor: getScoreColor(result.percentage)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="performance-badge">
                  {result.percentage >= 80 ? '🏆 Excellent' :
                   result.percentage >= 60 ? '👍 Good' : '📚 Keep Learning'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-stats">
        {examHistory.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Total Exams</h3>
                <p className="stat-number">{examHistory.length}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>Average Score</h3>
                <p className="stat-number">
                  {Math.round(examHistory.reduce((sum, exam) => sum + exam.percentage, 0) / examHistory.length)}%
                </p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>Best Score</h3>
                <p className="stat-number">
                  {Math.max(...examHistory.map(exam => exam.percentage))}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;