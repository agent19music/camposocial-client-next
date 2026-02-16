'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { FallingIcon } from '@/types';

// Skeuomorphic icons from your R2 storage
const iconList = [
  {
    src: 'https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/calendarskeuomorphism.png',
    alt: 'Calendar'
  },
  {
    src: 'https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/chatskeuomorphism.png',
    alt: 'Chat'
  },
  {
    src: 'https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/iphoneskeuomorphism.png',
    alt: 'iPhone'
  },
  {
    src: 'https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/heartskeuomorphism.png',
    alt: 'Heart'
  },
  {
    src: 'https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/globeskeuomorphism.png',
    alt: 'Globe'
  },
];

export function FallingIcons() {
  const [icons, setIcons] = useState<FallingIcon[]>([]);

  useEffect(() => {
    const generateIcons = () => {
      const newIcons: FallingIcon[] = [];
      
      for (let i = 0; i < 12; i++) {
        const randomIcon = iconList[Math.floor(Math.random() * iconList.length)];
        newIcons.push({
          id: i,
          src: randomIcon.src,
          alt: randomIcon.alt,
          left: Math.random() * 100,
          duration: Math.random() * 8 + 12, // 12-20 seconds
          delay: Math.random() * 8, // 0-8 seconds delay
          size: Math.random() * 30 + 40, // 40-70px
          rotation: Math.random() * 360, // Random initial rotation
        });
      }
      
      setIcons(newIcons);
    };

    generateIcons();
    
    // Regenerate icons periodically to keep the animation fresh
    const interval = setInterval(generateIcons, 25000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {icons.map((iconData) => {
        return (
          <div
            key={iconData.id}
            className="absolute animate-fall opacity-30 dark:opacity-20"
            style={{
              left: `${iconData.left}%`,
              animationDuration: `${iconData.duration}s`,
              animationDelay: `${iconData.delay}s`,
              transform: `rotate(${iconData.rotation}deg)`,
            }}
          >
            <Image
              src={iconData.src}
              alt={iconData.alt}
              width={iconData.size}
              height={iconData.size}
              className="drop-shadow-lg"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
