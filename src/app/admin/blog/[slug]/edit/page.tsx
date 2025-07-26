
"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, PlusCircle, Trash2, Sparkles, Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { getPostBySlug, getAuthors } from "@/lib/blog";
import { Combobox } from "@/components/ui/combobox";
import { useEffect, useMemo, useState, useActionState } from "react";
import { generateBlogPostAction } from "@/app/actions";
import { useFormStatus } from "react-dom";

const authors = getAuthors();
const availableTags = [
    { value: "Travel Tips", label: "Travel Tips" },
    { value: "Destinations", label: "Destinations" },
    { value: "Egypt", label: "Egypt" },
    { value: "Adventure", label: "Adventure" },
    { value: "Culture", label: "Culture" },
    { value: "Food", label: "Food" },
];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with words separated by dashes."),
  content: z.string().min(100, "Content should be at least 100 characters."),
  author: z.string().min(1, "Author is required."),
  status: z.enum(["Published", "Draft"]),
  tags: z.array(z.string()).optional(),
  featuredImage: z.array(z.any()).optional(),
});

function GenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="outline" className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Generate Content with AI
    </Button>
  );
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const isNewPost = slug === 'new';
  const post = useMemo(() => isNewPost ? null : getPostBySlug(slug), [slug, isNewPost]);
  
  const [aiState, generateAction, isGenerating] = useActionState(generateBlogPostAction, { message: '', content: '' });
  const [topic, setTopic] = useState('');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      author: "",
      status: "Draft",
      tags: [],
      featuredImage: [],
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        slug: post.slug,
        content: post.content,
        author: post.author,
        status: post.status,
        tags: post.tags,
        featuredImage: [], // Can't pre-populate file inputs
      });
    }
  }, [post, form]);

  useEffect(() => {
    if (aiState.content) {
      form.setValue('content', aiState.content, { shouldValidate: true, shouldDirty: true });
    }
  }, [aiState.content, form]);

  if (!isNewPost && !post) {
    return <div>Post not found.</div>;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Blog Post Data:", values);
    alert(`${isNewPost ? 'New post created' : 'Post updated'}! Check the console for the data.`);
    router.push('/admin/blog');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" asChild>
            <Link href="/admin/blog">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to blog posts</span>
            </Link>
        </Button>
        <div>
            <h2 className="text-2xl font-bold tracking-tight">{isNewPost ? 'Create a New Post' : 'Edit Post'}</h2>
            <p className="text-muted-foreground">{isNewPost ? 'Fill out the details to publish a new article.' : `Editing "${post?.title}"`}</p>
        </div>
      </div>
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Post Content</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                             <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Post Title</FormLabel>
                                    <FormControl><Input placeholder="e.g., Top 10 Things to Do in Cairo" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                              <FormField control={form.control} name="slug" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl><Input placeholder="e.g., top-10-cairo" {...field} /></FormControl>
                                    <FormDescription>A unique, URL-friendly identifier for the post.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                             <Card className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">AI Content Generator</CardTitle>
                                    <CardDescription>Provide a topic and let AI draft the content for you.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <form action={generateAction}>
                                        <div className="flex gap-2">
                                            <Input 
                                                name="topic"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                placeholder="e.g., A 3-day itinerary for Luxor"
                                                disabled={isGenerating}
                                            />
                                            <GenerateButton />
                                        </div>
                                         {aiState.message && aiState.message !== 'Success' && (
                                            <p className="text-sm text-destructive mt-2">{aiState.message}</p>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>

                             <FormField control={form.control} name="content" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl><Textarea placeholder="Write your article here. Supports Markdown." {...field} rows={15} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Publishing</CardTitle>
                        </CardHeader>
                         <CardContent className="grid gap-6">
                             <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Published">Published</SelectItem>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="author" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Author</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select an author" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {authors.map(author => (
                                                <SelectItem key={author} value={author}>{author}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button type="submit">{isNewPost ? 'Create Post' : 'Save Changes'}</Button>
                        </CardFooter>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                           <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags</FormLabel>
                                        <Combobox
                                            options={availableTags}
                                            selected={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Select tags..."
                                            className="w-full"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Featured Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="featuredImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <ImageUploader 
                                                value={field.value || []}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
      </Form>
    </div>
  );
}
