import { alpha, createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import { TypographyOptions } from "@mui/material/styles/createTypography";
import { deepmerge } from "@mui/utils";
import React from "react";
import { FONT_FACES } from "./fonts";

// TODO: Move to separate declaration file to make theme file cleaner?

// TYPOGRAHY

interface TypographyCustomVariants {
  h7: React.CSSProperties;
  h1mono: React.CSSProperties;
  h2mono: React.CSSProperties;
  h3mono: React.CSSProperties;
  h4mono: React.CSSProperties;
  h5mono: React.CSSProperties;
  h6mono: React.CSSProperties;
  h7mono: React.CSSProperties;
  body1mono: React.CSSProperties;
  body2mono: React.CSSProperties;
  largeInput: React.CSSProperties;
  menuItem: React.CSSProperties;
  tooltip: React.CSSProperties;
}

declare module "@mui/material/styles" {
  interface TypographyVariants extends TypographyCustomVariants {}
  interface TypographyVariantsOptions extends TypographyCustomVariants {}
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    h7: true;
    h1mono: true;
    h2mono: true;
    h3mono: true;
    h4mono: true;
    h5mono: true;
    h6mono: true;
    h7mono: true;
    body1mono: true;
    body2mono: true;
    largeInput: true;
    menuItem: true;
    tooltip: true;
  }
}

// COLOR PALETTE

interface PaletteOtherColors {
  outline: string;
  backdrop: string;
  snackbar: string;
  intercom: string;
}

declare module "@mui/material/styles/createPalette" {
  interface Palette {
    other: PaletteOtherColors;
  }

  interface PaletteOptions {
    other?: PaletteOtherColors;
  }
}

// BUTTONS

declare module "@mui/material/Button" {
  interface ButtonPropsSizeOverrides {
    xxs: true;
    xs: true;
    xl: true;
  }

  interface ButtonPropsVariantOverrides {
    textContained: true;
    input: true;
    token: true;
  }
}

export const ELEVATION1_BG = `linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.03) 100%)`;

export const FONT_FAMILY = "'Walsheim', Arial";

export const buildTheme = (mode: "light" | "dark") => {
  const themeCreate = createTheme({
    palette: {
      mode,
    },
  });

  const themeWithDesignTokens = createTheme(getDesignTokens(themeCreate));

  return deepmerge(
    themeWithDesignTokens,
    getThemedComponents(themeWithDesignTokens)
  );
};

const getModeStyleCB =
  (mode: "light" | "dark") =>
  <T>(lightStyle: T, darkStyle: T): T =>
    mode === "dark" ? darkStyle : lightStyle;

const getDesignTokens = (theme: Theme): ThemeOptions => {
  const getModeStyle = getModeStyleCB(theme.palette.mode);
  const {
    typography: { pxToRem },
  } = theme;

  return {
    palette: {
      mode: theme.palette.mode,
      text: {
        primary: getModeStyle("#12141EDE", "#FFFFFFFF"),
        secondary: getModeStyle("#12141E99", "#FFFFFFC7"),
        disabled: getModeStyle("#12141E61", "#FFFFFF99"),
      },
      primary: {
        main: getModeStyle("#10BB35FF", "#10BB35FF"),
        dark: getModeStyle("#0B8225FF", "#008900FF"),
        light: getModeStyle("#3FC85DFF", "#5FEF66FF"),
        contrastText: getModeStyle("#FFFFFFFF", "#FFFFFFDE"),
      },
      secondary: {
        main: getModeStyle("#12141e61", "#ffffff99"), //getModeStyle("#E0E0E0FF", "#E0E0E0FF"),
        dark: getModeStyle("#AEAEAEFF", "#AEAEAEFF"),
        light: getModeStyle("#FFFFFFFF", "#FFFFFFFF"),
        contrastText: getModeStyle("#FFFFFFFF", "#FFFFFFDE"),
      },
      action: {
        active: getModeStyle("#8292AD8A", "#FFFFFF8F"),
        hover: getModeStyle("#8292AD0A", "#FFFFFF14"),
        selected: getModeStyle("#8292AD14", "#FFFFFF29"),
        disabled: getModeStyle("#8292AD42", "#FFFFFF4D"),
        disabledBackground: getModeStyle("#8292AD1F", "#FFFFFF1F"),
        focus: getModeStyle("#8292AD1F", "#FFFFFF1F"),
      },
      error: {
        main: getModeStyle("#D22525FF", "#F2685BFF"),
        dark: getModeStyle("#B80015FF", "#B80015FF"),
        light: getModeStyle("#FF5965FF", "#FF5965FF"),
        contrastText: getModeStyle("#FFFFFFFF", "#FFFFFFFF"),
      },
      warning: {
        main: getModeStyle("#F3A002FF", "#F3A002FF"),
        dark: getModeStyle("#BB7100FF", "#BB7100FF"),
        light: getModeStyle("#FFD149FF", "#FFD149FF"),
        contrastText: getModeStyle("#FFFFFFFF", "#000000DE"),
      },
      info: {
        main: getModeStyle("#8292ADFF", "#8292ADFF"),
        dark: getModeStyle("#DADADAFF", "#55647EFF"),
        light: getModeStyle("#B2C2DFFF", "#B2C2DFFF"),
        contrastText: getModeStyle("#FFFFFFFF", "#000000DE"),
      },
      success: {
        main: getModeStyle("#10BB35FF", "#10BB35FF"),
        dark: getModeStyle("#008900FF", "#008900FF"),
        light: getModeStyle("#5FEF66FF", "#5FEF66FF"),
        contrastText: getModeStyle("#FFFFFFFF", "#000000DE"),
      },
      background: {
        paper: getModeStyle("#FFFFFFFF", "#151619"),
        default: getModeStyle("#FFFFFFFF", "#151619"),
      },
      other: {
        outline: getModeStyle("#E0E0E0", "#2D2D2D"),
        backdrop: "rgba(0, 0, 0, 0.5)",
        snackbar: "#323232",
        intercom: "#1c1d20",
      },
      divider: getModeStyle("#0000001F", "#FFFFFF1F"),
    },
    typography: {
      fontFamily: FONT_FAMILY,
      h1: {
        fontSize: pxToRem(64),
        letterSpacing: pxToRem(-1.5),
        fontWeight: 500,
      },
      h1mono: {
        fontSize: pxToRem(64),
        letterSpacing: pxToRem(-1.5),
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
      },
      h2: {
        fontSize: pxToRem(48),
        fontWeight: 400,
        letterSpacing: "-0.5px",
        [theme.breakpoints.down("md")]: {
          fontSize: pxToRem(36),
        },
      },
      h2mono: {
        fontSize: pxToRem(48),
        fontWeight: 400,
        letterSpacing: "-0.5px",
        fontVariantNumeric: "tabular-nums",
        [theme.breakpoints.down("md")]: {
          fontSize: pxToRem(36),
        },
      },
      h3: {
        fontSize: pxToRem(36),
        fontWeight: 500,
        lineHeight: "116.7%",
        [theme.breakpoints.down("md")]: {
          fontSize: pxToRem(24),
        },
      },
      h3mono: {
        fontSize: pxToRem(36),
        fontWeight: 500,
        lineHeight: "116.7%",
        fontVariantNumeric: "tabular-nums",
        [theme.breakpoints.down("md")]: {
          fontSize: pxToRem(24),
        },
      },
      h4: {
        fontSize: pxToRem(24),
        fontWeight: 500,
        letterSpacing: "0.25px",
      },
      h4mono: {
        fontSize: pxToRem(24),
        fontWeight: 500,
        letterSpacing: "0.25px",
        fontVariantNumeric: "tabular-nums",
      },
      h5: {
        fontSize: pxToRem(18),
        fontWeight: 500,
      },
      h5mono: {
        fontSize: pxToRem(16),
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
      },
      h6: {
        fontSize: pxToRem(16),
        fontWeight: 500,
        lineHeight: "150%",
        letterSpacing: "0.15px",
      },
      h6mono: {
        fontSize: pxToRem(16),
        fontWeight: 500,
        lineHeight: "150%",
        fontVariantNumeric: "tabular-nums",
      },
      h7: {
        fontSize: pxToRem(14),
        fontWeight: 500,
        lineHeight: "150%",
        letterSpacing: "0.15px",
      },
      h7mono: {
        fontSize: pxToRem(14),
        fontWeight: 500,
        lineHeight: "150%",
        fontVariantNumeric: "tabular-nums",
      },
      body1: {
        fontWeight: 400,
        letterSpacing: 0.15,
      },
      body1mono: {
        fontWeight: 400,
        whiteSpace: "pre",
        fontVariantNumeric: "tabular-nums",
      },
      body2: {
        fontSize: pxToRem(14),
        fontWeight: 400,
        letterSpacing: 0.17,
      },
      body2mono: {
        fontSize: pxToRem(14),
        fontWeight: 400,
        whiteSpace: "pre",
        fontVariantNumeric: "tabular-nums",
      },
      subtitle1: {
        letterSpacing: pxToRem(0.15),
      },
      subtitle2: {
        letterSpacing: pxToRem(0.1),
      },
      caption: {
        fontSize: pxToRem(12),
        lineHeight: pxToRem(22),
        letterSpacing: pxToRem(0.4),
      },
      overline: {
        letterSpacing: pxToRem(1),
      },
      largeInput: {
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: pxToRem(30),
        lineHeight: "150%",
        letterSpacing: pxToRem(0.15),
      },
      menuItem: {
        fontSize: pxToRem(16),
        fontWeight: 500,
        lineHeight: "150%",
        letterSpacing: pxToRem(0.15),
      },
      tooltip: {
        fontSize: pxToRem(12),
        fontWeight: 400,
      },
    },
    shadows: [
      "none", // elevation 0
      getModeStyle("0px 0px 6px 3px rgba(204, 204, 204, 0.25)", "none"), // elevation 1
      getModeStyle(
        "0px 0px 30px -2px rgba(204, 204, 204, 0.4), 0px 0px 6px rgba(204, 204, 204, 0.25)",
        "none"
      ), // elevation 2
      getModeStyle(
        "0px 0px 3px -2px rgba(0, 0, 0, 0.2), 0px 0px 25px rgba(0, 0, 0, 0.14), 0px 0px 8px rgba(0, 0, 0, 0.12)",
        "0px 0px 3px -2px rgba(0, 0, 0, 0.2), 0px 0px 25px rgba(0, 0, 0, 0.14), 0px 0px 8px rgba(0, 0, 0, 0.12)"
      ), // elevation 3
      getModeStyle(
        "0px 0px 8px rgba(0, 0, 0, 0.15), 0px 0px 3px -2px rgba(0, 0, 0, 0.23), 0px 0px 25px rgba(0, 0, 0, 0.17)",
        "0px 0px 8px rgba(0, 0, 0, 0.15), 0px 0px 3px -2px rgba(0, 0, 0, 0.23), 0px 0px 25px rgba(0, 0, 0, 0.17)"
      ), // elevation 4
      getModeStyle(
        "0px 0px 8px rgba(0, 0, 0, 0.18), 0px 0px 3px -2px rgba(0, 0, 0, 0.26), 0px 0px 25px rgba(0, 0, 0, 0.2)",
        "0px 0px 8px rgba(0, 0, 0, 0.18), 0px 0px 3px -2px rgba(0, 0, 0, 0.26), 0px 0px 25px rgba(0, 0, 0, 0.2)"
      ), // elevation 5
      getModeStyle(
        "0px 0px 8px rgba(0, 0, 0, 0.21), 0px 0px 3px -2px rgba(0, 0, 0, 0.29), 0px 0px 25px rgba(0, 0, 0, 0.23)",
        "0px 0px 8px rgba(0, 0, 0, 0.21), 0px 0px 3px -2px rgba(0, 0, 0, 0.29), 0px 0px 25px rgba(0, 0, 0, 0.23)"
      ), // elevation 6
      getModeStyle(
        "0px 0px 8px rgba(0, 0, 0, 0.24), 0px 0px 3px -2px rgba(0, 0, 0, 0.32), 0px 0px 25px rgba(0, 0, 0, 0.26)",
        "0px 0px 8px rgba(0, 0, 0, 0.24), 0px 0px 3px -2px rgba(0, 0, 0, 0.32), 0px 0px 25px rgba(0, 0, 0, 0.26)"
      ), // elevation 7
      getModeStyle(
        "0px 0px 8px rgba(0, 0, 0, 0.27), 0px 0px 3px -2px rgba(0, 0, 0, 0.35), 0px 0px 25px rgba(0, 0, 0, 0.29)",
        "0px 0px 8px rgba(0, 0, 0, 0.27), 0px 0px 3px -2px rgba(0, 0, 0, 0.35), 0px 0px 25px rgba(0, 0, 0, 0.29)"
      ), // elevation 8
      getModeStyle(
        "0px 0px 8px rgba(0, 0, 0, 0.3), 0px 0px 3px -2px rgba(0, 0, 0, 0.38), 0px 0px 25px rgba(0, 0, 0, 0.32)",
        "0px 0px 8px rgba(0, 0, 0, 0.3), 0px 0px 3px -2px rgba(0, 0, 0, 0.38), 0px 0px 25px rgba(0, 0, 0, 0.32)"
      ), // elevation 9
      getModeStyle(
        "0px 0px 8px rgba(0, 0, 0, 0.33), 0px 0px 3px -2px rgba(0, 0, 0, 0.41), 0px 0px 25px rgba(0, 0, 0, 0.35)",
        "0px 0px 8px rgba(0, 0, 0, 0.33), 0px 0px 3px -2px rgba(0, 0, 0, 0.41), 0px 0px 25px rgba(0, 0, 0, 0.35)"
      ), // elevation 10
      getModeStyle(
        "0px 0px 8px rgba(0, 0, 0, 0.36), 0px 0px 3px -2px rgba(0, 0, 0, 0.44), 0px 0px 25px rgba(0, 0, 0, 0.38)",
        "0px 0px 8px rgba(0, 0, 0, 0.36), 0px 0px 3px -2px rgba(0, 0, 0, 0.44), 0px 0px 25px rgba(0, 0, 0, 0.38)"
      ), // elevation 11
      getModeStyle(
        "0px 0px 8px rgba(0, 0, 0, 0.39), 0px 0px 3px -2px rgba(0, 0, 0, 0.47), 0px 0px 25px rgba(0, 0, 0, 0.41)",
        "0px 0px 8px rgba(0, 0, 0, 0.39), 0px 0px 3px -2px rgba(0, 0, 0, 0.47), 0px 0px 25px rgba(0, 0, 0, 0.41)"
      ), // elevation 12
      getModeStyle(
        "0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 13px 19px 2px rgba(0, 0, 0, 0.14), 0px 5px 24px 4px rgba(0, 0, 0, 0.12)",
        "0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 13px 19px 2px rgba(0, 0, 0, 0.14), 0px 5px 24px 4px rgba(0, 0, 0, 0.12)"
      ), // elevation 13
      getModeStyle(
        "0px 7px 9px -4px rgba(0, 0, 0, 0.2), 0px 14px 21px 2px rgba(0, 0, 0, 0.14), 0px 5px 26px 4px rgba(0, 0, 0, 0.12)",
        "0px 7px 9px -4px rgba(0, 0, 0, 0.2), 0px 14px 21px 2px rgba(0, 0, 0, 0.14), 0px 5px 26px 4px rgba(0, 0, 0, 0.12)"
      ), // elevation 14
      getModeStyle(
        "0px 8px 9px -5px rgba(0, 0, 0, 0.2), 0px 15px 22px 2px rgba(0, 0, 0, 0.14), 0px 6px 28px 5px rgba(0, 0, 0, 0.12)",
        "0px 8px 9px -5px rgba(0, 0, 0, 0.2), 0px 15px 22px 2px rgba(0, 0, 0, 0.14), 0px 6px 28px 5px rgba(0, 0, 0, 0.12)"
      ), // elevation 15
      getModeStyle(
        "0px 8px 10px -5px rgba(0, 0, 0, 0.2), 0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12)",
        "0px 8px 10px -5px rgba(0, 0, 0, 0.2), 0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12)"
      ), // elevation 16
      getModeStyle(
        "0px 8px 11px -5px rgba(0, 0, 0, 0.2), 0px 17px 26px 2px rgba(0, 0, 0, 0.14), 0px 6px 32px 5px rgba(0, 0, 0, 0.12)",
        "0px 8px 11px -5px rgba(0, 0, 0, 0.2), 0px 17px 26px 2px rgba(0, 0, 0, 0.14), 0px 6px 32px 5px rgba(0, 0, 0, 0.12)"
      ), // elevation 17
      getModeStyle(
        "0px 9px 11px -5px rgba(0, 0, 0, 0.2), 0px 18px 28px 2px rgba(0, 0, 0, 0.14), 0px 7px 34px 6px rgba(0, 0, 0, 0.12);",
        "0px 9px 11px -5px rgba(0, 0, 0, 0.2), 0px 18px 28px 2px rgba(0, 0, 0, 0.14), 0px 7px 34px 6px rgba(0, 0, 0, 0.12);"
      ), // elevation 18
      getModeStyle(
        "0px 9px 12px -6px rgba(0, 0, 0, 0.2), 0px 19px 29px 2px rgba(0, 0, 0, 0.14), 0px 7px 36px 6px rgba(0, 0, 0, 0.12)",
        "0px 9px 12px -6px rgba(0, 0, 0, 0.2), 0px 19px 29px 2px rgba(0, 0, 0, 0.14), 0px 7px 36px 6px rgba(0, 0, 0, 0.12)"
      ), // elevation 19
      getModeStyle(
        "0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 20px 31px 3px rgba(0, 0, 0, 0.14), 0px 8px 38px 7px rgba(0, 0, 0, 0.12)",
        "0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 20px 31px 3px rgba(0, 0, 0, 0.14), 0px 8px 38px 7px rgba(0, 0, 0, 0.12)"
      ), // elevation 20
      getModeStyle(
        "0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 21px 33px 3px rgba(0, 0, 0, 0.14), 0px 8px 40px 7px rgba(0, 0, 0, 0.12)",
        "0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 21px 33px 3px rgba(0, 0, 0, 0.14), 0px 8px 40px 7px rgba(0, 0, 0, 0.12)"
      ), // elevation 21
      getModeStyle(
        "0px 10px 14px -6px rgba(0, 0, 0, 0.2), 0px 22px 35px 3px rgba(0, 0, 0, 0.14), 0px 8px 42px 7px rgba(0, 0, 0, 0.12)",
        "0px 10px 14px -6px rgba(0, 0, 0, 0.2), 0px 22px 35px 3px rgba(0, 0, 0, 0.14), 0px 8px 42px 7px rgba(0, 0, 0, 0.12)"
      ), // elevation 22
      getModeStyle(
        "0px 11px 14px -7px rgba(0, 0, 0, 0.2), 0px 23px 36px 3px rgba(0, 0, 0, 0.14), 0px 9px 44px 8px rgba(0, 0, 0, 0.12)",
        "0px 11px 14px -7px rgba(0, 0, 0, 0.2), 0px 23px 36px 3px rgba(0, 0, 0, 0.14), 0px 9px 44px 8px rgba(0, 0, 0, 0.12)"
      ), // elevation 23
      getModeStyle(
        "0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)",
        "0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)"
      ), // elevation 24
    ],
    transitions: {
      easing: {
        easeInOut: "cubic-bezier(.55, 0, 0.1, 1)",
        easeOut: "cubic-bezier(0, 0, 0.2, 1)",
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  };
};

export function getThemedComponents(theme: Theme): ThemeOptions {
  const getModeStyle = getModeStyleCB(theme.palette.mode);

  return {
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            border: getModeStyle("none", "1px solid"),
            borderColor: theme.palette.other.outline,
          },
          rounded: {
            borderRadius: "20px",
          },
          elevation1: {
            backgroundImage: getModeStyle("none", ELEVATION1_BG),
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: getModeStyle(
              theme.palette.background.paper,
              "#181a1c" // TODO: Move to palette variable
            ),
            backgroundImage: "none",
            [theme.breakpoints.down("sm")]: {
              borderRadius: 0,
            },
          },
        },
      },
      MuiDialogTitle: {
        defaultProps: {
          component: "div",
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          invisible: {
            background: "transparent",
          },
          root: {
            background: "#00000080",
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            background: theme.palette.background.paper,
            backgroundImage: getModeStyle("none", ELEVATION1_BG),
          },
          input: {
            "&[type=number]::-webkit-outer-spin-button, &[type=number]::-webkit-inner-spin-button":
              {
                WebkitAppearance: "none",
                m: 0,
              },
            "&[type=number]": {
              MozAppearance: "textfield",
            },
          },
          adornedStart: {
            ".MuiSvgIcon-root": {
              marginRight: theme.spacing(1),
            },
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          MenuProps: {
            PaperProps: {
              square: true,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            // TODO: Figure out why styleOverrides.disabled is not working and replace .Mui-disabled hardcoded class.
            "&.Mui-disabled": {
              background: theme.palette.action.disabledBackground,
              borderRadius: "10px",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.other.outline,
              },
            },
          },
          notchedOutline: {
            borderColor: theme.palette.other.outline,
            transition: theme.transitions.create("all", {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.short,
            }),
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          fontSizeLarge: {
            fontSize: 48,
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          color: "default",
        },
        styleOverrides: {
          colorDefault: {
            backgroundColor: theme.palette.background.paper,
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
      MuiButtonGroup: {
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            padding: theme.spacing(0.75),
            color: theme.palette.text.secondary,
          },
          colorInherit: {
            color: theme.palette.text.primary,
          },
          colorPrimary: {
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            "&:hover": {
              backgroundColor: alpha(
                theme.palette.primary.main,
                getModeStyle(0.12, 0.16)
              ),
            },
          },
          sizeSmall: {
            padding: theme.spacing(0.5),
            ".MuiSvgIcon-root": {
              fontSize: "18px",
            },
          },
        },
        variants: [
          {
            props: { color: "error" },
            style: {
              color: theme.palette.error.main,
              backgroundColor: alpha(theme.palette.error.main, 0.08),
              "&:hover": {
                backgroundColor: alpha(
                  theme.palette.error.main,
                  getModeStyle(0.12, 0.16)
                ),
              },
            },
          },
        ],
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            padding: theme.spacing(0.5),
            backgroundColor: alpha(theme.palette.action.disabled, 0.12),
          },
          grouped: {
            border: "none",
            ":not(:first-of-type), :not(:last-of-type)": {
              borderRadius: "10px",
            },
            ":not(:first-of-type)": {
              marginLeft: "4px",
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "inherit",
            ...theme.typography.body1,
            "&.Mui-selected, &.Mui-selected:hover": {
              ...theme.typography.h6,
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.primary.contrastText
                  : theme.palette.primary.main,
              background: theme.palette.background.default,
            },
          },
          sizeMedium: {
            letterSpacing: "0.17px",
          },
          sizeLarge: {
            ...theme.typography.h5,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: "inherit",
            flexShrink: 0,
            minWidth: 0,
          },
          sizeMedium: {
            letterSpacing: "0.17px",
          },
          outlinedSecondary: {
            color: theme.palette.text.primary,
            borderColor: theme.palette.other.outline,
            background: theme.palette.background.paper,
            backgroundImage: getModeStyle("none", ELEVATION1_BG),
            "&:hover": {
              boxShadow: theme.shadows[2],
              ...getModeStyle(
                {
                  background: theme.palette.background.paper,
                  backgroundImage: "none",
                  borderColor: theme.palette.other.outline,
                },
                {
                  backgroundImage: ELEVATION1_BG,
                }
              ),
            },
          },
          sizeSmall: {
            ...theme.typography.caption,
          },
          sizeLarge: {
            fontSize: 16,
          },
        },
        variants: [
          {
            props: { size: "xxs" },
            style: {
              ...theme.typography.caption,
              padding: "0 6px",
              minWidth: "0",
              borderRadius: "6px",
              lineHeight: "20px",
            },
          },
          {
            props: { size: "xs" },
            style: {
              padding: "4px 8px",
              minWidth: "0",
            },
          },
          {
            props: { size: "xl" },
            style: {
              padding: "14px 21px", // These paddings are used to match "large" button.
              width: "100%",
              ...theme.typography.h6,
            },
          },
          {
            props: { variant: "input" },
            style: {
              border: "1px solid",
              color: theme.palette.text.primary,
              borderColor: theme.palette.other.outline,
              background: theme.palette.background.paper,
              backgroundImage: getModeStyle("none", ELEVATION1_BG),
              justifyContent: "flex-start",
              textAlign: "left",
              minHeight: 54,
              ".MuiButton-endIcon": {
                marginLeft: "auto",
              },
              "&:hover": {
                borderColor: theme.palette.text.primary,
                background: theme.palette.background.paper,
                backgroundImage: getModeStyle("none", ELEVATION1_BG),
              },
            },
          },
          {
            props: { variant: "token" },
            style: {
              color: theme.palette.text.primary,
              borderColor: theme.palette.other.outline,
              background: getModeStyle(
                theme.palette.background.paper,
                "#37393b"
              ),
              "&:hover": {
                boxShadow: theme.shadows[2],
                background: getModeStyle(
                  theme.palette.background.paper,
                  "#1b1d20"
                ),
              },
            },
          },
          {
            props: {
              variant: "textContained",
              color: "primary",
            },
            style: {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              "&:hover": {
                backgroundColor: alpha(
                  theme.palette.primary.main,
                  getModeStyle(0.12, 0.16)
                ),
              },
            },
          },
          {
            props: {
              variant: "textContained",
              color: "error",
            },
            style: {
              color: theme.palette.error.main,
              backgroundColor: alpha(theme.palette.error.main, 0.08),
              "&:hover": {
                backgroundColor: alpha(
                  theme.palette.error.main,
                  getModeStyle(0.12, 0.16)
                ),
              },
            },
          },
          {
            props: {
              variant: "textContained",
              color: "secondary",
            },
            style: {
              color: theme.palette.text.disabled,
            },
          },
        ],
      },
      MuiLink: {
        defaultProps: {
          underline: "none",
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "inherit",
            ...theme.typography.h6,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: "10px",
          },
          sizeSmall: {
            borderRadius: "6px",
            ".MuiAvatar-root": {
              marginLeft: "3px",
            },
          },
          sizeMedium: {
            borderColor: getModeStyle("#E0E0E0", "#595A5F"),
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "0.46px",
            paddingTop: "8px",
            paddingBottom: "8px",
            height: "auto",
          },
          avatarMedium: {
            marginLeft: "12px",
          },
          iconMedium: {
            marginLeft: "12px",
          },
          deleteIconMedium: {
            marginRight: "12px",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
          },
        },
      },
      MuiListSubheader: {
        styleOverrides: {
          root: {
            color: theme.palette.text.primary,
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
            ...theme.typography.body2,
            lineHeight: "48px",
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            padding: "8px 24px",
          },
        },
      },
      // TODO: Figure out why styleOverrides.selected does not work and replace hardcoded classes
      MuiListItemButton: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              color: theme.palette.primary.main,
              ".MuiSvgIcon-root": {
                color: theme.palette.primary.main,
              },
            },
          },
        },
      },
      MuiListItemText: {
        defaultProps: {
          primaryTypographyProps: {
            variant: "h6",
          },
        },
        styleOverrides: {
          root: {
            margin: "4px 0",
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: "auto",
            marginRight: theme.spacing(2),
          },
        },
      },
      MuiListItemAvatar: {
        styleOverrides: {
          root: {
            marginRight: theme.spacing(2),
            minWidth: "auto",
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            width: "36px",
            height: "36px",
          },
        },
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiMenu: {
        defaultProps: {
          elevation: 2,
          PaperProps: {
            square: true,
          },
        },
      },
      MuiPopover: {
        defaultProps: {
          elevation: 2,
          PaperProps: {
            square: true,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            ...theme.typography.menuItem,
            ".MuiListItemIcon-root": {
              minWidth: "auto",
            },
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            background: theme.palette.background.paper,
            backgroundImage: getModeStyle("none", ELEVATION1_BG),
            borderTop: `1px solid`,
            borderColor: theme.palette.divider,
          },
          input: {
            background: "transparent",
          },
          selectLabel: {
            [theme.breakpoints.down("md")]: {
              display: "none",
            },
          },
          selectRoot: {
            [theme.breakpoints.down("md")]: {
              display: "none",
            },
          },
          toolbar: {
            [theme.breakpoints.up("md")]: {
              paddingRight: theme.spacing(4),
            },
            [theme.breakpoints.down("md")]: {
              paddingRight: theme.spacing(2),
            },
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: "20px",
            border: "1px solid",
            borderColor: theme.palette.other.outline,
            boxShadow: theme.shadows[1],
          },
        },
      },
      MuiTable: {
        variants: [
          {
            props: { size: "small" },
            style: {
              tr: {
                background: getModeStyle(
                  "transparent",
                  alpha(theme.palette.action.hover, 0.08)
                ),
                "&.MuiTableRow-hover:hover": {
                  background: getModeStyle(
                    "transparent",
                    alpha(theme.palette.action.hover, 0.08)
                  ),
                },
              },
            },
          },
        ],
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            background: theme.palette.background.paper,
            backgroundImage: getModeStyle("none", ELEVATION1_BG),
            "&.MuiTableRow-hover:hover": {
              background: theme.palette.background.paper,
              backgroundImage: getModeStyle("none", ELEVATION1_BG),
              td: {
                background: theme.palette.action.hover,
              },
            },
            "&:last-of-type": {
              "> td": {
                border: "none",
              },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            ...theme.typography.body2,
            color: theme.palette.text.secondary,
            padding: "10px 32px",
            minHeight: 0,
            [theme.breakpoints.down("md")]: {
              padding: "8px 16px",
            },
          },
          body: {
            ...theme.typography.body2,
            padding: "8px 32px",
            [theme.breakpoints.down("md")]: {
              padding: "8px 16px",
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.secondary,
            boxShadow: theme.shadows[5],
            padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
            borderRadius: "4px",
            maxWidth: "220px",
            width: "100%", // TODO: This should have a better solution.
            ...theme.typography.tooltip,
          },
          arrow: {
            color: theme.palette.background.paper,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            padding: theme.spacing(3.5),
          },
        },
      },
      MuiCardHeader: {
        defaultProps: {
          subheaderTypographyProps: {
            variant: "body2",
          },
        },
        styleOverrides: {
          root: {
            padding: "0px",
            " + .MuiCardContent-root": {
              paddingTop: theme.spacing(3),
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: "0px",
            "&:last-child": {
              paddingBottom: "0px",
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: FONT_FACES,
      },
    },
    shape: {
      borderRadius: 10,
    },
  };
}
