import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentBookings = [
  {
    user: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    avatar: "https://placehold.co/40x40.png",
  },
  {
    user: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$39.00",
    avatar: "https://placehold.co/40x40.png",
  },
  {
    user: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
    avatar: "https://placehold.co/40x40.png",
  },
  {
    user: "William Kim",
    email: "will@email.com",
    amount: "+$99.00",
    avatar: "https://placehold.co/40x40.png",
  },
  {
    user: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$39.00",
    avatar: "https://placehold.co/40x40.png",
  },
];

export function RecentSales() {
  return (
    <div className="space-y-8">
      {recentBookings.map((booking, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9" data-ai-hint="person portrait">
            <AvatarImage src={booking.avatar} alt={`${booking.user}'s avatar`} />
            <AvatarFallback>{booking.user.split(' ').map((n) => n[0]).join('').substring(0, 2)}</AvatarFallback>
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
