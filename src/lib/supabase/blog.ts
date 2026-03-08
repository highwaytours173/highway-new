'use server';

import { createClient } from './server';
import type { Post } from '@/types';
import { getCurrentAgencyId } from '@/lib/supabase/agencies';

type DbPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  status: 'Published' | 'Draft';
  created_at: string;
  updated_at: string | null;
  featured_image: string | null;
  tags: string[] | null;
};

function toPost(row: DbPost): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    author: row.author,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    // Ensure type consistency: Post.featuredImage is a string in types
    // Use empty string when no image is set
    featuredImage: row.featured_image ?? '',
    tags: row.tags ?? [],
  };
}

export async function getPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        'id, slug, title, content, author, status, created_at, updated_at, featured_image, tags'
      )
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return (data || []).map(toPost);
  } catch (err) {
    console.error('Unexpected error fetching posts:', err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        'id, slug, title, content, author, status, created_at, updated_at, featured_image, tags'
      )
      .eq('slug', slug)
      .eq('agency_id', agencyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching post by slug:', error);
      return null;
    }

    if (!data) return null;
    return toPost(data as DbPost);
  } catch (err) {
    console.error('Unexpected error fetching post by slug:', err);
    return null;
  }
}

export async function upsertPost(post: Post): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  try {
    const payload = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      author: post.author,
      status: post.status,
      created_at: post.createdAt,
      updated_at: new Date().toISOString(),
      featured_image: post.featuredImage ?? null,
      tags: post.tags ?? [],
      agency_id: agencyId,
    };
    // Note: onConflict: "slug" might need to be "slug, agency_id" if we have a composite unique constraint.
    // However, if we only have unique constraint on slug, this might fail if multiple agencies use same slug.
    // Ideally we should update the unique constraint to be (slug, agency_id).
    // For now, assuming slug is unique globally or we rely on ID.
    const { error } = await supabase.from('posts').upsert(payload, {
      onConflict: 'id', // Use ID for upsert to avoid slug collision issues across agencies if unique constraint is not updated yet
    });
    if (error) throw error;
    return { ok: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}

export async function deletePostBySlug(slug: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('slug', slug)
      .eq('agency_id', agencyId);
    if (error) throw error;
    return { ok: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}
