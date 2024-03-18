import {
  AdminBlock,
  BlockStack,
  Divider,
  Text,
  reactExtension,
  useApi,
} from '@shopify/ui-extensions-react/admin';
import { useEffect, useState } from 'react';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.product-details.block.render';

export default reactExtension(TARGET, () => <App />);

const FeedbackCard = ({ feedback }) => (
  <>
    <BlockStack>
      <Text>User ID: {feedback.userId}</Text>
      <Text>Rating: {'❤'.repeat(parseInt(feedback.rating))}</Text>
      <Text>Comment: {feedback.comment}</Text>
    </BlockStack>
    <Divider />
  </>
);

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  const { i18n, query, data } = useApi(TARGET);
  const [reviews, setReviews] = useState([]);

  const productId = data.selected[0].id

  useEffect(() => {
    const fetchReviews = async () => {
      const reviews = await query(`
        #graphql
        query Product($id: ID!) {
          product(id: $id) {
            metafield(namespace: "reviews", key: "review") {
              value
            }
          }
        }
      `, {
        variables: {
          id: `${productId}`
        }
      })

      return reviews
    }

    fetchReviews().then((res: any) => {
      if (res?.data?.product?.metafield?.value) {
        setReviews(JSON.parse(res.data.product.metafield.value))
      }
    })
  }, [])

  return (
    // The AdminBlock component provides an API for setting the title of the Block extension wrapper.
    <AdminBlock title="Product Reviews">
      <BlockStack>
        {
          reviews ? reviews.map((review, index) => (
            <FeedbackCard key={index} feedback={review} />
          )) : <Text>No reviews yet</Text>
        }
      </BlockStack>
    </AdminBlock>
  );
}