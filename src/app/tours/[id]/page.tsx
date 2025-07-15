import { getTourById } from '@/lib/tours';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { Clock, MapPin, Star, Calendar, DollarSign } from 'lucide-react';

type TourDetailsPageProps = {
  params: {
    id: string;
  };
};

export default function TourDetailsPage({ params }: TourDetailsPageProps) {
  const tour = getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="relative h-80 md:h-full min-h-[400px]">
            <Image
              src={tour.image}
              alt={tour.name}
              fill
              className="object-cover"
              data-ai-hint={`${tour.destination} ${tour.type}`}
            />
          </div>
          <div className="p-8 flex flex-col">
            <Badge variant="secondary" className="w-fit mb-2">{tour.type}</Badge>
            <h1 className="font-headline text-4xl font-bold text-primary mb-4">{tour.name}</h1>
            <p className="text-muted-foreground mb-6 flex-grow">{tour.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-accent"/> <span>{tour.destination}</span></div>
              <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-accent"/> <span>{tour.duration} days</span></div>
              <div className="flex items-center gap-2"><Star className="h-5 w-5 text-accent fill-accent"/> <span>{tour.rating}/5.0</span></div>
              <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-accent"/> <span>{tour.availability ? 'Available' : 'Sold Out'}</span></div>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <p className="text-3xl font-bold text-primary flex items-center gap-2">
                <DollarSign className="h-7 w-7"/>{tour.price.toLocaleString()}
              </p>
              <AddToCartButton tour={tour} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Itinerary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tour.itinerary.map(item => (
              <div key={item.day} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                    {item.day}
                  </div>
                  {item.day !== tour.itinerary.length && <div className="w-px h-full bg-border"></div>}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary">Day {item.day}</h3>
                  <p className="text-muted-foreground">{item.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
