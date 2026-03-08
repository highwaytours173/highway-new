import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type RecentItem = {
  user: string;
  email: string;
  amount: string; // formatted currency string
  avatar?: string;
};

export function RecentSales({ items }: { items: RecentItem[] }) {
  return (
    <div className="space-y-8">
      {items.map((booking, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9" data-ai-hint="person portrait">
            {booking.avatar ? (
              <AvatarImage src={booking.avatar} alt={`${booking.user}'s avatar`} />
            ) : null}
            <AvatarFallback>
              {booking.user
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{booking.user}</p>
            <p className="text-sm text-muted-foreground">{booking.email}</p>
          </div>
          <div className="ml-auto font-medium">{booking.amount}</div>
        </div>
      ))}
    </div>
  );
}
