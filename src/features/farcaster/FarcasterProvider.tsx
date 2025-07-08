import { createContext, useContext, useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterContextType {
  isInFarcaster: boolean;
  isReady: boolean;
  walletProvider: any | null; // EIP-1193 provider when available
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
  const [walletProvider, setWalletProvider] = useState<any | null>(null);

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        
        if (inMiniApp) {
          setIsInFarcaster(true);
          
          try {
            const provider = await sdk.wallet.getEthereumProvider();
            setWalletProvider(provider);
            console.log('Farcaster wallet provider available:', !!provider);
          } catch (walletError) {
            console.warn('Farcaster wallet provider not available:', walletError);
          }
          
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
    walletProvider,
  };

  return (
    <FarcasterContext.Provider value={contextValue}>
      {children}
    </FarcasterContext.Provider>
  );
};

export default FarcasterProvider; 