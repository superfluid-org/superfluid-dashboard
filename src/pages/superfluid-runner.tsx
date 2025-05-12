import withStaticSEO from "../components/SEO/withStaticSEO";
import {FC, PropsWithChildren} from "react";
import {Alert, Container, Typography} from "@mui/material";
import {NextPage} from "next";
import Minigame from "../features/minigame/MinigameContainer";
import config from "../utils/config";
import { useAccount } from "@/hooks/useAccount"

const DisplayWarning: FC<PropsWithChildren<{}>> = ({}) => (
    <Container maxWidth="lg" sx={{textAlign: "center"}}>
        <Alert severity="warning">
            <Typography data-cy={"superfluid-runner-game-alert-text"}>
            To access and unlock in-game cosmetics, please connect your wallet before beginning the game.
            </Typography>
        </Alert>
    </Container>
)

const SuperfluidRunner: NextPage = () => {
    const {isConnected} = useAccount();

    return (
        <>
            <Minigame />
            {!isConnected && <DisplayWarning/>}
        </>
    );
}
export default withStaticSEO({
    title: "Superfluid Runner | Superfluid",
    ogImage: `${config.appUrl}/images/superfluid-runner-thumbnail.png`,
    ogUrl: `${config.appUrl}/superfluid-runner`,
}, SuperfluidRunner);
