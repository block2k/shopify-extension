import db from "../db.server";

type ProductReview = {
  productId: string;
  rating: number;
  productTitle: string;
  comment: string;
  shopId: string
  userEmail: string
  userId: string
  userName: string
};

export async function getProductReviews(shopId: string) {
  // const reviews = await db.productReview.findMany({
  //   where: {
  //     shopId
  //   }
  // });

  // select distinct on productId
  const reviews = await db.productReview.findMany({
    where: {
      shopId
    },
    distinct: ['productId']
  });

  const averageRating = await db.productReview.aggregate({
    _avg: {
      rating: true
    },
    where: {
      shopId
    }
  });

  return {
    reviews,
    averageRating: averageRating._avg.rating
  };
}

export async function createReview(data: ProductReview) {
  return db.productReview.create({
    data: {
      productId: data.productId,
      productTitle: data.productTitle,
      rating: data.rating,
      shopId: data.shopId,
      userEmail: data.userEmail,
      userId: data.userId,
      userName: data.userName,
      comment: data.comment,
    }
  });
}

export async function getReviewsByProductId(productId: string) {
  return db.productReview.findMany({
    where: {
      productId
    }
  });
}