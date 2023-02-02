import { networkDefinition } from "./networks";

export const AUTOMATE_CRYPTO_PAYROLL = [
    {
        name: "Coinshift",
        href: "https://coinshift.xyz/",
        icon: "/icons/ecosystem/coinshift.svg",
        description: `A treasury management platform with efficient multi-sig tooling`,
        chains: [networkDefinition.polygon.id],
        colors: {
            primary: "#1452F5",
            secondary: "#5893ED",
        },
    },
    {
        name: "Request Finance",
        href: "https://www.request.finance/",
        icon: "/icons/ecosystem/request.svg",
        description: `Manage and track crypto invoices, salaries, and expenses in one place`,
        chains: [
            networkDefinition.arbitrum.id,
            networkDefinition.avalancheC.id,
            networkDefinition.gnosis.id,
            networkDefinition.polygon.id,
        ],
        comingSoon: true,
        colors: {
            primary: "#1B52D0",
            secondary: "#5184F7",
        },
    },
];

export const AUTOMATE_CRYPTO_VESTING = [
    {
        name: "TokenOps",
        href: `https://www.tokenops.xyz/`,
        icon: "/icons/ecosystem/tokenops.svg",
        description: `Create, track, and automate token vesting schedules`,
        chains: [networkDefinition.polygon.id],
        colors: {
            primary: "#2D6DEC",
            secondary: "#8F98F4",
        },
    },
    // {
    //     name: "Superfluid Dashboard",
    //     href: `https://superfluid.finance/vesting`,
    //     icon: "/icons/ecosystem/superfluid.svg",
    //     description: `Create vesting schedules directly from the Superfluid app`,
    //     chains: [networkDefinition.polygon.id],
    //     colors: {
    //         primary: "#2D6DEC",
    //         secondary: "#8F98F4",
    //     },
    // },
];

export const INVEST_IN_REALTIME = [
    {
        name: "Ricochet",
        href: "https://ricochet.exchange/",
        description: `An exchange for effortless real-time crypto investing and streaming`,
        icon: "/icons/ecosystem/ricochet.svg",
        chains: [networkDefinition.polygon.id],
        colors: {
            primary: "#1B2733",
            secondary: "#254D5A",
        },
    },
    {
        name: "aqueduct",
        href: "https://aqueductfinance.vercel.app/",
        description: `A real-time DEX where you can swap and earn tokens every second`,
        icon: "/icons/ecosystem/aqueduct.png",
        chains: [
            networkDefinition.arbitrum.id,
            networkDefinition.avalancheC.id,
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
            networkDefinition.bsc.id,
        ],
        comingSoon: true,
        colors: {
            primary: "#1F4276",
            secondary: "#0460CE",
        },
    },
];

export const BRIDGE_AND_EXCHANGE = [
    {
        name: "LI.FI",
        href: "https://app.superfluid.finance/bridge",
        icon: "/icons/ecosystem/li-fi.svg",
        description: `Advanced bridge aggregation with DEX connectivity`,
        chains: [
            networkDefinition.arbitrum.id,
            networkDefinition.avalancheC.id,
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
        ],
        colors: {
            primary: "#616BEF",
            secondary: "#EAA4FF",
        },
    },
];

export const ON_OFFRAMP = [
    {
        name: "Transak",
        href: "https://transak.com/",
        icon: "/icons/ecosystem/transak.svg",
        description: `Fiat on-off ramp developer integration for Web3 applications`,
        chains: [
            networkDefinition.arbitrum.id,
            networkDefinition.avalancheC.id,
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
        ],
        comingSoon: true,
        colors: {
            primary: "#0064EC",
            secondary: "#33AAFF",
        },
    },
];

export const SUPERFLUID_INTEGRATIONS = [
    {
        name: "Gnosis Safe",
        href: "https://gnosis-safe.io/",
        icon: "/icons/ecosystem/gnosis-safe.svg",
        description: `Multi-sig and smart contract wallet for storing digital assets safely`,
        chains: [
            networkDefinition.arbitrum.id,
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
        ],
        colors: {
            primary: "#33806B",
            secondary: "#4BC2A2",
        },
    },
    {
        name: "Unlock Protocol",
        href: "https://unlock-protocol.com/",
        icon: "/icons/ecosystem/unlock.svg",
        description: `Connecting creative communities with NFT-based memberships`,
        chains: [
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
        ],
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
            networkDefinition.arbitrum.id,
            networkDefinition.avalancheC.id,
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
        ],
        colors: {
            primary: "#E88F27",
            secondary: "#FDB867",
        },
    },
    {
        name: "UMA",
        href: "https://umaproject.org/",
        icon: "/icons/ecosystem/uma.svg",
        description: `Optimistic oracle for Web3 serving data to smart contracts`,
        chains: [
            networkDefinition.arbitrum.id,
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
        ],
        colors: {
            primary: "#FF4A4A",
            secondary: "#F07979",
        },
    },
    {
        name: "DAO Haus",
        href: "https://daohaus.club/",
        icon: "/icons/ecosystem/dao-haus.svg",
        description: `No-code platform for Moloch DAOs and their summoners`,
        chains: [
            networkDefinition.arbitrum.id,
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
        ],
        colors: {
            primary: "#192AC2",
            secondary: "#FB708B",
        },
    },
];

export const OTHER_APPS_BUILT_ON_SUPERFLUID = [
    {
        name: "Degen Dogs",
        href: "https://degendogs.club/",
        icon: "/icons/ecosystem/degen-dogs.svg",
        description: `NFT project combining DeFi and streaming through a DAO treasury`,
        chains: [networkDefinition.polygon.id],
        colors: {
            primary: "#645D5B",
            secondary: "#978D87",
        },
    },
    {
        name: "Diagonal",
        href: "https://diagonal.finance/",
        icon: "/icons/ecosystem/diagonal.svg",
        description: `Non-custodial protocol for recurring payments on Ethereum`,
        chains: [networkDefinition.polygon.id],
        colors: {
            primary: "#D4493F",
            secondary: "#F3766C",
        },
    },
    {
        name: "MIVA Farms",
        href: "https://farm.minerva.digital/",
        icon: "/icons/ecosystem/minerva.svg",
        description: `Next-gen yield farming with continuous MIVA reward streaming`,
        chains: [networkDefinition.gnosis.id],
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
        chains: [networkDefinition.polygon.id],
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
        chains: [networkDefinition.polygon.id],
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
        chains: [networkDefinition.polygon.id],
        comingSoon: true,
        colors: {
            primary: "#2786DB",
            secondary: "#5AC1FB",
        },
    },
    {
        name: "Geo Web",
        href: "https://www.geoweb.network/",
        icon: "/icons/ecosystem/geoweb.svg",
        description: `AR layer anchoring digital content to physical locations`,
        chains: [
            networkDefinition.optimism.id,
        ],
        colors: {
            primary: "#4B5588",
            secondary: "#2FC1C1",
        },
    },
];

export const SUPPORTS_SUPER_TOKENS = [
    {
        name: "Minerva",
        href: "https://minerva.digital/",
        icon: "/icons/ecosystem/minerva.svg",
        description: `User-friendly wallet for sovereign identities, data, and money`,
        chains: [
            networkDefinition.arbitrum.id,
            networkDefinition.avalancheC.id,
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
            networkDefinition.bsc.id,
        ],
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
            networkDefinition.arbitrum.id,
            networkDefinition.avalancheC.id,
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
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
            networkDefinition.arbitrum.id,
            networkDefinition.avalancheC.id,
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
        ],
        colors: {
            primary: "#285BE3",
            secondary: "#698EF4",
        },
    },
    {
        name: "DeBank",
        href: "https://debank.com/",
        icon: "/icons/ecosystem/debank.svg",
        description: `Multi-chain portfolio tracker that supports the largest number of DeFi protocols.`,
        chains: [
            networkDefinition.arbitrum.id,
            networkDefinition.avalancheC.id,
            networkDefinition.gnosis.id,
            networkDefinition.optimism.id,
            networkDefinition.polygon.id,
        ],
        colors: {
            primary: "#FF6238",
            secondary: "#FE815F",
        },
    },
];