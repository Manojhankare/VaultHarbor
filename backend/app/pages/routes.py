"""Public landing and legal pages for VaultSync."""

from __future__ import annotations

from flask import Blueprint, jsonify

from app.pages.site_html import (
    CONTACT_EMAIL,
    EXT_LINK,
    GITHUB_RELEASES,
    GITHUB_REPO,
    ICON_128,
    LANDING_EXTRA_CSS,
    SITE_URL,
    about_section_html,
    build_page,
    faq_items_html,
    faq_preview_html,
    hero_section_html,
    support_section_html,
)

pages_bp = Blueprint(
    "pages",
    __name__,
    static_folder="static",
    static_url_path="/pages-static",
)

PAGE_TITLE = "VaultSync: Zero-Knowledge Password Manager"
PAGE_DESCRIPTION = (
    "VaultSync is a zero-knowledge password manager. Your vault is encrypted on your device before "
    "sync. The server only stores opaque blobs. Install the browser extension for Chrome, Edge, and Brave."
)

WEB_MANIFEST = {
    "name": "VaultSync",
    "short_name": "VaultSync",
    "description": (
        "Zero-knowledge password manager with encrypted vault on the client and opaque sync on the server."
    ),
    "start_url": "/",
    "scope": "/",
    "display": "standalone",
    "background_color": "#0f172a",
    "theme_color": "#0f172a",
    "lang": "en",
    "icons": [
        {
            "src": ICON_128,
            "sizes": "128x128",
            "type": "image/png",
            "purpose": "any",
        }
    ],
}

LANDING_BODY = f"""
{hero_section_html()}

{about_section_html()}

  <section id="features">
    <div class="container">
      <p class="section-label">Features</p>
      <h2 class="section-title">Everything you need, nothing you don't</h2>
      <p class="section-desc">Designed for everyday use with fast autofill, reliable sync, and security you can verify.</p>
      <div class="features-grid">
        <div class="feature-card">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          <h3>Zero-knowledge encryption</h3>
          <p>Your vault is encrypted with AES-GCM on your device. The server stores ciphertext it can never decrypt.</p>
        </div>
        <div class="feature-card">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          <h3>One-click autofill</h3>
          <p>Fill usernames and passwords on any site. VaultSync detects login fields and offers matching credentials instantly.</p>
        </div>
        <div class="feature-card">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <h3>Save &amp; update prompts</h3>
          <p>Capture new logins as you sign up. When a password changes, VaultSync asks whether to update the existing entry.</p>
        </div>
        <div class="feature-card">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          <h3>Cross-device sync</h3>
          <p>Sign in on any browser with the extension. Your encrypted vault syncs automatically across all your devices.</p>
        </div>
        <div class="feature-card">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <h3>Master password unlock</h3>
          <p>One master password derives your vault key locally. It never travels to the server, not even as a hash.</p>
        </div>
        <div class="feature-card">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          <h3>Self-hosted backend</h3>
          <p>Run your own sync server or use the hosted instance. Your encrypted data stays under your infrastructure.</p>
        </div>
      </div>
    </div>
  </section>

  <section id="how-it-works">
    <div class="container">
      <p class="section-label">How it works</p>
      <h2 class="section-title">Simple on the surface, secure underneath</h2>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <h3>Create your account</h3>
          <p>Register with email and an account password. This authenticates you to the sync server; it does not encrypt your vault.</p>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <h3>Set a master password</h3>
          <p>Choose a strong master password. VaultSync derives encryption keys locally and wraps your vault so the master password never leaves your device.</p>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <h3>Save, sync, autofill</h3>
          <p>Add credentials to your vault. They encrypt on your device, sync as opaque blobs, and autofill whenever you need them.</p>
        </div>
      </div>
    </div>
  </section>

  <section id="security">
    <div class="container">
      <p class="section-label">Security</p>
      <h2 class="section-title">Two passwords, one principle: your data stays yours</h2>
      <p class="section-desc">VaultSync separates account login from vault encryption so your secrets remain protected even if credentials are reset.</p>
      <div class="security-cards">
        <div class="sec-card">
          <span class="sec-badge badge-green">Stored as hash only</span>
          <h3>Account password</h3>
          <p>Used to sign in to VaultSync and sync your vault across devices. Stored on the server as an Argon2id hash, never in plaintext.</p>
        </div>
        <div class="sec-card">
          <span class="sec-badge badge-red">Never sent to server</span>
          <h3>Master password</h3>
          <p>Derives the key that encrypts and decrypts your vault. Exists only on your device. VaultSync cannot recover it; only you can unlock your data.</p>
        </div>
        <div class="sec-card">
          <span class="sec-badge badge-green">Client-side only</span>
          <h3>End-to-end encryption</h3>
          <p>Vault contents are encrypted with AES-GCM before upload. The server sees only base64 ciphertext, revision numbers, and sync metadata.</p>
        </div>
        <div class="sec-card">
          <span class="sec-badge badge-green">Recovery option</span>
          <h3>Recovery key</h3>
          <p>If you forget your master password, a recovery key can re-wrap your vault key. Store it safely; VaultSync shows it once during setup.</p>
        </div>
      </div>
    </div>
  </section>

  <section id="install">
    <div class="container">
      <p class="section-label">Install</p>
      <h2 class="section-title">Get VaultSync on your browser</h2>
      <p class="section-desc">Available for Chromium browsers: Chrome, Microsoft Edge, and Brave.</p>
      <div class="install-card">
        <a class="btn-primary" href="{GITHUB_RELEASES}"{EXT_LINK}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download from GitHub Releases
        </a>
        <p class="note">Latest build: <code>vaultsync-extension-0.1.0-chrome.zip</code></p>
        <ol>
          <li>Download the release zip from <a href="{GITHUB_RELEASES}"{EXT_LINK}>GitHub Releases</a>.</li>
          <li>Unzip to a permanent folder; it must contain <code>manifest.json</code> at the root.</li>
          <li>Open <code>chrome://extensions</code> (Microsoft Edge: <code>edge://extensions</code>).</li>
          <li>Enable <strong>Developer mode</strong> (toggle in the top-right corner).</li>
          <li>Click <strong>Load unpacked</strong> and select the unzipped folder.</li>
          <li>Pin VaultSync to your toolbar and sign in to get started.</li>
        </ol>
        <p class="note">Manual installs do not auto-update. Official store listings below will enable automatic updates once published.</p>
        <div class="stores">
          <span class="store-badge">
            <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            Chrome Web Store (Coming soon)
          </span>
          <span class="store-badge">
            <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            Microsoft Edge Add-ons (Coming soon)
          </span>
        </div>
      </div>
    </div>
  </section>

  <section id="faq-preview">
    <div class="container">
      <p class="section-label">FAQ</p>
      <h2 class="section-title">Common questions</h2>
      <p class="section-desc">Quick answers about VaultSync security, installation, and your data.</p>
      <div class="faq-preview">
{faq_preview_html(3)}
        <a class="more-link" href="/faq">View all FAQ →</a>
      </div>
    </div>
  </section>
{support_section_html()}
"""

FAQ_BODY = f"""
  <div class="page-hero">
    <div class="container">
      <h1>Frequently Asked Questions</h1>
      <p>Answers about VaultSync security, installation, sync, and your data.</p>
    </div>
  </div>
  <div class="faq-list">
{faq_items_html()}
  </div>
"""

PRIVACY_BODY = f"""
  <div class="page-hero">
    <div class="container">
      <h1>Privacy Policy</h1>
      <p>How VaultSync handles your information.</p>
    </div>
  </div>
  <div class="legal-body">
    <p class="updated">Last updated: 29 August 2026</p>

    <h2>1. Introduction</h2>
    <p>
      VaultSync (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a zero-knowledge password manager operated by
      Manoj Hankare. This Privacy Policy explains what information we collect, how we use it,
      and your rights when you use VaultSync at <a href="{SITE_URL}">{SITE_URL.rstrip('/')}</a>
      and the VaultSync browser extension.
    </p>
    <p>
      VaultSync is built on a zero-knowledge architecture: your master password and decrypted
      vault contents never leave your device. We cannot read your stored credentials.
    </p>

    <h2>2. Information we collect</h2>
    <p>When you create an account and use VaultSync, we may store:</p>
    <ul>
      <li><strong>Account information</strong>: email address and a one-way hash of your account password (Argon2id). We never store your account password in plaintext.</li>
      <li><strong>Encrypted vault data</strong>: your vault as an opaque, encrypted blob and wrapped encryption keys. We cannot decrypt this data.</li>
      <li><strong>Key derivation metadata</strong>: salts and KDF parameters required for client-side key derivation. These do not reveal your master password.</li>
      <li><strong>Device information</strong>: device name, type (e.g. browser), and an opaque device identifier for sync and session management.</li>
      <li><strong>Sync metadata</strong>: vault revision numbers, sync timestamps, and event records. These contain no plaintext credentials.</li>
      <li><strong>Authentication tokens</strong>: hashed refresh tokens for secure session management.</li>
      <li><strong>Password reset tokens</strong>: hashed, time-limited codes when you request an account password reset.</li>
      <li><strong>Server logs</strong>: request metadata (timestamps, HTTP method, path, status code, request ID) for reliability and security. We do not log master passwords, vault plaintext, authorization headers, or raw tokens.</li>
    </ul>

    <h2>3. Information we do not collect</h2>
    <p>VaultSync is designed so that we never receive or store:</p>
    <ul>
      <li>Your master password</li>
      <li>Your recovery key in plaintext</li>
      <li>Individual usernames, passwords, or notes from inside your vault</li>
      <li>Decrypted vault contents at any time</li>
    </ul>

    <h2>4. How we use your information</h2>
    <p>We use collected information solely to:</p>
    <ul>
      <li>Authenticate your account and maintain secure sessions</li>
      <li>Store and sync your encrypted vault across your devices</li>
      <li>Send account password reset emails when you request them</li>
      <li>Operate, secure, and improve the VaultSync service</li>
      <li>Respond to support requests and legal obligations</li>
    </ul>
    <p>We do not sell your personal information. We do not use your vault data for advertising or profiling.</p>

    <h2>5. Zero-knowledge encryption</h2>
    <p>
      All vault encryption and decryption happens on your device. Data is encrypted with AES-GCM
      before upload. The server treats your vault as an opaque binary blob and cannot access
      individual credential fields inside it.
    </p>

    <h2>6. Third-party services</h2>
    <p>VaultSync relies on the following infrastructure providers:</p>
    <ul>
      <li><strong>Vercel</strong>: hosts the VaultSync API</li>
      <li><strong>Supabase (PostgreSQL)</strong>: stores account and encrypted vault data</li>
      <li><strong>Brevo</strong>: sends transactional emails (e.g. password reset codes)</li>
    </ul>
    <p>
      These providers process data on our behalf under their own privacy policies and
      contractual safeguards. Encrypted vault blobs remain unreadable to us and to these
      providers without your master password.
    </p>

    <h2>7. Data retention and deletion</h2>
    <p>
      We retain your account and encrypted vault data for as long as your account is active.
      You may delete your vault from within the extension. To request full account deletion,
      contact us at <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>. We will delete
      your account records and encrypted vault data from our servers within a reasonable period.
    </p>

    <h2>8. Cookies and tracking</h2>
    <p>
      The VaultSync marketing website does not use analytics cookies or third-party advertising
      trackers. The browser extension stores session tokens and cached vault data locally in
      your browser, not in cross-site tracking cookies.
    </p>

    <h2>9. Your rights</h2>
    <p>Depending on your location, you may have the right to:</p>
    <ul>
      <li>Access the personal data we hold about you (email, account metadata)</li>
      <li>Request correction of inaccurate account information</li>
      <li>Request deletion of your account and associated data</li>
      <li>Export your encrypted vault (via the extension) before deletion</li>
    </ul>
    <p>
      To exercise these rights, contact <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.
      Because we cannot decrypt your vault, we cannot provide plaintext credential exports;
      only the encrypted blob stored on our servers.
    </p>

    <h2>10. Security</h2>
    <p>
      We use industry-standard measures including HTTPS/TLS, Argon2id password hashing,
      hashed refresh tokens, rate limiting, and strict logging policies that exclude secrets.
      No system is perfectly secure; you are responsible for choosing a strong master password
      and storing your recovery key safely.
    </p>

    <h2>11. Children</h2>
    <p>
      VaultSync is not intended for users under 16. We do not knowingly collect information
      from children.
    </p>

    <h2>12. Changes to this policy</h2>
    <p>
      We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date
      at the top will reflect changes. Continued use of VaultSync after changes constitutes
      acceptance of the updated policy.
    </p>

    <h2>13. Contact</h2>
    <p>
      Manoj Hankare<br />
      Email: <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a> (VaultSync support)
    </p>
  </div>
"""

TERMS_BODY = f"""
  <div class="page-hero">
    <div class="container">
      <h1>Terms of Service</h1>
      <p>Terms governing your use of VaultSync.</p>
    </div>
  </div>
  <div class="legal-body">
    <p class="updated">Last updated: 29 August 2026</p>

    <h2>1. Acceptance of terms</h2>
    <p>
      By accessing or using VaultSync (the website at {SITE_URL.rstrip('/')}, the browser
      extension, and related sync services), you agree to these Terms of Service. If you do
      not agree, do not use VaultSync.
    </p>

    <h2>2. Service description</h2>
    <p>
      VaultSync is a zero-knowledge password manager that encrypts your vault on your device
      and syncs encrypted data to our servers. VaultSync is provided by Manoj Hankare as
      a personal/open-source project. The service is offered on an &ldquo;as is&rdquo; basis.
    </p>

    <h2>3. Your account</h2>
    <p>You are responsible for:</p>
    <ul>
      <li>Providing accurate registration information</li>
      <li>Keeping your account password confidential</li>
      <li>Choosing and remembering a strong master password</li>
      <li>Securely storing your recovery key if you enable master password recovery</li>
      <li>All activity that occurs under your account</li>
    </ul>

    <h2>4. Zero-knowledge responsibility</h2>
    <p>
      Because VaultSync uses zero-knowledge encryption, <strong>we cannot recover your master
      password or decrypt your vault</strong> if you lose your master password and recovery key.
      You acknowledge this limitation and accept full responsibility for maintaining access
      to your vault.
    </p>

    <h2>5. Acceptable use</h2>
    <p>You agree not to:</p>
    <ul>
      <li>Use VaultSync for unlawful purposes</li>
      <li>Attempt to gain unauthorized access to VaultSync systems or other users&rsquo; accounts</li>
      <li>Reverse engineer, attack, or disrupt the service</li>
      <li>Upload malicious content or abuse rate limits</li>
    </ul>

    <h2>6. Open source and self-hosting</h2>
    <p>
      VaultSync source code is available on
      <a href="{GITHUB_REPO}"{EXT_LINK}>GitHub</a>. You may self-host the backend subject to the
      project&rsquo;s open-source license. Self-hosted deployments are operated by you, not by us.
    </p>

    <h2>7. Availability and changes</h2>
    <p>
      We aim to keep VaultSync available but do not guarantee uninterrupted access. We may
      modify, suspend, or discontinue features with reasonable notice where possible. The
      hosted service may be unavailable during maintenance or outages.
    </p>

    <h2>8. Disclaimer of warranties</h2>
    <p>
      VaultSync is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties
      of any kind, express or implied, including merchantability, fitness for a particular
      purpose, and non-infringement. We do not warrant that the service will be error-free
      or that your data will never be lost. Maintain your own backups and recovery keys.
    </p>

    <h2>9. Limitation of liability</h2>
    <p>
      To the maximum extent permitted by law, Manoj Hankare shall not be liable for any
      indirect, incidental, special, consequential, or punitive damages, or any loss of
      profits, data, or goodwill, arising from your use of VaultSync, including loss of
      access due to a forgotten master password or recovery key.
    </p>

    <h2>10. Termination</h2>
    <p>
      You may stop using VaultSync at any time and request account deletion. We may suspend
      or terminate accounts that violate these terms. Upon termination, your right to use
      the service ceases; you may request deletion of server-stored data as described in
      our <a href="/privacy">Privacy Policy</a>.
    </p>

    <h2>11. Privacy</h2>
    <p>
      Your use of VaultSync is also governed by our
      <a href="/privacy">Privacy Policy</a>, which describes how we handle your information.
    </p>

    <h2>12. Changes to these terms</h2>
    <p>
      We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date will
      reflect changes. Continued use after changes constitutes acceptance.
    </p>

    <h2>13. Governing law</h2>
    <p>
      These terms are governed by the laws of India, without regard to conflict-of-law
      principles. Any disputes shall be subject to the courts of competent jurisdiction in India.
    </p>

    <h2>14. Contact</h2>
    <p>
      Manoj Hankare<br />
      Email: <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a> (VaultSync support)
    </p>
  </div>
"""


@pages_bp.get("/")
def landing():
    return build_page(PAGE_TITLE, PAGE_DESCRIPTION, "/", LANDING_BODY, LANDING_EXTRA_CSS)


@pages_bp.get("/faq")
def faq():
    title = "FAQ: VaultSync"
    desc = "Frequently asked questions about VaultSync security, installation, sync, and your data."
    return build_page(title, desc, "/faq", FAQ_BODY, nav_active="faq")


@pages_bp.get("/privacy")
def privacy():
    title = "Privacy Policy: VaultSync"
    desc = "VaultSync Privacy Policy: what data we collect, zero-knowledge encryption, and your rights."
    return build_page(title, desc, "/privacy", PRIVACY_BODY)


@pages_bp.get("/terms")
def terms():
    title = "Terms of Service: VaultSync"
    desc = "VaultSync Terms of Service: rules for using the password manager and sync service."
    return build_page(title, desc, "/terms", TERMS_BODY)


@pages_bp.get("/manifest.webmanifest")
def web_manifest():
    return jsonify(WEB_MANIFEST), 200, {"Content-Type": "application/manifest+json"}
