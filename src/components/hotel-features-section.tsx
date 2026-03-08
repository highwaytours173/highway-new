import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import type { HotelFeaturesSection as HotelFeaturesSectionType } from '@/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface HotelFeaturesSectionProps {
  data: HotelFeaturesSectionType;
  className?: string;
}

export function HotelFeaturesSection({ data, className }: HotelFeaturesSectionProps) {
  if (!data?.features?.length) return null;

  return (
    <section className={cn('py-16 md:py-24 bg-secondary/10', className)}>
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-headline font-bold mb-4"
          >
            {data.title || 'Our Amenities'}
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground text-lg">
            {data.subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {data.features.map((feature, index) => {
            // Dynamically get icon component
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.Star;

            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex flex-col items-center text-center p-6 bg-background rounded-2xl shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <IconComponent className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
