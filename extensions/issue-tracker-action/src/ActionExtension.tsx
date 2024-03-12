import {
  AdminAction,
  Banner,
  BlockStack,
  Button,
  InlineStack,
  ProgressIndicator,
  Text,
  TextArea,
  TextField,
  reactExtension,
  useApi
} from "@shopify/ui-extensions-react/admin";
import { useCallback, useEffect, useState } from "react";
import { getIssues, updateIssues } from "./utils";

function generateId(allIssues) {
  return !allIssues?.length ? 0 : allIssues[allIssues.length - 1].id + 1;
};

function validateForm({ title, description }) {
  return {
    isValid: Boolean(title) && Boolean(description),
    errors: {
      title: !title,
      description: !description,
    },
  };
};

// The target used here must match the target used in the extension's .toml file at ./shopify.extension.toml
const TARGET = "admin.product-details.action.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  const { close, data, intents } = useApi(TARGET);
  const issueId = intents?.launchUrl
    ? new URL(intents?.launchUrl)?.searchParams?.get("issueId")
    : null;
  const [loading, setLoading] = useState(issueId ? true : false);
  const [issue, setIssue] = useState({ title: "", description: "", id: undefined, createdAt: new Date() });
  const [allIssues, setAllIssues] = useState([]);
  const [formErrors, setFormErrors] = useState(null);
  const { title, description, id } = issue;
  const isEditing = id !== undefined;
  const [loadingRecommended, setLoadingRecommended] = useState(false);

  useEffect(() => {
    getIssues(data.selected[0].id).then((issues) => {
      setLoading(false);
      setAllIssues(issues || []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = useCallback(async () => {
    const { isValid, errors } = validateForm(issue);
    setFormErrors(errors);

    if (isValid) {
      const newIssues = [...allIssues];
      if (isEditing) {
        // Find the index of the issue that you're editing
        const editingIssueIndex = newIssues.findIndex(
          (listIssue) => listIssue.id == issue.id
        );
        // Overwrite that issue's title and description with the new ones
        newIssues[editingIssueIndex] = {
          ...issue,
          title,
          description,
        };
      } else {
        // Add a new issue at the end of the list
        newIssues.push({
          id: generateId(allIssues),
          title,
          description,
          completed: false,
          createdAt: new Date(),
        });
      }
      // Commit changes to the database
      await updateIssues(data.selected[0].id, newIssues);
      // Close the modal using the 'close' API
      close();
    }
  }, [issue, allIssues, isEditing, data.selected, close, title, description]);

  const getIssueRecommendation = useCallback(async () => {
    // Get a recommended issue title and description from your app's backend
    setLoadingRecommended(true);
    // fetch is automatically authenticated and the path is resolved against your app's URL
    const res = await fetch(
      `api/recommendedProductIssue?productId=${data.selected[0].id}`,
    );
    setLoadingRecommended(false);

    if (!res.ok) {
      console.error("Network error");
    }
    const json = await res.json();
    if (json?.productIssue) {
      // If you get an recommendation, then update the title and description fields
      setIssue(json?.productIssue);
    }
  }, [data.selected]);

  useEffect(() => {
    if (issueId) {
      // If opened from the block extension, you find the issue that's being edited
      const editingIssue = allIssues.find(({ id }) => `${id}` === issueId);
      if (editingIssue) {
        // Set the issue's ID in the state
        setIssue(editingIssue);
      }
    }
  }, [issueId, allIssues]);

  if (loading) {
    return <></>;
  }

  return (
    <AdminAction
      title={isEditing ? "Edit your issue" : "Create an issue"}
      primaryAction={
        <Button onPress={onSubmit}>{isEditing ? "Save" : "Create"}</Button>
      }
      secondaryAction={<Button onPress={close}>Cancel</Button>}
    >

      {/*Create a banner to let the buyer auto fill the issue with the
    recommendation from the backend*/}
      <BlockStack gap="base">
        <Banner>
          <BlockStack gap="base">
            <Text>
              Automatically fill the issue based on past customer feedback
            </Text>
            <InlineStack blockAlignment="center" gap="base">
              {/*When the button is pressed, fetch the reccomendation*/}
              <Button
                onPress={getIssueRecommendation}
                disabled={loadingRecommended}
              >
                Generate issue
              </Button>
              {loadingRecommended && <ProgressIndicator size="small-100" />}
            </InlineStack>
          </BlockStack>
        </Banner>

        <TextField
          value={title}
          error={formErrors?.title ? "Please enter a title" : undefined}
          onChange={(val) => setIssue((prev) => ({ ...prev, title: val }))}
          label="Title"
        />

        <TextArea
          value={description}
          error={
            formErrors?.description ? "Please enter a description" : undefined
          }
          onChange={(val) =>
            setIssue((prev) => ({ ...prev, description: val }))
          }
          label="Description"
        />
      </BlockStack>
    </AdminAction>
  );
}
