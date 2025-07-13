import { gql, useMutation } from "@apollo/client";

const SEND_MESSAGE = gql`
  mutation SendMessage($content: String!) {
    sendMessage(content: $content) {
      id
      content
      createdAt
      user {
        username
      }
    }
  }
`;

const MESSAGES_QUERY = gql`
  query {
    messages {
      id
      content
      createdAt
      user {
        username
      }
    }
  }
`;

// Custom hook for sending messages
export function useSendMessage() {
  const [sendMessageMutation, { loading, error }] = useMutation(SEND_MESSAGE, {
    update: (cache, { data }) => {
      if (data?.sendMessage) {
        const existingMessages = cache.readQuery({ query: MESSAGES_QUERY });
        if (existingMessages && (existingMessages as any).messages) {
          cache.writeQuery({
            query: MESSAGES_QUERY,
            data: {
              messages: [
                ...(existingMessages as any).messages,
                data.sendMessage,
              ],
            },
          });
        }
      }
    },
  });

  // Send message function
  const sendMessage = async (content: string) => {
    await sendMessageMutation({ variables: { content } });
  };

  return { sendMessage, loading, error };
}
