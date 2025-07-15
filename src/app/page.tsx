"use client"

import React, { useState, useMemo } from 'react';
import { TourCard } from '@/components/tour-card';
import { getTours } from '@/lib/tours';
import type { Tour } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SlidersHorizontal } from 'lucide-react';

export default function Home() {
  const tours = getTours();
  const [destination, setDestination] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  const [duration, setDuration] = useState<string>('all');

  const destinations = useMemo(() => ['all', ...Array.from(new Set(tours.map(t => t.destination)))], [tours]);
  const types = useMemo(() => ['all', ...Array.from(new Set(tours.map(t => t.type)))], [tours]);

  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      const durationNum = parseInt(duration);
      return (
        (destination === 'all' || tour.destination === destination) &&
        (type === 'all' || tour.type === type) &&
        (duration === 'all' || 
          (durationNum === 1 && tour.duration <= 3) ||
          (durationNum === 2 && tour.duration > 3 && tour.duration <= 7) ||
          (durationNum === 3 && tour.duration > 7))
      );
    });
  }, [tours, destination, type, duration]);

  return (
    <div className="space-y-8">
      <section className="text-center bg-card p-8 rounded-lg shadow-md">
        <h1 className="font-headline text-5xl font-bold text-primary mb-2">Discover Your Next Adventure</h1>
        <p className="text-lg text-muted-foreground">Explore curated tours from around the globe.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Filter Tours
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="destination-filter" className="text-sm font-medium">Destination</label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger id="destination-filter" className="w-full">
                <SelectValue placeholder="Select Destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map(d => <SelectItem key={d} value={d}>{d === 'all' ? 'All Destinations' : d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="type-filter" className="text-sm font-medium">Tour Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type-filter" className="w-full">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map(t => <SelectItem key={t} value={t}>{t === 'all' ? 'All Types' : t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="duration-filter" className="text-sm font-medium">Duration</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration-filter" className="w-full">
                <SelectValue placeholder="Select Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                <SelectItem value="1">1-3 Days</SelectItem>
                <SelectItem value="2">4-7 Days</SelectItem>
                <SelectItem value="3">7+ Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredTours.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour: Tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">No Tours Found</h2>
          <p className="text-muted-foreground">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
