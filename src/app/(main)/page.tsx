import React from "react";
import { getTours } from "@/lib/supabase/tours";
import { createClient } from "@/lib/supabase/server";
import HomePageClient from "./home-client";
import type { Post } from "@/types";

const defaultContent = {
  hero: {
    title: "Let's Make Your Best<br />Trip With Us",
    subtitle:
      "Explore the world with our curated travel packages. Adventure awaits!",
    imageUrl: "https://placehold.co/1920x1080.png",
    imageAlt: "Ancient Egyptian temples",
  },
  whyChooseUs: {
    pretitle: "Why Choose Us",
    title: "Great Opportunity For<br/>Adventure & Travels",
    feature1: {
      title: "Safety First",
      description:
        "We prioritize your safety to ensure you have a worry-free and memorable experience.",
    },
    feature2: {
      title: "Professional Guide",
      description:
        "Our guides are local experts who bring destinations to life with their passion and knowledge.",
    },
    feature3: {
      title: "Exclusive Trip",
      description:
        "We offer unique itineraries and exclusive access to create once-in-a-lifetime journeys.",
    },
  },
  discountBanners: {
    banner1: {
      title: "35% OFF",
      description: "Explore The World tour Hotel Booking.",
    },
    banner2: {
      title: "35% OFF",
      description: "On Flight Ticket Grab This Now.",
    },
  },
  lastMinuteOffers: {
    discount: "50%",
    pretitle: "Deals & Offers",
    title: "Incredible Last-Minute Offers",
  },
  testimonials: [
    {
      name: "Brooklyn Simmons",
      role: "Brooklyn Simmons",
      avatar: "https://placehold.co/100x100.png",
      text: "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.",
    },
    {
      name: "Kristin Watson",
      role: "Web Designer",
      avatar: "https://placehold.co/100x100.png",
      text: "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.",
    },
    {
      name: "Wade Warren",
      role: "President Of Sales",
      avatar: "https://placehold.co/100x100.png",
      text: "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.",
    },
  ],
  videoSection: {
    pretitle: "Watch Our Story",
    title: "We Provide The Best Tour Facilities",
  },
  newsSection: {
    pretitle: "News & Updates",
    title: "Our Latest News & Articles",
  },
};

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch tours from Supabase
  const initialTours = await getTours();

  // Fetch home page content from Supabase
  const { data: homePageData } = await supabase
    .from("home_page_content")
    .select("data")
    .eq("id", 1)
    .single();
    
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

  // Merge fetched content with default content to ensure all fields exist
  const homeContent = homePageData?.data 
    ? { ...defaultContent, ...homePageData.data }
    : defaultContent;

  return (
    <HomePageClient 
      initialTours={initialTours} 
      homeContent={homeContent}
      articles={articles}
    />
  );
}