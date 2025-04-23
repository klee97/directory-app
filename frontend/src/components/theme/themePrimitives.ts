const typography = {
  fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '3rem',
    fontWeight: 500,
    color: 'primary'
  },
  h2: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '2rem',
    fontWeight: 500,
  },
  h3: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1.5rem',
    fontWeight: 500,
  },
  h4: {
    
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1.2rem',
    fontWeight: 500,
    mb: 1,
  },
  h6: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1.1rem',
    fontWeight: 400,
    mb: 1,
  },
  body1: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1.1rem',
    fontWeight: 400,
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
  }

}
export const getDesignTokens = () => {

  return {
    colorSchemes: colorSchemes
  };
};
