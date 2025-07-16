import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
          <CardDescription>
            This is your control panel. You can manage tours, bookings, and users from here.
          </d>
        </CardHeader>
        <CardContent>
          <p>Dashboard content will go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
