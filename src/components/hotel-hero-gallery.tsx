'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { Building2 } from 'lucide-react';

interface HotelHeroGalleryProps {
  images: string[];
  alt: string;
}

/**
 * HotelHeroGallery — scroll-parallax hero for the hotel detail page.
 *
 * - 1 large image left, 4 thumbnail grid right (md+).
 * - Main image translates up slowly as user scrolls (Apple-style depth).
 * - Falls back to plain layout when prefers-reduced-motion is set.
 */
export function HotelHeroGallery({ images, alt }: HotelHeroGalleryProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.08]);

  const heroImage = images[0];
  const thumbnails = images.slice(1, 5);

  if (images.length === 0) {
    return (
      <div className="flex h-72 w-full items-center justify-center bg-muted">
        <Building2 className="h-16 w-16 text-muted-foreground/30" />
      </div>
    );
  }

  if (images.length === 1 || prefersReducedMotion) {
    return (
      <div ref={sectionRef} className="relative bg-muted">
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
          {heroImage && (
            <Image src={heroImage} alt={alt} fill className="object-cover" priority />
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="relative overflow-hidden bg-muted">
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-1 md:h-[460px]">
        <div className="relative md:col-span-2 md:row-span-2 aspect-[16/10] md:aspect-auto overflow-hidden bg-muted">
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{ y: heroY, scale: heroScale }}
          >
            <Image
              src={heroImage}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </div>
        {thumbnails.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden md:block overflow-hidden bg-muted"
          >
            <Image
              src={src}
              alt={`${alt} – ${i + 2}`}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="25vw"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
