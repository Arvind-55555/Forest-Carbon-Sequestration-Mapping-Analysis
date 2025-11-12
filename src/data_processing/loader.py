import numpy as np
import pandas as pd
import json
from pathlib import Path

class EnhancedBiomassLoader:
    """Enhanced loader for biomass data from multiple sources."""
    
    def __init__(self, data_dir="data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
    
    def load_sample(self):
        """Returns a small list representing simplified pixel biomass values."""
        return [1.0, 2.5, 3.2, 0.8, 2.1]
    
    def create_sample_csv(self, filename="sample_biomass.csv"):
        """Create a sample CSV file for demonstration."""
        data = {
            'pixel_id': range(1, 101),
            'biomass_value': np.random.normal(2.5, 1.0, 100).clip(0.1, 5.0),
            'latitude': np.random.uniform(40.0, 45.0, 100),
            'longitude': np.random.uniform(-75.0, -70.0, 100),
            'vegetation_type': np.random.choice(['Forest', 'Grassland', 'Shrubland', 'Wetland'], 100)
        }
        df = pd.DataFrame(data)
        filepath = self.data_dir / filename
        df.to_csv(filepath, index=False)
        return filepath
    
    def create_sample_json(self, filename="sample_biomass.json"):
        """Create a sample JSON file for demonstration."""
        data = {
            "metadata": {
                "dataset_name": "Biomass Sample Data",
                "collection_date": "2024-01-15",
                "units": "kg/m²"
            },
            "biomass_readings": [
                {
                    "site_id": f"S{i:03d}",
                    "biomass": round(np.random.normal(3.0, 1.5), 2),
                    "coordinates": {
                        "lat": round(np.random.uniform(40.0, 45.0), 4),
                        "lon": round(np.random.uniform(-75.0, -70.0), 4)
                    },
                    "quality_flag": np.random.choice(["good", "fair", "poor"], p=[0.8, 0.15, 0.05])
                } for i in range(50)
            ]
        }
        filepath = self.data_dir / filename
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        return filepath
    
    def load_csv(self, filename):
        """Load biomass data from CSV file."""
        filepath = self.data_dir / filename
        if not filepath.exists():
            raise FileNotFoundError(f"CSV file not found: {filepath}")
        return pd.read_csv(filepath)
    
    def load_json(self, filename):
        """Load biomass data from JSON file."""
        filepath = self.data_dir / filename
        if not filepath.exists():
            raise FileNotFoundError(f"JSON file not found: {filepath}")
        with open(filepath, 'r') as f:
            return json.load(f)
    
    def load_multiple_formats(self, csv_file=None, json_file=None):
        """Load data from multiple file formats and combine."""
        datasets = {}
        
        if csv_file:
            datasets['csv'] = self.load_csv(csv_file)
        
        if json_file:
            json_data = self.load_json(json_file)
            # Convert JSON to DataFrame for easier analysis
            biomass_data = []
            for reading in json_data['biomass_readings']:
                biomass_data.append({
                    'site_id': reading['site_id'],
                    'biomass': reading['biomass'],
                    'latitude': reading['coordinates']['lat'],
                    'longitude': reading['coordinates']['lon'],
                    'quality_flag': reading['quality_flag']
                })
            datasets['json'] = pd.DataFrame(biomass_data)
        
        return datasets

# Keep the original DummyLoader for backward compatibility
class DummyLoader:
    """Stub loader for sampling/demo data."""
    def load_sample(self):
        # returns a small list representing simplified pixel biomass values
        return [1.0, 2.5, 3.2, 0.8, 2.1]
