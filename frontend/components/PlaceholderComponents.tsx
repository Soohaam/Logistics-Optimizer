import React from 'react';
import { Card, CardContent } from './ui/card';

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
export const Optimization: React.FC = () => <PlaceholderComponent title="Optimization" />;