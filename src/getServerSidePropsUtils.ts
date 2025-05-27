import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { ParsedUrlQuery } from "querystring";

// Define a type for the props that will be injected
// Cookies will now be a string (raw cookie string from headers)
export interface WithCookiesProps {
  cookies: string;
}

/**
 * A higher-order function to wrap GetServerSideProps and inject the raw cookie string
 * from request headers into the page props.
 *
 * @param originalGetServerSideProps Optional existing GetServerSideProps function for the page.
 * @returns A new GetServerSideProps function that includes the raw cookie string in the props if props are returned.
 */
export function withCookiesServerSideProps<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery
>(
  originalGetServerSideProps?: GetServerSideProps<P, Q>
): GetServerSideProps<P & WithCookiesProps, Q> {
  return async (
    context: GetServerSidePropsContext<Q>
  ): Promise<GetServerSidePropsResult<P & WithCookiesProps>> => {
    // Get the raw cookie string from headers, or an empty string if not present.
    const cookiesHeaderString = context.req.headers.cookie || "";

    // Optional: You can log the cookie header string if needed for debugging
    // console.log({ cookiesHeaderString });

    if (!originalGetServerSideProps) {
      // No original getServerSideProps, just return the cookie header string
      return {
        props: { cookies: cookiesHeaderString } as P & WithCookiesProps,
      };
    }

    const originalResult = await originalGetServerSideProps(context);

    if ("props" in originalResult) {
      // Original function returned props, merge cookie header string in
      const resolvedProps = await originalResult.props; // Props can be a promise
      return {
        ...originalResult,
        props: {
          ...resolvedProps,
          cookies: cookiesHeaderString,
        },
      };
    } else {
      // Original function returned redirect or notFound, pass it through
      // The result type GetServerSidePropsResult<P & WithCookiesProps>
      // accommodates Redirect or NotFound results directly.
      return originalResult as GetServerSidePropsResult<P & WithCookiesProps>;
    }
  };
}