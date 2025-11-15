"""
Regulation Service

Provides emotional regulation support, grounding, and stabilization.
"""

from typing import Dict, Any, List
import random


class EmotionalRegulator:
    """Provides regulation and stabilization support."""

    # Grounding techniques
    GROUNDING_SCRIPTS = [
        {
            "name": "5-4-3-2-1 Sensory",
            "steps": [
                "Name 5 things you can see",
                "Name 4 things you can touch",
                "Name 3 things you can hear",
                "Name 2 things you can smell",
                "Name 1 thing you can taste"
            ],
            "duration": "2-3 minutes"
        },
        {
            "name": "Box Breathing",
            "steps": [
                "Breathe in slowly for 4 counts",
                "Hold your breath for 4 counts",
                "Breathe out slowly for 4 counts",
                "Hold empty for 4 counts",
                "Repeat 4 times"
            ],
            "duration": "1-2 minutes"
        },
        {
            "name": "Physical Grounding",
            "steps": [
                "Press your feet firmly into the floor",
                "Feel the surface beneath you",
                "Notice the temperature of the air",
                "Wiggle your fingers and toes",
                "Say your name and today's date out loud"
            ],
            "duration": "1 minute"
        }
    ]

    # Validation statements
    VALIDATION_STATEMENTS = [
        "What you're feeling right now is real and valid.",
        "It's okay to be overwhelmed. You're not broken.",
        "Your nervous system is trying to protect you.",
        "You've gotten through hard moments before. You can get through this one.",
        "It's okay to need support. That's human.",
        "Your reaction makes sense given what you've experienced."
    ]

    def regulate(self, user_message: str) -> Dict[str, Any]:
        """
        Provide regulation support based on user's state.

        Args:
            user_message: User's request for regulation

        Returns:
            Regulation support response
        """
        # Detect level of distress
        distress_level = self._assess_distress_level(user_message)

        response = {
            "original_message": user_message,
            "intent": "REGULATE",
            "distress_level": distress_level,
            "validation": random.choice(self.VALIDATION_STATEMENTS),
            "grounding_technique": self._select_grounding_technique(distress_level),
            "immediate_actions": self._get_immediate_actions(distress_level),
            "follow_up": "Check in with me after you try this. I'm here."
        }

        return response

    def _assess_distress_level(self, message: str) -> str:
        """
        Assess the user's distress level from their message.

        Args:
            message: User's message

        Returns:
            Distress level: low, medium, high
        """
        message_lower = message.lower()

        high_distress_markers = [
            "overwhelmed", "spiraling", "panic", "can't breathe",
            "too much", "shutting down", "meltdown"
        ]

        medium_distress_markers = [
            "stressed", "anxious", "struggling", "confused",
            "help", "regulate"
        ]

        if any(marker in message_lower for marker in high_distress_markers):
            return "high"
        elif any(marker in message_lower for marker in medium_distress_markers):
            return "medium"
        else:
            return "low"

    def _select_grounding_technique(self, distress_level: str) -> Dict[str, Any]:
        """
        Select appropriate grounding technique based on distress level.

        Args:
            distress_level: User's current distress level

        Returns:
            Selected grounding technique
        """
        if distress_level == "high":
            # For high distress, use physical grounding first
            return self.GROUNDING_SCRIPTS[2]  # Physical Grounding
        elif distress_level == "medium":
            # For medium distress, breathing exercises
            return self.GROUNDING_SCRIPTS[1]  # Box Breathing
        else:
            # For low distress, sensory grounding
            return self.GROUNDING_SCRIPTS[0]  # 5-4-3-2-1

    def _get_immediate_actions(self, distress_level: str) -> List[str]:
        """
        Get immediate actions based on distress level.

        Args:
            distress_level: User's distress level

        Returns:
            List of immediate actions to take
        """
        if distress_level == "high":
            return [
                "If safe, move to a quiet space",
                "Put your phone down after reading this",
                "Focus only on breathing for the next 60 seconds",
                "You don't need to respond to anything right now"
            ]
        elif distress_level == "medium":
            return [
                "Take three slow, deep breaths",
                "Give yourself permission to step away if needed",
                "Remind yourself: this feeling will pass"
            ]
        else:
            return [
                "Take a moment to check in with your body",
                "Notice what you need right now",
                "It's okay to take a break"
            ]

    def check_overwhelm(self, user_message: str) -> Dict[str, Any]:
        """
        Check if user is currently overwhelmed.

        Args:
            user_message: User's message

        Returns:
            Overwhelm assessment
        """
        distress_level = self._assess_distress_level(user_message)

        return {
            "is_overwhelmed": distress_level in ["medium", "high"],
            "distress_level": distress_level,
            "assessment": (
                f"Based on your message, you seem to be experiencing {distress_level} distress. "
                if distress_level != "low" else
                "You seem relatively stable right now. "
            ),
            "recommendation": (
                "Let's work on regulation together."
                if distress_level != "low" else
                "Keep checking in with yourself. Prevention is powerful."
            )
        }
