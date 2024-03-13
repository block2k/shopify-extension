import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
// import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import "@shopify/polaris/build/esm/styles.css";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { useState } from "react";
import { DiscountProvider } from "../components/providers/DiscountProvider";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const url = new URL(request.url);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "", host: url.searchParams.get("host") });
};

export default function App() {
  const { apiKey, host } = useLoaderData<typeof loader>();
  const [config] = useState({ host, apiKey });

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      {/* <AppBridgeProvider config={config}> */}
        <DiscountProvider>
          <ui-nav-menu>
            <Link to="/app" rel="home">
              Home
            </Link>
            <Link to="/app/additional">Additional page</Link>
            <Link to="/app/qrcodes/new">Create QRCode</Link>
            <Link to="/app/products/reviews">Product Reviews</Link>
          </ui-nav-menu>
          <Outlet />
        </DiscountProvider>
      {/* </AppBridgeProvider> */}
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};