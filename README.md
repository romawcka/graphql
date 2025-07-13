# GraphQL Chat Application

A chat application using GraphQL, Apollo Client, WebSocket subscriptions, and React.

## Problem and Solution

**Problem:** Messages were not displayed immediately on the frontend; a page reload was required.

**Causes and Solutions:**

1. **Apollo Client cache not updating** – cache update after mutation was added in `useSendMessage`
2. **WebSocket subscription issues** – improved error handling and authentication
3. **Duplicate messages** – added a check to prevent adding the same message twice

## Getting Started

### 1. Start the server

```bash
cd server
npm install
npm start
```

The server will run at:

- HTTP: http://localhost:4000
- WebSocket: ws://localhost:4001/graphql

### 2. Start the client

```bash
cd client
npm install
npm start
```

The client will run at http://localhost:3000

## Key Changes

### 1. Apollo Client cache update in useSendMessage

```typescript
const [sendMessageMutation, { loading, error }] = useMutation(SEND_MESSAGE, {
  update: (cache, { data }) => {
    if (data?.sendMessage) {
      const existingMessages = cache.readQuery({ query: MESSAGES_QUERY });
      if (existingMessages && (existingMessages as any).messages) {
        cache.writeQuery({
          query: MESSAGES_QUERY,
          data: {
            messages: [...(existingMessages as any).messages, data.sendMessage],
          },
        });
      }
    }
  },
});
```

### 2. Improved subscription handling

```typescript
useEffect(() => {
  if (subData?.messageAdded) {
    setMessages((prev) => {
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
```

### 3. Apollo Client configuration

```typescript
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
```
