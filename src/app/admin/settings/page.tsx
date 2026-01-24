"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import {
  getAgencySettings,
  updateAgencySettings,
  type AgencyImageSettings,
  AgencySettingsData,
  type DestinationFallbackImage,
  PageSeoSettings,
  SiteSeoSettings,
} from "@/lib/supabase/agency-content";

const formSchema = z
  .object({
    agencyName: z.string().min(1, "Agency name is required."),
    phoneNumber: z.string().min(10, "A valid phone number is required."),
    contactEmail: z.string().email("Invalid email address."),
    address: z.string().min(1, "Address is required."),
    logo: z.array(z.any()).optional(),
    tagline: z.string().optional(),
    navLinks: z
      .array(
        z.object({
          label: z.string().min(1, "Label is required"),
          href: z.string().min(1, "Href is required"),
        }),
      )
      .optional(),
    aboutUs: z
      .string()
      .min(10, "About us description should be at least 10 characters."),
    images: z
      .object({
        aboutHeroUrl: z.array(z.any()).optional(),
        aboutSideImageUrl: z.array(z.any()).optional(),
        contactHeroUrl: z.array(z.any()).optional(),
        contactCardImageUrl: z.array(z.any()).optional(),
        servicesHeroUrl: z.array(z.any()).optional(),
        blogHeroUrl: z.array(z.any()).optional(),
        destinationHeroUrl: z.array(z.any()).optional(),
        upsellHeroUrl: z.array(z.any()).optional(),
        destinationFallbackImages: z
          .array(
            z.object({
              destination: z.string().min(1, "Destination is required"),
              imageUrl: z.array(z.any()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    socialMedia: z.object({
      facebook: z.string().url().or(z.literal("")),
      twitter: z.string().url().or(z.literal("")),
      instagram: z.string().url().or(z.literal("")),
      linkedin: z.string().url().or(z.literal("")),
    }),
    paymentMethods: z
      .object({
        cash: z.boolean(),
        online: z.boolean(),
        defaultMethod: z.enum(["cash", "online"]),
      })
      .default({ cash: true, online: true, defaultMethod: "online" }),
    theme: z.object({
      primaryColor: z.string().optional(),
      fontFamily: z.string().optional(),
    }).optional(),
    seo: z.object({
      site: z.object({
        siteName: z.string().optional(),
        defaultTitle: z.string().optional(),
        titleTemplate: z.string().optional(),
        description: z.string().optional(),
        keywords: z.string().optional(),
        ogImageUrl: z.string().url().or(z.literal("")).optional(),
        twitterImageUrl: z.string().url().or(z.literal("")).optional(),
        faviconUrl: z.string().url().or(z.literal("")).optional(),
      }).optional(),
      home: z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.string().optional() }).optional(),
      about: z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.string().optional() }).optional(),
      contact: z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.string().optional() }).optional(),
      tours: z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.string().optional() }).optional(),
      services: z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.string().optional() }).optional(),
      blog: z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.string().optional() }).optional(),
      destination: z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.string().optional() }).optional(),
      tailorMade: z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.string().optional() }).optional(),
    }).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.paymentMethods.cash && !data.paymentMethods.online) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enable at least one payment method.",
        path: ["paymentMethods", "cash"],
      });
    }

    if (
      data.paymentMethods.defaultMethod === "cash" &&
      !data.paymentMethods.cash
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Default method must be enabled.",
        path: ["paymentMethods", "defaultMethod"],
      });
    }

    if (
      data.paymentMethods.defaultMethod === "online" &&
      !data.paymentMethods.online
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Default method must be enabled.",
        path: ["paymentMethods", "defaultMethod"],
      });
    }
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required to set a new one.",
      path: ["currentPassword"],
    },
  )
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  });

export default function SettingsPage() {
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [loadedSettingsData, setLoadedSettingsData] = useState<AgencySettingsData | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agencyName: "",
      phoneNumber: "",
      contactEmail: "",
      address: "",
      logo: [],
      tagline: "",
      navLinks: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Destination", href: "/destination" },
        { label: "Tour", href: "/tours" },
        { label: "Services", href: "/services" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
      aboutUs: "",
      images: {
        aboutHeroUrl: [],
        aboutSideImageUrl: [],
        contactHeroUrl: [],
        contactCardImageUrl: [],
        servicesHeroUrl: [],
        blogHeroUrl: [],
        destinationHeroUrl: [],
        upsellHeroUrl: [],
        destinationFallbackImages: [],
      },
      socialMedia: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      paymentMethods: {
        cash: true,
        online: true,
        defaultMethod: "online",
      },
      theme: {
        primaryColor: "#0f172a",
        fontFamily: "Inter",
      },
      seo: {},
    },
  });

  const { fields: navLinkFields, append, remove } = useFieldArray({
    control: form.control,
    name: "navLinks",
  });

  const {
    fields: destinationFallbackFields,
    append: appendDestinationFallback,
    remove: removeDestinationFallback,
  } = useFieldArray({
    control: form.control,
    name: "images.destinationFallbackImages" as never,
  });

  useEffect(() => {
    async function loadSettings() {
      const data = await getAgencySettings();

      if (data) {
        const settingsData = (data.data ?? {}) as AgencySettingsData;
        setLoadedSettingsData(settingsData);
        const paymentMethods = settingsData.paymentMethods ?? {};
        const images: AgencyImageSettings = settingsData.images ?? {};
        setExistingLogoUrl(data.logo_url ?? null);
        const destinationFallbackImages: DestinationFallbackImage[] = Array.isArray(
          images.destinationFallbackImages,
        )
          ? images.destinationFallbackImages
          : [];
        form.reset({
          agencyName: settingsData.agencyName ?? "",
          phoneNumber: settingsData.phoneNumber ?? "",
          contactEmail: settingsData.contactEmail ?? "",
          address: settingsData.address ?? "",
          logo: [],
          tagline: settingsData.tagline ?? "",
          navLinks: settingsData.navLinks ?? [
            { label: "Home", href: "/" },
            { label: "About Us", href: "/about" },
            { label: "Destination", href: "/destination" },
            { label: "Tour", href: "/tours" },
            { label: "Services", href: "/services" },
            { label: "Blog", href: "/blog" },
            { label: "Contact", href: "/contact" },
          ],
          aboutUs: settingsData.aboutUs ?? "",
          images: {
            aboutHeroUrl: images.aboutHeroUrl ? [images.aboutHeroUrl] : [],
            aboutSideImageUrl: images.aboutSideImageUrl
              ? [images.aboutSideImageUrl]
              : [],
            contactHeroUrl: images.contactHeroUrl ? [images.contactHeroUrl] : [],
            contactCardImageUrl: images.contactCardImageUrl
              ? [images.contactCardImageUrl]
              : [],
            servicesHeroUrl: images.servicesHeroUrl
              ? [images.servicesHeroUrl]
              : [],
            blogHeroUrl: images.blogHeroUrl ? [images.blogHeroUrl] : [],
            destinationHeroUrl: images.destinationHeroUrl
              ? [images.destinationHeroUrl]
              : [],
            upsellHeroUrl: images.upsellHeroUrl ? [images.upsellHeroUrl] : [],
            destinationFallbackImages: destinationFallbackImages.map((entry) => ({
              destination: entry.destination,
              imageUrl: entry.imageUrl ? [entry.imageUrl] : [],
            })),
          },
          socialMedia: settingsData.socialMedia ?? {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
          },
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          paymentMethods: {
            cash: paymentMethods.cash ?? true,
            online: paymentMethods.online ?? true,
            defaultMethod:
              paymentMethods.defaultMethod ??
              (paymentMethods.online === false ? "cash" : "online"),
          },
          theme: {
            primaryColor: settingsData.theme?.primaryColor ?? "#0f172a",
            fontFamily: settingsData.theme?.fontFamily ?? "Inter",
          },
          seo: settingsData.seo ?? {},
        });
      }
    }
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  type FormValues = z.infer<typeof formSchema>;
  type FormSeo = FormValues["seo"];
  type FormSiteSeo = NonNullable<NonNullable<FormSeo>["site"]>;
  type FormPageSeo = PageSeoSettings;

  const mergeSiteSeo = (
    base: SiteSeoSettings | undefined,
    incoming: FormSiteSeo | undefined,
  ): SiteSeoSettings | undefined => {
    if (!base && !incoming) return undefined;
    return { ...(base ?? {}), ...(incoming ?? {}) };
  };

  const mergePageSeo = (
    base: FormPageSeo | undefined,
    incoming: FormPageSeo | undefined,
  ): PageSeoSettings | undefined => {
    if (!base && !incoming) return undefined;
    return { ...(base ?? {}), ...(incoming ?? {}) };
  };

  const mergeSeo = (
    base: AgencySettingsData["seo"] | undefined,
    incoming: FormSeo | undefined,
  ): AgencySettingsData["seo"] | undefined => {
    if (!base && !incoming) return undefined;

    const b = base ?? {};
    const i = incoming ?? {};

    return {
      site: mergeSiteSeo(b.site, i.site),
      home: mergePageSeo(b.home, i.home),
      about: mergePageSeo(b.about, i.about),
      contact: mergePageSeo(b.contact, i.contact),
      tours: mergePageSeo(b.tours, i.tours),
      services: mergePageSeo(b.services, i.services),
      destination: mergePageSeo(b.destination, i.destination),
      tailorMade: mergePageSeo(b.tailorMade, i.tailorMade),
      blog: mergePageSeo(b.blog, i.blog),
    };
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient();

    // Handle logo upload if provided
    let logoUrl: string | null = existingLogoUrl;
    try {
      const logoFile = values.logo && values.logo[0];
      if (logoFile && logoFile instanceof File) {
        const ext = logoFile.name.split(".").pop() || "png";
        const path = `logos/agency-logo-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("cms")
          .upload(path, logoFile, {
            contentType: logoFile.type || "image/png",
            upsert: true,
          });
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("cms")
            .getPublicUrl(path);
          logoUrl = publicUrlData.publicUrl;
        }
      }
    } catch {
      // ignore upload failure
    }

    const uploadSingleImage = async (
      value: unknown[] | undefined,
      pathPrefix: string,
      fallbackUrl?: string,
    ): Promise<string | undefined> => {
      const first = value?.[0];
      if (!first) return fallbackUrl;
      if (typeof first === "string") return first;
      if (!(first instanceof File)) return fallbackUrl;

      const ext = first.name.split(".").pop() || "png";
      const path = `page-images/${pathPrefix}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("cms")
        .upload(path, first, {
          contentType: first.type || "image/png",
          upsert: true,
        });

      if (uploadError) return fallbackUrl;
      const { data: publicUrlData } = supabase.storage
        .from("cms")
        .getPublicUrl(path);
      return publicUrlData.publicUrl;
    };

    const slugify = (value: string) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const imagesPayload = values.images
      ? {
          aboutHeroUrl: await uploadSingleImage(
            values.images.aboutHeroUrl,
            "about-hero",
            loadedSettingsData?.images?.aboutHeroUrl,
          ),
          aboutSideImageUrl: await uploadSingleImage(
            values.images.aboutSideImageUrl,
            "about-side",
            loadedSettingsData?.images?.aboutSideImageUrl,
          ),
          contactHeroUrl: await uploadSingleImage(
            values.images.contactHeroUrl,
            "contact-hero",
            loadedSettingsData?.images?.contactHeroUrl,
          ),
          contactCardImageUrl: await uploadSingleImage(
            values.images.contactCardImageUrl,
            "contact-card",
            loadedSettingsData?.images?.contactCardImageUrl,
          ),
          servicesHeroUrl: await uploadSingleImage(
            values.images.servicesHeroUrl,
            "services-hero",
            loadedSettingsData?.images?.servicesHeroUrl,
          ),
          blogHeroUrl: await uploadSingleImage(
            values.images.blogHeroUrl,
            "blog-hero",
            loadedSettingsData?.images?.blogHeroUrl,
          ),
          destinationHeroUrl: await uploadSingleImage(
            values.images.destinationHeroUrl,
            "destination-hero",
            loadedSettingsData?.images?.destinationHeroUrl,
          ),
          upsellHeroUrl: await uploadSingleImage(
            values.images.upsellHeroUrl,
            "upsell-hero",
            loadedSettingsData?.images?.upsellHeroUrl,
          ),
          destinationFallbackImages: Array.isArray(values.images.destinationFallbackImages)
            ? (
                await Promise.all(
                  values.images.destinationFallbackImages.map(async (entry) => {
                    const destination =
                      typeof entry?.destination === "string" ? entry.destination.trim() : "";
                    if (!destination) return null;
                    const existingEntry = loadedSettingsData?.images?.destinationFallbackImages?.find(
                      (e) => e.destination === destination,
                    );
                    const url = await uploadSingleImage(
                      entry.imageUrl,
                      `destination-fallback-${slugify(destination) || "destination"}`,
                      existingEntry?.imageUrl,
                    );
                    if (!url) return null;
                    return { destination, imageUrl: url };
                  }),
                )
              ).filter(
                (
                  value,
                ): value is DestinationFallbackImage =>
                  value !== null,
              )
            : undefined,
        }
      : undefined;

    const nextSettingsData: AgencySettingsData = {
      agencyName: values.agencyName,
      phoneNumber: values.phoneNumber,
      contactEmail: values.contactEmail,
      address: values.address,
      tagline: values.tagline ?? "",
      navLinks: values.navLinks ?? [],
      aboutUs: values.aboutUs,
      images: imagesPayload,
      socialMedia: values.socialMedia,
      paymentMethods: values.paymentMethods,
      theme: values.theme,
      seo: mergeSeo(loadedSettingsData?.seo, values.seo),
    };

    try {
      const mergedSettingsData: AgencySettingsData = {
        ...(loadedSettingsData ?? {}),
        ...nextSettingsData,
      };

      await updateAgencySettings(mergedSettingsData, logoUrl);
      alert("Settings saved!");
    } catch (error) {
      alert(`Failed to save settings: ${(error as Error).message}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
              Manage your site settings, branding, and security.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Update your tour agency&apos;s public information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="agencyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tour Agency Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Agency Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@you.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input placeholder="Your tagline" {...field} />
                    </FormControl>
                    <FormDescription>
                      Short phrase under the logo in the header/footer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload your company logo. PNG or JPG recommended.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
              <CardDescription>
                Configure the primary navigation links shown in the header and footer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {navLinkFields && navLinkFields.length > 0 ? (
                navLinkFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-3 gap-4 items-end">
                    <FormField
                      control={form.control}
                      name={`navLinks.${index}.label` as const}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Label</FormLabel>
                          <FormControl>
                            <Input placeholder="Home" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`navLinks.${index}.href` as const}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Href</FormLabel>
                          <FormControl>
                            <Input placeholder="/" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" onClick={() => remove(index)}>
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No links. Add some below.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={() => append({ label: "New Link", href: "/" })}>
                Add Link
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About & Address</CardTitle>
              <CardDescription>
                Information that may appear on your website&apos;s footer or contact
                page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main St, Anytown, USA"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aboutUs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Us</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little about your agency"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Page Images</CardTitle>
              <CardDescription>
                Customize hero and section images used on public pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={"images.aboutHeroUrl" as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Page Hero Image</FormLabel>
                      <FormControl>
                        <ImageUploader value={field.value || []} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={"images.aboutSideImageUrl" as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Page Side Image</FormLabel>
                      <FormControl>
                        <ImageUploader value={field.value || []} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={"images.contactHeroUrl" as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Page Hero Image</FormLabel>
                      <FormControl>
                        <ImageUploader value={field.value || []} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={"images.contactCardImageUrl" as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Page Card Image</FormLabel>
                      <FormControl>
                        <ImageUploader value={field.value || []} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={"images.servicesHeroUrl" as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services Page Hero Image</FormLabel>
                      <FormControl>
                        <ImageUploader value={field.value || []} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={"images.blogHeroUrl" as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blog Page Hero Image</FormLabel>
                      <FormControl>
                        <ImageUploader value={field.value || []} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={"images.destinationHeroUrl" as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Page Hero Image</FormLabel>
                      <FormControl>
                        <ImageUploader value={field.value || []} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={"images.upsellHeroUrl" as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upsell Items Page Hero Image</FormLabel>
                      <FormControl>
                        <ImageUploader value={field.value || []} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Destination Fallback Images</p>
                  <p className="text-sm text-muted-foreground">
                    Used when a destination has no tour cover image.
                  </p>
                </div>

                <div className="space-y-4">
                  {destinationFallbackFields.map((f, index) => (
                    <div key={f.id} className="rounded-2xl border p-4">
                      <div className="grid gap-4 md:grid-cols-[1fr,2fr,auto] md:items-end">
                        <FormField
                          control={form.control}
                          name={`images.destinationFallbackImages.${index}.destination` as never}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destination</FormLabel>
                              <FormControl>
                                <Input placeholder="Cairo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`images.destinationFallbackImages.${index}.imageUrl` as never}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image</FormLabel>
                              <FormControl>
                                <ImageUploader value={field.value || []} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeDestinationFallback(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendDestinationFallback({ destination: "", imageUrl: [] } as never)
                  }
                >
                  Add Destination Image
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Links to your agency&apos;s social media profiles.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="socialMedia.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://facebook.com/your-page"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialMedia.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter / X</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://twitter.com/your-handle"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialMedia.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://instagram.com/your-profile"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialMedia.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/company/your-company"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>
                Customize the look and feel of your website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="theme.primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <div className="flex items-center gap-4">
                      <FormControl>
                        <Input
                          type="color"
                          {...field}
                          className="w-12 h-12 p-1 rounded-md cursor-pointer"
                        />
                      </FormControl>
                      <Input
                        {...field}
                        placeholder="#0f172a"
                        className="max-w-[120px]"
                      />
                    </div>
                    <FormDescription>
                      The main color used for buttons, links, and highlights.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="theme.fontFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Inter">Inter (Default)</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display (Luxury)</SelectItem>
                        <SelectItem value="Roboto">Roboto (Modern)</SelectItem>
                        <SelectItem value="Lato">Lato (Friendly)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The font used for headings and body text.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO & Metadata</CardTitle>
              <CardDescription>
                Control page titles, descriptions, and keywords for search engines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pb-6">
                <FormField
                  control={form.control}
                  name={"seo.site.siteName" as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your brand name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={"seo.site.defaultTitle" as never}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Default browser title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={"seo.site.titleTemplate" as never}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title Template</FormLabel>
                        <FormControl>
                          <Input placeholder="%s | Your Brand" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={"seo.site.description" as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Default meta description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={"seo.site.keywords" as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Keywords (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="travel, tours, holidays" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name={"seo.site.ogImageUrl" as never}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OpenGraph Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={"seo.site.twitterImageUrl" as never}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={"seo.site.faviconUrl" as never}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {[
                  { key: "home", label: "Home" },
                  { key: "about", label: "About" },
                  { key: "contact", label: "Contact" },
                  { key: "tours", label: "Tours" },
                  { key: "services", label: "Services" },
                  { key: "destination", label: "Destination" },
                  { key: "tailorMade", label: "Tailor Made" },
                  { key: "blog", label: "Blog" },
                ].map((page) => (
                  <AccordionItem key={page.key} value={page.key}>
                    <AccordionTrigger>{page.label} Page</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        // @ts-expect-error - dynamic path construction
                        name={`seo.${page.key}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input placeholder={`Title for ${page.label} page`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        // @ts-expect-error - dynamic path construction
                        name={`seo.${page.key}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder={`Description for ${page.label} page`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        // @ts-expect-error - dynamic path construction
                        name={`seo.${page.key}.keywords`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Keywords (comma separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="travel, egypt, tours" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Control which payment options appear at checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="paymentMethods.cash"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Cash</FormLabel>
                      <FormDescription>Pay in cash on arrival.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          const isOnlineEnabled = form.getValues(
                            "paymentMethods.online",
                          );
                          const currentDefault = form.getValues(
                            "paymentMethods.defaultMethod",
                          );
                          if (
                            currentDefault === "cash" &&
                            !checked &&
                            isOnlineEnabled
                          ) {
                            form.setValue(
                              "paymentMethods.defaultMethod",
                              "online",
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethods.online"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Online (Kashier)</FormLabel>
                      <FormDescription>
                        Pay online to confirm immediately.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          const isCashEnabled = form.getValues(
                            "paymentMethods.cash",
                          );
                          const currentDefault = form.getValues(
                            "paymentMethods.defaultMethod",
                          );
                          if (
                            currentDefault === "online" &&
                            !checked &&
                            isCashEnabled
                          ) {
                            form.setValue(
                              "paymentMethods.defaultMethod",
                              "cash",
                            );
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethods.defaultMethod"
                render={({ field }) => {
                  const cashEnabled = form.watch("paymentMethods.cash");
                  const onlineEnabled = form.watch("paymentMethods.online");

                  return (
                    <FormItem>
                      <FormLabel>Default method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select default payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash" disabled={!cashEnabled}>
                            Cash
                          </SelectItem>
                          <SelectItem value="online" disabled={!onlineEnabled}>
                            Online (Kashier)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Change your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
