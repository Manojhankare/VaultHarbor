import { StrictMode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { bg } from "./api";
import "./styles.css";
import "./picker.css";
import { MESSAGE_SOURCE } from "../shared/messages";
import { faviconChain, isGenericGoogleFavicon } from "../shared/favicon";
import { IconChevronRight, IconSettings } from "./components/icons/Icon";
import { openVaultAppTab } from "../shared/open-vault-tab";
import {
  pickerPrimaryLabel,
  pickerSecondaryLabel,
  type PickerItem,
} from "./picker-display";

const params = new URLSearchParams(window.location.search);
const pickerTheme = params.get("theme") === "light" ? "light" : "dark";
const pageIcon = params.get("pageIcon");
document.documentElement.dataset.pickerTheme = pickerTheme;
document.documentElement.style.colorScheme = pickerTheme;

function notifyParent(type: string, extra?: Record<string, unknown>) {
  window.parent.postMessage({ source: MESSAGE_SOURCE, type, ...extra }, "*");
}

function PickerFavicon({ uri }: { uri: string }) {
  const chain = faviconChain(uri, pageIcon);
  const [index, setIndex] = useState(0);
  const src = chain[Math.min(index, chain.length - 1)] ?? chain[0];

  function advance() {
    setIndex((i) => (i + 1 < chain.length ? i + 1 : i));
  }

  return (
    <img
      className="picker__favicon"
      src={src}
      alt=""
      width={20}
      height={20}
      onError={advance}
      onLoad={(e) => {
        if (isGenericGoogleFavicon(e.currentTarget)) advance();
      }}
    />
  );
}

function PickerApp() {
  const rootRef = useRef<HTMLDivElement>(null);
  const idsParam = params.get("ids") ?? "";
  const [items, setItems] = useState<PickerItem[]>([]);
  const [ready, setReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const ids = idsParam.split(",").filter(Boolean);
    void (async () => {
      const res = await bg<PickerItem[]>({
        type: "LIST_CREDENTIALS",
      });
      if (res.ok && res.data) {
        setItems(res.data.filter((i) => ids.includes(i.id)));
      }
      setReady(true);
    })();
  }, [idsParam]);

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

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

  useEffect(() => {
    function onMsg(event: MessageEvent) {
      const data = event.data as {
        source?: string;
        type?: string;
        direction?: string;
      };
      if (data?.source !== MESSAGE_SOURCE || data.type !== "PICKER_NAV") return;
      if (items.length === 0) return;
      if (data.direction === "next") {
        setActiveIndex((i) => (i + 1) % items.length);
      } else if (data.direction === "prev") {
        setActiveIndex((i) => (i - 1 + items.length) % items.length);
      } else if (data.direction === "confirm") {
        const item = items[activeIndex];
        if (item) pick(item.id);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [items, activeIndex]);

  useEffect(() => {
    document
      .getElementById(`picker-opt-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function pick(id: string) {
    notifyParent("PICK_CREDENTIAL", { id });
  }

  function close() {
    notifyParent("CLOSE_PICKER");
  }

  function openVault() {
    void openVaultAppTab();
    close();
  }

  if (!ready) {
    return (
      <div className="picker" ref={rootRef}>
        <p className="picker__loading">Loading…</p>
      </div>
    );
  }

  return (
    <div className="picker" ref={rootRef}>
      {items.length === 0 ? (
        <p className="picker__empty">No matching logins.</p>
      ) : (
        <ul className="picker__list" role="listbox" aria-label="VaultHarbor logins">
          {items.map((item, index) => {
            const primary = pickerPrimaryLabel(item);
            const secondary = pickerSecondaryLabel(item);
            const active = index === activeIndex;
            return (
              <li
                key={item.id}
                id={`picker-opt-${index}`}
                className={
                  active ? "picker__item picker__item--active" : "picker__item"
                }
                role="option"
                aria-selected={active}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => pick(item.id)}
              >
                <PickerFavicon uri={item.uri} />
                <div className="picker__meta">
                  <div className="picker__primary">{primary}</div>
                  {secondary ? (
                    <div className="picker__secondary">{secondary}</div>
                  ) : null}
                </div>
                <span className="picker__chevron" aria-hidden="true">
                  <IconChevronRight size={14} />
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <div className="picker__footer">
        <img src="/icons/icon128.png" alt="" width={14} height={14} />
        <span className="picker__brand">VaultHarbor</span>
        <div className="picker__footer-actions">
          <button
            type="button"
            className="picker__icon-btn"
            title="Manage vault"
            aria-label="Manage vault"
            onClick={openVault}
          >
            <IconSettings size={13} />
          </button>
          <button
            type="button"
            className="picker__icon-btn"
            title="Close"
            aria-label="Close"
            onClick={close}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PickerApp />
  </StrictMode>
);
