"use client";
import { createTheme } from "@mui/material/styles";
import { colorSchemes, typography, shadows, shape } from './themePrimitives';
import { dataDisplayCustomizations } from "./customizations/dataDisplay";
import { feedbackCustomizations } from "./customizations/feedback";
import { inputsCustomizations } from "./customizations/inputs";
import { surfacesCustomizations } from "./customizations/surfaces";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
    cssVarPrefix: 'template',
  },
  colorSchemes, // Recently added in v6 for building light & dark mode app, see https://mui.com/material-ui/customization/palette/#color-schemes
  shadows,
  shape,
  typography,
  components: {
    ...dataDisplayCustomizations,
    ...feedbackCustomizations,
    ...inputsCustomizations,
    ...surfacesCustomizations
  }
})

export default theme;