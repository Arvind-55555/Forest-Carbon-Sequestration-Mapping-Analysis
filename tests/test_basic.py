def test_dummy():
    from src.data_processing.loader import DummyLoader
    loader = DummyLoader()
    assert isinstance(loader.load_sample(), list)
