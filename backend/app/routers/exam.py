import json
import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from ..database import db
from ..schemas import Question, ExamSubmission, ExamResult
from ..auth import get_current_user

router = APIRouter()

@router.get("/start", response_model=list[Question])
async def start_exam(current_user: dict = Depends(get_current_user)):
    """Get randomized questions for the exam"""
    query = """
        SELECT id, question_text, option_a, option_b, option_c, option_d 
        FROM questions 
        ORDER BY RAND() 
        LIMIT 10
    """
    
    questions = db.execute_query(query)
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questions available"
        )
    
    return questions

@router.post("/submit", response_model=ExamResult)
async def submit_exam(
    submission: ExamSubmission,
    current_user: dict = Depends(get_current_user)
):
    """Submit exam and calculate score"""
    
    # Get correct answers for submitted questions
    question_ids = [answer.question_id for answer in submission.answers]
    placeholders = ','.join(['%s'] * len(question_ids))
    
    query = f"""
        SELECT id, correct_answer 
        FROM questions 
        WHERE id IN ({placeholders})
    """
    
    correct_answers = db.execute_query(query, question_ids)
    
    if not correct_answers:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questions not found"
        )
    
    # Create a mapping of question_id to correct_answer
    correct_map = {q['id']: q['correct_answer'] for q in correct_answers}
    
    # Calculate score
    score = 0
    total_questions = len(submission.answers)
    detailed_answers = []
    
    for answer in submission.answers:
        is_correct = correct_map[answer.question_id] == answer.selected_answer
        if is_correct:
            score += 1
            
        detailed_answers.append({
            "question_id": answer.question_id,
            "selected_answer": answer.selected_answer,
            "correct_answer": correct_map[answer.question_id],
            "is_correct": is_correct
        })
    
    # Store exam result
    result_query = """
        INSERT INTO exam_results (user_id, score, total_questions, answers, started_at)
        VALUES (%s, %s, %s, %s, %s)
    """
    
    db.execute_query(
        result_query,
        (
            current_user['id'],
            score,
            total_questions,
            json.dumps(detailed_answers),
            submission.started_at
        )
    )
    
    percentage = (score / total_questions) * 100
    
    return ExamResult(
        score=score,
        total_questions=total_questions,
        percentage=round(percentage, 2),
        answers=detailed_answers,
        submitted_at=datetime.now()
    )

@router.get("/results", response_model=list[dict])
async def get_exam_results(current_user: dict = Depends(get_current_user)):
    """Get user's exam history"""
    query = """
        SELECT id, score, total_questions, submitted_at,
               ROUND((score / total_questions * 100), 2) as percentage
        FROM exam_results 
        WHERE user_id = %s
        ORDER BY submitted_at DESC
    """
    
    results = db.execute_query(query, (current_user['id'],))
    
    return results or []