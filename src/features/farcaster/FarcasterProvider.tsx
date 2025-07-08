import { createContext, useContext, useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterContextType {
  isInFarcaster: boolean;
  isReady: boolean;
}

const FarcasterContext = createContext<FarcasterContextType | undefined>(undefined);

export const useFarcaster = () => {
  const context = useContext(FarcasterContext);
  if (context === undefined) {
    throw new Error('useFarcaster must be used within a FarcasterProvider');
  }
  return context;
};

interface FarcasterProviderProps {
  children: React.ReactNode;
}

export const FarcasterProvider: React.FC<FarcasterProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isInFarcaster, setIsInFarcaster] = useState(false);

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        
        if (inMiniApp) {
          setIsInFarcaster(true);
          
          // Call ready() to hide the splash screen and show the app content
          await sdk.actions.ready();
          
          console.log('Farcaster Mini App initialized successfully');
        } else {
          console.log('Not running in Farcaster Mini App environment - continuing as standalone app');
          setIsInFarcaster(false);
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing Farcaster SDK:', error);
        setIsInFarcaster(false);
        setIsReady(true);
      }
    };

    initializeFarcaster();
  }, []);

  if (!isReady) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px'
      }}>
        Loading...
      </div>
    );
  }

  const contextValue: FarcasterContextType = {
    isInFarcaster,
    isReady,
  };

  return (
    <FarcasterContext.Provider value={contextValue}>
      {children}
    </FarcasterContext.Provider>
  );
};

export default FarcasterProvider; 