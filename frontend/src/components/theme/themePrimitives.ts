
export const colorSchemes = {
  light: {
    palette: {
      primary: {
        main: "#8c8fea", // Lavender
      },
      background: {
        default: "#f8f8fc", // Soft White
        paper: "#e4e6ff", // Pale Lilac (Surface)
      },
      text: {
        primary: "#33334d", // Dark Slate
        secondary: "#77778f", // Soft Gray
      },
      error: {
        main: "#ff857a", // Coral
      },
      divider: "#b5b8f8", // Muted Periwinkle
    },
    typography: {
      fontFamily: "'Inter', 'Nunito', 'Poppins', sans-serif",
    }
  },
  dark: {
    palette: {
      primary: {
        main: "#8c8fea", // Lavender
      },
      background: {
        default: "#1b1b2f", // Deep Indigo
        paper: "#252545", // Midnight Blue (Surface)
      },
      text: {
        primary: "#eaeaff", // Off-White
        secondary: "#a5a5c3", // Cool Gray
      },
      error: {
        main: "#ffb5a7", // Soft Peach
      },
      divider: "#5c5e91", // Muted Purple
    },
    typography: {
      fontFamily: "'Inter', 'Nunito', 'Poppins', sans-serif",
    },
  }

}
export const getDesignTokens = () => {

  return {
    colorSchemes: colorSchemes
  };
};
