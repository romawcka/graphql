import { gql, useQuery, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";

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

const MESSAGE_ADDED = gql`
  subscription {
    messageAdded {
      id
      content
      createdAt
      user {
        username
      }
    }
  }
`;

export function useMessages() {
  const { data, loading, error } = useQuery(MESSAGES_QUERY, {
    onCompleted: (data) => {
      console.log("Messages query completed:", data);
    },
    onError: (error) => {
      console.error("Messages query error:", error);
    },
  });
  const { data: subData, error: subError } = useSubscription(MESSAGE_ADDED, {
    onData: ({ data }) => {
      console.log("Subscription data received:", data);
    },
    onError: (error) => {
      console.error("Subscription error:", error);
    },
  });
  const [messages, setMessages] = useState<any[]>([]);

  // Load initial messages
  useEffect(() => {
    if (data?.messages) {
      console.log("Setting initial messages:", data.messages);
      setMessages(data.messages);
    }
  }, [data]);

  // Add new message from subscription
  useEffect(() => {
    if (subData?.messageAdded) {
      console.log(
        "Adding new message from subscription:",
        subData.messageAdded
      );
      setMessages((prev) => {
        // Проверяем, что сообщение еще не добавлено
        const messageExists = prev.some(
          (msg) => msg.id === subData.messageAdded.id
        );
        if (!messageExists) {
          return [...prev, subData.messageAdded];
        }
        return prev;
      });
    }
  }, [subData]);

  // Log subscription errors for debugging
  useEffect(() => {
    if (subError) {
      console.error("Subscription error:", subError);
    }
  }, [subError]);

  return { messages, loading, error: error || subError };
}
