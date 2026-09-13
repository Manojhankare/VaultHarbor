import { AUTHOR } from "../../shared/author";
import { extensionVersionLabel } from "../../shared/extension-version";

export function AuthorFooter() {
  const version = extensionVersionLabel();

  return (
    <footer className="author-footer">
      <span className="muted">{AUTHOR.credit}</span>
      {version ? (
        <>
          <span className="author-footer__sep">·</span>
          <span className="muted" title="Extension version">
            {version}
          </span>
        </>
      ) : null}
      <span className="author-footer__sep">·</span>
      <a
        className="link author-footer__link"
        href={AUTHOR.site}
        target="_blank"
        rel="noopener noreferrer"
      >
        {AUTHOR.siteLabel}
      </a>
    </footer>
  );
}
