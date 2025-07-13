import { useState } from "react";
import { gql, useMutation } from "@apollo/client";

const REGISTER = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password)
  }
`;

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

export function AuthForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [register] = useMutation(REGISTER);
  const [login] = useMutation(LOGIN);

  const handleAuth = async (isLogin: boolean) => {
    const fn = isLogin ? login : register;
    const { data } = await fn({ variables: { username, password } });
    const token = data[isLogin ? "login" : "register"];
    localStorage.setItem("token", token);
    window.location.reload();
  };

  return (
    <div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
      />
      <button onClick={() => handleAuth(true)}>Login</button>
      <button onClick={() => handleAuth(false)}>Register</button>
    </div>
  );
}
