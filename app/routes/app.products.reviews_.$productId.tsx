import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { getReviewsByProductId } from "~/data/product-reviews.server";
import { authenticate } from "~/shopify.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { admin, session, sessionToken, } = await authenticate.admin(request);
  const shop = session.shop;

  const productId = params.productId;

  return getReviewsByProductId(productId);
}

export default function ReviewsPage() {
  const loaderData = useLoaderData<typeof loader>();
  console.log("🚀 ~ ListReviewsByProductPage ~ loaderData:", loaderData)

  return (
    <Page>
      <h1>{loaderData[0].productTitle}</h1>
      <ul>
        {loaderData.map((review) => (
          <li key={review.id}>
            <h3>{review.rating} stars</h3>
            <h3>{review.userName} ({review.userEmail})</h3>
            <text>{review.comment}</text>
          </li>
        ))}
      </ul>
    </Page>
  );
}