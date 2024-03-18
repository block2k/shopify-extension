import { ActionFunctionArgs, json } from "@remix-run/node";
import { unauthenticated } from "../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();

  const { admin } = await unauthenticated.admin(body.shopId);

  const oldReviews = await admin.graphql(
    `#graphql
    query Product($id: ID!) {
      product(id: $id) {
        metafield(namespace: "reviews", key: "review") {
          value
        }
      }
    }
  `,
    {
      variables: {
        id: 'gid://shopify/Product/' + body.productId,
      },
    },
  ).then((response) => {
    return response.json();
  })
    .then((data) => {
      return data.data.product.metafield === null ? [] : JSON.parse(data.data.product.metafield.value);
    })
    .catch((error) => {
      console.error(error);
      throw new Error("Failed to fetch old reviews");
    });

  const newReviews = [...oldReviews, {
    userId: body.userId,
    rating: body.rating,
    comment: body.comment,
  }]

  const response = await admin.graphql(
    `#graphql
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          key
          namespace
          value
          createdAt
          updatedAt
        }
        userErrors {
          field
          message
          code
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            ownerId: "gid://shopify/Product/" + body.productId,
            namespace: "reviews",
            key: "review",
            type: "json",
            value: JSON.stringify(newReviews),
          },
        ],
      },
    },
  );

  const data = await response.json();

  return json(
    {
      data,
    },
    { status: 201 },
  );
}
