import { useState, useEffect } from 'react';

let cachedSignatureUrl: string | null = null;

export const useSignature = () => {
  const [signatureUrl, setSignatureUrl] = useState<string | null>(cachedSignatureUrl);

  useEffect(() => {
    if (cachedSignatureUrl) return;

    let backendUrl = import.meta.env.VITE_API_URL || 'https://idealwebtechsolutions.onrender.com';
    if (backendUrl.endsWith('/')) {
      backendUrl = backendUrl.slice(0, -1);
    }
    const signatureEndpoint = `${backendUrl}/api/signature?v=${Date.now()}`;

    cachedSignatureUrl = signatureEndpoint;
    setSignatureUrl(signatureEndpoint);
  }, []);

  return signatureUrl;
};
