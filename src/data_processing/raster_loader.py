"""
Raster ingestion and training-sample creation utilities.
"""
import rasterio
from rasterio.enums import Resampling
import numpy as np
import os

def read_raster(path):
    with rasterio.open(path) as src:
        arr = src.read(1)
        profile = src.profile
    return arr, profile

def align_and_stack(raster_paths, ref_path=None):
    if ref_path is None:
        ref_path = raster_paths[0]
    with rasterio.open(ref_path) as ref:
        ref_profile = ref.profile
        ref_shape = (ref_profile['height'], ref_profile['width'])
        ref_transform = ref_profile['transform']
        ref_crs = ref_profile['crs']
    layers = []
    for p in raster_paths:
        with rasterio.open(p) as src:
            if src.profile['crs'] != ref_crs or src.profile['transform'] != ref_transform or src.profile['width'] != ref_shape[1] or src.profile['height'] != ref_shape[0]:
                data = src.read(
                    out_shape=(1, ref_shape[0], ref_shape[1]),
                    resampling=Resampling.bilinear
                )[0]
            else:
                data = src.read(1)
        layers.append(data)
    stack = np.stack(layers, axis=-1)
    return stack, ref_profile

def create_training_samples(lulc_from_path, lulc_to_path, driver_paths, out_path, sample_fraction=0.05, transition=(2,3)):
    lulc_from, _ = read_raster(lulc_from_path)
    lulc_to, _ = read_raster(lulc_to_path)
    all_paths = [lulc_from_path, lulc_to_path] + driver_paths
    stack, profile = align_and_stack(all_paths, ref_path=lulc_from_path)
    H,W = lulc_from.shape
    pos = (lulc_from == transition[0]) & (lulc_to == transition[1])
    neg = ~pos
    pos_idx = np.argwhere(pos)
    neg_idx = np.argwhere(neg)
    rng = np.random.RandomState(0)
    n_pos = max(10, int(len(pos_idx)*sample_fraction))
    n_neg = max(50, int(len(neg_idx)*sample_fraction))
    pos_choice = pos_idx[rng.choice(len(pos_idx), size=min(n_pos, len(pos_idx)), replace=False)] if len(pos_idx)>0 else np.empty((0,2), dtype=int)
    neg_choice = neg_idx[rng.choice(len(neg_idx), size=min(n_neg, len(neg_idx)), replace=False)] if len(neg_idx)>0 else np.empty((0,2), dtype=int)
    chosen = np.vstack([pos_choice, neg_choice]) if len(pos_choice)>0 or len(neg_choice)>0 else np.empty((0,2), dtype=int)
    X = []
    y = []
    for (r,c) in chosen:
        feats = stack[r,c,2:].astype(float)
        X.append(feats)
        y.append(1 if (lulc_from[r,c]==transition[0] and lulc_to[r,c]==transition[1]) else 0)
    X = np.array(X)
    y = np.array(y)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    np.savez_compressed(out_path, X=X, y=y)
    return out_path, X.shape, int(y.sum())
