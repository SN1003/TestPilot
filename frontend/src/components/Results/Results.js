import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { examAPI } from '../../services/api';
import './Results.css';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const result = location.state?.result;
  const isAutoSubmit = location.state?.isAutoSubmit || false;

  useEffect(() => {
    if (!result) {
      navigate('/dashboard');
      return;
    }
    
    // Fetch questions to show detailed results
    fetchQuestions();
  }, [result, navigate]);

  const fetchQuestions = async () => {
    try {
      // We need to get the questions again to show the question text
      // In a real app, you might want to store this data differently
      const response = await examAPI.startExam();
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#28a745';
    if (percentage >= 60) return '#ffc107';
    return '#dc3545';
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return 'Outstanding! 🏆';
    if (percentage >= 80) return 'Excellent work! 🌟';
    if (percentage >= 70) return 'Good job! 👍';
    if (percentage >= 60) return 'Well done! 👌';
    return 'Keep practicing! 📚';
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  if (!result) {
    return null;
  }

  return (
    <div className="results-container">
      {/* Header */}
      <div className="results-header">
        <div className="results-title">
          <h1>Exam Results</h1>
          {isAutoSubmit && (
            <div className="auto-submit-notice">
              ⏰ Time expired - Exam was automatically submitted
            </div>
          )}
        </div>
      </div>

      {/* Score Summary */}
      <div className="score-summary">
        <div className="score-main">
          <div 
            className="score-circle-large"
            style={{ borderColor: getScoreColor(result.percentage) }}
          >
            <div 
              className="score-percentage-large"
              style={{ color: getScoreColor(result.percentage) }}
            >
              {result.percentage}%
            </div>
            <div className="grade-display">
              Grade: {getGrade(result.percentage)}
            </div>
          </div>
          
          <div className="score-details-main">
            <h2>{getPerformanceMessage(result.percentage)}</h2>
            <div className="score-breakdown">
              <div className="score-item">
                <span className="score-label">Correct Answers:</span>
                <span className="score-value">{result.score}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Total Questions:</span>
                <span className="score-value">{result.total_questions}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Accuracy:</span>
                <span className="score-value">{result.percentage}%</span>
              </div>
              <div className="score-item">
                <span className="score-label">Completed:</span>
                <span className="score-value">
                  {new Date(result.submitted_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="performance-insights">
        <h3>Performance Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">
              {result.percentage >= 80 ? '🎯' : result.percentage >= 60 ? '📈' : '📊'}
            </div>
            <div className="insight-content">
              <h4>Overall Performance</h4>
              <p>
                {result.percentage >= 80 
                  ? 'Excellent understanding of the material!' 
                  : result.percentage >= 60 
                  ? 'Good grasp with room for improvement.'
                  : 'Consider reviewing the material and taking more practice tests.'
                }
              </p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">⚡</div>
            <div className="insight-content">
              <h4>Completion Status</h4>
              <p>
                {isAutoSubmit 
                  ? 'Time management could be improved for future exams.'
                  : 'Great time management - completed within the time limit!'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="detailed-results">
        <h3>Detailed Question Review</h3>
        {loading ? (
          <div className="loading-questions">Loading question details...</div>
        ) : (
          <div className="questions-review">
            {result.answers.map((answer, index) => {
              const question = questions.find(q => q.id === answer.question_id);
              if (!question) return null;
              
              return (
                <div 
                  key={answer.question_id} 
                  className={`question-review ${answer.is_correct ? 'correct' : 'incorrect'}`}
                >
                  <div className="question-review-header">
                    <span className="question-number">Question {index + 1}</span>
                    <span className={`result-badge ${answer.is_correct ? 'correct' : 'incorrect'}`}>
                      {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  
                  <div className="question-review-text">
                    {question.question_text}
                  </div>
                  
                  <div className="answer-comparison">
                    <div className="answer-row">
                      <span className="answer-label">Your Answer:</span>
                      <span className={`answer-value ${answer.is_correct ? 'correct' : 'incorrect'}`}>
                        {answer.selected_answer}. {question[`option_${answer.selected_answer.toLowerCase()}`]}
                      </span>
                    </div>
                    
                    {!answer.is_correct && (
                      <div className="answer-row">
                        <span className="answer-label">Correct Answer:</span>
                        <span className="answer-value correct">
                          {answer.correct_answer}. {question[`option_${answer.correct_answer.toLowerCase()}`]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="action-btn primary"
        >
          Back to Dashboard
        </button>
        <button 
          onClick={() => navigate('/exam')} 
          className="action-btn secondary"
        >
          Take Another Exam
        </button>
      </div>
    </div>
  );
};

export default Results;