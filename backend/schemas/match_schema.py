from typing import List, Optional

from pydantic import BaseModel


class MatchSuggestion(BaseModel):
    score: int
    location_match: bool
    matching_skills: List[str]
    opportunity_id: Optional[str] = None
    opportunity_title: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    ngo_id: Optional[str] = None
    ngo_name: Optional[str] = None
    volunteer_id: Optional[str] = None
    volunteer_name: Optional[str] = None
    volunteer_location: Optional[str] = None
