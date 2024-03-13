import { ActionFunctionArgs, json } from "@remix-run/node";
import { createReview } from "../data/product-reviews.server";

export async function action({ request }: ActionFunctionArgs) {
  // get request body from the request object
  const body = await request.json();

  const productReview = {
    productId: body.productId,
    productTitle: body.productTitle,
    userId: body.userId,
    userEmail: body.userEmail,
    userName: body.userName,
    shopId: body.shopId,
    rating: Number(body.rating),
    comment: body.comment,
  };

  const review = await createReview(productReview);

  return json(review, { status: 201 });
}