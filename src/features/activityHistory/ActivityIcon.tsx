import {
  Avatar,
  ListItemAvatar,
  styled,
  SvgIcon,
  SvgIconProps,
} from "@mui/material";
import { FC } from "react";

const ActivityIconWrapper = styled(Avatar)(({ theme }) => ({
  width: "40px",
  height: "40px",
  backgroundColor: "transparent",
  border: "2px solid",
  color: theme.palette.text.secondary,
  borderColor: theme.palette.other.outline,
  [theme.breakpoints.down("md")]: {
    width: "32px",
    height: "32px",
  },
}));

interface ActivityIconProps {
  icon: typeof SvgIcon;
  IconProps?: Partial<SvgIconProps>;
  /**
   * Test hook. Material UI v7 strips the default `data-testid` from icons in
   * production bundles, and the e2e suite runs against a production build, so
   * activity rows carry their own hook instead.
   */
  dataCy?: string;
}

const ActivityIcon: FC<ActivityIconProps> = ({
  icon: Icon,
  IconProps = { sx: {} },
  dataCy,
}) => (
  <ListItemAvatar>
    <ActivityIconWrapper>
      <Icon
        {...IconProps}
        data-cy={dataCy}
        sx={{
          fontSize: "20px",
          ...IconProps.sx,
        }}
      />
    </ActivityIconWrapper>
  </ListItemAvatar>
);

export default ActivityIcon;
