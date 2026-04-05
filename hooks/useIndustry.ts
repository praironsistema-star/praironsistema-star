'use client';

import { useState, useEffect } from 'react';
import { getUser, hasModule } from '../lib/auth';

export function useIndustry() {
  const [industryModules, setIndustryModules] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const user = getUser();
    setIndustryModules(user?.industryModules || []);
    setIsLoaded(true);
  }, []);

  const isMixto = industryModules.includes('MIXTO');

  return {
    industryModules,
    isLoaded,
    isMixto,
    hasModule: (module: string) => hasModule(module),
    isCafe:       isMixto || industryModules.includes('CAFE'),
    isPalma:      isMixto || industryModules.includes('PALMA'),
    isAvicultura: isMixto || industryModules.includes('AVICULTURA'),
    isGanaderia:  isMixto || industryModules.includes('GANADERIA'),
    isCana:       isMixto || industryModules.includes('CANA'),
    isAcuicultura:isMixto || industryModules.includes('ACUICULTURA'),
    isApicultura: isMixto || industryModules.includes('APICULTURA'),
    isCacao:      isMixto || industryModules.includes('CACAO'),
    isArroz:      isMixto || industryModules.includes('ARROZ'),
  };
}
