'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'EGP' | 'SAR' | 'AED';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amount: number) => number;
  format: (amount: number) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const currencyLocales: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  EGP: 'ar-EG',
  SAR: 'ar-SA',
  AED: 'ar-AE',
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    EGP: 47.5,
    SAR: 3.75,
    AED: 3.67,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load currency from local storage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency && currencies.some((c) => c.code === savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Fetch exchange rates from API
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
        );
        if (!response.ok) throw new Error('Failed to fetch rates');
        const data = await response.json();

        // The API returns rates in lowercase (e.g. "eur": 0.92)
        // We need to map them to our uppercase Currency type
        const apiRates = data.usd;
        const newRates: Record<string, number> = { USD: 1 };

        currencies.forEach((c) => {
          if (c.code === 'USD') return;
          const rate = apiRates[c.code.toLowerCase()];
          if (rate) {
            newRates[c.code] = rate;
          }
        });

        setExchangeRates((prev) => ({ ...prev, ...newRates }));
      } catch (error) {
        console.error('Error fetching currency rates:', error);
        // Fallback is already set in initial state
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Save currency to local storage when changed
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const convert = (amount: number) => {
    const rate = exchangeRates[currency] || 1;
    return amount * rate;
  };

  const format = (amount: number) => {
    const convertedAmount = convert(amount);
    return new Intl.NumberFormat(currencyLocales[currency], {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(convertedAmount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];
