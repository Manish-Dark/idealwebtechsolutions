import { useState, useEffect } from 'react';

let cachedLogoUrl: string | null = null;

export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(cachedLogoUrl);

  useEffect(() => {
    if (cachedLogoUrl) return;
    
    // Using the local API endpoint (which handles the Vercel Blob token securely)
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const logoEndpoint = `${backendUrl}/api/logo`;
    
    cachedLogoUrl = logoEndpoint;
    setLogoUrl(logoEndpoint);
  }, []);

  return logoUrl;
};
