import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Ship, 
  MapPin, 
  Factory, 
  Train,
  Navigation,
  Info,
  Clock,
  Route
} from 'lucide-react';

// Leaflet types and imports
interface LatLng {
  lat: number;
  lng: number;
}

interface PlantAllocation {
  plantName: string;
  requiredQuantity: number;
  plantStockAvailability: number;
  _id: string;
}

interface PortPreference {
  portName: string;
  sequentialDischarge: boolean;
  dischargeOrder: string[];
  portStockAvailability: number;
  _id: string;
}

interface RouteData {
  loadingCountry: string;
  loadPort: string;
  portPreferences: PortPreference[];
  plantAllocations: PlantAllocation[];
  vesselName: string;
}

// Coordinates database for major countries, ports, and industrial locations
const locationCoordinates: { [key: string]: LatLng } = {
  // Countries (capital cities as reference points)
  'Australia': { lat: -25.2744, lng: 133.7751 },
  'Brazil': { lat: -14.2350, lng: -51.9253 },
  'South Africa': { lat: -30.5595, lng: 22.9375 },
  'Canada': { lat: 56.1304, lng: -106.3468 },
  'Chile': { lat: -35.6751, lng: -71.5430 },
  'Peru': { lat: -9.1900, lng: -75.0152 },
  'Indonesia': { lat: -0.7893, lng: 113.9213 },
  'Russia': { lat: 61.5240, lng: 105.3188 },
  'USA': { lat: 39.8283, lng: -98.5795 },
  'India': { lat: 20.5937, lng: 78.9629 },
  
  // Major Indian Ports
  'Kandla': { lat: 23.0225, lng: 70.2208 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'JNPT': { lat: 18.9647, lng: 72.9505 },
  'Cochin': { lat: 9.9312, lng: 76.2673 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Paradip': { lat: 20.3647, lng: 86.6107 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Tuticorin': { lat: 8.8932, lng: 78.1348 },
  'Mangalore': { lat: 12.9141, lng: 74.8560 },
  'Goa': { lat: 15.2993, lng: 74.1240 },
  'Ennore': { lat: 13.2127, lng: 80.3340 },
  'Kakinada': { lat: 16.9891, lng: 82.2475 },
  
  // Major Industrial Plants/Cities in India
  'Jamshedpur': { lat: 22.8046, lng: 86.2029 },
  'Rourkela': { lat: 22.2604, lng: 84.8536 },
  'Bhilai': { lat: 21.1938, lng: 81.3509 },
  'Bokaro': { lat: 23.6693, lng: 86.1511 },
  'Durgapur': { lat: 23.5204, lng: 87.3119 },
  'Salem': { lat: 11.6643, lng: 78.1460 },
  'Bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'Ranchi': { lat: 23.3441, lng: 85.3096 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Gurgaon': { lat: 28.4595, lng: 77.0266 },
  'Noida': { lat: 28.5355, lng: 77.3910 },
  'Faridabad': { lat: 28.4089, lng: 77.3178 },
};

const ImportRoute: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [routeStats, setRouteStats] = useState({
    oceanDistance: 0,
    railDistance: 0,
    totalDistance: 0,
    estimatedDays: 0
  });

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const parsedData: RouteData = JSON.parse(decodeURIComponent(dataParam));
        setRouteData(parsedData);
        
        // Set default selections
        if (parsedData.portPreferences.length > 0) {
          setSelectedPort(parsedData.portPreferences[0].portName);
        }
        if (parsedData.plantAllocations.length > 0) {
          setSelectedPlant(parsedData.plantAllocations[0].plantName);
        }
      } catch (error) {
        console.error('Error parsing route data:', error);
      }
    }
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    const loadMap = async () => {
      if (mapRef.current && !mapInstanceRef.current && typeof window !== 'undefined') {
        // Dynamically import Leaflet to avoid SSR issues
        const L = (await import('leaflet')).default;
        
        // Import CSS
        await import('leaflet/dist/leaflet.css');

        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [20.5937, 78.9629], // Center on India
          zoom: 5,
          zoomControl: true,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        // Custom icons
        const shipIcon = L.divIcon({
          html: '<div style="color: #1e40af; font-size: 24px;">🚢</div>',
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const portIcon = L.divIcon({
          html: '<div style="color: #dc2626; font-size: 20px;">⚓</div>',
          className: 'custom-marker',
          iconSize: [25, 25],
          iconAnchor: [12, 12]
        });

        const plantIcon = L.divIcon({
          html: '<div style="color: #7c3aed; font-size: 18px;">🏭</div>',
          className: 'custom-marker',
          iconSize: [25, 25],
          iconAnchor: [12, 12]
        });

        const railIcon = L.divIcon({
          html: '<div style="color: #059669; font-size: 16px;">🚂</div>',
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        if (routeData) {
          drawRoute(L, shipIcon, portIcon, plantIcon, railIcon);
        }
      }
    };

    if (routeData && !loading) {
      loadMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routeData, selectedPort, selectedPlant, loading]);

  const drawRoute = async (L: any, shipIcon: any, portIcon: any, plantIcon: any, railIcon: any) => {
    if (!mapInstanceRef.current || !routeData) return;

    // Clear existing layers
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer.options && (layer.options.color || layer._path)) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Get coordinates
    const loadingCountryCoords = locationCoordinates[routeData.loadingCountry];
    const portCoords = locationCoordinates[selectedPort];
    const plantCoords = locationCoordinates[selectedPlant];

    if (!loadingCountryCoords || !portCoords || !plantCoords) {
      console.warn('Some coordinates not found for route calculation');
      return;
    }

    // Add markers
    L.marker([loadingCountryCoords.lat, loadingCountryCoords.lng], { icon: shipIcon })
      .bindPopup(`<strong>Loading Port:</strong><br/>${routeData.loadPort}<br/><strong>Country:</strong> ${routeData.loadingCountry}`)
      .addTo(mapInstanceRef.current);

    L.marker([portCoords.lat, portCoords.lng], { icon: portIcon })
      .bindPopup(`<strong>Discharge Port:</strong><br/>${selectedPort}<br/><strong>Type:</strong> Sea Route Destination`)
      .addTo(mapInstanceRef.current);

    L.marker([plantCoords.lat, plantCoords.lng], { icon: plantIcon })
      .bindPopup(`<strong>Plant:</strong><br/>${selectedPlant}<br/><strong>Type:</strong> Final Destination`)
      .addTo(mapInstanceRef.current);

    // Ocean route (curved line for better visualization)
    const oceanRoute = L.polyline([
      [loadingCountryCoords.lat, loadingCountryCoords.lng],
      [portCoords.lat, portCoords.lng]
    ], {
      color: '#1e40af',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 5'
    }).bindPopup('🚢 Ocean Route: Vessel Transportation')
      .addTo(mapInstanceRef.current);

    // Rail route
    const railRoute = L.polyline([
      [portCoords.lat, portCoords.lng],
      [plantCoords.lat, plantCoords.lng]
    ], {
      color: '#059669',
      weight: 4,
      opacity: 0.8,
      dashArray: '5, 5'
    }).bindPopup('🚂 Rail Route: Port to Plant Transportation')
      .addTo(mapInstanceRef.current);

    // Calculate approximate distances (Haversine formula)
    const oceanDistance = calculateDistance(
      loadingCountryCoords.lat, loadingCountryCoords.lng,
      portCoords.lat, portCoords.lng
    );
    
    const railDistance = calculateDistance(
      portCoords.lat, portCoords.lng,
      plantCoords.lat, plantCoords.lng
    );

    const totalDistance = oceanDistance + railDistance;
    const estimatedDays = Math.ceil((oceanDistance / 500) + (railDistance / 200)); // Rough estimate

    setRouteStats({
      oceanDistance: Math.round(oceanDistance),
      railDistance: Math.round(railDistance),
      totalDistance: Math.round(totalDistance),
      estimatedDays
    });

    // Fit map to show all markers
    const group = new L.featureGroup([oceanRoute, railRoute]);
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleBack = () => {
    router.back();
  };

  const handlePortChange = (portName: string) => {
    setSelectedPort(portName);
  };

  const handlePlantChange = (plantName: string) => {
    setSelectedPlant(plantName);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6 shadow-lg rounded-xl border border-gray-200">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-lg text-gray-600 font-medium">Loading route information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!routeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6 shadow-lg rounded-xl border border-red-200">
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-lg text-red-600 font-medium">No route data available</p>
            <Button onClick={handleBack} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg px-6 py-2 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Route className="h-8 w-8 text-blue-600" />
                Import Route - {routeData.vesselName}
              </h1>
              <p className="text-gray-600 mt-1">
                Shipping route from {routeData.loadingCountry} to India
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Route Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Route Summary */}
            <Card className="shadow-lg rounded-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-blue-600" />
                  Route Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Ship className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Ocean Route</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    {routeData.loadingCountry} → {selectedPort}
                  </p>
                  <p className="text-lg font-bold text-blue-800">
                    {routeStats.oceanDistance.toLocaleString()} km
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Train className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Rail Route</span>
                  </div>
                  <p className="text-sm text-green-600">
                    {selectedPort} → {selectedPlant}
                  </p>
                  <p className="text-lg font-bold text-green-800">
                    {routeStats.railDistance.toLocaleString()} km
                  </p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Total Journey</span>
                  </div>
                  <p className="text-sm text-purple-600">
                    Estimated Duration
                  </p>
                  <p className="text-lg font-bold text-purple-800">
                    ~{routeStats.estimatedDays} days
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Port Selection */}
            <Card className="shadow-lg rounded-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Port Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {routeData.portPreferences.map((port) => (
                    <button
                      key={port._id}
                      onClick={() => handlePortChange(port.portName)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        selectedPort === port.portName
                          ? 'bg-red-100 border-2 border-red-500 text-red-800'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-medium">{port.portName}</div>
                      <div className="text-sm text-gray-600">
                        Stock: {port.portStockAvailability.toLocaleString()} MT
                      </div>
                      {port.sequentialDischarge && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Sequential
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Plant Selection */}
            <Card className="shadow-lg rounded-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-purple-600" />
                  Plant Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {routeData.plantAllocations.map((plant) => (
                    <button
                      key={plant._id}
                      onClick={() => handlePlantChange(plant.plantName)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        selectedPlant === plant.plantName
                          ? 'bg-purple-100 border-2 border-purple-500 text-purple-800'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-medium">{plant.plantName}</div>
                      <div className="text-sm text-gray-600">
                        Required: {plant.requiredQuantity.toLocaleString()} MT
                      </div>
                      <div className="text-sm text-gray-600">
                        Available: {plant.plantStockAvailability.toLocaleString()} MT
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg rounded-xl bg-white h-[800px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Route Visualization
                  <Badge variant="outline" className="ml-auto">
                    Total: {routeStats.totalDistance.toLocaleString()} km
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[720px]">
                <div ref={mapRef} className="w-full h-full rounded-b-xl" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Route Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Ship className="h-5 w-5" />
                Ocean Transport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Origin:</span>
                  <span className="font-medium">{routeData.loadPort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium">{selectedPort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">{routeStats.oceanDistance.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Duration:</span>
                  <span className="font-medium">{Math.ceil(routeStats.oceanDistance / 500)} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Train className="h-5 w-5" />
                Rail Transport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Origin:</span>
                  <span className="font-medium">{selectedPort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium">{selectedPlant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">{routeStats.railDistance.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Duration:</span>
                  <span className="font-medium">{Math.ceil(routeStats.railDistance / 200)} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Info className="h-5 w-5" />
                Journey Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Distance:</span>
                  <span className="font-medium">{routeStats.totalDistance.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Duration:</span>
                  <span className="font-medium">{routeStats.estimatedDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport Modes:</span>
                  <span className="font-medium">Sea + Rail</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vessel:</span>
                  <span className="font-medium">{routeData.vesselName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImportRoute;