import { useEffect, useState } from "react";
import { bg } from "../api";
import { DEFAULT_GEN_OPTIONS } from "../../password-generator/generator";
import type { PasswordGenOptions } from "../../shared/messages";

type Props = {
  onBack: () => void;
  onUse?: (password: string) => void;
};

export function PasswordGenerator({ onBack, onUse }: Props) {
  const [options, setOptions] = useState<PasswordGenOptions>(DEFAULT_GEN_OPTIONS);
  const [password, setPassword] = useState("");

  async function regenerate(opts = options) {
    const res = await bg<string>({ type: "GENERATE_PASSWORD", options: opts });
    if (res.ok && res.data) setPassword(res.data);
  }

  useEffect(() => {
    void regenerate();
  }, []);

  function toggle(key: keyof PasswordGenOptions) {
    if (key === "length") return;
    const next = { ...options, [key]: !options[key] };
    setOptions(next);
    void regenerate(next);
  }

  return (
    <div className="app">
      <div className="header">
        <button type="button" className="link" onClick={onBack}>
          ← Back
        </button>
        <h1>Generator</h1>
      </div>
      <div className="field">
        <label htmlFor="len">Length: {options.length}</label>
        <input
          id="len"
          type="range"
          min={8}
          max={64}
          value={options.length}
          onChange={(e) => {
            const next = { ...options, length: Number(e.target.value) };
            setOptions(next);
            void regenerate(next);
          }}
        />
      </div>
      <label>
        <input type="checkbox" checked={options.uppercase} onChange={() => toggle("uppercase")} /> Uppercase
      </label>
      <br />
      <label>
        <input type="checkbox" checked={options.lowercase} onChange={() => toggle("lowercase")} /> Lowercase
      </label>
      <br />
      <label>
        <input type="checkbox" checked={options.numbers} onChange={() => toggle("numbers")} /> Numbers
      </label>
      <br />
      <label>
        <input type="checkbox" checked={options.symbols} onChange={() => toggle("symbols")} /> Symbols
      </label>
      <br />
      <label>
        <input type="checkbox" checked={options.excludeAmbiguous} onChange={() => toggle("excludeAmbiguous")} /> Exclude ambiguous
      </label>
      <div className="section" style={{ marginTop: 12, wordBreak: "break-all" }}>
        {password || "..."}
      </div>
      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => void regenerate()}>
          Regenerate
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => void bg({ type: "COPY_TO_CLIPBOARD", text: password })}>
          Copy
        </button>
        {onUse && (
          <button type="button" className="btn" onClick={() => onUse(password)}>
            Use
          </button>
        )}
      </div>
    </div>
  );
}
