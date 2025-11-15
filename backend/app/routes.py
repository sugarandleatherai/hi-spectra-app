"""
API Routes for Hi-Spectra

Endpoints:
- POST /spectra/intent - Classify user intent
- POST /spectra/translate - Self-translation (what I meant)
- POST /spectra/decode - Decode others' messages (what they meant)
- POST /spectra/regulate - Emotional regulation support
"""

from fastapi import APIRouter, HTTPException
from app.models import (
    IntentRequest, IntentResponse,
    TranslateRequest, TranslateResponse,
    DecodeRequest, DecodeResponse, ToneAnalysis,
    RegulateRequest, RegulateResponse, GroundingTechnique
)
from app.services.wake_phrase import WakePhraseDetector
from app.services.intent import IntentClassifier, IntentType
from app.services.translator import SelfTranslator
from app.services.decoder import MessageDecoder
from app.services.regulator import EmotionalRegulator


router = APIRouter(prefix="/spectra", tags=["spectra"])

# Initialize services
wake_detector = WakePhraseDetector()
intent_classifier = IntentClassifier()
translator = SelfTranslator()
decoder = MessageDecoder()
regulator = EmotionalRegulator()


@router.post("/intent", response_model=IntentResponse)
async def classify_intent(request: IntentRequest):
    """
    Classify user intent from their message.

    Detects wake phrase, strips it, and classifies the intent.
    """
    # Detect and strip wake phrase
    has_wake, extracted_message = wake_detector.detect_and_strip(request.message)

    if not has_wake:
        return IntentResponse(
            has_wake_phrase=False,
            intent=IntentType.UNKNOWN,
            extracted_message=None,
            extracted_subject=None,
            confidence="high"
        )

    # Classify intent
    intent = intent_classifier.classify(extracted_message)

    # Extract subject if applicable
    subject = intent_classifier.extract_subject(extracted_message, intent)

    return IntentResponse(
        has_wake_phrase=True,
        intent=intent.value,
        extracted_message=extracted_message,
        extracted_subject=subject,
        confidence="medium"
    )


@router.post("/translate", response_model=TranslateResponse)
async def translate_self(request: TranslateRequest):
    """
    Help user translate/clarify what they meant to say.

    This is for SELF_TRANSLATE intent.
    """
    # Validate wake phrase
    has_wake, extracted_message = wake_detector.detect_and_strip(request.message)

    if not has_wake:
        raise HTTPException(
            status_code=400,
            detail="Message must start with wake phrase (Hi/High/Hey Spectra)"
        )

    # Get translation
    result = translator.translate(
        user_message=extracted_message,
        subject=request.subject
    )

    return TranslateResponse(**result)


@router.post("/decode", response_model=DecodeResponse)
async def decode_other(request: DecodeRequest):
    """
    Decode what someone else might have meant.

    This is for OTHER_TRANSLATE intent.
    """
    # Validate wake phrase
    has_wake, extracted_message = wake_detector.detect_and_strip(request.message)

    if not has_wake:
        raise HTTPException(
            status_code=400,
            detail="Message must start with wake phrase (Hi/High/Hey Spectra)"
        )

    # Get decode analysis
    result = decoder.decode(
        user_message=extracted_message,
        subject=request.subject
    )

    # Convert tone_analysis dict to ToneAnalysis model
    result["tone_analysis"] = ToneAnalysis(**result["tone_analysis"])

    return DecodeResponse(**result)


@router.post("/regulate", response_model=RegulateResponse)
async def regulate_emotion(request: RegulateRequest):
    """
    Provide emotional regulation and grounding support.

    This is for REGULATE intent.
    """
    # Validate wake phrase
    has_wake, extracted_message = wake_detector.detect_and_strip(request.message)

    if not has_wake:
        raise HTTPException(
            status_code=400,
            detail="Message must start with wake phrase (Hi/High/Hey Spectra)"
        )

    # Get regulation support
    result = regulator.regulate(user_message=extracted_message)

    # Convert grounding_technique dict to GroundingTechnique model
    result["grounding_technique"] = GroundingTechnique(**result["grounding_technique"])

    return RegulateResponse(**result)


@router.post("/process", response_model=dict)
async def process_message(request: IntentRequest):
    """
    Unified endpoint that processes a message end-to-end.

    1. Detects wake phrase
    2. Classifies intent
    3. Routes to appropriate service
    4. Returns comprehensive response
    """
    # Step 1: Detect wake phrase
    has_wake, extracted_message = wake_detector.detect_and_strip(request.message)

    if not has_wake:
        return {
            "error": "No wake phrase detected",
            "message": "Please start your message with 'Hi Spectra', 'High Spectra', or 'Hey Spectra'",
            "has_wake_phrase": False
        }

    # Step 2: Classify intent
    intent = intent_classifier.classify(extracted_message)
    subject = intent_classifier.extract_subject(extracted_message, intent)

    # Step 3: Route to appropriate service
    response = {
        "has_wake_phrase": True,
        "intent": intent.value,
        "extracted_message": extracted_message,
        "subject": subject
    }

    if intent == IntentType.SELF_TRANSLATE:
        result = translator.translate(extracted_message, subject)
        response["response"] = result

    elif intent == IntentType.OTHER_TRANSLATE:
        result = decoder.decode(extracted_message, subject)
        response["response"] = result

    elif intent == IntentType.REGULATE:
        result = regulator.regulate(extracted_message)
        response["response"] = result

    else:
        response["response"] = {
            "message": "I heard you, but I'm not sure how to help with that yet.",
            "suggestion": "Try asking me to translate what you meant, decode what someone said, or help you regulate."
        }

    return response
