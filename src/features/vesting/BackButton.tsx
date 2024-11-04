import { IconButton } from "@mui/material";
import { Box } from "@mui/system";
import { useRouter } from "next/router";
import { CreateVestingCardView } from "./CreateVestingSection";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export function BackButton(props: {
    view: CreateVestingCardView;
    setView: (view: CreateVestingCardView) => void;
  }) {
    const { view, setView } = props;
  
    const router = useRouter();
    return (
      <Box>
        <IconButton
          data-cy={"close-button"}
          color="inherit"
          onClick={() => {
            if (view === CreateVestingCardView.Form) {
              router.push("/vesting");
            } else if (view === CreateVestingCardView.Success) {
              router.push("/vesting");
            } else {
              setView(view - 1);
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
    );
  }