'use client';

import { useState, useTransition } from 'react';
import type { Review } from '@/types';
import { updateReviewStatus, deleteReview } from '@/lib/supabase/reviews';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  Globe,
  Building2,
  MessageSquare,
} from 'lucide-react';

interface ReviewsClientProps {
  initialReviews: Review[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

const statusFilterTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
] as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved':
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
  }
}

export function ReviewsClient({ initialReviews, stats }: ReviewsClientProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [reviews, setReviews] = useState(initialReviews);
  const [isPending, startTransition] = useTransition();

  const filteredReviews =
    activeTab === 'all' ? reviews : reviews.filter((r) => r.status === activeTab);

  const handleUpdateStatus = (reviewId: string, status: 'approved' | 'rejected') => {
    startTransition(async () => {
      try {
        await updateReviewStatus(reviewId, status);
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status } : r)));
        toast({
          title: `Review ${status}`,
          description: `The review has been ${status}.`,
        });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to update review status.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDelete = (reviewId: string) => {
    startTransition(async () => {
      try {
        await deleteReview(reviewId);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        toast({ title: 'Review deleted' });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to delete review.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {statusFilterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-muted-foreground">
              (
              {tab.key === 'all'
                ? reviews.length
                : reviews.filter((r) => r.status === tab.key).length}
              )
            </span>
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No {activeTab === 'all' ? '' : activeTab} reviews yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>For</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="hidden md:table-cell">Review</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{review.customerName}</p>
                        <p className="text-xs text-muted-foreground">{review.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        {review.tours ? (
                          <>
                            <Globe className="h-3.5 w-3.5 text-blue-500" />
                            <span className="max-w-[120px] truncate">{review.tours.name}</span>
                          </>
                        ) : review.hotels ? (
                          <>
                            <Building2 className="h-3.5 w-3.5 text-orange-500" />
                            <span className="max-w-[120px] truncate">{review.hotels.name}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} />
                    </TableCell>
                    <TableCell className="hidden max-w-[250px] md:table-cell">
                      <p className="truncate text-sm text-muted-foreground">
                        {review.content || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={review.status} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {review.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleUpdateStatus(review.id, 'approved')}
                            disabled={isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="ml-1 hidden lg:inline">Approve</span>
                          </Button>
                        )}
                        {review.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleUpdateStatus(review.id, 'rejected')}
                            disabled={isPending}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="ml-1 hidden lg:inline">Reject</span>
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-muted-foreground hover:text-destructive"
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete review?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the review by{' '}
                                <strong>{review.customerName}</strong>. This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(review.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
