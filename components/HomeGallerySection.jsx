'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const GALLERY_IMAGES = [
  {
    src: '/Gallery Test Image 1.jpeg',
    alt: 'Volunteers organizing donated supplies for community distribution',
    title: 'Community in Action',
    description: 'Local volunteers sort and prepare donated essentials so they reach the people who need them most.',
  },
  {
    src: '/Gallery Test Image 2.jpeg',
    alt: 'Donation drive collecting hygiene and care products',
    title: 'Giving That Makes a Difference',
    description: 'Every drive brings our community closer to meeting real needs on the ground.',
  },
  {
    src: '/Gallery Test Image 3.jpeg',
    alt: 'Team collaborating at a GirlsWhoGive donation event',
    title: 'Stronger Together',
    description: 'Donors and organizations work side by side to turn generosity into organized, trackable impact.',
  },
  {
    src: '/Gallery Image 4.jpg',
    alt: 'Chapter members at a Her Voice, Her Vote community event',
    title: 'Her Voice, Her Vote',
    description: 'Chapters come together to advocate, organize, and build community around meaningful causes.',
  },
  {
    src: '/Gallery Image 5.jpg',
    alt: 'Community members volunteering at a GirlsWhoGive donation event',
    title: 'Volunteers Making an Impact',
    description: 'Students and community members work together to collect and organize donations for those in need.',
  },
];

const GALLERY_FRAME_CLASS = 'relative w-full h-[280px] sm:h-[360px] bg-white rounded-2xl overflow-hidden';

function GalleryImage({ src, alt, className = '' }) {
  return (
    <div className={`${GALLERY_FRAME_CLASS} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-3"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
  );
}

export function HeroImageGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${GALLERY_FRAME_CLASS} shadow-xl border border-pink-100`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <Image
            src={GALLERY_IMAGES[activeIndex].src}
            alt={GALLERY_IMAGES[activeIndex].alt}
            fill
            className="object-contain p-3"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={activeIndex === 0}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        {GALLERY_IMAGES.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show gallery image ${index + 1}`}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex ? 'w-6 bg-pink-500' : 'w-2 bg-pink-300/80 hover:bg-pink-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomeGallerySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Impact in Our Community
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real moments from drives, donations, and the people making change happen.
          </p>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: '100px' } : { width: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto mt-6"
          />
        </motion.div>

        <div className="space-y-12 sm:space-y-16">
          {GALLERY_IMAGES.map((item, index) => {
            const imageOnLeft = index % 2 === 0;
            return (
              <motion.div
                key={item.src}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                className={`flex flex-col gap-8 items-center ${
                  imageOnLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                <div className="w-full lg:w-1/2">
                  <GalleryImage
                    src={item.src}
                    alt={item.alt}
                    className="shadow-lg border border-pink-100"
                  />
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="reflective-glass p-8 sm:p-10 h-full flex flex-col justify-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
