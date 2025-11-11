"""
MLPnn-Markov minimal implementation

Uses scikit-learn MLPClassifier to fit transition sub-models for a few transitions,
and applies a Markov transition matrix (from the paper) to simulate class proportions
for a future year.

Citations:
- Transition matrix (Table 8) used as default: extracted from the uploaded paper. fileciteturn2file9
- MLP parameters (Table 7) used as starting hyperparameters. fileciteturn2file10
"""
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split

# Default transition matrix (rows: from class index, cols: to class index)
# Classes order: [Dense Forest, Open Forest, Agriculture, Grassland, Degraded Land, Barren Land, Water Bodies, Snow Cover, Built-up, Sand Bar]
DEFAULT_MARKOV = np.array([
 [0.891, 0.022, 0.053, 0.020, 0.002, 0.001, 0.004, 0.001, 0.003, 0.002],
 [0.058, 0.522, 0.287, 0.102, 0.006, 0.005, 0.002, 0.003, 0.007, 0.004],
 [0.018, 0.135, 0.709, 0.076, 0.002, 0.003, 0.003, 0.0,   0.020, 0.029],
 [0.080, 0.066, 0.132, 0.515, 0.057, 0.063, 0.007, 0.029, 0.031, 0.015],
 [0.022, 0.016, 0.034, 0.260, 0.561, 0.022, 0.005, 0.018, 0.032, 0.025],
 [0.003, 0.013, 0.032, 0.145, 0.182, 0.565, 0.001, 0.050, 0.003, 0.004],
 [0.199, 0.005, 0.129, 0.015, 0.000, 0.002, 0.396, 0.0,   0.045, 0.205],
 [0.064, 0.083, 0.005, 0.324, 0.005, 0.035, 0.001, 0.477, 0.001, 0.001],
 [0.080, 0.182, 0.293, 0.122, 0.027, 0.008, 0.010, 0.002, 0.248, 0.025],
 [0.024, 0.022, 0.266, 0.078, 0.005, 0.016, 0.132, 0.002, 0.036, 0.415]
])

class MLPSubModel:
    """Train a small MLP to predict probability of a specific transition."""
    def __init__(self, hidden_layer_sizes=(10,), learning_rate_init=0.0008, max_iter=10000, random_state=42):
        # parameters inspired by Table 7 in paper. fileciteturn2file10
        self.clf = MLPClassifier(hidden_layer_sizes=hidden_layer_sizes, learning_rate_init=learning_rate_init,
                                 max_iter=max_iter, random_state=random_state)
        self.is_trained = False

    def fit(self, X, y):
        self.clf.fit(X, y)
        self.is_trained = True

    def predict_proba(self, X):
        if not self.is_trained:
            raise RuntimeError("Model not trained")
        # return probability for positive class (assume binary labelled 0/1)
        p = self.clf.predict_proba(X)
        # if binary, positive class is column 1; otherwise return max class prob
        if p.shape[1] == 2:
            return p[:,1]
        return np.max(p, axis=1)

def apply_markov(initial_proportions, markov_matrix=DEFAULT_MARKOV, steps=1):
    """Apply markov transition matrix to an initial class proportion vector.
    initial_proportions: 1D array of length 10 summing to 1 (or raw areas; will be normalized)
    returns: proportions after `steps` transitions
    """
    p = np.array(initial_proportions, dtype=float)
    if p.sum() <= 0:
        raise ValueError("initial_proportions must contain positive values")
    p = p / p.sum()
    M = np.array(markov_matrix)
    for _ in range(steps):
        p = p.dot(M)
    return p

if __name__ == '__main__':
    # tiny self-test: start with proportions similar to Table 4 (normalized areas approximate)
    initial = np.array([0.3588, 0.3529, 0.0803, 0.0365, 0.0071, 0.0123, 0.0106, 0.0338, 0.0010, 0.0067])
    print('Initial proportions (sample):', initial)
    print('After one markov step:', apply_markov(initial))
