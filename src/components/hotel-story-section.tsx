import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { HotelStorySection as HotelStorySectionType } from '@/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

interface HotelStorySectionProps {
  data: HotelStorySectionType;
  className?: string;
}

export function HotelStorySection({ data, className }: HotelStorySectionProps) {
  if (!data?.title || !data?.description) return null;

  return (
    <section className={cn('py-16 md:py-24 overflow-hidden', className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col justify-center order-2 lg:order-1"
          >
            <h2 className="text-3xl md:text-5xl font-headline font-bold mb-6 text-foreground">
              {data.title}
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed mb-8">
              {data.description.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
            {data.buttonText && data.buttonLink && (
              <Button size="lg" className="w-fit gap-2" asChild>
                <Link href={data.buttonLink}>
                  {data.buttonText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl order-1 lg:order-2"
          >
            {data.imageUrl ? (
              <Image
                src={data.imageUrl}
                alt={data.imageAlt || data.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No image provided</span>
              </div>
            )}

            {/* Decorative elements */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute top-10 right-10 w-20 h-20 bg-secondary/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
