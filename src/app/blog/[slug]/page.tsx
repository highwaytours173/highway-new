import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/supabase/blog";
import Image from "next/image";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto py-10 prose prose-neutral dark:prose-invert">
      <h1>{post.title}</h1>
      <p className="text-sm text-muted-foreground">
        By {post.author} · {new Date(post.createdAt).toLocaleDateString()} · {post.status}
      </p>
      {post.featuredImage && (
        <div className="relative w-full h-80 my-6">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}
      <div>
        {post.content}
      </div>
    </article>
  );
}