import "./App.css";
import { AuthForm } from "./AuthForm";
import { Chat } from "./Chat";

function App() {
  const token = localStorage.getItem("token");

  return <div>{token ? <Chat /> : <AuthForm />}</div>;
}

export default App;
