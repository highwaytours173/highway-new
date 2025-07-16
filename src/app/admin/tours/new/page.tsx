
"use client"

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const priceTierSchema = z.object({
  minPeople: z.coerce.number().min(1, "Min people is required"),
  maxPeople: z.coerce.number().nullable(),
  pricePerAdult: z.coerce.number().min(0, "Price must be positive"),
  pricePerChild: z.coerce.number().min(0, "Price must be positive"),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  destination: z.string().min(2, "Destination is required."),
  type: z.enum(['Adventure', 'Relaxation', 'Cultural', 'Culinary', 'Family', 'Honeymoon']),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  image: z.string().url("Please enter a valid image URL."),
  availability: z.boolean().default(true),
  rating: z.coerce.number().min(1).max(5),
  priceTiers: z.array(priceTierSchema).min(1, "At least one price tier is required."),
});

export default function NewTourPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      destination: "",
      duration: 1,
      description: "",
      image: "",
      availability: true,
      rating: 4.5,
      priceTiers: [{ minPeople: 1, maxPeople: 5, pricePerAdult: 100, pricePerChild: 50 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "priceTiers",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would send this data to your backend/database.
    console.log("New Tour Data:", values);
    alert("New tour created! Check the console for the data.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" asChild>
            <Link href="/admin/tours">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to tours</span>
            </Link>
        </Button>
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Create a New Tour</h2>
            <p className="text-muted-foreground">Fill out the details below to add a new tour package.</p>
        </div>
      </div>
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tour Details</CardTitle>
                            <CardDescription>Provide the main information about the tour.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                             <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tour Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Pyramids & Sphinx Expedition" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea placeholder="A brief but compelling description of the tour..." {...field} rows={5} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing Tiers</CardTitle>
                            <CardDescription>Define different prices based on group size.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-4 gap-4 items-end p-4 border rounded-md relative">
                                    <FormField control={form.control} name={`priceTiers.${index}.minPeople`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Min People</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name={`priceTiers.${index}.maxPeople`} render={({ field }) => (
                                         <FormItem>
                                            <FormLabel>Max People</FormLabel>
                                            <FormControl><Input type="number" placeholder="Leave empty for..." {...field} value={field.value ?? ""} /></FormControl>
                                             <FormDescription className="text-xs">Leave empty for no max.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name={`priceTiers.${index}.pricePerAdult`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Adult Price</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name={`priceTiers.${index}.pricePerChild`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Child Price</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-3 -right-3 h-7 w-7"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                             <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ minPeople: 6, maxPeople: null, pricePerAdult: 80, pricePerChild: 40 })}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Price Tier
                            </Button>
                        </CardContent>
                    </Card>

                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Properties</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                             <FormField control={form.control} name="destination" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destination</FormLabel>
                                    <FormControl><Input placeholder="e.g., Cairo" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tour Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a tour type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Adventure">Adventure</SelectItem>
                                        <SelectItem value="Relaxation">Relaxation</SelectItem>
                                        <SelectItem value="Cultural">Cultural</SelectItem>
                                        <SelectItem value="Culinary">Culinary</SelectItem>
                                        <SelectItem value="Family">Family</SelectItem>
                                        <SelectItem value="Honeymoon">Honeymoon</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="duration" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration (in days)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="rating" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rating (1-5)</FormLabel>
                                    <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="image" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image URL</FormLabel>
                                    <FormControl><Input placeholder="https://images.unsplash.com/..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="availability" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Availability</FormLabel>
                                    <FormDescription>Is this tour currently available for booking?</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardFooter className="flex justify-end">
                            <Button type="submit">Create Tour</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </form>
      </Form>
    </div>
  );
}
