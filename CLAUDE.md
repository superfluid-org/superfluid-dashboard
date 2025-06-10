# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Key Commands

### Development
- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production (`.next/`)
- `pnpm start` - Serve the built static files
- `pnpm lint` - Run Next.js linting
- `pnpm typecheck` - Run TypeScript type checking

### Code Generation (run after modifying contracts or GraphQL)
- `pnpm generate` - Run all code generation tasks
- `pnpm generate:eth-sdk` - Generate contract interfaces from ABIs
- `pnpm generate:wagmi` - Generate Wagmi contract hooks
- `pnpm generate:vesting-graphql` - Generate GraphQL types for vesting subgraph
- `pnpm generate:auto-wrap-graphql` - Generate GraphQL types for auto-wrap subgraph

### Testing
- In the `tests/` directory:
  - `pnpm cypress open` - Open Cypress test runner
  - `pnpm cypress run --env network=opsepolia` - Run tests for specific network
  - Test files use Cucumber/Gherkin syntax (`.feature` files)

## Architecture Overview

### Core Technologies
- **Next.js 15** deployed to Vercel as serverless
- **TypeScript** with strict mode
- **Redux Toolkit** with RTK Query for state management and API calls
- **Wagmi v2** for Web3 wallet connections
- **Ethers v5** for legacy Web3 interactions involving @superfluid-finance/sdk-core & @superfluid-finance/sdk-redux
- **Material-UI v6** for UI components
- **Emotion** for CSS-in-JS styling

### Key Architectural Patterns

1. **Feature-Based Organization**: All major features live in `src/features/` with their own slices, components, and API logic.

2. **API Layer**: 
   - RTK Query slices for different data sources (RPC, subgraphs, external APIs)
   - Separate API slices for ENS, Lens, gas prices, token prices, etc.

3. **Blockchain Integration**:
   - Wagmi for wallet connections and contract interactions
   - Ethers v5 for legacy contract interactions
   - Custom fallback provider implementation for reliability
   - Transaction tracking and restoration system
   - Multi-network support with network-specific configurations

4. **State Management**:
   - Redux slices for each feature
   - Redux Persist for state persistence with migrations
   - Separate slices for UI state (notifications, preferences) and data

5. **Code Generation Pipeline**:
   - Contract types generated from ABIs using eth-sdk and Wagmi CLI
   - GraphQL types generated from subgraph schemas
   - All generated code goes into specific directories (`src/eth-sdk/`, `generated.ts`)

### Important Patterns

1. **Transaction Handling**:
   - `TransactionBoundary` component wraps transaction UI
   - Pending updates tracked in Redux for optimistic UI
   - Transaction restoration system for failed/interrupted transactions

2. **Multi-Network Support**:
   - Network-specific routing (e.g., `/token/[network]/[token]`)
   - Network constants and configurations in `src/features/network/`
   - Separate RPC and subgraph endpoints per network

3. **Form Handling**:
   - React Hook Form with Yup validation
   - Form providers for complex forms (vesting, streaming, etc.)
   - Shared validation utilities in `src/utils/`

4. **Error Handling**:
   - Sentry integration for error tracking
   - Custom error boundaries and toast notifications
   - Wallet connection error handling with retry logic

### Common Development Tasks

When working with:
- **New Features**: Create a new directory in `src/features/`
- **API Integration**: Add new endpoints to existing RTK Query slices or create new ones
- **Smart Contracts**: Add ABIs to `src/eth-sdk/abis/` and run code generation
- **UI Components**: Use Material-UI components and follow existing patterns in `src/components/`

### Notes
- Advanced features available via `window.superfluid_dashboard.advanced` (see README)
- When `eth-sdk` generation fails with ES module error, temporarily remove `"type": "module"` from package.json