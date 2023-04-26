import withStaticSEO from "../components/SEO/withStaticSEO";
import {FC, PropsWithChildren} from "react";
import SEO from "../components/SEO/SEO";
import {Container, Typography} from "@mui/material";
import {NextPage} from "next";
import Minigame from "../features/minigame/MinigameContainer";
import config from "../utils/config";
import {useAccount} from "wagmi";

const DisplayWarning: FC<PropsWithChildren<{}>> = ({}) => (
    <Container maxWidth="lg" sx={{textAlign: "center"}}>
        <Typography variant={"body2"} color="secondary">
            To register your wallet address and unlock cosmetics, please connect to a wallet before starting the game.
        </Typography>
    </Container>
)

const SuperfluidRunnerPageContainer: FC<PropsWithChildren<{}>
> = ({children}) => (
    <SEO
        title={`Superfluid Runner | Superfluid`}
        ogTitle={`Superfluid Runner | Superfluid`}
        ogImage={`${config.appUrl}/images/superfluid-runner-thumbnail.png`}
    >
        {children}
    </SEO>
);

const SuperfluidRunner: NextPage = () => {

    const {isConnected} = useAccount();

    return (
        <SuperfluidRunnerPageContainer key={`superfluid-runner`}>
            <Minigame/>
            {!isConnected && <DisplayWarning/>}
        </SuperfluidRunnerPageContainer>
    );
}
export default withStaticSEO({title: "Superfluid Runner | Superfluid"}, SuperfluidRunner);
