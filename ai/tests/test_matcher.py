from enhanced_manufacturer_matcher import ManufacturerMatcher


def test_matcher_basic():
    matcher = ManufacturerMatcher("manufacturers.csv")
    results = matcher.find_top_suppliers(
        material="Organic Cotton", region=None, min_capacity=0, top_n=3
    )
    assert isinstance(results, list)
    # Each result must include the required keys
    for r in results:
        assert "Manufacturer_Name" in r or "name" in r
        assert "final_score" in r
    # Score order should be descending
    scores = [r["final_score"] for r in results]
    assert scores == sorted(scores, reverse=True)
