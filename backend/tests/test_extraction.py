import pytest
from uuid import uuid4
from app.services.extraction import ExtractionService
from app.schemas.extraction import ExtractionResult

def test_fallback_extraction_types():
    transcript = (
        "Speaker A: We observed thermal throttling on the MOSFET.\n"
        "Speaker A: We decided to switch to an aluminum casing.\n"
        "Speaker A: We need to buy replacement thermal pads.\n"
        "Speaker A: What if the power supply is failing?\n"
    )

    result = ExtractionService._fallback_extract(transcript)
    assert isinstance(result, ExtractionResult)
    assert len(result.claims) == 4

    types = [c.type for c in result.claims]
    assert "observation" in types
    assert "decision" in types
    assert "task" in types
    assert "question" in types

def test_sensitivity_flagging():
    transcript = (
        "Speaker A: This is off the record, the contractor cost us $15000 extra.\n"
        "Speaker A: Normal task to implement firmware update.\n"
    )

    result = ExtractionService._fallback_extract(transcript)
    assert len(result.claims) == 2
    assert result.claims[0].sensitivity == "flagged"
    assert result.claims[1].sensitivity == "none"

def test_entity_extraction():
    transcript = "Speaker A: The ODrive controller failed when connected to MotorX."
    result = ExtractionService._fallback_extract(transcript)
    entity_names = [e.name for e in result.entities]
    assert "ODrive" in entity_names or "MotorX" in entity_names
