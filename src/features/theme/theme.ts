import { createTheme, ThemeOptions } from "@mui/material/styles";
import merge from "lodash/fp/merge";

const FONT_FACES = `
@font-face {
  font-family: 'Walsheim';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(./fonts/GT-Walsheim-Pro-Regular.EOT) format('eot'), url(./fonts/GT-Walsheim-Pro-Regular.OTF) format('otf'), url(./fonts/GT-Walsheim-Pro-Regular.TTF) format('ttf'), url(./fonts/GT-Walsheim-Pro-Regular.WOFF) format('woff'), url(./fonts/GT-Walsheim-Pro-Regular.WOFF2) format('woff2');
}

@font-face {
  font-family: 'Walsheim';
  font-style: normal;
  font-display: swap;
  font-weight: 500;
  src: url(./fonts/GT-Walsheim-Pro-Medium.EOT) format('eot'), url(./fonts/GT-Walsheim-Pro-Medium.OTF) format('otf'), url(./fonts/GT-Walsheim-Pro-Medium.TTF) format('ttf'), url(./fonts/GT-Walsheim-Pro-Medium.WOFF) format('woff'), url(./fonts/GT-Walsheim-Pro-Medium.WOFF2) format('woff2');
}

@font-face {
  font-family: 'Walsheim';
  font-style: italic;
  font-display: swap;
  font-weight: 400;
  src: url(./fonts/GT-Walsheim-Pro-Regular-Oblique.EOT) format('eot'), url(./fonts/GT-Walsheim-Pro-Regular-Oblique.OTF) format('otf'), url(./fonts/GT-Walsheim-Pro-Regular-Oblique.TTF) format('ttf'), url(./fonts/GT-Walsheim-Pro-Regular-Oblique.WOFF) format('woff'), url(./fonts/GT-Walsheim-Pro-Regular-Oblique.WOFF2) format('woff2');
}

@font-face {
  font-family: 'Walsheim';
  font-style: italic;
  font-display: swap;
  font-weight: 500;
  src: url(./fonts/GT-Walsheim-Pro-Medium-Oblique.EOT) format('eot'), url(./fonts/GT-Walsheim-Pro-Medium-Oblique.OTF) format('otf'), url(./fonts/GT-Walsheim-Pro-Medium-Oblique.TTF) format('ttf'), url(./fonts/GT-Walsheim-Pro-Medium-Oblique.WOFF) format('woff'), url(./fonts/GT-Walsheim-Pro-Medium-Oblique.WOFF2) format('woff2');
}
`;

const general: ThemeOptions = {
  palette: {
    primary: {
      main: "#10BB35",
      dark: "#0B8225",
      light: "#3FC85D",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#4916E2",
    },
    error: {
      main: "#D22525",
    },
    warning: {
      main: "#F3A002",
    },
    info: {
      main: "#8292AD",
    },
    action: {
      active: "#8292AD8A",
      hover: "#8292AD0A",
      selected: "#8292AD14",
      disabled: "#8292AD42",
      disabledBackground: "#8292AD1F",
      focus: "#8292AD1F",
    },
    divider: "#0000001F",
  },
  typography: {
    fontFamily: "Walsheim, Arial",
  },
  components: {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          background: "#00000080",
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          background: "#323232",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h3: {
          fontWeight: 500,
        },
        h4: {
          fontWeight: 500,
        },
        h5: {
          fontWeight: 500,
        },
        h6: {
          fontSize: "16px",
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: "contained" },
          style: {
            boxShadow: "0px 0px 6px rgba(204, 204, 204, 0.25)",
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      ],
      styleOverrides: {
        root: {
          textTransform: "inherit",
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: FONT_FACES,
    },
  },
  shape: {
    borderRadius: 7,
  },
};

const lightMode: ThemeOptions = {
  palette: {
    mode: "light",
    background: {
      default: "#F9F9F9",
    },
    text: {
      primary: "#12141EDE",
      secondary: "#12141E99",
      disabled: "#12141E61",
    },
  },
};

const darkMode: ThemeOptions = {
  palette: {
    mode: "dark",
    background: {
      default: "#151619",
    },
  },
};

export const createSuperfluidMuiTheme = (mode: "light" | "dark" = "light") =>
  createTheme(merge(mode === "light" ? lightMode : darkMode, general));