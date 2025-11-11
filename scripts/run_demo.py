"""
Demo pipeline:
- Generate synthetic driver variables for N pixels
- Create synthetic labels for a small set of transitions (binary)
- Train MLP submodels (demo)
- Apply Markov transition matrix to class proportions to get future proportions
- Compute InVEST-like carbon storage and sequestration using Table 3 values from the paper. fileciteturn2file8
"""
import numpy as np
from src.modeling.mlp_markov import MLPSubModel, apply_markov
from src.modeling.invest_like import carbon_storage_from_areas, sequestration_between

np.random.seed(0)

# 1) Synthetic driver dataset (N pixels, 7 driver variables as in paper) 
N = 2000
X = np.random.normal(size=(N,7))  # elevation, slope, dist_road, dist_place, dist_building, dist_waterway, dist_landuse (standardized)

# 2) Synthetic binary label for one transition: e.g., Open Forest -> Agriculture (class 2 -> 3)
# We'll make ~10% positives depending on a logistic of X[:,0] + noise to mimic spatial tendency
logit = (X[:,0] * -0.5 + X[:,2] * 0.3)  # fake signal
prob = 1 / (1 + np.exp(-logit))
y = (np.random.rand(N) < (0.08 + 0.4*(prob - prob.mean()))).astype(int)

# Train demo MLP submodel
model = MLPSubModel(hidden_layer_sizes=(10,), learning_rate_init=0.0008, max_iter=2000)
model.fit(X, y)
p = model.predict_proba(X[:10])
print('Demo MLP predicted probabilities (first 10 pixels):', p)

# 3) Apply Markov to get future proportions starting from 2020 proportions (approx from Table 4 percentages)
initial_props = np.array([0.3529, 0.2555, 0.2251, 0.0776, 0.0051, 0.0309, 0.0074, 0.0212, 0.0069, 0.0072])
future_props = apply_markov(initial_props, steps=1)
print('\nInitial class proportions (sample, 2020-like):', initial_props)
print('Future class proportions after Markov (2020->2035 step):', future_props)

# 4) Convert proportions to sample area (assume total area 45465 ha as reported reduced AWLS area) 
total_area_ha = 45465.0
area_current = {i+1: initial_props[i]*total_area_ha for i in range(10)}  # mapping class index 1..10
area_future = {i+1: future_props[i]*total_area_ha for i in range(10)}
# Note: our class indexing in invest_like uses 0..10. We'll map 0 as unclassified with 0 area.
area_current_full = {0:0.0}; area_future_full = {0:0.0}
for k in range(1,11):
    area_current_full[k] = area_current.get(k,0.0)
    area_future_full[k] = area_future.get(k,0.0)

# 5) Carbon accounting (InVEST-like)
from src.modeling.invest_like import sequestration_between, carbon_storage_from_areas
cur_total, fut_total, delta = sequestration_between(area_current_full, area_future_full)
print(f'\nCarbon storage current: {cur_total:,.2f} Mg; future: {fut_total:,.2f} Mg; delta (future-current): {delta:,.2f} Mg')

# 6) Convert Mg C to tCO2 (multiply by 3.667) and approximate economic valuation example using price 86 USD/tCO2 (scenario I in paper)
tCO2_delta = delta * 3.667 / 1000.0  # Mg -> tonnes -> multiply then /1000? careful: Mg = metric tonne, so Mg * 3.667 = tCO2; then /1 to get tonnes. Keep direct.
tCO2_delta = delta * 3.667  # delta in Mg C -> convert to Mg CO2 (metric tonnes CO2)
price_usd_per_tCO2 = 86.0
npv = tCO2_delta * price_usd_per_tCO2  # naive one-time value (paper uses NPV formula across years)
print(f'Approx economic change (one-time, USD): {npv:,.2f} (using ${price_usd_per_tCO2}/tCO2)')
