import React from "react";
import { getTours } from "@/lib/supabase/tours";
import { createClient } from "@/lib/supabase/server";
import HomePageClient from "./home-client";
import type { HomeContent, Post } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch home page content from Supabase
  const { data: homePageData } = await supabase
    .from("home_page_content")
    .select("data")
    .eq("id", 1)
    .maybeSingle();
    
  // Fetch posts/articles from Supabase
  // Try 'articles' first, if not found (error), try 'posts'
  // Actually, based on investigation, 'articles' table doesn't exist, 'posts' exists but is empty.
  // So we'll fetch from 'posts'.
  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "Published")
    .order("createdAt", { ascending: false })
    .limit(3);

  const articles = (postsData as unknown as Post[]) || [];

  const homeContent =
    homePageData?.data && typeof homePageData.data === "object"
      ? (homePageData.data as HomeContent)
      : null;

  if (!homeContent) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-2xl border bg-card p-8 text-center">
          <h1 className="font-headline text-3xl font-bold">
            Home page not configured
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add home page content in the admin panel to publish this page.
          </p>
        </div>
      </div>
    );
  }

  const popularCount =
    typeof homeContent.popularDestinations?.count === "number"
      ? homeContent.popularDestinations.count
      : 0;
  const offersCount =
    typeof homeContent.lastMinuteOffers?.count === "number"
      ? homeContent.lastMinuteOffers.count
      : 0;
  const toursLimit = Math.max(popularCount || 0, offersCount || 0);

  const initialTours = await getTours({ limit: toursLimit > 0 ? toursLimit : undefined });

  return (
    <HomePageClient 
      initialTours={initialTours} 
      homeContent={homeContent}
      articles={articles}
    />
  );
}
