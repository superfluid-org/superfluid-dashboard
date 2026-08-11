import type { NextApiRequest, NextApiResponse } from "next";
import {
  ZerionDefiPortfolioResponse,
  ZerionDefiPosition,
  ZerionNftNetworksRequest,
  ZerionNftNetworksResponse,
  ZerionNftPageRequest,
  ZerionNftPageResponse,
  ZerionNftPosition,
} from "../../features/portfolio/zerionDefiPortfolioTypes";

const ZERION_API_URL = "https://api.zerion.io/v1";
const REQUEST_TIMEOUT_MS = 30_000;
const BETWEEN_REQUESTS_MS = 1_050;
const MAX_RATE_LIMIT_RETRIES = 1;
const NFT_PAGE_SIZE = 12;

export const config = {
  maxDuration: 60,
};

interface ZerionErrorBody {
  errors?: Array<{ title?: string; detail?: string }>;
}

interface ZerionPortfolioBody {
  data?: {
    attributes?: {
      positions_distribution_by_type?: Record<string, number>;
      positions_distribution_by_chain?: Record<string, number>;
      total?: { positions?: number };
      changes?: {
        absolute_1d?: number | null;
        percent_1d?: number | null;
      };
    };
  };
}

interface ZerionPositionBody {
  data?: Array<{
    id: string;
    attributes?: {
      name?: string | null;
      quantity?: { float?: number; numeric?: string };
      protocol?: string | null;
      protocol_module?: string | null;
      group_id?: string | null;
      position_type?: string | null;
      value?: number | null;
      price?: number | null;
      changes?: { percent_1d?: number | null };
      fungible_info?: {
        name?: string | null;
        symbol?: string | null;
        icon?: { url?: string | null } | null;
        flags?: { verified?: boolean };
      };
      application_metadata?: {
        name?: string | null;
        icon?: { url?: string | null } | null;
      } | null;
    };
    relationships?: {
      chain?: { data?: { id?: string } };
    };
  }>;
  links?: { next?: string | null };
}

interface ZerionNftBody {
  data?: Array<{
    id: string;
    attributes?: {
      amount?: string | number | null;
      value?: number | null;
      price?: number | null;
      nft_info?: {
        name?: string | null;
        contract_address?: string | null;
        token_id?: string | null;
        interface?: string | null;
        flags?: { is_spam?: boolean };
        content?: {
          preview?: { url?: string | null } | null;
          detail?: { url?: string | null } | null;
        };
      };
      collection_info?: {
        name?: string | null;
        content?: { icon?: { url?: string | null } | null };
      } | null;
    };
    relationships?: {
      chain?: { data?: { id?: string } };
    };
  }>;
  links?: { next?: string | null; self?: string | null };
}

interface ZerionNftPortfolioBody {
  data?: {
    attributes?: {
      positions_distribution_by_chain?: Record<string, number>;
    };
  };
}

class ZerionRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfter?: string
  ) {
    super(message);
  }
}

const optionalFiniteNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const retryDelayMs = (headers: Headers): number => {
  const reset =
    headers.get("retry-after") ??
    headers.get("ratelimit-org-second-reset") ??
    "1";
  const seconds = Number(reset);
  return Number.isFinite(seconds)
    ? Math.min(Math.max(seconds * 1_000, 250), 5_000)
    : 1_000;
};

const getErrorMessage = (body: unknown, status: number): string => {
  const firstError = (body as ZerionErrorBody | undefined)?.errors?.[0];
  return (
    firstError?.detail || firstError?.title || `Zerion responded with ${status}`
  );
};

const fetchZerion = async <T>({
  path,
  apiKey,
}: {
  path: string;
  apiKey: string;
}): Promise<{ body?: T; pending: boolean }> => {
  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    const response = await fetch(`${ZERION_API_URL}${path}`, {
      headers: {
        accept: "application/json",
        authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    if (response.ok) {
      return { body: body as T, pending: response.status === 202 };
    }

    if (response.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
      await wait(retryDelayMs(response.headers));
      continue;
    }

    throw new ZerionRequestError(
      getErrorMessage(body, response.status),
      response.status,
      response.headers.get("retry-after") ?? undefined
    );
  }

  throw new ZerionRequestError("Zerion request retry limit reached", 429);
};

const mapPosition = (
  position: NonNullable<ZerionPositionBody["data"]>[number]
): ZerionDefiPosition | undefined => {
  const attributes = position.attributes ?? {};
  const info = attributes.fungible_info ?? {};
  const quantity = attributes.quantity;
  const protocol =
    attributes.application_metadata?.name || attributes.protocol || undefined;
  const positionType = attributes.position_type || "investment";
  const liquidityDescriptor = `${attributes.protocol_module ?? ""} ${
    attributes.name ?? ""
  }`;
  const isLiquidityPosition =
    /(?:liquidity|liquidity-pool|automated market maker|\bamm\b|\blp\b)/i.test(
      liquidityDescriptor
    );

  // Zerion can classify ordinary Super Token holdings as protocol deposits.
  // They already belong in the wallet balance list and are not DeFi deposits.
  // Keep an actual LP position when Zerion's module/name identifies it as one.
  if (
    positionType === "deposit" &&
    protocol?.toLowerCase().includes("superfluid") &&
    !isLiquidityPosition
  ) {
    return undefined;
  }

  return {
    id: position.id,
    chainId: position.relationships?.chain?.data?.id ?? "unknown",
    name: info.name || attributes.name || "Unknown asset",
    symbol: info.symbol || "—",
    iconUrl: info.icon?.url ?? undefined,
    quantity:
      quantity?.numeric ??
      (quantity?.float !== undefined ? String(quantity.float) : "0"),
    value: optionalFiniteNumber(attributes.value),
    price: optionalFiniteNumber(attributes.price),
    changePercent24h: optionalFiniteNumber(attributes.changes?.percent_1d),
    positionType,
    isLiquidityPosition,
    protocol,
    protocolModule: attributes.protocol_module ?? undefined,
    protocolIconUrl: attributes.application_metadata?.icon?.url ?? undefined,
    groupId: attributes.group_id ?? undefined,
    verified: info.flags?.verified ?? false,
  };
};

const mapNfts = (body?: ZerionNftBody): ZerionNftPosition[] =>
  (body?.data ?? []).flatMap((position) => {
    const nft = mapNft(position);
    return nft ? [nft] : [];
  });

const buildNftPath = (encodedAddress: string, chainId: string) => {
  const parameters = new URLSearchParams({
    currency: "usd",
    sort: "-floor_price",
    "page[size]": String(NFT_PAGE_SIZE),
  });
  parameters.set("filter[chain_ids]", chainId);
  return `/wallets/${encodedAddress}/nft-positions/?${parameters.toString()}`;
};

const encodeNftCursor = (nextUrl?: string | null) =>
  nextUrl ? Buffer.from(nextUrl, "utf8").toString("base64url") : undefined;

const decodeNftCursor = ({
  cursor,
  address,
  chainId,
}: {
  cursor: string;
  address: string;
  chainId: string;
}) => {
  try {
    const nextUrl = new URL(Buffer.from(cursor, "base64url").toString("utf8"));
    const expectedPath = `/v1/wallets/${address}/nft-positions/`;
    const cursorChainId =
      nextUrl.searchParams.get("filter[chain_ids]") ?? undefined;
    if (
      nextUrl.origin !== "https://api.zerion.io" ||
      nextUrl.pathname.toLowerCase() !== expectedPath.toLowerCase() ||
      cursorChainId !== chainId ||
      nextUrl.searchParams.get("page[size]") !== String(NFT_PAGE_SIZE)
    ) {
      throw new Error("Cursor does not match this NFT query");
    }

    return `${nextUrl.pathname.slice("/v1".length)}${nextUrl.search}`;
  } catch {
    throw new ZerionRequestError("Invalid NFT cursor", 400);
  }
};

const mapNft = (
  position: NonNullable<ZerionNftBody["data"]>[number]
): ZerionNftPosition | undefined => {
  const attributes = position.attributes ?? {};
  const info = attributes.nft_info ?? {};
  if (info.flags?.is_spam) return undefined;

  return {
    id: position.id,
    chainId: position.relationships?.chain?.data?.id ?? "unknown",
    contractAddress: info.contract_address ?? undefined,
    tokenId: info.token_id ?? undefined,
    name: info.name || "Untitled NFT",
    collectionName: attributes.collection_info?.name ?? undefined,
    imageUrl:
      info.content?.preview?.url ??
      info.content?.detail?.url ??
      attributes.collection_info?.content?.icon?.url ??
      undefined,
    amount:
      attributes.amount !== undefined && attributes.amount !== null
        ? String(attributes.amount)
        : "1",
    value: optionalFiniteNumber(attributes.value),
    price: optionalFiniteNumber(attributes.price),
    interface: info.interface ?? undefined,
  };
};

const sumPositions = (positions: ZerionDefiPosition[], type?: string) =>
  positions.reduce(
    (total, position) =>
      !type || position.positionType === type
        ? total +
          (position.positionType === "loan" ? -1 : 1) * (position.value ?? 0)
        : total,
    0
  );

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<
    | ZerionDefiPortfolioResponse
    | ZerionNftNetworksResponse
    | ZerionNftPageResponse
    | { error: string }
  >
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ZERION_TEST_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: "Zerion is not configured" });
  }

  const { address } = request.body as { address?: unknown };
  if (typeof address !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return response.status(400).json({ error: "Invalid portfolio request" });
  }

  const encodedAddress = encodeURIComponent(address);
  const portfolioPath =
    `/wallets/${encodedAddress}/portfolio` +
    "?currency=usd&filter%5Bpositions%5D=no_filter";
  const positionsPath =
    `/wallets/${encodedAddress}/positions/` +
    "?currency=usd&filter%5Bpositions%5D=only_complex" +
    "&filter%5Btrash%5D=only_non_trash&sort=-value";

  try {
    if (
      (request.body as Partial<ZerionNftNetworksRequest>).nftNetworks === true
    ) {
      const nftPortfolioResult = await fetchZerion<ZerionNftPortfolioBody>({
        path: `/wallets/${encodedAddress}/nft-portfolio?currency=usd`,
        apiKey,
      });

      response.setHeader("Cache-Control", "private, no-store");
      return response.status(200).json({
        provider: "zerion",
        byChain:
          nftPortfolioResult.body?.data?.attributes
            ?.positions_distribution_by_chain ?? {},
        nftsPending: nftPortfolioResult.pending,
      });
    }

    if ((request.body as Partial<ZerionNftPageRequest>).nftPage === true) {
      const { chainId, cursor } = request.body as ZerionNftPageRequest;
      if (
        typeof chainId !== "string" ||
        !/^[a-z0-9-]{1,64}$/.test(chainId) ||
        (cursor !== undefined && typeof cursor !== "string")
      ) {
        return response.status(400).json({ error: "Invalid NFT request" });
      }

      const pagePath = cursor
        ? decodeNftCursor({ cursor, address, chainId })
        : buildNftPath(encodedAddress, chainId);
      const pageResult = await fetchZerion<ZerionNftBody>({
        path: pagePath,
        apiKey,
      });

      response.setHeader("Cache-Control", "private, no-store");
      return response.status(200).json({
        provider: "zerion",
        chainId,
        nfts: mapNfts(pageResult.body),
        nftsPending: pageResult.pending,
        nextNftCursor: encodeNftCursor(pageResult.body?.links?.next),
        pageSize: NFT_PAGE_SIZE,
      });
    }

    // Zerion's entry plan is rate limited per second, so keep enrichment calls
    // sequential and spaced out instead of making the tab throttle itself.
    const portfolioResult = await fetchZerion<ZerionPortfolioBody>({
      path: portfolioPath,
      apiKey,
    });
    await wait(BETWEEN_REQUESTS_MS);

    let positionsResult: Awaited<
      ReturnType<typeof fetchZerion<ZerionPositionBody>>
    >;
    let positionsUnavailable = false;
    try {
      positionsResult = await fetchZerion<ZerionPositionBody>({
        path: positionsPath,
        apiKey,
      });
    } catch (error) {
      positionsUnavailable = true;
      positionsResult = { pending: false };
      console.warn(
        "Zerion DeFi positions were unavailable; returning portfolio overview",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
    const overview = portfolioResult.body?.data?.attributes;
    const positions = (positionsResult.body?.data ?? [])
      .flatMap((position) => {
        const mappedPosition = mapPosition(position);
        return mappedPosition ? [mappedPosition] : [];
      })
      .sort((first, second) => (second.value ?? -1) - (first.value ?? -1));
    const byPositionType = overview?.positions_distribution_by_type ?? {};
    const portfolioTotal =
      optionalFiniteNumber(overview?.total?.positions) ?? 0;
    const walletTotal = optionalFiniteNumber(byPositionType.wallet);
    const defiTotal = positionsUnavailable
      ? walletTotal === undefined
        ? 0
        : portfolioTotal - walletTotal
      : sumPositions(positions);
    const stakedTotal = positionsUnavailable
      ? optionalFiniteNumber(byPositionType.staked) ?? 0
      : sumPositions(positions, "staked");

    response.setHeader("Cache-Control", "private, no-store");
    return response.status(200).json({
      provider: "zerion",
      overview: {
        total: portfolioTotal,
        change24h: optionalFiniteNumber(overview?.changes?.absolute_1d),
        changePercent24h: optionalFiniteNumber(overview?.changes?.percent_1d),
        defiTotal,
        stakedTotal,
        byPositionType,
        byChain: overview?.positions_distribution_by_chain ?? {},
      },
      positions,
      positionsUnavailable,
    });
  } catch (error) {
    console.error(
      "Zerion DeFi portfolio request failed",
      error instanceof Error ? error.message : "Unknown error"
    );
    if (error instanceof ZerionRequestError) {
      if (error.retryAfter) response.setHeader("Retry-After", error.retryAfter);
      const status = [400, 401, 404, 429, 503].includes(error.status)
        ? error.status
        : 502;
      return response.status(status).json({ error: error.message });
    }
    return response.status(502).json({ error: "Unable to reach Zerion" });
  }
}
