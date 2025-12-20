import { useState, useCallback } from 'react';
import type { Product } from '../services/productService';
import { loadArrivalProducts, loadAgeProducts, loadOccasionProducts, loadStyleProducts, loadPartyProducts, loadCasualProducts, loadSeasonalProducts, loadSpecialOccasionProducts } from '../utils/storage';

export const useLazyLoadCatalog = () => {
  const [arrivalCatalog, setArrivalCatalog] = useState<Product[] | null>(null);
  const [ageCatalog, setAgeCatalog] = useState<Product[] | null>(null);
  const [occasionCatalog, setOccasionCatalog] = useState<Product[] | null>(null);
  const [styleCatalog, setStyleCatalog] = useState<Product[] | null>(null);
  const [partyCatalog, setPartyCatalog] = useState<Product[] | null>(null);
  const [casualCatalog, setCasualCatalog] = useState<Product[] | null>(null);
  const [seasonalCatalog, setSeasonalCatalog] = useState<Product[] | null>(null);
  const [specialOccasionCatalog, setSpecialOccasionCatalog] = useState<Product[] | null>(null);

  const loadArrivals = useCallback(() => {
    if (!arrivalCatalog) setArrivalCatalog(loadArrivalProducts());
  }, [arrivalCatalog]);

  const loadAge = useCallback(() => {
    if (!ageCatalog) setAgeCatalog(loadAgeProducts());
  }, [ageCatalog]);

  const loadOccasion = useCallback(() => {
    if (!occasionCatalog) setOccasionCatalog(loadOccasionProducts());
  }, [occasionCatalog]);

  const loadStyle = useCallback(() => {
    if (!styleCatalog) setStyleCatalog(loadStyleProducts());
  }, [styleCatalog]);

  const loadParty = useCallback(() => {
    if (!partyCatalog) setPartyCatalog(loadPartyProducts());
  }, [partyCatalog]);

  const loadCasual = useCallback(() => {
    if (!casualCatalog) setCasualCatalog(loadCasualProducts());
  }, [casualCatalog]);

  const loadSeasonal = useCallback(() => {
    if (!seasonalCatalog) setSeasonalCatalog(loadSeasonalProducts());
  }, [seasonalCatalog]);

  const loadSpecialOccasion = useCallback(() => {
    if (!specialOccasionCatalog) setSpecialOccasionCatalog(loadSpecialOccasionProducts());
  }, [specialOccasionCatalog]);

  return {
    arrivalCatalog: arrivalCatalog || [],
    ageCatalog: ageCatalog || [],
    occasionCatalog: occasionCatalog || [],
    styleCatalog: styleCatalog || [],
    partyCatalog: partyCatalog || [],
    casualCatalog: casualCatalog || [],
    seasonalCatalog: seasonalCatalog || [],
    specialOccasionCatalog: specialOccasionCatalog || [],
    loadArrivals,
    loadAge,
    loadOccasion,
    loadStyle,
    loadParty,
    loadCasual,
    loadSeasonal,
    loadSpecialOccasion
  };
};
