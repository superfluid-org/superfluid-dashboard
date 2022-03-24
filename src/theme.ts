import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

export const createSuperfluidMuiTheme = (mode: "light" | "dark" = "light") =>
  createTheme({
    palette: {
      mode: mode,
      primary: {
        main: "#00991F",
      },
      secondary: {
        main: "#4816E2",
      },
      error: {
        main: red.A400,
      },
      info: {
        main: "rgba(0, 0, 0, 0.87)",
      },
      background:
        mode === "light"
          ? {
              default: "#F9F9F9",
            }
          : {},
    },
    components: {
      MuiButtonBase: {
        // The properties to apply
        defaultProps: {
          disableRipple: true, // No more ripple, on the whole application!
        },
      },
    },
    shape: {
      borderRadius: 7,
    },
  });
