"""
Intent Classification Service

Classifies user intent after wake phrase is detected.
"""

from enum import Enum
from typing import Optional
import re


class IntentType(str, Enum):
    """Possible user intents."""
    SELF_TRANSLATE = "SELF_TRANSLATE"  # What I meant to say
    OTHER_TRANSLATE = "OTHER_TRANSLATE"  # What they meant
    REGULATE = "REGULATE"  # Emotional regulation
    MEMORY = "MEMORY"  # Memory and context tracking
    COGNITIVE_SUPPORT = "COGNITIVE_SUPPORT"  # Thread tracking, what am I missing
    UNKNOWN = "UNKNOWN"  # Fallback


class IntentClassifier:
    """Classifies user intent based on their message."""

    # Patterns for each intent type
    INTENT_PATTERNS = {
        IntentType.SELF_TRANSLATE: [
            r"what (was|am) i (trying|meant) to (say|express)",
            r"say that in my voice",
            r"help me (express|say|communicate) (this|that)",
            r"translate (me|what i meant|my words)",
            r"clarify what i (said|meant)",
            r"rephrase (this|that|what i said)",
        ],
        IntentType.OTHER_TRANSLATE: [
            r"what (did|do) they mean",
            r"what does (he|she|that) mean",
            r"simplify what (they|he|she) said",
            r"decode (this|that|what they said)",
            r"is (that|this) hostile or neutral",
            r"(is|are) they being (hostile|passive aggressive|rude|mean)",
            r"translate (them|what they said|their words)",
        ],
        IntentType.REGULATE: [
            r"stabilize me",
            r"help me (stay )?regulated?",
            r"am i overwhelmed",
            r"(calm|ground|center) me",
            r"i'm (overwhelmed|spiraling|panicking)",
            r"regulate me",
            r"breathing",
        ],
        IntentType.COGNITIVE_SUPPORT: [
            r"what am i missing",
            r"remind me what (the )?topic (was|is)",
            r"track (this|the) conversation",
            r"what (was|were) we (talking|discussing) about",
            r"thread (this|that)",
            r"context",
        ],
        IntentType.MEMORY: [
            r"remember (this|that)",
            r"store (this|that)",
            r"save (this|that)",
            r"recall",
            r"what (do you|did i) (know|say) about",
        ],
    }

    def classify(self, text: str) -> IntentType:
        """
        Classify the intent of the user's message.

        Args:
            text: User message (after wake phrase has been stripped)

        Returns:
            Detected IntentType
        """
        text_lower = text.lower().strip()

        # Try to match against each intent pattern
        for intent_type, patterns in self.INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return intent_type

        # Default to UNKNOWN if no pattern matches
        return IntentType.UNKNOWN

    def extract_subject(self, text: str, intent: IntentType) -> Optional[str]:
        """
        Extract the subject/content being referred to.

        Args:
            text: User message
            intent: Classified intent

        Returns:
            Extracted subject or None
        """
        # For OTHER_TRANSLATE, try to extract what "they" said
        if intent == IntentType.OTHER_TRANSLATE:
            # Look for quotes
            quote_match = re.search(r'["\'](.+?)["\']', text)
            if quote_match:
                return quote_match.group(1)

        # For SELF_TRANSLATE, try to extract what the user said
        if intent == IntentType.SELF_TRANSLATE:
            # Look for "I said..." or similar
            said_match = re.search(r'i said (.+)', text, re.IGNORECASE)
            if said_match:
                return said_match.group(1).strip('"\'.,;')

        return None
