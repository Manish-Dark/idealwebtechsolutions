import { useState, useEffect } from 'react';

let cachedLogoUrl: string | null = null;

export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(cachedLogoUrl);

  useEffect(() => {
    if (cachedLogoUrl) return;

    let backendUrl = import.meta.env.VITE_API_URL || 'https://idealwebtechsolutions.onrender.com';
    if (backendUrl.endsWith('/')) {
      backendUrl = backendUrl.slice(0, -1);
    }
    const logoEndpoint = `${backendUrl}/api/logo`;

    cachedLogoUrl = logoEndpoint;
    setLogoUrl(logoEndpoint);
  }, []);

  return logoUrl;
};


