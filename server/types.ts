export interface User {
  id: string;
  username: string;
  password: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
}
