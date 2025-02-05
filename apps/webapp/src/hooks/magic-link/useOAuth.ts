import config from '@/lib/config';
import { useState, useEffect, useRef } from 'react';
import { constructAuthUrl } from '@panora/shared/src/test';

type UseOAuthProps = {
  clientId?: string;
  providerName: string;           // Name of the OAuth provider
  vertical: string;    // Vertical (Crm, Ticketing, etc)
  returnUrl: string;              // Return URL after OAuth flow
  projectId: string;              // Project ID
  linkedUserId: string;           // Linked User ID
  redirectIngressUri: {
    status: boolean;
    value: string | null;
  },
  onSuccess: () => void;
  additionalParams?: {[key: string]: any}
};

let useOAuth = ({ providerName, vertical, returnUrl, projectId, linkedUserId, additionalParams, redirectIngressUri, onSuccess }: UseOAuthProps) => {
  let [isReady, setIsReady] = useState(false);
  let intervalRef = useRef<number | ReturnType<typeof setInterval> | null>(null);
  let authWindowRef = useRef<Window | null>(null);  

  useEffect(() => {
    // Perform any setup logic here
    setTimeout(() => setIsReady(true), 1000); // Simulating async operation

    return () => {
      // Cleanup on unmount
      clearExistingInterval(false);
      if (authWindowRef.current && !authWindowRef.current.closed) {
        authWindowRef.current.close();
      }
    };
  }, []);

  let clearExistingInterval = (clearAuthWindow: boolean) => {
    if (clearAuthWindow && authWindowRef.current && !authWindowRef.current.closed) {
      authWindowRef.current.close();
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };


  let openModal = async (onWindowClose: () => void) => {
    let apiUrl = config.API_URL!;
    let authUrl = await constructAuthUrl({
      projectId, linkedUserId, providerName, returnUrl, apiUrl , vertical, additionalParams, redirectUriIngress: redirectIngressUri 
    });

    if (!authUrl) {
      throw new Error("Auth Url is Invalid " + authUrl);
    }

    let width = 600, height = 600;
    let left = (window.innerWidth - width) / 2;
    let top = (window.innerHeight - height) / 2;
    let authWindow = window.open(authUrl as string, '_blank', `width=${width},height=${height},top=${top},left=${left}`); 
    authWindowRef.current = authWindow; 

    clearExistingInterval(false);

    let interval = setInterval(() => {
      try {
        let redirectedURL = authWindow!.location.href;
        let urlParams = new URL(redirectedURL).searchParams;
        let success = urlParams.get('success'); // Example parameter
        if (redirectedURL === returnUrl || success) {
          onSuccess(); 
          clearExistingInterval(true);
        }
      } catch (e) {
        console.error(e)
      }
      if (!authWindow || authWindow.closed) {
        if (onWindowClose) {
          onWindowClose();
        }
        authWindowRef.current = null;
        clearExistingInterval(false);
      }

    }, 500);

    intervalRef.current = interval;

    return authWindow;
  };

  return { open: openModal, isReady };
};

export default useOAuth;
