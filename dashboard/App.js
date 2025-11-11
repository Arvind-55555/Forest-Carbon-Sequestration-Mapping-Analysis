import React, { useState, useEffect } from 'react';
import { MapPin, Trees, TrendingUp, DollarSign, Download, Upload, Play, Settings, Database, BarChart3, Layers, AlertCircle } from 'lucide-react';

const ForestCarbonPlatform = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('default');

  const sampleData = {
    carbonStock: 245.6,
    sequestrationRate: 12.3,
    forestArea: 15420,
    economicValue: 2145000,
    scenarios: {
      business_as_usual: { carbon: 220.4, change: -10.3 },
      conservation: { carbon: 268.9, change: 9.5 },
      afforestation: { carbon: 312.5, change: 27.3 }
    }
  };

  const initializeProject = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProjectData(sampleData);
    setLoading(false);
  };

  useEffect(() => {
    initializeProject();
  }, []);

  const codeSnippets = {
    dataProcessing: `# data_processing/satellite_loader.py
import ee
import numpy as np
from datetime import datetime, timedelta

class LandsatLoader:
    """Load and preprocess Landsat imagery from Google Earth Engine"""
    
    def __init__(self, start_date='2020-01-01', end_date='2023-12-31'):
        ee.Initialize()
        self.start_date = start_date
        self.end_date = end_date
        
    def load_images(self, region, cloud_cover_max=20):
        collection = (ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                     .filterBounds(region)
                     .filterDate(self.start_date, self.end_date)
                     .filter(ee.Filter.lt('CLOUD_COVER', cloud_cover_max)))
        
        return collection.map(self._mask_clouds)`,

    carbonModeling: `# modeling/carbon_estimation.py
class CarbonEstimator:
    """Estimate carbon stocks from land cover and biomass data"""
    
    def __init__(self, carbon_pools):
        self.carbon_pools = carbon_pools
        
    def estimate_stocks(self, landcover, forest_types):
        carbon_map = np.zeros_like(landcover, dtype=float)
        
        for forest_type in self.biomass_coef.index:
            mask = (landcover == 1) & (forest_types == forest_type)
            
            if mask.sum() > 0:
                biomass = self.biomass_coef.loc[forest_type, 'biomass_mg_ha']
                total_carbon = biomass * sum(self.carbon_pools.values())
                carbon_map[mask] = total_carbon
                
        return carbon_map`,

    dataExtraction: `# data_extraction/api_clients.py
import requests
import pandas as pd

class GlobalForestWatchAPI:
    BASE_URL = "https://data-api.globalforestwatch.org"
    
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.session = requests.Session()
        
    def get_forest_loss(self, geometry, start_year=2000, end_year=2023):
        endpoint = f"{self.BASE_URL}/dataset/umd_tree_cover_loss/latest/query"
        params = {'geometry': geometry}
        response = self.session.get(endpoint, params=params)
        return pd.DataFrame(response.json()['data'])`,

    scenarioAnalysis: `# modeling/scenarios.py
class ScenarioAnalyzer:
    def __init__(self, baseline_carbon, baseline_year=2023):
        self.baseline_carbon = baseline_carbon
        self.baseline_year = baseline_year
        
    def business_as_usual(self, projection_year=2035):
        years = projection_year - self.baseline_year
        deforestation_rate = 0.012
        projected_carbon = self.baseline_carbon * (1 - deforestation_rate) ** years
        return projected_carbon`
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === id
          ? 'bg-green-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const MetricCard = ({ icon: Icon, label, value, unit, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="p-3 bg-green-50 rounded-lg">
          <Icon className="text-green-600" size={24} />
        </div>
        {trend && (
          <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
      {unit && <div className="text-xs text-gray-500 mt-1">{unit}</div>}
    </div>
  );

  const CodeBlock = ({ title, code }) => (
    <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <span className="text-gray-300 font-mono text-sm">{title}</span>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Download size={16} />
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm max-h-96">
        <code className="text-green-400 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Trees}
          label="Total Carbon Stock"
          value={projectData?.carbonStock || 0}
          unit="Mg C/ha"
          trend={-2.3}
        />
        <MetricCard
          icon={TrendingUp}
          label="Sequestration Rate"
          value={projectData?.sequestrationRate || 0}
          unit="Mg C/ha/year"
          trend={1.5}
        />
        <MetricCard
          icon={MapPin}
          label="Forest Area"
          value={projectData?.forestArea || 0}
          unit="hectares"
          trend={-0.8}
        />
        <MetricCard
          icon={DollarSign}
          label="Economic Value"
          value={projectData?.economicValue || 0}
          unit="USD"
          trend={3.2}
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Scenario Comparison (2035 Projection)</h3>
        <div className="space-y-3">
          {projectData?.scenarios && Object.entries(projectData.scenarios).map(([key, data]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 capitalize">
                  {key.replace('_', ' ')}
                </div>
                <div className="text-sm text-gray-600">
                  Carbon Stock: {data.carbon} Mg C/ha
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold ${
                data.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {data.change > 0 ? '+' : ''}{data.change}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Project Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Database size={32} className="mb-2" />
            <h4 className="font-semibold mb-1">Data Layer</h4>
            <p className="text-sm text-green-50">Satellite imagery, field data, climate variables</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Settings size={32} className="mb-2" />
            <h4 className="font-semibold mb-1">Processing</h4>
            <p className="text-sm text-green-50">MLP-Markov models, InVEST integration</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <BarChart3 size={32} className="mb-2" />
            <h4 className="font-semibold mb-1">Visualization</h4>
            <p className="text-sm text-green-50">Interactive dashboards, scenario analysis</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCodebase = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Layers size={24} className="text-green-600" />
          Core Codebase Components
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">1. Data Processing Pipeline</h4>
            <CodeBlock title="satellite_loader.py" code={codeSnippets.dataProcessing} />
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">2. Carbon Estimation Models</h4>
            <CodeBlock title="carbon_estimation.py" code={codeSnippets.carbonModeling} />
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">3. Data Extraction APIs</h4>
            <CodeBlock title="api_clients.py" code={codeSnippets.dataExtraction} />
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">4. Scenario Analysis</h4>
            <CodeBlock title="scenarios.py" code={codeSnippets.scenarioAnalysis} />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-bold text-blue-900 mb-2">Installation Instructions</h4>
            <pre className="bg-white p-4 rounded-lg text-sm overflow-x-auto">
              <code className="text-gray-800">{`# Clone repository
git clone https://github.com/your-username/forest-carbon-mapping.git
cd forest-carbon-mapping

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your API keys: GEE_SERVICE_ACCOUNT, SENTINEL_HUB_CLIENT_ID

# Run setup
python scripts/setup_directories.py

# Start application
python app.py`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSources = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Available Data Sources</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-bold text-gray-900 mb-2">Satellite Imagery</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Landsat 8/9: 30m resolution, 16-day revisit
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Sentinel-2: 10m resolution, 5-day revisit
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Sentinel-1 SAR: 10m resolution, all-weather
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-bold text-gray-900 mb-2">Forest Data</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Global Forest Watch: Tree cover loss
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Hansen Global Forest: Annual updates
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                ESA CCI Land Cover: 300m global
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-bold text-gray-900 mb-2">Climate Variables</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                WorldClim: Temperature, precipitation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                CHIRPS: Daily rainfall data
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                ERA5: Hourly climate reanalysis
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-bold text-gray-900 mb-2">Elevation & Terrain</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                SRTM DEM: 30m global elevation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                ALOS PALSAR: 12.5m high-resolution
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                OpenTopography: Custom DEM products
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">API Integration Examples</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Google Earth Engine</h4>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
              <code>{`import ee
ee.Initialize()

# Load Landsat collection
collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') \\
    .filterBounds(region) \\
    .filterDate('2020-01-01', '2023-12-31')

# Calculate NDVI
def add_ndvi(image):
    ndvi = image.normalizedDifference(['SR_B5', 'SR_B4'])
    return image.addBands(ndvi.rename('NDVI'))

ndvi_collection = collection.map(add_ndvi)`}</code>
            </pre>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Global Forest Watch API</h4>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
              <code>{`import requests

url = "https://data-api.globalforestwatch.org/dataset/umd_tree_cover_loss/latest/query"
params = {
    'sql': 'SELECT year, SUM(area__ha) as loss_ha FROM data GROUP BY year',
    'geometry': geojson_geometry
}

response = requests.get(url, params=params)
forest_loss = response.json()['data']`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive Map Visualization</h3>
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={64} className="text-green-600 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold">Interactive Map Component</p>
            <p className="text-sm text-gray-600 mt-2">Carbon density heatmap with region selection</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Historical Trends</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">1995-2000</span>
              <div className="flex items-center gap-2">
                <div className="bg-red-100 h-8 rounded" style={{width: '120px'}}></div>
                <span className="text-sm font-semibold text-red-600">-8.2%</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">2000-2010</span>
              <div className="flex items-center gap-2">
                <div className="bg-red-100 h-8 rounded" style={{width: '100px'}}></div>
                <span className="text-sm font-semibold text-red-600">-6.5%</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">2010-2020</span>
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 h-8 rounded" style={{width: '80px'}}></div>
                <span className="text-sm font-semibold text-orange-600">-4.8%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">2020-2023</span>
              <div className="flex items-center gap-2">
                <div className="bg-yellow-100 h-8 rounded" style={{width: '60px'}}></div>
                <span className="text-sm font-semibold text-yellow-600">-1.3%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Priority Conservation Zones</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Critical Priority</div>
                <div className="text-xs text-gray-600">2,340 hectares</div>
              </div>
              <div className="text-sm font-bold text-red-600">High Threat</div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <div className="flex-1">
                <div className="font-semibold text-sm">High Priority</div>
                <div className="text-xs text-gray-600">4,890 hectares</div>
              </div>
              <div className="text-sm font-bold text-orange-600">Moderate</div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Medium Priority</div>
                <div className="text-xs text-gray-600">8,190 hectares</div>
              </div>
              <div className="text-sm font-bold text-yellow-600">Low</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Export & Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download size={20} />
            Carbon Maps (GeoTIFF)
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={20} />
            Analysis Report (PDF)
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download size={20} />
            Data Export (CSV)
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Trees className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Forest Carbon Sequestration Platform</h1>
                <p className="text-sm text-gray-600">End-to-End Geospatial Carbon Analysis</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Play size={18} />
              Run Analysis
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <TabButton id="overview" label="Overview" icon={BarChart3} />
          <TabButton id="codebase" label="Codebase" icon={Database} />
          <TabButton id="datasources" label="Data Sources" icon={Layers} />
          <TabButton id="dashboard" label="Dashboard" icon={MapPin} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading project data...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'codebase' && renderCodebase()}
            {activeTab === 'datasources' && renderDataSources()}
            {activeTab === 'dashboard' && renderDashboard()}
          </>
        )}
      </div>
    </div>
  );
};

export default ForestCarbonPlatform;