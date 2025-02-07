
export const colorSchemes = {
  light: {
    palette: {
      primary: {
        main: '#e6a39a',
      },
      secondary: {
        main: '#64c6d5',
      },
      success: {
        main: '#30c74d',
      },
      info: {
        main: '#009688',
      },
      background: {
        default: '#FFFFFF',
        paper: '#F5EAD6',
      },
      divider: "#db8073",
    },
    typography: {
      fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Merienda", "Lato", "Roboto", "Helvetica", "Arial", sans-serif',
      },
    },
  },
  dark: {
    palette: {
      primary: {
        main: '#e6a39a',
      },
      secondary: {
        main: '#64c6d5',
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
    },
    typography: {
      fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Merienda", "Lato", "Roboto", "Helvetica", "Arial", sans-serif',
      },
    },
  }

}
export const getDesignTokens = () => {

  return {
    colorSchemes: colorSchemes
  };
};
