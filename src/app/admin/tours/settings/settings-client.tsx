"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Loader2, Save, MapPin, Tag, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  AgencySettingsData,
  DestinationFallbackImage,
  updateAgencySettings,
  updateTourTaxonomy,
} from "@/lib/supabase/agency-content";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/admin/image-uploader";
import { createClient } from "@/lib/supabase/client";

function ManageListSection({
  title,
  description,
  icon: Icon,
  items,
  setItems,
  placeholder,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder: string;
}) {
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    if (
      newItem.trim() &&
      !items.find((item) => item.toLowerCase() === newItem.trim().toLowerCase())
    ) {
      setItems((prev) => [...prev, newItem.trim()].sort());
      setNewItem("");
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setItems((prev) => prev.filter((item) => item !== itemToRemove));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg min-h-[120px] bg-muted/30 content-start">
          {items.length > 0 ? (
            items.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="text-sm py-1 pl-2.5 pr-1.5 gap-1 hover:bg-secondary/80 transition-colors"
              >
                {item}
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="rounded-full p-0.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {item}</span>
                </button>
              </Badge>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm italic">
              No items added yet.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 border-t bg-muted/10 p-4">
        <Input
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddItem();
          }}
          className="bg-background"
        />
        <Button onClick={handleAddItem} size="icon" className="shrink-0">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface SettingsClientProps {
  initialSettings: AgencySettingsData | null;
}

type DestinationCardDraft = {
  destination: string;
  image: (File | string)[];
  description: string;
};

function normalizeDestinationKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function slugifyDestination(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uploadSingleImage(input: {
  supabase: ReturnType<typeof createClient>;
  value: (File | string)[] | undefined;
  pathPrefix: string;
  fallbackUrl?: string;
}): Promise<string | undefined> {
  const first = input.value?.[0];
  if (!first) return input.fallbackUrl;
  if (typeof first === "string") return first;
  if (!(first instanceof File)) return input.fallbackUrl;

  const ext = first.name.split(".").pop() || "png";
  const path = `page-images/${input.pathPrefix}-${Date.now()}.${ext}`;
  const { error: uploadError } = await input.supabase.storage
    .from("cms")
    .upload(path, first, {
      contentType: first.type || "image/png",
      upsert: true,
    });

  if (uploadError) return input.fallbackUrl;
  const { data: publicUrlData } = input.supabase.storage
    .from("cms")
    .getPublicUrl(path);
  return publicUrlData.publicUrl;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [destinations, setDestinations] = useState<string[]>(
    initialSettings?.tourDestinations ?? [],
  );
  const [categories, setCategories] = useState<string[]>(
    initialSettings?.tourCategories ?? [],
  );
  const [destinationHeroImage, setDestinationHeroImage] = useState<(File | string)[]>(
    initialSettings?.images?.destinationHeroUrl
      ? [initialSettings.images.destinationHeroUrl]
      : [],
  );
  const [destinationHeroTitle, setDestinationHeroTitle] = useState(
    initialSettings?.destinationPage?.heroTitle ?? "",
  );
  const [destinationHeroSubtitle, setDestinationHeroSubtitle] = useState(
    initialSettings?.destinationPage?.heroSubtitle ?? "",
  );
  const [destinationCards, setDestinationCards] = useState<DestinationCardDraft[]>(() => {
    const initialImages =
      initialSettings?.images?.destinationFallbackImages ?? [];
    const initialDescriptions =
      initialSettings?.destinationPage?.cards ?? [];

    const imageByDestination = new Map<string, string>();
    for (const entry of initialImages) {
      if (!entry?.destination || !entry?.imageUrl) continue;
      imageByDestination.set(normalizeDestinationKey(entry.destination), entry.imageUrl);
    }

    const descriptionByDestination = new Map<string, string>();
    for (const entry of initialDescriptions) {
      if (!entry?.destination || typeof entry.destination !== "string") continue;
      if (!entry?.description || typeof entry.description !== "string") continue;
      descriptionByDestination.set(
        normalizeDestinationKey(entry.destination),
        entry.description,
      );
    }

    const result = (initialSettings?.tourDestinations ?? []).map((destination) => {
      const key = normalizeDestinationKey(destination);
      const existingImageUrl = imageByDestination.get(key);
      const existingDescription = descriptionByDestination.get(key);
      return {
        destination,
        image: existingImageUrl ? [existingImageUrl] : [],
        description: existingDescription ?? "",
      };
    });

    return result;
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    setDestinations(initialSettings?.tourDestinations ?? []);
    setCategories(initialSettings?.tourCategories ?? []);
    setDestinationHeroImage(
      initialSettings?.images?.destinationHeroUrl
        ? [initialSettings.images.destinationHeroUrl]
        : [],
    );
    setDestinationHeroTitle(initialSettings?.destinationPage?.heroTitle ?? "");
    setDestinationHeroSubtitle(initialSettings?.destinationPage?.heroSubtitle ?? "");
  }, [initialSettings]);

  useEffect(() => {
    const images = initialSettings?.images?.destinationFallbackImages ?? [];
    const descriptions = initialSettings?.destinationPage?.cards ?? [];

    const imageByDestination = new Map<string, string>();
    for (const entry of images) {
      if (!entry?.destination || !entry?.imageUrl) continue;
      imageByDestination.set(normalizeDestinationKey(entry.destination), entry.imageUrl);
    }

    const descriptionByDestination = new Map<string, string>();
    for (const entry of descriptions) {
      if (!entry?.destination || typeof entry.destination !== "string") continue;
      if (!entry?.description || typeof entry.description !== "string") continue;
      descriptionByDestination.set(
        normalizeDestinationKey(entry.destination),
        entry.description,
      );
    }

    setDestinationCards((prev) => {
      const prevByDestination = new Map<string, DestinationCardDraft>();
      for (const entry of prev) {
        prevByDestination.set(normalizeDestinationKey(entry.destination), entry);
      }

      return destinations.map((destination) => {
        const key = normalizeDestinationKey(destination);
        const existing = prevByDestination.get(key);
        if (existing) {
          return { ...existing, destination };
        }
        const existingImageUrl = imageByDestination.get(key);
        const existingDescription = descriptionByDestination.get(key);
        return {
          destination,
          image: existingImageUrl ? [existingImageUrl] : [],
          description: existingDescription ?? "",
        };
      });
    });
  }, [destinations, initialSettings]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateTourTaxonomy({
        categories,
        destinations,
      });

      const destinationHeroUrl = await uploadSingleImage({
        supabase,
        value: destinationHeroImage,
        pathPrefix: "destination-hero",
        fallbackUrl: initialSettings?.images?.destinationHeroUrl,
      });

      const destinationFallbackImages = (
        await Promise.all(
          destinationCards.map(async (card) => {
            const destination = typeof card.destination === "string" ? card.destination.trim() : "";
            if (!destination) return null;
            const key = normalizeDestinationKey(destination);
            const existingUrl = initialSettings?.images?.destinationFallbackImages?.find(
              (e) => normalizeDestinationKey(e.destination) === key,
            )?.imageUrl;
            const imageUrl = await uploadSingleImage({
              supabase,
              value: card.image,
              pathPrefix: `destination-card-${slugifyDestination(destination) || "destination"}`,
              fallbackUrl: existingUrl,
            });
            if (!imageUrl) return null;
            return { destination, imageUrl };
          }),
        )
      ).filter((value): value is DestinationFallbackImage => value !== null);

      const destinationPageCards: { destination: string; description: string }[] = [];
      for (const card of destinationCards) {
        const destination = typeof card.destination === "string" ? card.destination.trim() : "";
        if (!destination) continue;
        const description = card.description.trim();
        if (!description) continue;
        destinationPageCards.push({ destination, description });
      }

      const mergedSettingsData: AgencySettingsData = {
        ...(initialSettings ?? {}),
        images: {
          ...(initialSettings?.images ?? {}),
          destinationHeroUrl: destinationHeroUrl ?? undefined,
          destinationFallbackImages,
        },
        destinationPage: {
          ...(initialSettings?.destinationPage ?? {}),
          heroTitle: destinationHeroTitle.trim() || undefined,
          heroSubtitle: destinationHeroSubtitle.trim() || undefined,
          cards: destinationPageCards.length > 0 ? destinationPageCards : undefined,
        },
      };

      await updateAgencySettings(mergedSettingsData);

      toast({
        title: "Settings saved",
        description: "Your tour settings have been successfully updated.",
      });
      
      router.refresh();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 border-b pb-6">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href="/admin/tours">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to tours</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tours Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure global options for your tours, including available destinations and categories.
          </p>
        </div>
        <div className="ml-auto">
          <Button onClick={handleSaveChanges} disabled={isSaving} className="min-w-[140px]">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <ManageListSection
          title="Destinations"
          description="Manage the list of available destinations for your tours."
          icon={MapPin}
          items={destinations}
          setItems={setDestinations}
          placeholder="Add a destination (e.g. Siwa Oasis)"
        />
        <ManageListSection
          title="Categories"
          description="Manage the categories (tags) used to filter tours."
          icon={Tag}
          items={categories}
          setItems={setCategories}
          placeholder="Add a category (e.g. Historical)"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Destination Page</CardTitle>
          <CardDescription>
            Customize the destination page hero and destination cards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Hero Title</p>
              <Input
                value={destinationHeroTitle}
                onChange={(e) => setDestinationHeroTitle(e.target.value)}
                placeholder="Explore Egypt’s main regions"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Hero Image</p>
              <ImageUploader value={destinationHeroImage} onChange={setDestinationHeroImage} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Hero Subtitle</p>
            <Textarea
              value={destinationHeroSubtitle}
              onChange={(e) => setDestinationHeroSubtitle(e.target.value)}
              placeholder="Pick a region to see available tours, highlights, and experiences."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Destination Cards</p>
              <p className="text-sm text-muted-foreground">
                Set a custom image and description for each destination. Custom images override tour cover images.
              </p>
            </div>

            <div className="grid gap-4">
              {destinationCards.map((card) => (
                <div
                  key={card.destination}
                  className="rounded-2xl border bg-card p-4"
                >
                  <div className="grid gap-4 md:grid-cols-3 md:items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Destination</p>
                      <Input value={card.destination} readOnly />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Image</p>
                      <ImageUploader
                        value={card.image}
                        onChange={(next) => {
                          setDestinationCards((prev) =>
                            prev.map((p) =>
                              normalizeDestinationKey(p.destination) ===
                              normalizeDestinationKey(card.destination)
                                ? { ...p, image: next }
                                : p,
                            ),
                          );
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Description</p>
                      <Textarea
                        value={card.description}
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          setDestinationCards((prev) =>
                            prev.map((p) =>
                              normalizeDestinationKey(p.destination) ===
                              normalizeDestinationKey(card.destination)
                                ? { ...p, description: nextValue }
                                : p,
                            ),
                          );
                        }}
                        placeholder={`Browse tours in ${card.destination}.`}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
