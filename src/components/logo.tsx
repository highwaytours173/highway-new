import React from 'react';
import { Plane } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-full h-12 w-12">
      <Plane className="h-6 w-6" />
    </div>
  );
}
