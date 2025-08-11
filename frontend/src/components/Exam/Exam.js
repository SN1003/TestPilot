import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../../services/api';
import { useExam } from '../../contexts/ExamContext';
import { ExamTimer, formatTime, getTimeColor } from '../../utils/timer';
import Loading from '../Common/Loading';
import './Exam.css';

const Exam = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  
const {
  examData,
  initializeExam,
  setAnswer,
  nextQuestion,
  previousQuestion,
  getCurrentQuestion,
  getAnsweredCount,
  isQuestionAnswered,
  getProgress,
  updateTimeLeft,
  submitExam,
  goToQuestion // ← add this
} = useExam();

  
  const navigate = useNavigate();

  useEffect(() => {
    startExam();
    return () => {
      if (timer) {
        timer.stop();
      }
    };
  }, []);

  const startExam = async () => {
    try {
      const response = await examAPI.startExam();
      const questions = response.data;
      
      if (questions.length === 0) {
        setError('No questions available for the exam');
        return;
      }

      initializeExam(questions);
      
      // Initialize timer
      const examTimer = new ExamTimer(
        1800, // 30 minutes
        (timeLeft) => {
          updateTimeLeft(timeLeft);
        },
        () => {
          handleAutoSubmit();
        }
      );
      
      setTimer(examTimer);
      examTimer.start();
      setLoading(false);
    } catch (error) {
      console.error('Error starting exam:', error);
      setError('Failed to start exam. Please try again.');
      setLoading(false);
    }
  };

  const handleAnswerChange = (answer) => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      setAnswer(currentQuestion.id, answer);
    }
  };

  const handleAutoSubmit = async () => {
    await handleSubmitExam(true);
  };

  const handleSubmitExam = async (isAutoSubmit = false) => {
    if (!isAutoSubmit && getAnsweredCount() < examData.questions.length) {
      setShowSubmitConfirm(true);
      return;
    }

    setSubmitting(true);
    
    try {
      const answers = Object.entries(examData.answers).map(([questionId, selectedAnswer]) => ({
        question_id: parseInt(questionId),
        selected_answer: selectedAnswer
      }));

      const submissionData = {
        answers,
        started_at: examData.startTime
      };

      const response = await examAPI.submitExam(submissionData);
      
      if (timer) {
        timer.stop();
      }
      
      submitExam();
      
      // Navigate to results with the result data
      navigate('/results', { 
        state: { 
          result: response.data,
          isAutoSubmit 
        } 
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      setError('Failed to submit exam. Please try again.');
      setSubmitting(false);
    }
  };

  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    handleSubmitExam(false);
  };

  const cancelSubmit = () => {
    setShowSubmitConfirm(false);
  };

  if (loading) {
    return <Loading message="Preparing your exam..." />;
  }

  if (error) {
    return (
      <div className="exam-error">
        <div className="error-content">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = currentQuestion ? examData.answers[currentQuestion.id] : null;
  const totalQuestions = examData.questions.length;
  const currentIndex = examData.currentQuestionIndex;

  return (
    <div className="exam-container">
      {/* Header */}
      <div className="exam-header">
        <div className="exam-info">
          <h1>Online Exam</h1>
          <div className="question-counter">
            Question {currentIndex + 1} of {totalQuestions}
          </div>
        </div>
        
        <div className="exam-timer">
          <div 
            className="timer-display"
            style={{ color: getTimeColor(examData.timeLeft, 1800) }}
          >
            ⏰ {formatTime(examData.timeLeft)}
          </div>
          <div className="timer-bar">
            <div 
              className="timer-fill"
              style={{ 
                width: `${(examData.timeLeft / 1800) * 100}%`,
                backgroundColor: getTimeColor(examData.timeLeft, 1800)
              }}
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-info">
          <span>Progress: {getAnsweredCount()}/{totalQuestions} answered</span>
          <span>{Math.round(getProgress())}% complete</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Question Display */}
      <div className="question-section">
        {currentQuestion && (
          <div className="question-card">
            <div className="question-header">
              <h2>Question {currentIndex + 1}</h2>
              {isQuestionAnswered(currentQuestion.id) && (
                <span className="answered-badge">✓ Answered</span>
              )}
            </div>
            
            <div className="question-text">
              {currentQuestion.question_text}
            </div>
            
            <div className="options-container">
              {['A', 'B', 'C', 'D'].map((option) => (
                <label 
                  key={option} 
                  className={`option-label ${currentAnswer === option ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    disabled={submitting}
                  />
                  <span className="option-text">
                    <strong>{option}.</strong> {currentQuestion[`option_${option.toLowerCase()}`]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="exam-navigation">
        <div className="nav-buttons">
          <button
            onClick={previousQuestion}
            disabled={currentIndex === 0 || submitting}
            className="nav-btn prev-btn"
          >
            ← Previous
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={currentIndex === totalQuestions - 1 || submitting}
            className="nav-btn next-btn"
          >
            Next →
          </button>
        </div>
        
        <button
          onClick={() => handleSubmitExam()}
          disabled={submitting}
          className="submit-btn"
        >
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>

      {/* Question Navigation Pills */}
      <div className="question-pills">
        <h3>Quick Navigation</h3>
        <div className="pills-container">
          {examData.questions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => examData.currentQuestionIndex !== index && !submitting && 
                goToQuestion(index)}
              className={`question-pill ${
                index === currentIndex ? 'current' : ''
              } ${isQuestionAnswered(question.id) ? 'answered' : ''}`}
              disabled={submitting}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Submit Exam?</h3>
            <p>
              You have answered {getAnsweredCount()} out of {totalQuestions} questions.
              {getAnsweredCount() < totalQuestions && (
                <strong> You haven't answered all questions yet.</strong>
              )}
            </p>
            <p>Are you sure you want to submit your exam?</p>
            <div className="modal-buttons">
              <button onClick={cancelSubmit} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmSubmit} className="confirm-btn">
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;