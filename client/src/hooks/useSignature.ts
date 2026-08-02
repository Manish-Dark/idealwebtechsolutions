import { useState, useEffect } from 'react';

let cachedSignatureUrl: string | undefined = undefined;

export const useSignature = () => {
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>(cachedSignatureUrl);

  useEffect(() => {
    if (cachedSignatureUrl) return;

    let backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (backendUrl.endsWith('/')) {
      backendUrl = backendUrl.slice(0, -1);
    }
    const signatureEndpoint = `${backendUrl}/api/signature?v=${Date.now()}`;

    cachedSignatureUrl = signatureEndpoint;
    setSignatureUrl(signatureEndpoint);
  }, []);

  return signatureUrl;
};
