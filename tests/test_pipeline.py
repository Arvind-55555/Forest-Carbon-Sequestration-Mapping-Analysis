def test_pipeline_runs():
    from src.modeling.mlp_markov import apply_markov
    from src.modeling.invest_like import carbon_storage_from_areas
    initial = [1,1,1,1,1,1,1,1,1,1]
    p = apply_markov(initial)
    assert abs(p.sum() - 1.0) < 1e-6
