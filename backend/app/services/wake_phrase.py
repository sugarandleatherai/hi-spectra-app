"""
Wake Phrase Detection and Normalization

Handles detection of "Hi Spectra", "High Spectra", and "Hey Spectra"
and normalizes them to a single internal token.
"""

import re
from typing import Tuple, Optional


class WakePhraseDetector:
    """Detects and normalizes wake phrases for Hi-Spectra."""

    # All valid wake phrase variations (case-insensitive)
    WAKE_PHRASES = [
        "hi spectra",
        "high spectra",
        "hey spectra"
    ]

    # Internal normalized token
    WAKE_TOKEN = "WAKE_SPECTRA"

    def detect_and_strip(self, text: str) -> Tuple[bool, Optional[str]]:
        """
        Detect if text starts with a wake phrase and strip it.

        Args:
            text: User input text

        Returns:
            Tuple of (wake_phrase_found, remaining_text)
            - If wake phrase found: (True, text_after_wake_phrase)
            - If not found: (False, None)
        """
        text_lower = text.lower().strip()

        for wake_phrase in self.WAKE_PHRASES:
            # Check if text starts with wake phrase
            if text_lower.startswith(wake_phrase):
                # Strip the wake phrase and any following punctuation/whitespace
                remaining = text[len(wake_phrase):].strip()
                # Remove leading comma or punctuation if present
                remaining = re.sub(r'^[,;:.!?]+\s*', '', remaining)
                return True, remaining

        return False, None

    def normalize(self, text: str) -> str:
        """
        Normalize wake phrase to internal token.

        Args:
            text: User input text

        Returns:
            Text with wake phrase replaced by WAKE_TOKEN
        """
        has_wake, remaining = self.detect_and_strip(text)
        if has_wake:
            return f"{self.WAKE_TOKEN} {remaining}"
        return text

    def is_valid_command(self, text: str) -> bool:
        """
        Check if text is a valid Spectra command (starts with wake phrase).

        Args:
            text: User input text

        Returns:
            True if text starts with a wake phrase
        """
        has_wake, _ = self.detect_and_strip(text)
        return has_wake
