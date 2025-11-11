"""
Simple InVEST-like carbon accounting using biophysical table values from the paper (Table 3).

Calculates per-class carbon storage (Mg) given class areas (ha), and sequestration between current and future.
C_total_k = area_k_ha * (C_above + C_below + C_soil + C_dead)  (Mg)
"""
import numpy as np
import pandas as pd

# Biophysical table extracted from paper Table 3. Keys are class indices 0..10 (0 unclassified)
BIOPHYSICAL = {
    0: {'name':'Unclassified','C_above':0,'C_below':0,'C_soil':0,'C_dead':0},
    1: {'name':'Dense Forest','C_above':140,'C_below':70,'C_soil':35,'C_dead':12},
    2: {'name':'Open Forest','C_above':65,'C_below':40,'C_soil':25,'C_dead':6},
    3: {'name':'Agriculture','C_above':23,'C_below':35,'C_soil':21,'C_dead':5},
    4: {'name':'Grassland','C_above':15,'C_below':35,'C_soil':30,'C_dead':4},
    5: {'name':'Degraded Land','C_above':0,'C_below':0,'C_soil':0,'C_dead':0},
    6: {'name':'Barren Land','C_above':0.1,'C_below':1.9,'C_soil':0.8,'C_dead':0},
    7: {'name':'Water Bodies','C_above':2,'C_below':1,'C_soil':10,'C_dead':0},
    8: {'name':'Snow Cover','C_above':0,'C_below':0,'C_soil':0,'C_dead':0},
    9: {'name':'Built-up','C_above':2,'C_below':1,'C_soil':6.22,'C_dead':0},
    10:{'name':'Sand Bar','C_above':0,'C_below':0,'C_soil':0,'C_dead':0}
}

def carbon_storage_from_areas(area_by_class_ha):
    """area_by_class_ha: dict or array-like mapping class index->area (ha).
    Returns dict of class->carbon storage (Mg), and total storage.
    """
    total = 0.0
    out = {}
    for k, vals in BIOPHYSICAL.items():
        area = float(area_by_class_ha.get(k, 0.0))
        pool_sum = vals['C_above'] + vals['C_below'] + vals['C_soil'] + vals['C_dead']
        cstore = area * pool_sum
        out[k] = {'name': vals['name'], 'area_ha': area, 'carbon_Mg': cstore}
        total += cstore
    return out, total

def sequestration_between(area_current, area_future):
    """Compute carbon sequestration C_future - C_current given area dicts (ha).
    Returns total_current, total_future, delta (Mg)
    """
    _, cur_total = carbon_storage_from_areas(area_current)
    _, fut_total = carbon_storage_from_areas(area_future)
    return cur_total, fut_total, fut_total - cur_total

if __name__ == '__main__':
    # quick sanity check using sample areas (ha) taken from Table 4 (1995 ~ values)
    sample_areas = {1:22162.95, 2:17048.61, 3:3879.45, 4:1765.89, 5:342.45, 6:594.36, 7:511.11, 8:1632.06, 9:46.89, 10:323.46}
    cur, fut, delta = sequestration_between(sample_areas, sample_areas)
    print('Total carbon (sample areas):', cur, 'Mg; delta (same->same):', delta)