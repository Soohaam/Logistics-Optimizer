'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Ship, Anchor, Factory, MapPin, Train, Activity } from 'lucide-react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

interface SatelliteMapProps {
  vesselData?: any;
  optimizationData?: any;
}

/**
 * -------------------------
 * Types added to fix TS
 * -------------------------
 *
 * The main problem was `number[]` vs `[number, number]` (tuple) for coordinates.
 * maplibre/maptiler expects a tuple (LngLatLike -> [lng, lat]).
 *
 * We define LngLatTuple and typed models so TypeScript knows each coordinates
 * value is exactly a 2-tuple.
 */

type LngLatTuple = [number, number];

interface Port {
  id: string;
  name: string;
  coordinates: LngLatTuple;
  status: 'free' | 'busy' | 'congested';
  utilization: number;
  queueLength: number;
  availableBerths: number;
  nextVessel?: string;
  berths?: number;
  currentVessels?: string[];
}

interface Plant {
  id: string;
  name: string;
  coordinates: LngLatTuple;
  currentStock: number;
  expectedDelivery: string;
  allocationQuantity: number;
  shortfall: number;
  capacity: number;
  utilizationRate: number;
}

interface DischargePlanItem {
  port: string;
  quantity: number;
  sequence: number;
}

interface Vessel {
  id: string;
  name: string;
  coordinates: LngLatTuple;
  cargoType: string;
  cargoQuantity: number;
  eta: string;
  delayPrediction: { hours: number; confidence: number };
  currentSpeed: number;
  assignedPort: string;
  dischargePlan: DischargePlanItem[];
  riskLevel: string;
  recommendations: string[];
}

interface RailRoute {
  id: string;
  name: string;
  from: LngLatTuple;
  to: LngLatTuple;
  distance: number;
  assignedRakes: number;
  utilization: number;
  transitTime: number;
  cost: number;
  status: 'active' | 'high-utilization' | 'idle' | string;
  path: LngLatTuple[];
}

interface HeatmapPoint {
  coordinates: LngLatTuple;
  intensity: number;
  congestion: string;
  avgTime: number;
  avgCost: number;
}

interface SailData {
  ports: Port[];
  plants: Plant[];
  vessel: Vessel;
  railRoutes: RailRoute[];
  heatmapData: HeatmapPoint[];
}

interface EntityDetails {
  type: 'port' | 'plant' | 'vessel' | 'route';
  data: Port | Plant | Vessel | RailRoute | any;
}

const SatelliteMap: React.FC<SatelliteMapProps> = ({ vesselData, optimizationData }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // --- typed SAIL Logistics Data --- (annotated as SailData)
  const sailData: SailData = {
    ports: [
      {
        id: 'visakhapatnam',
        name: 'Visakhapatnam Port',
        coordinates: [83.218483, 17.686815],
        status: 'free',
        utilization: 75,
        queueLength: 2,
        availableBerths: 8,
        nextVessel: 'MV Iron Carrier',
        berths: 12,
        currentVessels: ['MV Steel Express', 'MV Cargo Master']
      },
      {
        id: 'paradip',
        name: 'Paradip Port',
        coordinates: [86.676283, 20.265400],
        status: 'busy',
        utilization: 85,
        queueLength: 4,
        availableBerths: 3,
        nextVessel: 'MV Ocean Pioneer',
        berths: 10,
        currentVessels: ['MV Iron Duke', 'MV Sea Titan', 'MV Bulk Carrier']
      },
      {
        id: 'haldia',
        name: 'Haldia Port',
        coordinates: [88.088800, 22.044700],
        status: 'congested',
        utilization: 95,
        queueLength: 6,
        availableBerths: 1,
        nextVessel: 'MV Steel Guardian',
        berths: 8,
        currentVessels: ['MV Iron Mountain', 'MV Coal Express', 'MV Bulk Master']
      }
    ],
    plants: [
      {
        id: 'bhilai',
        name: 'Bhilai Steel Plant',
        coordinates: [81.394207, 21.185157],
        currentStock: 85000,
        expectedDelivery: '2025-09-28',
        allocationQuantity: 50000,
        shortfall: 15000,
        capacity: 100000,
        utilizationRate: 85
      },
      {
        id: 'durgapur',
        name: 'Durgapur Steel Plant',
        coordinates: [87.245247, 23.548430],
        currentStock: 92000,
        expectedDelivery: '2025-09-27',
        allocationQuantity: 45000,
        shortfall: 8000,
        capacity: 100000,
        utilizationRate: 92
      },
      {
        id: 'rourkela',
        name: 'Rourkela Steel Plant',
        coordinates: [84.868950, 22.210804],
        currentStock: 78000,
        expectedDelivery: '2025-09-29',
        allocationQuantity: 60000,
        shortfall: 22000,
        capacity: 100000,
        utilizationRate: 78
      },
      {
        id: 'bokaro',
        name: 'Bokaro Steel Plant',
        coordinates: [86.106870, 23.671677],
        currentStock: 88000,
        expectedDelivery: '2025-09-28',
        allocationQuantity: 55000,
        shortfall: 12000,
        capacity: 100000,
        utilizationRate: 88
      },
      {
        id: 'iisco',
        name: 'IISCO Steel Plant (Burnpur)',
        coordinates: [86.926179, 23.673236],
        currentStock: 82000,
        expectedDelivery: '2025-09-30',
        allocationQuantity: 48000,
        shortfall: 18000,
        capacity: 100000,
        utilizationRate: 82
      }
    ],
    vessel: {
      id: 'mv-sail-carrier',
      name: 'MV SAIL Carrier',
      coordinates: [85.000000, 19.500000],
      cargoType: 'Iron Ore',
      cargoQuantity: 75000,
      eta: '2025-09-27 14:30',
      delayPrediction: { hours: 2.5, confidence: 85 },
      currentSpeed: 12.5,
      assignedPort: 'Paradip Port',
      dischargePlan: [
        { port: 'Paradip Port', quantity: 30000, sequence: 1 },
        { port: 'Haldia Port', quantity: 25000, sequence: 2 },
        { port: 'Visakhapatnam Port', quantity: 20000, sequence: 3 }
      ],
      riskLevel: 'medium',
      recommendations: ['Monitor weather conditions', 'Consider alternative berthing']
    },
    railRoutes: [
      {
        id: 'paradip-bhilai',
        name: 'Paradip - Bhilai Railway',
        from: [86.676283, 20.265400],
        to: [81.394207, 21.185157],
        distance: 485,
        assignedRakes: 12,
        utilization: 78,
        transitTime: 18,
        cost: 2400,
        status: 'active',
        path: [
          [86.676283, 20.265400],
          [86.2, 20.8],
          [85.5, 21.2],
          [84.8, 21.3],
          [83.9, 21.25],
          [82.8, 21.2],
          [81.394207, 21.185157]
        ]
      },
      {
        id: 'haldia-durgapur',
        name: 'Haldia - Durgapur Railway',
        from: [88.088800, 22.044700],
        to: [87.245247, 23.548430],
        distance: 165,
        assignedRakes: 8,
        utilization: 92,
        transitTime: 8,
        cost: 1200,
        status: 'high-utilization',
        path: [
          [88.088800, 22.044700],
          [87.8, 22.5],
          [87.6, 23.0],
          [87.4, 23.3],
          [87.245247, 23.548430]
        ]
      },
      {
        id: 'visakhapatnam-rourkela',
        name: 'Visakhapatnam - Rourkela Railway',
        from: [83.218483, 17.686815],
        to: [84.868950, 22.210804],
        distance: 520,
        assignedRakes: 6,
        utilization: 45,
        transitTime: 22,
        cost: 2800,
        status: 'idle',
        path: [
          [83.218483, 17.686815],
          [83.5, 18.2],
          [83.8, 19.0],
          [84.1, 19.8],
          [84.3, 20.5],
          [84.6, 21.2],
          [84.868950, 22.210804]
        ]
      }
    ],
    heatmapData: [
      { coordinates: [86.676283, 20.265400], intensity: 0.9, congestion: 'High', avgTime: 24, avgCost: 3200 },
      { coordinates: [88.088800, 22.044700], intensity: 0.95, congestion: 'Very High', avgTime: 28, avgCost: 3800 },
      { coordinates: [83.218483, 17.686815], intensity: 0.7, congestion: 'Medium', avgTime: 18, avgCost: 2400 },
      { coordinates: [85.0, 21.0], intensity: 0.6, congestion: 'Medium', avgTime: 20, avgCost: 2600 },
      { coordinates: [87.0, 23.0], intensity: 0.8, congestion: 'High', avgTime: 22, avgCost: 2900 }
    ]
  };

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      maptilersdk.config.apiKey = 'HPOa5Wbsh5rlu6op5CS6';

      // Center on eastern India for SAIL operations
      const center: LngLatTuple = [85.0, 21.0];

      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: "https://api.maptiler.com/maps/satellite/style.json?key=HPOa5Wbsh5rlu6op5CS6",
        center: center,
        zoom: 6,
        maxZoom: 18,
        minZoom: 4
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        addMapLayers();
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const addMapLayers = () => {
    if (!map.current) return;

    // Add rail routes
    sailData.railRoutes.forEach((route, index) => {
      const routeColor = route.status === 'active' ? '#3b82f6' :
                        route.status === 'high-utilization' ? '#ef4444' : '#9ca3af';
      const routeWidth = route.status === 'high-utilization' ? 4 : 2;

      map.current!.addSource(`rail-route-${index}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { ...route },
          geometry: {
            type: 'LineString',
            coordinates: route.path
          }
        }
      });

      map.current!.addLayer({
        id: `rail-route-${index}`,
        type: 'line',
        source: `rail-route-${index}`,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': routeColor,
          'line-width': routeWidth,
          'line-dasharray': route.status === 'idle' ? [2, 2] : [1, 0]
        }
      });

      // Add click handler for routes
      map.current!.on('click', `rail-route-${index}`, (e) => {
        if (e.features && e.features[0]) {
          setSelectedEntity({
            type: 'route',
            data: e.features[0].properties
          });
          setIsDialogOpen(true);
        }
      });

      // Change cursor on hover
      map.current!.on('mouseenter', `rail-route-${index}`, () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current!.on('mouseleave', `rail-route-${index}`, () => {
        map.current!.getCanvas().style.cursor = '';
      });
    });

    // Add heatmap
    map.current!.addSource('heatmap-data', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: sailData.heatmapData.map((point, index) => ({
          type: 'Feature',
          properties: { ...point },
          geometry: {
            type: 'Point',
            coordinates: point.coordinates
          }
        }))
      }
    });

    map.current!.addLayer({
      id: 'heatmap-layer',
      type: 'heatmap',
      source: 'heatmap-data',
      maxzoom: 9,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'intensity'],
          0, 0,
          1, 1
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          9, 3
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 20,
          9, 40
        ],
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 1,
          9, 0
        ]
      }
    });

    // Add markers for ports, plants, and vessel
    addMarkers();
  };

  const addMarkers = () => {
    if (!map.current) return;

    // Add port markers
    sailData.ports.forEach((port) => {
      const statusColor = port.status === 'free' ? '#22c55e' :
                         port.status === 'busy' ? '#eab308' : '#ef4444';

      const el = document.createElement('div');
      el.className = 'port-marker';
      el.style.cssText = `
        width: 30px; height: 30px; border-radius: 50%;
        background-color: ${statusColor}; border: 3px solid white;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;
      el.innerHTML = '⚓';
      el.style.fontSize = '16px';
      el.style.color = 'white';

      el.addEventListener('click', () => {
        setSelectedEntity({ type: 'port', data: port });
        setIsDialogOpen(true);
      });

      // port.coordinates is a LngLatTuple so setLngLat is type-safe
      new maptilersdk.Marker({ element: el })
        .setLngLat(port.coordinates)
        .addTo(map.current!);
    });

    // Add plant markers
    sailData.plants.forEach((plant) => {
      const el = document.createElement('div');
      el.className = 'plant-marker';
      el.style.cssText = `
        width: 30px; height: 30px; border-radius: 4px;
        background-color: #64748b; border: 3px solid white;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;
      el.innerHTML = '🏭';
      el.style.fontSize = '16px';

      el.addEventListener('click', () => {
        setSelectedEntity({ type: 'plant', data: plant });
        setIsDialogOpen(true);
      });

      new maptilersdk.Marker({ element: el })
        .setLngLat(plant.coordinates)
        .addTo(map.current!);
    });

    // Add vessel marker
    const vesselEl = document.createElement('div');
    vesselEl.className = 'vessel-marker';
    vesselEl.style.cssText = `
      width: 35px; height: 35px; border-radius: 50%;
      background-color: #3b82f6; border: 3px solid white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
    vesselEl.innerHTML = '🚢';
    vesselEl.style.fontSize = '18px';

    vesselEl.addEventListener('click', () => {
      setSelectedEntity({ type: 'vessel', data: sailData.vessel });
      setIsDialogOpen(true);
    });

    new maptilersdk.Marker({ element: vesselEl })
      .setLngLat(sailData.vessel.coordinates)
      .addTo(map.current!);

    // Add discharge sequence lines
    if (sailData.vessel.dischargePlan.length > 1) {
      // make dischargeCoordinates typed as tuple array
      const dischargeCoordinates: LngLatTuple[] = [];
      sailData.vessel.dischargePlan
        .sort((a, b) => a.sequence - b.sequence)
        .forEach((discharge) => {
          const port = sailData.ports.find(p => p.name === discharge.port);
          if (port) {
            dischargeCoordinates.push(port.coordinates);
          }
        });

      if (dischargeCoordinates.length > 1) {
        map.current!.addSource('discharge-sequence', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: dischargeCoordinates
            }
          }
        });

        map.current!.addLayer({
          id: 'discharge-sequence',
          type: 'line',
          source: 'discharge-sequence',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#8b5cf6',
            'line-width': 3,
            'line-dasharray': [1, 1]
          }
        });
      }
    }
  };

  const renderEntityDetails = () => {
    if (!selectedEntity) return null;

    const { type, data } = selectedEntity;

    switch (type) {
      case 'port':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Anchor className="h-5 w-5" />
              <h3 className="text-lg font-semibold">{data.name}</h3>
              <Badge className={`${
                data.status === 'free' ? 'bg-green-100 text-green-800' :
                data.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {data.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Utilization</p>
                <p className="font-semibold">{data.utilization}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Queue Length</p>
                <p className="font-semibold">{data.queueLength} vessels</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Berths</p>
                <p className="font-semibold">{data.availableBerths}/{data.berths}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Vessel</p>
                <p className="font-semibold">{data.nextVessel}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Vessels</p>
              <div className="flex flex-wrap gap-2">
                {data.currentVessels.map((vessel: string, idx: number) => (
                  <Badge key={idx} variant="outline">{vessel}</Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'plant':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              <h3 className="text-lg font-semibold">{data.name}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="font-semibold">{data.currentStock.toLocaleString()} MT</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Capacity</p>
                <p className="font-semibold">{data.capacity.toLocaleString()} MT</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Delivery</p>
                <p className="font-semibold">{data.expectedDelivery}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilization Rate</p>
                <p className="font-semibold">{data.utilizationRate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Allocation</p>
                <p className="font-semibold">{data.allocationQuantity.toLocaleString()} MT</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Shortfall</p>
                <p className="font-semibold text-red-600">{data.shortfall.toLocaleString()} MT</p>
              </div>
            </div>
          </div>
        );

      case 'vessel':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              <h3 className="text-lg font-semibold">{data.name}</h3>
              <Badge className={`${
                data.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                data.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {data.riskLevel} risk
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cargo Type</p>
                <p className="font-semibold">{data.cargoType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cargo Quantity</p>
                <p className="font-semibold">{data.cargoQuantity.toLocaleString()} MT</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ETA</p>
                <p className="font-semibold">{data.eta}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Speed</p>
                <p className="font-semibold">{data.currentSpeed} knots</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned Port</p>
                <p className="font-semibold">{data.assignedPort}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delay Prediction</p>
                <p className="font-semibold">{data.delayPrediction.hours}h ({data.delayPrediction.confidence}%)</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Discharge Plan</p>
              <div className="space-y-2">
                {data.dischargePlan.map((discharge: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{discharge.sequence}. {discharge.port}</span>
                    <span className="text-sm font-semibold">{discharge.quantity.toLocaleString()} MT</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Recommendations</p>
              <div className="space-y-1">
                {data.recommendations.map((rec: string, idx: number) => (
                  <p key={idx} className="text-sm bg-blue-50 p-2 rounded">• {rec}</p>
                ))}
              </div>
            </div>
          </div>
        );

      case 'route':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Train className="h-5 w-5" />
              <h3 className="text-lg font-semibold">{data.name}</h3>
              <Badge className={`${
                data.status === 'active' ? 'bg-blue-100 text-blue-800' :
                data.status === 'high-utilization' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {data.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Distance</p>
                <p className="font-semibold">{data.distance} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned Rakes</p>
                <p className="font-semibold">{data.assignedRakes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilization</p>
                <p className="font-semibold">{data.utilization}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transit Time</p>
                <p className="font-semibold">{data.transitTime} hours</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Cost</p>
                <p className="font-semibold">₹{data.cost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full">
      <Card className="h-[600px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              SAIL Logistics Satellite Map
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Ports Free
              </Badge>
              <Badge variant="outline" className="bg-yellow-50">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                Ports Busy
              </Badge>
              <Badge variant="outline" className="bg-red-50">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                Congested
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-80px)] p-0">
          <div ref={mapContainer} className="w-full h-full" />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEntity?.type === 'port' && 'Port Details'}
              {selectedEntity?.type === 'plant' && 'Steel Plant Details'}
              {selectedEntity?.type === 'vessel' && 'Vessel Details'}
              {selectedEntity?.type === 'route' && 'Railway Route Details'}
            </DialogTitle>
          </DialogHeader>
          {renderEntityDetails()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SatelliteMap;
