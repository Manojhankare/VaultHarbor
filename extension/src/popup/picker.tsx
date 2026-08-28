import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthorFooter } from "./components/AuthorFooter";
import { bg } from "./api";
import "../popup/styles.css";
import { MESSAGE_SOURCE } from "../shared/messages";

function PickerApp() {
  const params = new URLSearchParams(window.location.search);
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean);
  const [items, setItems] = useState<{ id: string; name: string; username: string }[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await bg<{ id: string; name: string; username: string }[]>({
        type: "LIST_CREDENTIALS",
      });
      if (res.ok && res.data) {
        setItems(res.data.filter((i) => ids.includes(i.id)));
      }
    })();
  }, [ids]);

  function pick(id: string) {
    window.parent.postMessage(
      { source: MESSAGE_SOURCE, type: "PICK_CREDENTIAL", id },
      "*"
    );
  }

  return (
    <div className="app">
      <h1 style={{ fontSize: 16 }}>Choose login</h1>
      <ul className="list">
        {items.map((item) => (
          <li key={item.id} className="list-item">
            <div className="name">{item.name}</div>
            <div className="domain">{item.username}</div>
            <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => pick(item.id)}>
              Fill
            </button>
          </li>
        ))}
      </ul>
      <AuthorFooter />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PickerApp />
  </StrictMode>
);
