import { alpha, Theme, ThemeOptions } from "@mui/material/styles";
import React from "react";
import { FONT_FACES } from "./fonts";

// TODO: Move to separate declaration file to make theme file cleaner?

// TYPOGRAHY

interface TypographyCustomVariants {
  h5mono: React.CSSProperties;
  h6mono: React.CSSProperties;
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
    h5mono: true;
    h6mono: true;
    body1mono: true;
    body2mono: true;
    largeInput: true;
    menuItem: true;
    tooltip: true;
  }
}

// COLOR PALETTE

interface PaletteCustomColors {
  other: {
    outline: string;
    backdrop: string;
    snackbar: string;
  };
}

declare module "@mui/material/styles/createPalette" {
  interface Palette extends PaletteCustomColors {}
  interface PaletteOptions extends PaletteCustomColors {}
}

// BUTTONS

declare module "@mui/material/Button" {
  interface ButtonPropsSizeOverrides {
    xl: true;
  }

  interface ButtonPropsVariantOverrides {
    textContained: true;
  }
}

const FONT_FAMILY = "'Walsheim', Arial";
const FONT_FAMILY_MONO = "'Azeret Mono', monospace;";

export const getDesignTokens = (mode: "light" | "dark"): ThemeOptions => {
  const getModeStyle = (lightStyle: string, darkStyle: string) =>
    mode === "dark" ? darkStyle : lightStyle;

  return {
    palette: {
      mode,
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
        main: getModeStyle("#E0E0E0FF", "#E0E0E0FF"),
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
      },
      divider: getModeStyle("#0000001F", "#FFFFFF1F"),
    },
    typography: {
      fontFamily: FONT_FAMILY,
      h1: {
        fontSize: "64px",
        letterSpacing: "-1.5px",
        fontWeight: 400,
      },
      h2: {
        fontSize: "48px",
        fontWeight: 400,
        letterSpacing: "-0.5px",
      },
      h3: {
        fontSize: "36px",
        fontWeight: 500,
      },
      h4: {
        fontSize: "24px",
        fontWeight: 500,
        letterSpacing: "0.25px",
      },
      h5: {
        fontSize: "18px",
        fontWeight: 500,
      },
      h5mono: {
        fontSize: "18px",
        fontWeight: 500,
        fontFamily: FONT_FAMILY_MONO,
      },
      h6: {
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: "150%",
        letterSpacing: "0.15px",
      },
      h6mono: {
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: "150%",
        fontFamily: FONT_FAMILY_MONO,
      },
      body1: {
        fontWeight: 400,
        letterSpacing: 0.15,
      },
      body1mono: {
        fontWeight: 400,
        whiteSpace: "pre",
        fontFamily: FONT_FAMILY_MONO,
      },
      body2: {
        fontSize: "14px",
        fontWeight: 400,
        letterSpacing: 0.17,
      },
      body2mono: {
        fontSize: "14px",
        fontWeight: 400,
        whiteSpace: "pre",
        fontFamily: FONT_FAMILY_MONO,
      },
      subtitle1: {
        letterSpacing: "0.15px",
      },
      subtitle2: {
        letterSpacing: "0.1px",
      },
      caption: {
        letterSpacing: "0.4px",
      },
      overline: {
        letterSpacing: "1px",
      },
      largeInput: {
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "30px",
        lineHeight: "150%",
        letterSpacing: "0.15px",
      },
      menuItem: {
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: "150%",
        letterSpacing: "0.15px",
      },
      tooltip: {
        fontSize: "12px",
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
  const getModeStyle = (lightStyle: string, darkStyle: string) =>
    theme.palette.mode === "dark" ? darkStyle : lightStyle;

  return {
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
          },
          rounded: {
            borderRadius: "20px",
          },
          outlined: {
            background: getModeStyle(
              "#FFFFFF",
              "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%), #121212"
            ),
          },
          elevation1: {
            background: getModeStyle(
              "#FFFFFF",
              "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%), #121212"
            ),
          },
          elevation2: {
            background: getModeStyle(
              "#FFFFFF",
              "linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.07) 100%), #121212"
            ),
          },
          elevation3: {
            background: getModeStyle(
              "#FFFFFF",
              "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.08) 100%), #121212"
            ),
          },
          elevation4: {
            background: getModeStyle(
              "#FFFFFF",
              "linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.09) 100%), #121212"
            ),
          },
          elevation5: {
            background: getModeStyle(
              "#FFFFFF",
              "linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%), #121212"
            ),
          },
          elevation6: {
            background: getModeStyle(
              "#FFFFFF",
              "linear-gradient(180deg, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0.11) 100%), #121212"
            ),
          },
          elevation7: {
            background: getModeStyle(
              "#FFFFFF",
              "linear-gradient(180deg, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0.11) 100%), #121212"
            ),
          },
          elevation8: {
            background: getModeStyle(
              "#FFFFFF",
              "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.12) 100%), #121212"
            ),
          },
          elevation9: {
            background: getModeStyle(
              "#FFFFFF",
              "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.12) 100%), #121212"
            ),
          },
          elevation10: {
            background: getModeStyle(
              "#FFFFFF",
              "linear-gradient(180deg, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.13) 100%), #121212"
            ),
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
          },
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
          input: {
            "&[type=number]::-webkit-outer-spin-button, &[type=number]::-webkit-inner-spin-button":
              {
                WebkitAppearance: "none",
                m: 0,
              },
            "&[type=number]": {
              "-moz-appearance": "textfield",
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            // TODO: Figure out why styleOverrides.disabled is not working and replace .Mui-disabled hardcoded class.
            ".Mui-disabled": {
              backgroundColor: alpha(theme.palette.secondary.main, 0.3),
              borderRadius: "10px",
            },
          },
          notchedOutline: {
            borderColor: theme.palette.other.outline,
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
            color: theme.palette.text.primary,
            borderRadius: "8px",
            padding: theme.spacing(0.75),
          },
        },
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
          },
          sizeMedium: {
            letterSpacing: "0.17px",
          },
          outlinedSecondary: {
            color: theme.palette.text.primary,
            borderColor: theme.palette.other.outline,
          },
        },
        variants: [
          {
            props: { size: "small" },
            style: {
              ...theme.typography.caption,
            },
          },
          {
            props: { size: "large" },
            style: {
              fontSize: 16,
            },
          },
          {
            props: { size: "xl" },
            style: {
              padding: "14px 0",
              width: "100%",
              ...theme.typography.h6,
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
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
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
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: "10px",
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
            marginRight: 16,
          },
        },
      },
      MuiListItemAvatar: {
        styleOverrides: {
          root: {
            marginRight: 16,
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
          PaperProps: {
            square: true,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            ...theme.typography.menuItem,
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            borderTop: `1px solid`,
            borderColor: theme.palette.divider,
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
                background: "transparent",
                "&.MuiTableRow-hover:hover": {
                  background: "transparent",
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
            "&.MuiTableRow-hover:hover": {
              background: theme.palette.background.paper,
              td: {
                background: theme.palette.action.hover,
              },
            },
            "&:last-of-type": {
              td: {
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
            padding: "12px 32px",
            minHeight: 0,
          },
          body: {
            ...theme.typography.body2,
            padding: "8px 32px",
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
      MuiCssBaseline: {
        styleOverrides: FONT_FACES,
      },
    },
    shape: {
      borderRadius: 10,
    },
  };
}
