// components/AuthRequiredAction.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPrompt from './LoginPrompt';

type AuthRequiredActionProps = {
  onAction: () => void;
  children: React.ReactNode;
  promptMessage?: string;
};

export default function AuthRequiredAction({ 
  onAction, 
  children, 
  promptMessage 
}: AuthRequiredActionProps) {
  const { isLoggedIn } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  
  const handleClick = () => {
    if (isLoggedIn) {
      onAction();
    } else {
      setShowPrompt(true);
    }
  };
  
  return (
    <>
      <div onClick={handleClick}>
        {children}
      </div>
      
      {showPrompt && (
        <LoginPrompt 
          message={promptMessage} 
          onLoginSuccess={onAction}
          onCancel={() => setShowPrompt(false)}
        />
      )}
    </>
  );
}