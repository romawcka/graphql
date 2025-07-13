import { gql, useMutation } from "@apollo/client";

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

const REGISTER = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password)
  }
`;

// Custom hook for authentication (login/register)
export function useAuth() {
  const [loginMutation] = useMutation(LOGIN);
  const [registerMutation] = useMutation(REGISTER);

  // Login function
  const login = async (username: string, password: string) => {
    const { data } = await loginMutation({ variables: { username, password } });
    if (data?.login) {
      localStorage.setItem("token", data.login);
      return true;
    }
    return false;
  };

  // Register function
  const register = async (username: string, password: string) => {
    const { data } = await registerMutation({
      variables: { username, password },
    });
    if (data?.register) {
      localStorage.setItem("token", data.register);
      return true;
    }
    return false;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return { login, register, logout };
}
