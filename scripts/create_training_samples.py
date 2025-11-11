"""
Create training samples from raw rasters
"""
import argparse
import os, sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import yaml
from src.data_processing.raster_loader import create_training_samples

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--lulc-year-from", type=int, default=1995)
    parser.add_argument("--lulc-year-to", type=int, default=2020)
    parser.add_argument("--transition", type=str, default="2->3", help="A->B")
    parser.add_argument("--sample-frac", type=float, default=0.05)
    parser.add_argument("--out", type=str, default="data/processed/train_2to3.npz")
    args = parser.parse_args()
    with open("config/paths.yaml") as f:
        cfg = yaml.safe_load(f)
    raw_dir = cfg.get("raw_data_dir", "data/raw")
    lulc_from = os.path.join(raw_dir, f"LULC_{args.lulc_year_from}.tif")
    lulc_to = os.path.join(raw_dir, f"LULC_{args.lulc_year_to}.tif")
    drivers = [os.path.join(raw_dir, p) for p in cfg.get("drivers", [])]
    trans = tuple(int(x) for x in args.transition.split("->"))
    out_path, shape, positives = create_training_samples(lulc_from, lulc_to, drivers, args.out, sample_fraction=args.sample_frac, transition=trans)
    print(f"Saved training file {out_path}. X shape: {shape}, positive samples: {positives}")

if __name__ == "__main__":
    main()
