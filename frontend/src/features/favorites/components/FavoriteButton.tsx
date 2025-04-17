'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPrompt from '@/features/login/components/LoginPrompt';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { IconButton } from '@mui/material';
import { upsertUserFavorite } from '../api/upsertUserFavorite';

type FavoriteButtonProps = {
  vendorId: string;
  initialIsFavorited: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
  sx?: object;
};

export default function FavoriteButton({
  vendorId,
  initialIsFavorited = false,
  onFavoriteChange,
  sx={}
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]); 

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    onFavoriteChange?.(newFavoriteState);

    upsertUserFavorite({
      vendor_id: vendorId,
      is_favorite: newFavoriteState
    });
  };

  const handleLoginSuccess = () => {
    setShowLoginPrompt(false);
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    onFavoriteChange?.(newFavoriteState);

    upsertUserFavorite({
      vendor_id: vendorId,
      is_favorite: newFavoriteState
    });
  };

  return (
    <>
      <IconButton
        sx={{ display: 'inline-flex', fontSize: 24, cursor: 'pointer', visibility: 'visible', ...sx }}
        color='primary'
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleFavoriteClick(event)}
      >
        {isFavorited ? (
          <FavoriteIcon
            color='inherit'
          />
        ) : (
          <FavoriteBorderIcon
            color='inherit'
          />
        )}
      </IconButton>

      {showLoginPrompt && (
        <LoginPrompt
          message="Log in to favorite this vendor."
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setShowLoginPrompt(false)}
        />
      )}
    </>
  );
}