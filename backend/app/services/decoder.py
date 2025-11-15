"""
Decoder Service

Helps users understand what others might have meant.
Decodes tone, intent, and possible meanings of others' communication.
"""

from typing import Dict, Any, List


class MessageDecoder:
    """Decodes and interprets what others might have meant."""

    def decode(self, user_message: str, subject: str = None) -> Dict[str, Any]:
        """
        Decode what someone else might have meant.

        Args:
            user_message: The user's request
            subject: The message/communication to decode

        Returns:
            Dictionary with decoded interpretation
        """
        # STUB: In production, this will use OpenAI with specialized prompts

        response = {
            "original_message": user_message,
            "intent": "OTHER_TRANSLATE",
            "subject_analyzed": subject or "[No specific message provided]",
            "tone_analysis": self._analyze_tone_stub(subject),
            "possible_meanings": self._generate_possible_meanings_stub(subject),
            "emotional_subtext": "neutral",
            "confidence": "medium",
            "recommendation": "Ask for clarification if you're uncertain"
        }

        return response

    def _analyze_tone_stub(self, message: str = None) -> Dict[str, Any]:
        """
        Analyze the tone of a message.

        Args:
            message: Message to analyze

        Returns:
            Tone analysis
        """
        if not message:
            return {
                "primary_tone": "unknown",
                "hostility_level": "unknown",
                "formality": "unknown"
            }

        # Simple stub analysis
        hostile_markers = ["stupid", "idiot", "waste", "terrible", "awful"]
        is_hostile = any(marker in message.lower() for marker in hostile_markers)

        return {
            "primary_tone": "hostile" if is_hostile else "neutral",
            "hostility_level": "high" if is_hostile else "low",
            "formality": "informal",
            "notes": "This is a preliminary analysis. Context matters significantly."
        }

    def _generate_possible_meanings_stub(self, message: str = None) -> List[str]:
        """
        Generate possible interpretations of a message.

        Args:
            message: Message to interpret

        Returns:
            List of possible meanings
        """
        if not message:
            return [
                "Without the specific message, I can't provide detailed interpretation.",
                "Please share what they said, and I'll help decode it."
            ]

        return [
            f"Literal interpretation: They said '{message}'",
            "Possible subtext: There may be unstated context or emotion",
            "Alternative reading: Consider their emotional state and relationship to you",
            "Recommendation: If unclear, asking 'What did you mean by that?' is valid"
        ]

    def is_hostile(self, message: str) -> Dict[str, Any]:
        """
        Determine if a message is hostile or neutral.

        Args:
            message: Message to analyze

        Returns:
            Hostility analysis
        """
        tone = self._analyze_tone_stub(message)

        return {
            "is_hostile": tone["hostility_level"] in ["medium", "high"],
            "confidence": "medium",
            "tone_details": tone,
            "guidance": (
                "If you're feeling hurt or confused, that reaction is valid. "
                "Consider whether this person is safe to engage with, and whether "
                "you need to protect your energy right now."
            )
        }
