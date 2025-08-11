import React, { createContext, useContext, useState } from 'react';

const ExamContext = createContext();

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};

export const ExamProvider = ({ children }) => {
  const [examData, setExamData] = useState({
    questions: [],
    answers: {},
    currentQuestionIndex: 0,
    timeLeft: 1800, // 30 minutes in seconds
    startTime: null,
    isSubmitted: false,
  });

  const initializeExam = (questions) => {
    const startTime = new Date().toISOString();
    setExamData({
      questions,
      answers: {},
      currentQuestionIndex: 0,
      timeLeft: 1800, // 30 minutes
      startTime,
      isSubmitted: false,
    });
  };

  const setAnswer = (questionId, answer) => {
    setExamData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < examData.questions.length) {
      setExamData(prev => ({
        ...prev,
        currentQuestionIndex: index
      }));
    }
  };

  const nextQuestion = () => {
    if (examData.currentQuestionIndex < examData.questions.length - 1) {
      setExamData(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const previousQuestion = () => {
    if (examData.currentQuestionIndex > 0) {
      setExamData(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const updateTimeLeft = (timeLeft) => {
    setExamData(prev => ({
      ...prev,
      timeLeft
    }));
  };

  const submitExam = () => {
    setExamData(prev => ({
      ...prev,
      isSubmitted: true
    }));
  };

  const resetExam = () => {
    setExamData({
      questions: [],
      answers: {},
      currentQuestionIndex: 0,
      timeLeft: 1800,
      startTime: null,
      isSubmitted: false,
    });
  };

  const getCurrentQuestion = () => {
    return examData.questions[examData.currentQuestionIndex] || null;
  };

  const getAnsweredCount = () => {
    return Object.keys(examData.answers).length;
  };

  const isQuestionAnswered = (questionId) => {
    return examData.answers.hasOwnProperty(questionId);
  };

  const getProgress = () => {
    const total = examData.questions.length;
    const answered = getAnsweredCount();
    return total > 0 ? (answered / total) * 100 : 0;
  };

  const value = {
    examData,
    initializeExam,
    setAnswer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    updateTimeLeft,
    submitExam,
    resetExam,
    getCurrentQuestion,
    getAnsweredCount,
    isQuestionAnswered,
    getProgress,
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};