# schemas.py
from pydantic import BaseModel
from typing import List, Optional

class StudentInput(BaseModel):
    name: str
    age: int
    answers: List[int]  # 15 answers

class Course(BaseModel):
    label: str
    platform: str
    url: str

class PredictionResponse(BaseModel):
    name: str
    age: int
    final_score: float
    skill_level: str
    recommended_courses: List[Course]

# ─────────────────────────────────────────
# Communication Evaluation Schemas
# ─────────────────────────────────────────
class CommCourse(BaseModel):
    label: str
    platform: str
    url: str
    reason: Optional[str] = None

class CommunicationEvalResponse(BaseModel):
    clarity: float
    vocabulary: float
    fluency: float
    structure: float
    confidence: float
    overall_score: float
    level: str
    recommended_courses: List[CommCourse]
