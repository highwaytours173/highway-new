import Link from 'next/link';
import Image from 'next/image';
import type { Tour } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Star, Tag } from 'lucide-react';
import { AddToCartButton } from './add-to-cart-button';

interface TourCardProps {
  tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/tours/${tour.id}`}>
          <div className="relative h-56 w-full">
            <Image
              src={tour.image}
              alt={tour.name}
              fill
              className="object-cover"
              data-ai-hint={`${tour.destination} ${tour.type}`}
            />
            {!tour.availability && (
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg">Sold Out</Badge>
               </div>
            )}
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-2">
        <div className="flex justify-between items-start">
            <Badge variant="secondary">{tour.type}</Badge>
            <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{tour.rating.toFixed(1)}</span>
            </div>
        </div>
        <CardTitle className="font-headline text-2xl h-16">
            <Link href={`/tours/${tour.id}`} className="hover:text-accent transition-colors">
                {tour.name}
            </Link>
        </CardTitle>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{tour.destination}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{tour.duration} Days</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex items-center justify-between">
        <p className="text-2xl font-bold text-primary">${tour.price.toLocaleString()}</p>
        <AddToCartButton tour={tour} />
      </CardFooter>
    </Card>
  );
}
