import { StrictMode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { bg } from "./api";
import "./styles.css";
import "./picker.css";
import { MESSAGE_SOURCE } from "../shared/messages";

function notifyParent(type: string, extra?: Record<string, unknown>) {
  window.parent.postMessage({ source: MESSAGE_SOURCE, type, ...extra }, "*");
}

function PickerApp() {
  const rootRef = useRef<HTMLDivElement>(null);
  const params = new URLSearchParams(window.location.search);
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean);
  const [items, setItems] = useState<{ id: string; name: string; username: string }[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await bg<{ id: string; name: string; username: string }[]>({
        type: "LIST_CREDENTIALS",
      });
      if (res.ok && res.data) {
        setItems(res.data.filter((i) => ids.includes(i.id)));
      }
      setReady(true);
    })();
  }, [ids]);

  useLayoutEffect(() => {
    if (!ready || !rootRef.current) return;

    const postHeight = () => {
      const el = rootRef.current;
      if (!el) return;
      const height = Math.ceil(el.getBoundingClientRect().height);
      notifyParent("RESIZE_PICKER", { height: height + 2 });
    };

    postHeight();
    const observer = new ResizeObserver(postHeight);
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [ready, items]);

  function pick(id: string) {
    notifyParent("PICK_CREDENTIAL", { id });
  }

  function close() {
    notifyParent("CLOSE_PICKER");
  }

  if (!ready) {
    return (
      <div className="picker" ref={rootRef}>
        <p className="picker__loading">Loading...</p>
      </div>
    );
  }

  return (
    <div className="picker" ref={rootRef}>
      <div className="picker__header">
        <h1 className="picker__title">Choose login</h1>
        <button
          type="button"
          className="picker__close"
          title="Close"
          aria-label="Close"
          onClick={close}
        >
          ×
        </button>
      </div>
      {items.length === 0 ? (
        <p className="picker__empty">No matching logins.</p>
      ) : (
        <ul className="picker__list">
          {items.map((item) => (
            <li
              key={item.id}
              className="picker__item"
              role="button"
              tabIndex={0}
              onClick={() => pick(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pick(item.id);
                }
              }}
            >
              <div className="picker__meta">
                <div className="picker__name">{item.name}</div>
                <div className="picker__user">{item.username}</div>
              </div>
              <button
                type="button"
                className="btn picker__fill"
                onClick={(e) => {
                  e.stopPropagation();
                  pick(item.id);
                }}
              >
                Fill
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PickerApp />
  </StrictMode>
);
