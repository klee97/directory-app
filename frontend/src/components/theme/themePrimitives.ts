const typography = {
  fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontFamily: '"Merienda", "Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '3rem',
    fontWeight: 500,
    color: 'primary'
  },
  h2: {
    fontFamily: '"Merienda", "Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '2rem',
    fontWeight: 500,
  },
  h4: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1.2rem',
    fontWeight: 500,
    mb: 1,
  },
  h6: {
    fontFamily: '"Merienda", "Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1rem',
    fontWeight: 400,
    mb: 1,
  },
  body1: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1rem',
    fontWeight: 300,
  }
}

export const colorSchemes = {
  light: {
    palette: {
      primary: {
        main: '#fdc6ea',
      },
      secondary: {
        main: '#ff6bbd',
      },
      success: {
        main: '#30c74d',
      },
      info: {
        main: '#009688',
      },
      background: {
        default: '#FFFFFF',
        paper: '#fffefa',
      },
      divider: '#fdc6ea',
      text: {
        primary: '#000000',
      },
    },
    typography: typography,
  },
  dark: {
    palette: {
      primary: {
        main: '#e6a39a',
      },
      secondary: {
        main: '#ffffff',
      },
      success: {
        main: '#30c74d',
      },
      info: {
        main: '#009688',
      },
      background: {
        default: '#251717',
        paper: '#714040',
      },
      divider: "#db8073",
      text: {
        primary: '#ffffff',
      }
    },
    typography: typography,
  }

}
export const getDesignTokens = () => {

  return {
    colorSchemes: colorSchemes
  };
};
