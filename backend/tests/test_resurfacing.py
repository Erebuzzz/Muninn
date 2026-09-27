from app.services.resurfacing import ResurfacingService

def test_resurfacing_relevance_matching():
    current_entities = ["ODrive", "Heatsink"]
    candidates = [
        {
            "id": "11111111-1111-1111-1111-111111111111",
            "type": "task",
            "text": "Redesign mounting bracket for Heatsink",
            "status": "blocked",
            "entities": ["Heatsink"],
        },
        {
            "id": "22222222-2222-2222-2222-222222222222",
            "type": "question",
            "text": "Does ODrive support 48V bus voltage?",
            "status": None,
            "entities": ["ODrive"],
        },
        {
            "id": "33333333-3333-3333-3333-333333333333",
            "type": "task",
            "text": "Order coffee beans",
            "status": "open",
            "entities": ["Kitchen"],
        }
    ]

    results = ResurfacingService._fallback_resurfacing(current_entities, candidates)
    assert len(results) == 2
    reasons = [r["reason"] for r in results]
    assert "stale_and_relevant" in reasons
    assert "reopened_question" in reasons
    assert all("Kitchen" not in r["message"] for r in results)
