import os
dirs = [
    "data/raw",
    "data/processed",
    "data/outputs",
    "data/field_measurements",
    "notebooks",
    "tests"
]
for d in dirs:
    os.makedirs(d, exist_ok=True)
print("Created directories:", dirs)
