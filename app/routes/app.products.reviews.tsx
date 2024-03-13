import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, DataTable, Link, Page } from "@shopify/polaris";
import { getProductReviews } from "~/data/product-reviews.server";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session, sessionToken, } = await authenticate.admin(request);
  const shop = session.shop;

  return getProductReviews(shop);
}

export default function AppProductsReviews() {
  const loaderData = useLoaderData<typeof loader>();
  const rows = loaderData.reviews.map((review) => {
    return [
      <Link
        removeUnderline
        url={`${review.productId}`}
      >
        {review.productTitle}
      </Link>,
      review.userEmail,
      review.userName,
      review.rating + ' stars',
      new Date(review.createdAt).toLocaleDateString(),
    ];
  });

  return (
    <Page title="List Products Rating">
      <Card>
        <DataTable
          showTotalsInFooter
          columnContentTypes={[
            'text',
            'text',
            'text',
            'numeric',
            'text',
          ]}
          headings={[
            'Product',
            'User Email',
            'User Name',
            'Rating',
            'Date',
          ]}
          rows={rows}
          totals={['', '', '', '', `${loaderData.averageRating.toFixed(1)} stars`]}
          totalsName={{
            singular: 'Average rating',
            plural: 'Average rating',
          }}
          pagination={{
            hasNext: true,
            onNext: () => { },
          }}
        />
      </Card>
    </Page>
  );
}