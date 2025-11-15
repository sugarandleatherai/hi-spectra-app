"""
Pydantic Models for API Request/Response Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.intent import IntentType


# Request Models

class SpectraRequest(BaseModel):
    """Base request model for all Spectra endpoints."""
    message: str = Field(..., description="User's message to Spectra")
    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional context (conversation history, user profile, etc.)"
    )


class IntentRequest(SpectraRequest):
    """Request for intent classification."""
    pass


class TranslateRequest(SpectraRequest):
    """Request for self-translation."""
    subject: Optional[str] = Field(
        default=None,
        description="Optional: the specific text user wants to rephrase"
    )


class DecodeRequest(SpectraRequest):
    """Request for decoding others' messages."""
    subject: str = Field(..., description="The message to decode")


class RegulateRequest(SpectraRequest):
    """Request for emotional regulation support."""
    pass


# Response Models

class IntentResponse(BaseModel):
    """Response from intent classification."""
    has_wake_phrase: bool = Field(..., description="Whether wake phrase was detected")
    intent: str = Field(..., description="Classified intent type")
    extracted_message: Optional[str] = Field(
        default=None,
        description="Message after wake phrase is stripped"
    )
    extracted_subject: Optional[str] = Field(
        default=None,
        description="Extracted subject/content if detected"
    )
    confidence: str = Field(default="medium", description="Classification confidence")


class TranslateResponse(BaseModel):
    """Response from self-translation service."""
    original_message: str
    intent: str
    translation: str
    tone: str
    confidence: str
    suggestions: List[str]


class ToneAnalysis(BaseModel):
    """Tone analysis details."""
    primary_tone: str
    hostility_level: str
    formality: str
    notes: Optional[str] = None


class DecodeResponse(BaseModel):
    """Response from message decoder."""
    original_message: str
    intent: str
    subject_analyzed: str
    tone_analysis: ToneAnalysis
    possible_meanings: List[str]
    emotional_subtext: str
    confidence: str
    recommendation: str


class GroundingTechnique(BaseModel):
    """Grounding technique details."""
    name: str
    steps: List[str]
    duration: str


class RegulateResponse(BaseModel):
    """Response from regulation service."""
    original_message: str
    intent: str
    distress_level: str
    validation: str
    grounding_technique: GroundingTechnique
    immediate_actions: List[str]
    follow_up: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str
