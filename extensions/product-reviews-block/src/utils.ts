export const getReviews = async (productId: string) => {
  const response = await fetch(`/admin/api/2024-01?productId=${productId}`);
  return response.json();
};