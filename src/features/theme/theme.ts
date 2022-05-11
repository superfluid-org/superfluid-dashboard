import { Theme, ThemeOptions } from "@mui/material/styles";
import { FONT_FACES } from "./fonts";

// TODO: Move to separate declaration file to make theme file cleaner?

// TYPOGRAHY

interface TypographyCustomVariants {
  h5mono: React.CSSProperties;
  h6mono: React.CSSProperties;
  body1mono: React.CSSProperties;
  body2mono: React.CSSProperties;
  largeInput: React.CSSProperties;
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
        main: getModeStyle("#10BB35FF", "#69E07FFF"),
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
        default: getModeStyle("#FFFFFFFF", "#151619FF"),
      },
      other: {
        outline: "#E0E0E0",
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
        fontWeight: 400,
        letterSpacing: 0.17,
      },
      body2mono: {
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
    },
    shadows: [
      "none",
      getModeStyle(
        "0px 0px 6px 3px rgba(204, 204, 204, 0.25)",
        "0px 0px 6px 3px rgba(204, 204, 204, 0.25)"
      ), // elevation 1
      getModeStyle(
        "0px 0px 30px -2px rgba(204, 204, 204, 0.4), 0px 0px 6px rgba(204, 204, 204, 0.25)",
        "0px 0px 30px -2px rgba(204, 204, 204, 0.4), 0px 0px 6px rgba(204, 204, 204, 0.25)"
      ), // elevation 2
      getModeStyle(
        "0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px rgba(0, 0, 0, 0.14), 0px 1px 8px rgba(0, 0, 0, 0.12)",
        "0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px rgba(0, 0, 0, 0.14), 0px 1px 8px rgba(0, 0, 0, 0.12)"
      ), // elevation 3
      getModeStyle(
        "0px 0px 6px rgba(0, 0, 0, 0.12)",
        "0px 0px 6px rgba(0, 0, 0, 0.12)"
      ), // elevation 4
      getModeStyle(
        "0px 0px 1px -1px rgba(0, 0, 0, 0.2), 0px 0px 7px rgba(0, 0, 0, 0.12)",
        "0px 0px 1px -1px rgba(0, 0, 0, 0.2), 0px 0px 7px rgba(0, 0, 0, 0.12)"
      ), // elevation 5
      getModeStyle(
        "0px 0px 6px 2px rgba(0, 0, 0, 0.12)",
        "0px 0px 6px 2px rgba(0, 0, 0, 0.12)"
      ), // elevation 6
      getModeStyle(
        "0px 4px 5px -2px rgba(0, 0, 0, 0.2), 0px 7px 10px 1px rgba(0, 0, 0, 0.14), 0px 2px 16px 1px rgba(0, 0, 0, 0.12)",
        "0px 4px 5px -2px rgba(0, 0, 0, 0.2), 0px 7px 10px 1px rgba(0, 0, 0, 0.14), 0px 2px 16px 1px rgba(0, 0, 0, 0.12)"
      ), // elevation 7
      getModeStyle(
        "0px 0px 5px -3px rgba(0, 0, 0, 0.14), 0px 0px 10px 1px rgba(0, 0, 0, 0.1), 0px 0px 14px 2px rgba(0, 0, 0, 0.05)",
        "0px 0px 5px -3px rgba(0, 0, 0, 0.14), 0px 0px 10px 1px rgba(0, 0, 0, 0.1), 0px 0px 14px 2px rgba(0, 0, 0, 0.05)"
      ), // elevation 8
      getModeStyle(
        "0px 5px 6px -3px rgba(0, 0, 0, 0.2), 0px 9px 12px 1px rgba(0, 0, 0, 0.14), 0px 3px 16px 2px rgba(0, 0, 0, 0.12)",
        "0px 5px 6px -3px rgba(0, 0, 0, 0.2), 0px 9px 12px 1px rgba(0, 0, 0, 0.14), 0px 3px 16px 2px rgba(0, 0, 0, 0.12)"
      ), // elevation 9
      getModeStyle(
        "0px 6px 6px -3px rgba(0, 0, 0, 0.2), 0px 10px 14px 1px rgba(0, 0, 0, 0.14), 0px 4px 18px 3px rgba(0, 0, 0, 0.12)",
        "0px 6px 6px -3px rgba(0, 0, 0, 0.2), 0px 10px 14px 1px rgba(0, 0, 0, 0.14), 0px 4px 18px 3px rgba(0, 0, 0, 0.12)"
      ), // elevation 10
      getModeStyle(
        "0px 6px 7px -4px rgba(0, 0, 0, 0.2), 0px 11px 15px 1px rgba(0, 0, 0, 0.14), 0px 4px 20px 3px rgba(0, 0, 0, 0.12)",
        "0px 6px 7px -4px rgba(0, 0, 0, 0.2), 0px 11px 15px 1px rgba(0, 0, 0, 0.14), 0px 4px 20px 3px rgba(0, 0, 0, 0.12)"
      ), // elevation 11
      getModeStyle(
        "0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 12px 17px 2px rgba(0, 0, 0, 0.14), 0px 5px 22px 4px rgba(0, 0, 0, 0.12)",
        "0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 12px 17px 2px rgba(0, 0, 0, 0.14), 0px 5px 22px 4px rgba(0, 0, 0, 0.12)"
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
  };
};

export function getThemedComponents(theme: Theme): ThemeOptions {
  const getModeStyle = (lightStyle: string, darkStyle: string) =>
    theme.palette.mode === "dark" ? darkStyle : lightStyle;

  return {
    components: {
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
      MuiSvgIcon: {
        styleOverrides: {
          fontSizeLarge: {
            fontSize: 48,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: theme.palette.text.primary,
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            padding: theme.spacing(0.5),
            // background: theme.palette.action.disabled,
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
          },
          sizeMedium: {
            letterSpacing: "0.17px",
          },
          sizeLarge: {
            ...theme.typography.h5,
          },
          selected: {
            ...theme.typography.h6,
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
      MuiListItem: {
        styleOverrides: {
          root: {
            padding: "8px 24px",
          },
        },
      },
      MuiListItemText: {
        defaultProps: {
          primaryTypographyProps: {
            variant: "h5",
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
      // TODO: Double check if this is still needed
      // MuiTableBody: {
      //   styleOverrides: {
      //     root: {
      //       // "tr:last-of-type > td": { border: 0 },
      //     },
      //   },
      // },
      // TODO: If we get tables to fit better then change paddings back to 8px 32px
      MuiTableRow: {
        styleOverrides: {
          root: {
            "td:first-of-type, th:first-of-type": {
              padding: "8px 24px 8px 32px",
            },
            "td:last-of-type, th:last-of-type": {
              padding: "8px 32px 8px 24px",
            },
          },
        },
      },
      // TODO: If we get tables to fit better then change paddings back to 8px 32px
      MuiTableCell: {
        styleOverrides: {
          head: {
            ...theme.typography.body2,
            fontSize: "14px",
            color: theme.palette.text.secondary,
            padding: "8px 24px",
            minHeight: 0,
          },
          body: {
            ...theme.typography.body2,
            padding: "12px 24px",
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
