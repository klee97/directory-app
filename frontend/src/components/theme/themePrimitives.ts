import DefaultImage from '@/assets/placeholder_cover_img_heart.jpeg';
import DefaultImageGray from '@/assets/placeholder_cover_img_gray.jpeg';

const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '3rem',
    fontWeight: 500,
    color: 'primary'
  },
  h2: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '2rem',
    fontWeight: 500,
  },
  h4: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1.2rem',
    fontWeight: 500,
    mb: 1,
  },
  h6: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1rem',
    fontWeight: 400,
    mb: 1,
  },
  body1: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1rem',
    fontWeight: 300,
  }
}

export const colorSchemes = {
  light: {
    palette: {
      primary: {
        main: '#d18f90',
      },
      secondary: {
        main: '#d18fb1',
      },
      success: {
        main: '#30c74d',
      },
      info: {
        main: '#009688',
      },
      background: {
        default: '#fbf9f8',
        paper: '#ececec',
      },
      divider: '#bf6566',
    },
    typography: typography,
    placeholderImage: DefaultImage,
  },
  dark: {
    palette: {
      primary: {
        main: '#edecef',
      },
      secondary: {
        main: '#a8a6a9',
      },
      success: {
        main: '#30c74d',
      },
      info: {
        main: '#009688',
      },
      background: {
        default: '#0f0d10',
        paper: '#313033',
      },
      divider: '#db8073',
      text: {
        primary: '#edecef',
        secondary: '#a8a6a9',
      },
    },
    typography: typography,
    placeholderImage: DefaultImageGray,
  }

}
export const getDesignTokens = () => {

  return {
    colorSchemes: colorSchemes
  };
};
