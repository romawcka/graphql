import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    username: String!
  }

  type Message {
    id: ID!
    content: String!
    createdAt: DateTime!
    user: User!
  }

  type Query {
    me: User
    messages: [Message!]!
    users: [User!]!
  }

  type Mutation {
    register(username: String!, password: String!): String!
    login(username: String!, password: String!): String!
    sendMessage(content: String!): Message!
  }

  type Subscription {
    messageAdded: Message!
  }
`;
