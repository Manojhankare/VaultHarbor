import { describe, it, expect } from "vitest";
import { parseCsvContent } from "../../src/import/csv";
import { bitwardenAdapter } from "../../src/import/adapters/bitwarden-csv";

describe("bitwarden csv adapter", () => {
  it("parses login and secure note", () => {
    const csv = `folder,favorite,type,name,notes,login_uri,login_username,login_password
Work,0,login,GitHub,,https://github.com,user@example.com,secret
Work,0,note,Recovery,,,,
Notes,0,note,Codes,alpha-beta-gamma,,,`;
    const { headers, rows } = parseCsvContent(csv);
    expect(bitwardenAdapter.canParse(headers)).toBeGreaterThan(0);
    const result = bitwardenAdapter.parse(rows, "Bitwarden");
    const login = result.records.find((r) => r.type === "login");
    const note = result.records.find((r) => r.title === "Codes");
    expect(login?.username).toBe("user@example.com");
    expect(note?.secureNoteContent).toBe("alpha-beta-gamma");
  });

  it("parses secure note type variants", () => {
    const csv = `folder,favorite,type,name,notes,login_uri,login_username,login_password
Work,0,secure note,Recovery codes,secret content,,,`;
    const { rows } = parseCsvContent(csv);
    const result = bitwardenAdapter.parse(rows, "Bitwarden");
    expect(result.records).toHaveLength(1);
    expect(result.records[0]?.type).toBe("secure_note");
    expect(result.records[0]?.secureNoteContent).toBe("secret content");
  });
});
