import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// HTTP endpoint
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  headers: {
    authorization: localStorage.getItem("token")
      ? `Bearer ${localStorage.getItem("token")}`
      : "",
  },
});

// WebSocket endpoint
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4001/graphql",
    connectionParams: () => ({
      authorization: localStorage.getItem("token")
        ? `Bearer ${localStorage.getItem("token")}`
        : "",
    }),
    retryAttempts: 3,
    shouldRetry: () => true,
    on: {
      connecting: () => console.log("WebSocket: Connecting..."),
      connected: () => console.log("WebSocket: Connected!"),
      error: (error) => console.error("WebSocket error:", error),
      closed: () => console.log("WebSocket: Connection closed"),
    },
  })
);

// split for separating HTTP и WS requests
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          messages: {
            merge: false, // Do not merge arrays automatically
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
