"""Shared HTML helpers for VaultSync public pages."""

from __future__ import annotations

SITE_URL = "https://vaultsync.manojhankare.in"
GITHUB_REPO = "https://github.com/Manojhankare/VaultSync"
GITHUB_RELEASES = "https://github.com/Manojhankare/VaultSync/releases"
GITHUB_RAW = "https://raw.githubusercontent.com/Manojhankare/VaultSync/main/extension/public"
LOGO_ICON = f"{GITHUB_RAW}/logo-icon.png"
ICON_128 = f"{GITHUB_RAW}/icons/icon128.png"
LOGO_FULL = f"{GITHUB_RAW}/logo.png"
OG_IMAGE = LOGO_FULL
AUTHOR_SITE = "https://manojhankare.in"
CONTACT_EMAIL = "manojhankare2@gmail.com"

BASE_CSS = """
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background: #0f172a; color: #f1f5f9; line-height: 1.6; min-height: 100vh;
    }
    a { color: #38bdf8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 72rem; margin: 0 auto; padding: 0 1.25rem; }
    .nav {
      position: sticky; top: 0; z-index: 50;
      background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(12px);
      border-bottom: 1px solid #334155;
    }
    .nav-inner {
      display: flex; align-items: center; justify-content: space-between;
      height: 3.5rem; gap: 1rem;
    }
    .nav-brand {
      display: flex; align-items: center; gap: 0.6rem;
      font-weight: 700; font-size: 1.1rem; color: #f1f5f9; text-decoration: none; flex-shrink: 0;
    }
    .nav-brand:hover { text-decoration: none; }
    .nav-brand img { width: 28px; height: 28px; display: block; flex-shrink: 0; }
    .nav-links { display: flex; gap: 1.25rem; list-style: none; flex-wrap: wrap; }
    .nav-links a { color: #cbd5e1; font-size: 0.88rem; font-weight: 500; text-decoration: none; }
    .nav-links a:hover, .nav-links a.active { color: #38bdf8; text-decoration: none; }
    .nav-cta {
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      color: #fff !important; padding: 0.4rem 0.85rem; border-radius: 0.375rem;
      font-size: 0.82rem; font-weight: 600;
    }
    .nav-cta:hover { opacity: 0.92; text-decoration: none !important; }
    footer { border-top: 1px solid #334155; padding: 2.5rem 0; text-align: center; margin-top: auto; }
    .footer-brand {
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      margin-bottom: 1rem; font-weight: 600; color: #cbd5e1;
    }
    .footer-brand img { width: 24px; height: 24px; display: block; }
    .footer-links { display: flex; justify-content: center; gap: 1.25rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .footer-links a { color: #94a3b8; font-size: 0.88rem; }
    .footer-copy { font-size: 0.8rem; color: #64748b; }
    .page-hero { padding: 3rem 0 2rem; text-align: center; }
    .page-hero h1 {
      font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; color: #f1f5f9; margin-bottom: 0.75rem;
    }
    .page-hero p { color: #cbd5e1; max-width: 36rem; margin: 0 auto; }
    .legal-body { max-width: 42rem; margin: 0 auto; padding: 0 1.25rem 3rem; }
    .legal-body h2 {
      font-size: 1.15rem; font-weight: 600; color: #f1f5f9;
      margin: 2rem 0 0.75rem; padding-top: 0.5rem;
    }
    .legal-body h2:first-child { margin-top: 0; }
    .legal-body p, .legal-body li { color: #e2e8f0; font-size: 0.95rem; margin-bottom: 0.75rem; }
    .legal-body ul { padding-left: 1.25rem; margin-bottom: 1rem; }
    .legal-body .updated { font-size: 0.85rem; color: #64748b; margin-bottom: 2rem; }
    .faq-list { max-width: 42rem; margin: 0 auto; padding: 0 1.25rem 3rem; }
    details.faq-item {
      background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem;
      margin-bottom: 0.75rem; overflow: hidden;
    }
    details.faq-item summary {
      padding: 1rem 1.25rem; cursor: pointer; font-weight: 600; color: #f1f5f9;
      list-style: none; display: flex; justify-content: space-between; align-items: center;
    }
    details.faq-item summary::-webkit-details-marker { display: none; }
    details.faq-item summary::after { content: "+"; color: #38bdf8; font-size: 1.25rem; font-weight: 400; }
    details.faq-item[open] summary::after { content: "−"; }
    details.faq-item .faq-answer { padding: 0 1.25rem 1.25rem; color: #cbd5e1; font-size: 0.95rem; }
    details.faq-item .faq-answer a { color: #38bdf8; }
    code {
      font-family: ui-monospace, monospace; font-size: 0.88em;
      background: #1e293b; padding: 0.1em 0.35em; border-radius: 0.25rem; color: #7dd3fc;
    }
"""

LANDING_EXTRA_CSS = """
    .hero {
      text-align: center; padding: 4.5rem 0 4rem;
      background:
        radial-gradient(ellipse 70% 50% at 50% -5%, rgba(56, 189, 248, 0.18), transparent),
        radial-gradient(ellipse 40% 30% at 80% 20%, rgba(129, 140, 248, 0.1), transparent);
    }
    .hero-brand { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; margin-bottom: 1.75rem; }
    .hero-logo {
      width: 84px; height: 84px; display: block; object-fit: contain;
      margin-bottom: 0.35rem;
    }
    .brand-title {
      margin: 0; font-size: clamp(2rem, 5vw, 2.75rem); font-weight: 800;
      letter-spacing: -0.03em; line-height: 1.1;
    }
    .brand-title-vault { color: #f8fafc; }
    .brand-title-sync {
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .brand-slogan {
      margin: 0.25rem 0 0; font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.18em; color: #64748b; text-transform: uppercase;
    }
    .hero-headline {
      font-size: clamp(1.35rem, 3vw, 1.75rem); font-weight: 600; line-height: 1.35;
      color: #e2e8f0; max-width: 28rem; margin: 0 auto;
    }
    .hero-tagline { margin: 1rem auto 0; max-width: 36rem; font-size: 1.05rem; color: #94a3b8; }
    .hero-actions { margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      color: #fff; font-weight: 600; font-size: 1rem;
      padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none;
    }
    .btn-primary:hover { opacity: 0.92; text-decoration: none; }
    .btn-secondary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: #1e293b; border: 1px solid #475569;
      color: #f1f5f9; font-weight: 600; font-size: 1rem;
      padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none;
    }
    .btn-secondary:hover { border-color: #64748b; text-decoration: none; }
    section { padding: 3.5rem 0; }
    section:nth-child(even) { background: #162032; }
    .section-label {
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; color: #38bdf8; margin-bottom: 0.5rem;
    }
    .section-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;
    }
    .section-desc { color: #cbd5e1; max-width: 40rem; font-size: 1.05rem; }
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; margin-top: 2rem; align-items: center; }
    @media (max-width: 768px) { .about-grid { grid-template-columns: 1fr; } }
    .about-text p { color: #e2e8f0; margin-bottom: 1rem; }
    .about-visual {
      background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 2rem; text-align: center;
    }
    .about-visual img { max-width: 100%; border-radius: 0.5rem; }
    .features-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; margin-top: 2rem;
    }
    .feature-card {
      background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.5rem;
    }
    .feature-card:hover { border-color: #475569; }
    .feature-icon { width: 2.5rem; height: 2.5rem; margin-bottom: 1rem; color: #38bdf8; }
    .feature-card h3 { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin-bottom: 0.5rem; }
    .feature-card p { font-size: 0.9rem; color: #cbd5e1; }
    .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 2rem; }
    @media (max-width: 768px) { .steps { grid-template-columns: 1fr; } }
    .step {
      text-align: center; padding: 1.5rem;
      background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem;
    }
    .step-num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 2.5rem; height: 2.5rem; border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      color: #fff; font-weight: 700; font-size: 1.1rem; margin-bottom: 1rem;
    }
    .step h3 { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin-bottom: 0.5rem; }
    .step p { font-size: 0.9rem; color: #cbd5e1; }
    .security-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 2rem; }
    @media (max-width: 640px) { .security-cards { grid-template-columns: 1fr; } }
    .sec-card { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.5rem; }
    .sec-card h3 { font-size: 0.95rem; font-weight: 600; color: #f1f5f9; margin-bottom: 0.5rem; }
    .sec-card p { font-size: 0.9rem; color: #cbd5e1; }
    .sec-badge {
      display: inline-block; font-size: 0.7rem; font-weight: 600;
      padding: 0.15rem 0.5rem; border-radius: 999px; margin-bottom: 0.75rem;
    }
    .badge-green { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
    .badge-red { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    .install-card {
      background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 2rem; margin-top: 2rem;
    }
    ol { padding-left: 1.25rem; color: #e2e8f0; }
    ol li { margin-bottom: 0.5rem; }
    .note { margin-top: 1rem; font-size: 0.9rem; color: #94a3b8; }
    .stores { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
    .store-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: #162032; border: 1px dashed #475569; color: #94a3b8;
      padding: 0.65rem 1.25rem; border-radius: 0.5rem; font-size: 0.9rem;
    }
    .store-badge svg { width: 20px; height: 20px; opacity: 0.5; }
    .faq-preview { margin-top: 2rem; }
    .faq-preview .more-link { display: inline-block; margin-top: 1rem; font-weight: 600; }
"""


def hero_brand_html() -> str:
    return f"""
      <div class="hero-brand">
        <img class="hero-logo" src="{ICON_128}" alt="VaultSync" width="84" height="84" />
        <h1 class="brand-title">
          <span class="brand-title-vault">Vault</span><span class="brand-title-sync">Sync</span>
        </h1>
        <p class="brand-slogan">Secure. Sync. Everywhere.</p>
      </div>
      <p class="hero-headline">Your passwords. Your encryption. Your control.</p>"""


def nav_html(active: str = "") -> str:
    def cls(name: str) -> str:
        return ' class="active"' if active == name else ""

    return f"""
  <nav class="nav">
    <div class="container nav-inner">
      <a class="nav-brand" href="/">
        <img src="{LOGO_ICON}" alt="" width="28" height="28" />
        VaultSync
      </a>
      <ul class="nav-links">
        <li><a href="/#about"{cls("about")}>About</a></li>
        <li><a href="/#features"{cls("features")}>Features</a></li>
        <li><a href="/#security"{cls("security")}>Security</a></li>
        <li><a href="/faq"{cls("faq")}>FAQ</a></li>
        <li><a href="/#install" class="nav-cta">Install</a></li>
      </ul>
    </div>
  </nav>"""


def footer_html() -> str:
    return f"""
  <footer>
    <div class="container">
      <div class="footer-brand">
        <img src="{LOGO_ICON}" alt="" width="24" height="24" />
        VaultSync
      </div>
      <div class="footer-links">
        <a href="/faq">FAQ</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="{GITHUB_REPO}">GitHub</a>
        <a href="{AUTHOR_SITE}">manojhankare.in</a>
      </div>
      <p class="footer-copy">&copy; 2026 Manoj Hankare. Zero-knowledge password manager.</p>
    </div>
  </footer>"""


def head_html(title: str, description: str, path: str = "/") -> str:
    canonical = SITE_URL + (path if path != "/" else "")
    return f"""
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content="{description}" />
  <meta name="keywords" content="password manager, zero-knowledge, browser extension, VaultSync, privacy" />
  <meta name="author" content="Manoj Hankare" />
  <meta name="theme-color" content="#0f172a" />
  <meta name="robots" content="index, follow" />
  <link rel="icon" type="image/png" href="{LOGO_ICON}" />
  <link rel="canonical" href="{canonical}" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="VaultSync" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:image" content="{OG_IMAGE}" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />
  <meta name="twitter:image" content="{OG_IMAGE}" />
  <meta name="apple-mobile-web-app-title" content="VaultSync" />
  <link rel="apple-touch-icon" href="{ICON_128}" />"""


def build_page(title: str, description: str, path: str, body: str, extra_css: str = "", nav_active: str = "") -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
{head_html(title, description, path)}
  <style>
{BASE_CSS}
{extra_css}
  </style>
</head>
<body>
{nav_html(nav_active)}
{body}
{footer_html()}
</body>
</html>"""


def faq_items_html() -> str:
    items = [
        (
            "What is VaultSync?",
            "VaultSync is a zero-knowledge password manager. Your credentials are encrypted on your "
            "device before they are synced. The server stores only opaque encrypted blobs — it never "
            "sees your master password or plaintext vault contents.",
        ),
        (
            "Can VaultSync or the server see my passwords?",
            "No. Your master password and decrypted vault never leave your device. The server stores "
            "only encrypted data it cannot read. VaultSync is designed so that even the operator cannot "
            "access your secrets without your master password.",
        ),
        (
            "What is the difference between my account password and master password?",
            "Your <strong>account password</strong> signs you in to VaultSync and enables sync across "
            "devices — it is stored on the server as a secure hash. Your <strong>master password</strong> "
            "encrypts and decrypts your vault locally and is <strong>never</strong> sent to the server.",
        ),
        (
            "What if I forget my master password?",
            "If you set up a recovery key during vault creation, you can use it to regain access and "
            "set a new master password. Without your master password or recovery key, your encrypted "
            "vault cannot be decrypted — this is by design for zero-knowledge security.",
        ),
        (
            "What if I forget my account password?",
            "Use the password reset flow in the extension. You will receive a code by email. Resetting "
            "your account password changes API login only — your vault remains decryptable with your "
            "master password or recovery key.",
        ),
        (
            "Which browsers are supported?",
            "The VaultSync extension works on Chromium browsers: Google Chrome, Microsoft Edge, and "
            "Brave. Firefox support is experimental and not yet verified for production use.",
        ),
        (
            "How do I install the extension?",
            "Download the latest zip from "
            f'<a href="{GITHUB_RELEASES}">GitHub Releases</a>, unzip it, open '
            "<code>chrome://extensions</code> (or <code>edge://extensions</code>), enable Developer mode, "
            "and click Load unpacked. See the <a href=\"/#install\">install section</a> for full steps.",
        ),
        (
            "Will the extension update automatically?",
            "Installs from the Chrome Web Store or Microsoft Edge Add-ons will auto-update once store "
            "listings are live. Manual installs from a GitHub zip do not auto-update — you must "
            "download and reload a newer version yourself.",
        ),
        (
            "Is VaultSync open source?",
            f'Yes. The source code is available on <a href="{GITHUB_REPO}">GitHub</a> under the '
            "VaultSync repository. You can review the encryption design and self-host the backend.",
        ),
        (
            "Can I self-host VaultSync?",
            "Yes. The backend is a Flask API that can be deployed to your own infrastructure. Point "
            "the extension at your server URL during configuration. Your encrypted vault data stays "
            "under your control.",
        ),
        (
            "What data does VaultSync collect?",
            "We store your email, account password hash, encrypted vault blob, device name/type for "
            "sync, and sync metadata (timestamps, revision numbers). We do not collect master passwords, "
            "recovery keys, or plaintext credentials. See our "
            '<a href="/privacy">Privacy Policy</a> for details.',
        ),
        (
            "How do I delete my account and data?",
            "You can wipe your vault from within the extension. To fully remove your account, contact "
            f'<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>. Encrypted vault data and account '
            "records will be deleted from our servers.",
        ),
        (
            "Does VaultSync use cookies or tracking?",
            "The marketing website at vaultsync.manojhankare.in does not use analytics cookies or "
            "third-party trackers. The extension uses local storage on your device for session tokens "
            "and vault cache — not advertising cookies.",
        ),
    ]
    parts = []
    for question, answer in items:
        parts.append(
            f"""    <details class="faq-item">
      <summary>{question}</summary>
      <div class="faq-answer"><p>{answer}</p></div>
    </details>"""
        )
    return "\n".join(parts)


def faq_preview_html(count: int = 3) -> str:
    """First N FAQ items for the landing page."""
    full = faq_items_html()
    items = full.split('<details class="faq-item">')
    # items[0] is empty prefix; take count+1 slices rejoined
    selected = ['<details class="faq-item">' + items[i] for i in range(1, min(count + 1, len(items)))]
    return "\n".join(selected)
