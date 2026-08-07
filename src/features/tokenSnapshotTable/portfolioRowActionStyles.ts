import { Theme } from "@mui/material/styles";

export const PORTFOLIO_ROW_ACTIONS_CLASS_NAME = "portfolio-row-actions";

export const getPortfolioRowActionStyles = (theme: Theme) => {
  const actionsSelector = `.${PORTFOLIO_ROW_ACTIONS_CLASS_NAME}`;

  return {
    [`& ${actionsSelector}`]: {
      opacity: 0,
      pointerEvents: "none" as const,
      transform: "translateX(10px)",
      transition: theme.transitions.create(["opacity", "transform"], {
        duration: theme.transitions.duration.shorter,
        easing: theme.transitions.easing.easeOut,
      }),
    },
    [`&:hover ${actionsSelector}, &:focus-within ${actionsSelector}`]: {
      opacity: 1,
      pointerEvents: "auto" as const,
      transform: "translateX(0)",
    },
    "@media (hover: none)": {
      [`& ${actionsSelector}`]: {
        opacity: 1,
        pointerEvents: "auto" as const,
        transform: "translateX(0)",
      },
    },
    "@media (prefers-reduced-motion: reduce)": {
      [`& ${actionsSelector}`]: {
        transition: "none",
      },
    },
  };
};

export const getPortfolioMobileRowStyles = (theme: Theme) => ({
  [theme.breakpoints.down("md")]: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(112px, auto)",
    width: "100%",
    "& > td": {
      display: "block",
      minWidth: 0,
    },
    "& > td:nth-of-type(1), & > td:nth-of-type(2)": {
      borderBottom: "none",
    },
    "& > td:last-of-type": {
      gridColumn: "1 / -1",
      width: "100%",
      px: theme.spacing(2),
      pt: 0,
      pb: theme.spacing(1),
    },
  },
});
