import { AUTHOR } from "../../shared/author";

export function AuthorFooter() {
  return (
    <footer className="author-footer">
      <span className="muted">{AUTHOR.credit}</span>
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
