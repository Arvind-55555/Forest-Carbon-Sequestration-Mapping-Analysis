from flask import Flask, jsonify
from src.data_processing.loader import DummyLoader
from src.modeling.mlp_markov import MLPMarkovModel

app = Flask(__name__)

@app.route("/")
def index():
    return jsonify({"project": "Forest Carbon Sequestration Mapping", "status": "ok"})

@app.route("/run-sample")
def run_sample():
    loader = DummyLoader()
    data = loader.load_sample()
    model = MLPMarkovModel()
    result = model.predict(data)
    return jsonify({"result_shape": len(result), "message": "sample run complete"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
