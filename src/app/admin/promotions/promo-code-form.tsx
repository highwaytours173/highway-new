'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createPromoCode, updatePromoCode } from '@/lib/supabase/promo-codes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { PromoCode } from '@/types';

const formSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters.')
    .regex(/^[a-zA-Z0-9]+$/, 'Code must be alphanumeric.'),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0.01, 'Value must be greater than 0.'),
  minOrderAmount: z.coerce.number().optional(),
  maxDiscountAmount: z.coerce.number().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  usageLimit: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
});

interface PromoCodeFormProps {
  initialData?: PromoCode;
  formType: 'new' | 'edit';
}

export function PromoCodeForm({ initialData, formType }: PromoCodeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = {
    code: initialData?.code ?? '',
    type: initialData?.type ?? 'percentage',
    value: initialData?.value ?? 0,
    minOrderAmount: initialData?.minOrderAmount ?? 0,
    maxDiscountAmount: initialData?.maxDiscountAmount ?? undefined,
    startsAt: initialData?.startsAt
      ? new Date(initialData.startsAt).toISOString().slice(0, 16)
      : '',
    expiresAt: initialData?.expiresAt
      ? new Date(initialData.expiresAt).toISOString().slice(0, 16)
      : '',
    usageLimit: initialData?.usageLimit ?? undefined,
    isActive: initialData?.isActive ?? true,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const payload = {
        code: values.code,
        type: values.type,
        value: values.value,
        minOrderAmount: values.minOrderAmount || undefined,
        maxDiscountAmount: values.maxDiscountAmount || undefined,
        startsAt: values.startsAt || undefined,
        expiresAt: values.expiresAt || undefined,
        usageLimit: values.usageLimit || undefined,
        isActive: values.isActive,
      };

      if (formType === 'edit' && initialData) {
        await updatePromoCode(initialData.id, payload);
      } else {
        await createPromoCode(
          payload as Omit<PromoCode, 'id' | 'createdAt' | 'usageCount' | 'agency_id'>
        );
      }
      router.push('/admin/promotions');
    } catch (error) {
      console.error(error);
      alert('Failed to save promo code.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promo Code</FormLabel>
              <FormControl>
                <Input placeholder="SUMMER2025" {...field} className="uppercase" />
              </FormControl>
              <FormDescription>Unique code that customers will enter at checkout.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormDescription>
                  {form.watch('type') === 'percentage' ? 'e.g. 10 for 10%' : 'e.g. 50 for $50'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="minOrderAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Order Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormDescription>Minimum cart total required.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxDiscountAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Discount Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>Optional limit for percentage discounts.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Starts At</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expires At</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="usageLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usage Limit</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>Total number of times this code can be used.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>Enable or disable this promo code.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {formType === 'new' ? 'Create Promo Code' : 'Update Promo Code'}
        </Button>
      </form>
    </Form>
  );
}
