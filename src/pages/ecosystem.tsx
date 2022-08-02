import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Container,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { NextPage } from "next";
import Link from "next/link";
import { chain } from "wagmi";
import SEO from "../components/SEO/SEO";
import { EcosystemApp } from "../features/ecosystem/EcosystemItem";
import EcosystemSection from "../features/ecosystem/EcosystemSection";

export const BUILT_ON_SUPERFLUID = [
  {
    name: "Ricochet",
    href: "https://ricochet.exchange/",
    description: `An exchange for effortless real-time crypto investing and streaming`,
    icon: "/icons/ecosystem/ricochet.svg",
    chains: [chain.polygon.id],
    colors: {
      primary: "#1B2733",
      secondary: "#254D5A",
    },
  },
  {
    name: "Diagonal",
    href: "https://diagonal.finance/",
    icon: "/icons/ecosystem/diagonal.svg",
    description: `Non-custodial protocol for recurring payments on Ethereum`,
    chains: [chain.polygon.id],
    colors: {
      primary: "#D4493F",
      secondary: "#F3766C",
    },
  },
  {
    name: "Degen Dogs",
    href: "https://degendogs.club/",
    icon: "/icons/ecosystem/degen-dogs.svg",
    description: `NFT project combining DeFi and streaming through a DAO treasury`,
    chains: [chain.polygon.id],
    colors: {
      primary: "#645D5B",
      secondary: "#978D87",
    },
  },
  {
    name: "MIVA Farms",
    href: "https://farm.minerva.digital/",
    icon: "/icons/ecosystem/minerva.svg",
    description: `Next-gen yield farming with continuous MIVA reward streaming`,
    chains: [100],
    colors: {
      primary: "#4A3FCA",
      secondary: "#7D59ED",
    },
  },
  {
    name: "Creaton",
    href: "https://creaton.io/",
    icon: "/icons/ecosystem/creaton.svg",
    description: `Web3 membership platform for subscription income from fans`,
    chains: [chain.polygon.id],
    colors: {
      primary: "#342F9B",
      secondary: "#1EA450",
    },
  },
  {
    name: "Huma",
    href: "https://huma.finance/",
    icon: "/icons/ecosystem/huma.svg",
    description: `Borrow against future income streams without collaterization`,
    chains: [chain.polygon.id],
    comingSoon: true,
    colors: {
      primary: "#8A51D5",
      secondary: "#B47EF9",
    },
  },
  {
    name: "Drip",
    href: "https://drip.stream/",
    icon: "/icons/ecosystem/drip.svg",
    description: `Web3 checkout and affiliate marketing using cash-flow NFTs`,
    chains: [chain.polygon.id],
    comingSoon: true,
    colors: {
      primary: "#2786DB",
      secondary: "#5AC1FB",
    },
  },
  {
    name: "Geo Web",
    href: "https://www.geoweb.network/",
    icon: "/icons/ecosystem/huma.svg",
    description: `AR layer anchoring digital content to physical locations`,
    chains: [chain.polygon.id],
    comingSoon: true,
    colors: {
      primary: "#434C7C",
      secondary: "#5E71E2",
    },
  },
];

export const SUPERFLUID_INTEGRATIONS: EcosystemApp[] = [
  {
    name: "Gnosis Safe",
    href: "https://gnosis-safe.io/",
    icon: "/icons/ecosystem/gnosis-safe.svg",
    description: `Multi-sig and smart contract wallet for storing digital assets safely`,
    chains: [chain.arbitrum.id, 100, chain.optimism.id, chain.polygon.id],
    colors: {
      primary: "#33806B",
      secondary: "#4BC2A2",
    },
  },
  {
    name: "Request Finance",
    href: "https://www.request.finance/",
    icon: "/icons/ecosystem/request.svg",
    description: `Manage and track crypto invoices, salaries, and expenses in one place`,
    chains: [chain.arbitrum.id, 43114, 100, chain.polygon.id],
    comingSoon: true,
    colors: {
      primary: "#1B52D0",
      secondary: "#5184F7",
    },
  },
  {
    name: "Coinshift",
    href: "https://coinshift.xyz/",
    icon: "/icons/ecosystem/coinshift.svg",
    description: `A treasury management platform with efficient multi-sig tooling`,
    chains: [chain.polygon.id],
    comingSoon: true,
    colors: {
      primary: "#1452F5",
      secondary: "#5893ED",
    },
  },
  {
    name: "DAO Haus",
    href: "https://daohaus.club/",
    icon: "/icons/ecosystem/dao-haus.svg",
    description: `No-code platform for Moloch DAOs and their summoners`,
    chains: [chain.arbitrum.id, 100, chain.optimism.id, chain.polygon.id],
    colors: {
      primary: "#192AC2",
      secondary: "#FB708B",
    },
  },
  {
    name: "Unlock Protocol",
    href: "https://unlock-protocol.com/",
    icon: "/icons/ecosystem/unlock.svg",
    description: `Connecting creative communities with NFT-based memberships`,
    chains: [100, chain.optimism.id, chain.polygon.id],
    comingSoon: true,
    colors: {
      primary: "#E76E73",
      secondary: "#FBA58F",
    },
  },
  {
    name: "Collab.Land",
    href: "https://collab.land/",
    icon: "/icons/ecosystem/collab-land.svg",
    description: `User-friendly, tokenized, community-management system`,
    chains: [
      chain.arbitrum.id,
      43114,
      100,
      chain.optimism.id,
      chain.polygon.id,
    ],
    comingSoon: true,
    colors: {
      primary: "#E88F27",
      secondary: "#FDB867",
    },
  },
  {
    name: "Connext",
    href: `https://medium.com/superfluid-blog/superfluid-protocol-is-enabling-cross-chain-asset-streaming-with-connext-nomad-9dd34a26dc7d`,
    icon: "/icons/ecosystem/connext.svg",
    description: `Powers fast, secure bridging between blockchains and rollups`,
    chains: [
      chain.arbitrum.id,
      43114,
      100,
      chain.optimism.id,
      chain.polygon.id,
    ],
    colors: {
      primary: "#5482FC",
      secondary: "#C02AD2",
    },
  },
  {
    name: "Nomad",
    href: `https://medium.com/superfluid-blog/superfluid-protocol-is-enabling-cross-chain-asset-streaming-with-connext-nomad-9dd34a26dc7d`,
    icon: "/icons/ecosystem/nomad.svg",
    description: `Cross-chain messaging protocol using an optimistic mechanism`,
    chains: [
      chain.arbitrum.id,
      43114,
      100,
      chain.optimism.id,
      chain.polygon.id,
    ],
    colors: {
      primary: "#1F2122",
      secondary: "#545455",
    },
  },
  {
    name: "UMA",
    href: "https://umaproject.org/",
    icon: "/icons/ecosystem/uma.svg",
    description: `Optimistic oracle for Web3 serving data to smart contracts`,
    chains: [chain.arbitrum.id, 100, chain.optimism.id, chain.polygon.id],
    colors: {
      primary: "#FF4A4A",
      secondary: "#F07979",
    },
  },
];

export const SUPPORTS_SUPER_TOKENS: EcosystemApp[] = [
  {
    name: "Minerva",
    href: "https://minerva.digital/",
    icon: "/icons/ecosystem/minerva.svg",
    description: `User-friendly wallet for sovereign identities, data, and money`,
    chains: [100, chain.polygon.id],
    colors: {
      primary: "#4A3FCA",
      secondary: "#7D59ED",
    },
  },
  {
    name: "Zapper",
    href: "https://zapper.fi/",
    icon: "/icons/ecosystem/zapper.svg",
    description: `Deploy, track, and manage DeFi positions and investments`,
    chains: [
      chain.arbitrum.id,
      43114,
      100,
      chain.optimism.id,
      chain.polygon.id,
    ],
    colors: {
      primary: "#6A50F4",
      secondary: "#A493FE",
    },
  },
  {
    name: "Zerion",
    href: "https://zerion.io/",
    icon: "/icons/ecosystem/zerion.svg",
    description: `Smart wallet to manage, swap, stake, borrow, and lend assets`,
    chains: [
      chain.arbitrum.id,
      43114,
      100,
      chain.optimism.id,
      chain.polygon.id,
    ],
    colors: {
      primary: "#285BE3",
      secondary: "#698EF4",
    },
  },
  {
    name: "Li.Fi",
    href: "https://li.fi/",
    icon: "/icons/ecosystem/li-fi.svg",
    description: `Advanced bridge aggregation with DEX connectivity`,
    chains: [
      chain.arbitrum.id,
      43114,
      100,
      chain.optimism.id,
      chain.polygon.id,
    ],
    comingSoon: true,
    colors: {
      primary: "#616BEF",
      secondary: "#EAA4FF",
    },
  },
  {
    name: "Transak",
    href: "https://transak.com/",
    icon: "/icons/ecosystem/transak.svg",
    description: `Fiat on-off ramp developer integration for Web3 applications`,
    chains: [
      chain.arbitrum.id,
      43114,
      100,
      chain.optimism.id,
      chain.polygon.id,
    ],
    comingSoon: true,
    colors: {
      primary: "#0064EC",
      secondary: "#33AAFF",
    },
  },
];

const Ecosystem: NextPage = () => {
  const theme = useTheme();

  return (
    <SEO title="Ecosystem | Superfluid">
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Stack gap={4.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              [theme.breakpoints.down("md")]: {
                flexDirection: "column",
                alignItems: "start",
                gap: 2,
              },
            }}
          >
            <Typography variant="h3" component="h1">
              Explore the Superfluid ecosystem
            </Typography>
            <Link
              href="https://github.com/superfluid-finance/ecosystem/"
              passHref
              target="_blank"
            >
              <Button
                data-cy={"add-new-app-button"}
                href=""
                variant="contained"
                color="primary"
                endIcon={<AddIcon />}
                target="_blank"
              >
            Add New App
          </Button>
        </Link>
      </Stack>

          <Divider />

          <EcosystemSection
            title="Built on Superfluid"
            apps={BUILT_ON_SUPERFLUID}
          />

          <Divider />

          <EcosystemSection
            title="Superfluid Integrations"
            apps={SUPERFLUID_INTEGRATIONS}
          />

          <Divider />

          <EcosystemSection
            title="Supports Super Tokens"
            apps={SUPPORTS_SUPER_TOKENS}
          />
        </Stack>
      </Container>
    </SEO>
  );
};

export default Ecosystem;
