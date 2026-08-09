from pydantic import BaseModel


class StatsSummary(BaseModel):
    mastered_count: int
    total_count: int
