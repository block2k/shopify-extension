import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Card, Divider, Layout, Page, Text } from "@shopify/polaris";
import { getReviewsByProductId } from "~/data/product-reviews.server";
import { authenticate } from "~/shopify.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { admin, session, sessionToken, } = await authenticate.admin(request);
  const shop = session.shop;

  const productId = params.productId;

  const productReviews = await getReviewsByProductId(productId);

  return {
    productId,
    reviews: productReviews
  }
}

export default function ReviewsPage() {
  const loaderData = useLoaderData<typeof loader>();
  console.log("🚀 ~ ListReviewsByProductPage ~ loaderData:", loaderData)

  return (
    <Page>
      <Layout.Section>
        <Card>
          <BlockStack gap='500'>
            <Text as={"h2"} variant="headingLg">
              Product ID: {loaderData.productId}
            </Text>
            <Divider />
            <BlockStack gap='100'>
              {loaderData.reviews.map((review) => (
                <Card key={review.id}>
                  <BlockStack gap='150'>
                    <Text as={"h3"} variant="bodyMd">
                      {review.userName} ({review.userEmail})
                    </Text>
                    <Text as={"h3"} variant="bodyMd">
                      {/* print stars */}
                      {Array.from({ length: review.rating }, (_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </Text>
                    <Text as={"p"}>{review.comment}</Text>
                  </BlockStack>
                </Card>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Page>
  );
}