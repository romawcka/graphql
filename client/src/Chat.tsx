import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useMessages } from "./hooks/useMessages";
import { useSendMessage } from "./hooks/useSendMessage";

export function Chat() {
  const { messages, loading, error } = useMessages();
  const { sendMessage, loading: sending } = useSendMessage();
  const { logout } = useAuth();
  const [content, setContent] = useState("");

  if (loading) return <div>Loading messages...</div>;

  return (
    <div>
      <button onClick={logout}>Logout</button>

      {error && (
        <div style={{ color: "red", margin: "10px 0" }}>
          Error: {error.message}
        </div>
      )}

      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            <b>{msg.user.username}:</b> {msg.content}
            <i>{new Date(msg.createdAt).toLocaleTimeString()}</i>
          </li>
        ))}
      </ul>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!content.trim() || sending) return;
          await sendMessage(content);
          setContent("");
        }}
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type message..."
          disabled={sending}
        />
        <button type="submit" disabled={sending || !content.trim()}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
