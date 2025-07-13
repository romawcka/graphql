import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { makeExecutableSchema } from "@graphql-tools/schema";
import bcrypt from "bcryptjs";
import { GraphQLScalarType, Kind } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { useServer } from "graphql-ws/lib/use/ws";
import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";
import { typeDefs } from "./schema";
import { Message, User } from "./types";
const JWT_SECRET = "supersecret";
// Global PubSub instance
declare global {
  var pubsub: any;
}

// In-memory storage
const users: User[] = [];
const messages: Message[] = [];

// Custom scalar for DateTime
const DateTime = new GraphQLScalarType({
  name: "DateTime",
  description: "DateTime custom scalar",
  parseValue(value: any) {
    return new Date(value);
  },
  serialize(value: any) {
    return value.toISOString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});

// Helper: get user from token
const getUser = (token?: string) => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return users.find((u) => u.id === decoded.id) || null;
  } catch {
    return null;
  }
};

// Create PubSub instance
const pubsub = new PubSub() as any;
global.pubsub = pubsub;

// Resolvers
const resolvers = {
  DateTime,
  Query: {
    me: (_: any, __: any, { user }: any) => user,
    messages: () => messages,
    users: () => users,
  },
  Mutation: {
    register: async (
      _: any,
      { username, password }: { username: string; password: string }
    ) => {
      if (users.find((u) => u.username === username))
        throw new Error("User exists");
      const hash = await bcrypt.hash(password, 10);
      const user: User = {
        id: String(users.length + 1),
        username,
        password: hash,
      };
      users.push(user);
      return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
    },
    login: async (
      _: any,
      { username, password }: { username: string; password: string }
    ) => {
      const user = users.find((u) => u.username === username);
      if (!user) throw new Error("No user");
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Wrong password");
      return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
    },
    sendMessage: (
      _: any,
      { content }: { content: string },
      { user }: { user: User }
    ) => {
      if (!user) throw new Error("Not authenticated");
      const message: Message = {
        id: String(messages.length + 1),
        content,
        createdAt: new Date(),
        user,
      };
      messages.push(message);
      // Publish to WebSocket subscribers
      console.log(`Publishing message: ${message.id} from ${user.username}`);
      global.pubsub.publish("MESSAGE_ADDED", { messageAdded: message });
      return message;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: () => {
        console.log("New subscription to messageAdded");
        return global.pubsub.asyncIterableIterator(["MESSAGE_ADDED"]);
      },
    },
  },
  Message: {
    user: (msg: Message) => users.find((u) => u.id === msg.user.id),
  },
};

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Apollo Server
const server = new ApolloServer({
  schema,
});

// Start HTTP server
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const authHeader = req.headers.authorization;
    const token = typeof authHeader === "string" ? authHeader : "";
    const user = getUser(token.replace("Bearer ", ""));
    return { user };
  },
});

console.log(` Server ready at ${url}`);

// Create WebSocket server for subscriptions
const wsServer = new WebSocketServer({
  port: 4001,
  path: "/graphql",
});

// Set up WebSocket server
useServer(
  {
    schema,
    context: async (ctx: any) => {
      const authParam = ctx.connectionParams?.authorization;
      const token = typeof authParam === "string" ? authParam : "";
      const user = getUser(token.replace("Bearer ", ""));

      return { user };
    },
  },
  wsServer
);

console.log(`🚀 Subscriptions ready at ws://localhost:4001/graphql`);
