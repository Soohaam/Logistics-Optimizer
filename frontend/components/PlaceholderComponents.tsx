"use client";

import React from 'react';
import { Card, CardContent } from './ui/card';

// Import and re-export the modular components
export { default as Optimization } from './Optimization';

// Placeholder component for other features
const PlaceholderComponent: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Card className="w-full h-[400px] flex items-center justify-center">
      <CardContent>
        <h2 className="text-2xl font-bold text-gray-500">{title} - Coming Soon</h2>
        <p className="text-gray-400 mt-2">This feature is under development</p>
      </CardContent>
    </Card>
  );
};

export const PortToPlant: React.FC = () => <PlaceholderComponent title="Port to Plant Analysis" />;
export const DelayPrediction: React.FC = () => <PlaceholderComponent title="Delay Prediction" />;
export const ImportRoute: React.FC = () => <PlaceholderComponent title="Import Route Analysis" />;
export const VesselPrediction: React.FC = () => <PlaceholderComponent title="Vessel Prediction" />;
export const VesselManagement: React.FC = () => <PlaceholderComponent title="Vessel Management" />;
export const VesselDetail: React.FC = () => <PlaceholderComponent title="Vessel Detail" />;
export const VesselManager: React.FC = () => <PlaceholderComponent title="Vessel Manager" />;
export const GlobeDemo: React.FC = () => <PlaceholderComponent title="Globe Demo" />;
