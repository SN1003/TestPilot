from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Question schemas
class Question(BaseModel):
    id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

class QuestionWithAnswer(Question):
    correct_answer: str

# Exam schemas
class ExamAnswer(BaseModel):
    question_id: int
    selected_answer: str

class ExamSubmission(BaseModel):
    answers: List[ExamAnswer]
    started_at: datetime

class ExamResult(BaseModel):
    score: int
    total_questions: int
    percentage: float
    answers: List[Dict]
    submitted_at: datetime