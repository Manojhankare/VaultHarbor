"""Shared HTML helpers for VaultHarbor public pages."""

from __future__ import annotations

SITE_URL = "https://vaultharbor.manojhankare.in"
GITHUB_REPO = "https://github.com/Manojhankare/VaultHarbor"
GITHUB_RELEASES = "https://github.com/Manojhankare/VaultHarbor/releases"
# Served by Flask pages blueprint (synced from extension generate-icons.mjs).
LOGO_ICON = "/pages-static/brand/icon128.png"
ICON_128 = "/pages-static/brand/icon128.png"
ICON_512 = "/pages-static/brand/icon512.png"
LOGO_FULL = "/pages-static/brand/logo.png"
OG_IMAGE = f"{SITE_URL.rstrip('/')}{LOGO_FULL}"
AUTHOR_SITE = "https://manojhankare.in"
CONTACT_EMAIL = "manojhankare2@gmail.com"
GITHUB_SPONSORS = "https://github.com/sponsors/Manojhankare"
EXT_LINK = ' target="_blank" rel="noopener noreferrer"'
BROWSER_ICON_CHROME = "/pages-static/browser-icons/chrome.svg"
BROWSER_ICON_EDGE = "/pages-static/browser-icons/edge.svg"
BROWSER_ICON_BRAVE = "/pages-static/browser-icons/brave.svg"
BROWSER_ICON_STORE = "/pages-static/browser-icons/chromewebstore.svg"
EXTENSION_RELEASE_ZIP = "vaultharbor-extension-0.1.0-chrome.zip"

BASE_CSS = """
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html {
      scroll-behavior: smooth; scroll-padding-top: 3.8rem;
      scrollbar-width: none;
    }
    html::-webkit-scrollbar { display: none; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background: #000814; color: #f1f5f9; line-height: 1.6; min-height: 100vh;
    }
    a { color: #0ec9fc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 72rem; margin: 0 auto; padding: 0 1.25rem; }
    .nav {
      position: sticky; top: 0; z-index: 50;
      background: linear-gradient(
        180deg,
        rgba(0, 8, 20, 0.68) 0%,
        rgba(10, 14, 23, 0.52) 100%
      );
      backdrop-filter: blur(20px) saturate(1.4);
      -webkit-backdrop-filter: blur(20px) saturate(1.4);
      border-bottom: 1px solid rgba(148, 163, 184, 0.14);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.07),
        0 8px 32px rgba(0, 0, 0, 0.22);
    }
    .nav-inner {
      display: flex; align-items: center; justify-content: space-between;
      height: 3.75rem; gap: 1rem;
    }
    .nav-brand {
      display: flex; align-items: center; gap: 0.65rem;
      text-decoration: none; flex-shrink: 0;
    }
    .nav-brand:hover { text-decoration: none; }
    .nav-brand img { width: 36px; height: 36px; display: block; flex-shrink: 0; }
    .nav-brand-title {
      font-weight: 700; font-size: 1.15rem; letter-spacing: -0.02em; line-height: 1;
    }
    .nav-brand-vault { color: #f8fafc; }
    .nav-brand-harbor {
      background: linear-gradient(135deg, #0ec9fc 0%, #0090f8 45%, #8b5af2 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .nav-links {
      display: flex; align-items: center; gap: clamp(0.85rem, 2vw, 1.5rem);
      list-style: none; flex-wrap: wrap;
    }
    .nav-links a {
      color: #f1f5f9; font-size: 0.9rem; font-weight: 500; text-decoration: none;
      transition: color 0.2s ease;
    }
    .nav-links a:hover, .nav-links a.active { color: #0ec9fc; text-decoration: none; }
    .nav-cta {
      background: linear-gradient(90deg, #0090f8 0%, #8b5af2 100%);
      color: #fff !important; padding: 0.48rem 1.15rem; border-radius: 999px;
      font-size: 0.875rem; font-weight: 600;
      box-shadow: 0 4px 14px rgba(14, 201, 252, 0.28);
      transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    }
    .nav-cta:hover {
      opacity: 0.95; text-decoration: none !important;
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(14, 201, 252, 0.34);
    }
    footer { border-top: 1px solid #334155; padding: 2.5rem 0; text-align: center; margin-top: auto; }
    .footer-brand {
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      margin-bottom: 1rem; font-weight: 600; color: #cbd5e1;
    }
    .footer-brand img { width: 30px; height: 30px; display: block; }
    .footer-links { display: flex; justify-content: center; gap: 1.25rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .footer-links a { color: #94a3b8; font-size: 0.88rem; }
    .footer-copy { font-size: 0.8rem; color: #64748b; }
    .footer-copy a { color: #94a3b8; text-decoration: none; }
    .footer-copy a:hover { color: #0ec9fc; text-decoration: underline; }
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
    .faq-list {
      width: min(72rem, 94vw); max-width: 72rem; margin: 0 auto;
      padding: 0 1.5rem 3.5rem;
    }
    details.faq-item {
      background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem;
      margin-bottom: 0.85rem; overflow: hidden;
    }
    details.faq-item summary {
      padding: 1.15rem 1.35rem; cursor: pointer; font-weight: 600; color: #f1f5f9;
      list-style: none; display: flex; justify-content: space-between; align-items: center;
      gap: 1rem; line-height: 1.4;
    }
    details.faq-item summary::-webkit-details-marker { display: none; }
    details.faq-item summary::after { content: "+"; color: #0ec9fc; font-size: 1.25rem; font-weight: 400; flex-shrink: 0; }
    details.faq-item[open] summary::after { content: "−"; }
    details.faq-item .faq-answer {
      padding: 0 1.35rem 1.35rem; color: #cbd5e1; font-size: 0.95rem; line-height: 1.65;
    }
    details.faq-item .faq-answer a { color: #0ec9fc; }
    .faq-page .page-hero { padding-bottom: 1.5rem; }
    .faq-page .faq-list { margin-bottom: 0; }
    code {
      font-family: ui-monospace, monospace; font-size: 0.88em;
      background: #1e293b; padding: 0.1em 0.35em; border-radius: 0.25rem; color: #7dd3fc;
    }
"""

LANDING_EXTRA_CSS = """
    .hero {
      position: relative;
      overflow-x: hidden;
      overflow-y: visible;
      min-height: calc(100dvh - 3.5rem);
      padding: 2.5rem 0 3rem;
      background: #030712;
      display: flex;
      flex-direction: column;
    }
    .hero .container {
      max-width: 1360px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }
    .hero-container {
      position: relative; z-index: 1;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 0.95fr 1.05fr;
      gap: 4rem;
      align-items: center;
      flex: 1;
      min-height: 0;
    }
    .hero-content {
      justify-self: center;
      width: 100%;
      max-width: 580px;
      text-align: left;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      margin-bottom: 2rem;
      border: 1px solid rgba(34, 211, 238, 0.25);
      border-radius: 999px;
      background: rgba(34, 211, 238, 0.03);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: #0ec9fc;
      text-transform: uppercase;
      box-shadow: 0 0 15px rgba(34, 211, 238, 0.04);
    }
    .hero-title {
      margin: 0 0 1.75rem;
      font-size: clamp(2.5rem, 4.8vw, 4rem);
      font-weight: 800;
      line-height: 1.02;
      letter-spacing: -0.02em;
      max-width: 600px;
      color: #ffffff;
    }
    .hero-title span {
      display: block;
    }
    .hero-title-gradient {
      background: linear-gradient(135deg, #0ec9fc 0%, #0090f8 50%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: inline-block;
    }
    .hero-desc {
      margin: 0 0 1.75rem;
      max-width: 590px;
      font-size: 1.125rem;
      line-height: 1.7;
      color: #94a3b8;
    }
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: flex-start;
      margin-bottom: 1.5rem;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      background: linear-gradient(135deg, #0090f8, #8b5af2);
      color: #fff;
      font-weight: 600;
      font-size: 1rem;
      height: 58px;
      width: 240px;
      border-radius: 10px;
      text-decoration: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .btn-primary:hover {
      opacity: 0.95;
      transform: translateY(-1px);
      text-decoration: none;
      color: #fff;
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: rgba(0, 8, 20, 0.4);
      border: 1px solid rgba(71, 85, 105, 0.6);
      color: #cbd5e1;
      font-weight: 600;
      font-size: 1rem;
      height: 58px;
      width: 160px;
      border-radius: 10px;
      text-decoration: none;
      transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
    }
    .btn-secondary:hover {
      border-color: #64748b;
      background: rgba(0, 8, 20, 0.6);
      transform: translateY(-1px);
      text-decoration: none;
      color: #f1f5f9;
    }
    .hero-availability {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
      color: #64748b;
    }
    .hero-availability-icons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .hero-availability-icons img {
      width: 22px;
      height: 22px;
      flex-shrink: 0;
      display: block;
      object-fit: contain;
    }
    .hero-visual {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: auto;
      margin-top: 0;
      padding: 0.5rem 0 2rem;
      overflow: visible;
      perspective: 800px;
      perspective-origin: 50% 50%;
      width: 100%;
    }
    .hero-orbit-stage {
      position: relative;
      width: min(300px, 100%);
      flex-shrink: 0;
      overflow: visible;
    }
    .hero-visual-glow {
      position: absolute;
      width: 148%;
      height: 138%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(ellipse at center, rgba(14, 201, 252, 0.22) 0%, rgba(139, 90, 242, 0.08) 40%, transparent 70%);
      pointer-events: none;
      z-index: 0;
      animation: hero-glow-pulse 8s ease-in-out infinite;
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    @keyframes hero-glow-pulse {
      0%, 100% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1.04); }
    }
    .hero-orbit-svg {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 182%;
      height: 168%;
      transform: translate(-50%, -50%);
      z-index: 1;
      pointer-events: none;
      overflow: visible;
      filter: drop-shadow(0 0 12px rgba(14, 201, 252, 0.2));
      transition: transform 0.5s ease, filter 0.5s ease;
    }
    .hero-orbit-field {
      transform-origin: 150px 200px;
      animation: orbit-field-drift 22s linear infinite;
      transition: animation-duration 0.4s ease;
    }
    @keyframes orbit-field-drift {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @media (hover: hover) {
      .hero-orbit-stage:hover .hero-mockup {
        transform: rotateY(-14deg) rotateX(7deg) rotateZ(1deg) translateY(-8px);
        border-color: rgba(14, 201, 252, 0.48);
        box-shadow:
          32px 42px 78px rgba(0, 0, 0, 0.62),
          14px 20px 36px rgba(0, 0, 0, 0.42),
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          0 0 72px rgba(14, 201, 252, 0.22);
      }
      .hero-orbit-stage:hover .hero-orbit-svg {
        transform: translate(-50%, -50%) scale(1.07);
        filter: drop-shadow(0 0 24px rgba(14, 201, 252, 0.38));
      }
      .hero-orbit-stage:hover .hero-orbit-field {
        animation-duration: 14s;
      }
      .hero-orbit-stage:hover .hero-visual-glow {
        animation-play-state: paused;
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.1);
      }
      .hero-orbit-stage:hover .hero-float-logo {
        animation-play-state: paused;
        transform: rotateY(-12deg) rotateX(8deg) translateY(-12px) scale(1.06);
        filter: drop-shadow(0 0 42px rgba(14, 201, 252, 0.65)) drop-shadow(0 0 28px rgba(139, 90, 242, 0.55));
      }
    }
    @media (hover: hover) and (max-width: 1100px) {
      .hero-orbit-stage:hover .hero-mockup {
        transform: translateY(-8px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .hero-visual-glow,
      .hero-orbit-field,
      .hero-float-logo {
        animation: none !important;
      }
      .hero-orbit-stage:hover .hero-mockup,
      .hero-orbit-stage:hover .hero-orbit-svg,
      .hero-orbit-stage:hover .hero-visual-glow,
      .hero-orbit-stage:hover .hero-float-logo {
        transform: none;
      }
      .hero-orbit-stage:hover .hero-orbit-svg {
        transform: translate(-50%, -50%);
      }
      .hero-orbit-stage:hover .hero-visual-glow {
        transform: translate(-50%, -50%);
      }
    }
    .hero-mockup {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 300px;
      height: auto;
      padding: 0.55rem;
      background: rgba(10, 15, 30, 0.72);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid rgba(14, 201, 252, 0.28);
      border-radius: 20px;
      box-shadow:
        28px 38px 70px rgba(0, 0, 0, 0.6),
        12px 18px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.06),
        0 0 52px rgba(14, 201, 252, 0.12);
      transform: rotateY(-18deg) rotateX(10deg) rotateZ(2deg);
      transform-style: preserve-3d;
      transform-origin: center center;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease;
    }
    .hero-mockup::before {
      content: "";
      position: absolute;
      inset: 0.55rem;
      border-radius: 14px;
      border: 1px solid rgba(14, 201, 252, 0.1);
      box-shadow: inset 0 0 24px rgba(14, 201, 252, 0.04);
      pointer-events: none;
      z-index: 4;
    }
    .mockup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.55rem 0.65rem;
      margin-bottom: 0.15rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.45);
      border-radius: 12px 12px 0 0;
      background: rgba(0, 8, 20, 0.35);
    }
    .mockup-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      font-size: 0.9rem;
      color: #f8fafc;
    }
    .mockup-brand img {
      width: 28px;
      height: 28px;
    }
    .mockup-actions {
      display: flex;
      gap: 0.5rem;
    }
    .mockup-btn {
      width: 1.65rem;
      height: 1.65rem;
      border-radius: 0.4rem;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.8);
      color: #94a3b8;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .mockup-btn:hover {
      background: rgba(30, 41, 59, 0.9);
      color: #f1f5f9;
      border-color: #475569;
    }
    .mockup-search {
      margin: 0 0.15rem 0.35rem;
      padding: 0.45rem 0.7rem;
      background: rgba(11, 15, 25, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.8);
      border-radius: 0.5rem;
      font-size: 0.78rem;
      color: #64748b;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .mockup-list {
      padding: 0.05rem 0.1rem 0.35rem;
      display: flex;
      flex-direction: column;
      gap: 0.08rem;
      flex: 0 0 auto;
    }
    .mockup-row {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.28rem 0.4rem;
      flex-shrink: 0;
      border-radius: 0.5rem;
      transition: background 0.2s ease;
    }
    .mockup-row:hover {
      background: rgba(30, 41, 59, 0.4);
    }
    .mockup-favicon {
      width: 1.85rem;
      height: 1.85rem;
      border-radius: 0.4rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
    }
    .mockup-favicon--gh { background: #24292f; color: #fff; }
    .mockup-favicon--no { background: #191919; border: 1px solid #333; color: #fff; }
    .mockup-favicon--go { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .mockup-favicon--sl { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .mockup-favicon--ms { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .mockup-row-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      text-align: left;
    }
    .mockup-row-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: #f1f5f9;
    }
    .mockup-row-email {
      font-size: 0.68rem;
      color: #64748b;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .mockup-dots {
      font-size: 0.8rem;
      letter-spacing: 0.15em;
      color: #0ec9fc;
      flex-shrink: 0;
      margin-right: 0.5rem;
    }
    .mockup-chevron {
      color: #475569;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .hero-float-logo {
      position: absolute;
      z-index: 5;
      width: 108px;
      height: 108px;
      bottom: -36px;
      right: -26px;
      left: auto;
      transform: rotateY(-12deg) rotateX(8deg);
      transform-style: preserve-3d;
      filter: drop-shadow(0 0 35px rgba(14, 201, 252, 0.5)) drop-shadow(0 0 20px rgba(139, 90, 242, 0.4));
      animation: float-logo 6s ease-in-out infinite;
      transition: transform 0.45s ease, filter 0.45s ease;
    }
    @keyframes float-logo {
      0%, 100% { transform: rotateY(-12deg) rotateX(8deg) translateY(0); }
      50% { transform: rotateY(-12deg) rotateX(8deg) translateY(-8px); }
    }
    .hero-trust {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-top: 2.5rem;
      padding: 1.15rem 2rem;
      background: rgba(10, 15, 30, 0.4);
      border: 1px solid rgba(51, 65, 85, 0.35);
      border-radius: 12px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .hero-trust-item {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      padding-right: 1rem;
    }
    .hero-trust-item:not(:last-child) {
      border-right: 1px solid rgba(51, 65, 85, 0.35);
    }
    .hero-trust-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
      color: #475569;
    }
    .hero-trust-item h4 {
      font-size: 0.82rem;
      font-weight: 700;
      color: #cbd5e1;
      margin-bottom: 0.1rem;
    }
    .hero-trust-item p {
      font-size: 0.72rem;
      color: #64748b;
      line-height: 1.4;
      margin: 0;
    }
    @media (max-width: 1200px) {
      .hero-mockup { max-width: 290px; }
      .hero-orbit-stage { width: min(290px, 100%); }
      .hero-visual { margin-top: 1.5rem; padding-bottom: 2rem; }
      .hero-float-logo { width: 96px; height: 96px; right: -20px; bottom: -30px; }
      .hero-grid { gap: 2rem; }
    }
    @media (max-width: 1100px) {
      .hero-grid {
        grid-template-columns: 1fr;
        gap: 4rem;
        text-align: center;
      }
      .hero-content {
        justify-self: center;
        text-align: center;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .hero-actions {
        justify-content: center;
      }
      .hero-availability {
        justify-content: center;
      }
      .hero-visual {
        justify-content: center;
        min-height: auto;
        margin-top: 0;
        padding-bottom: 2rem;
      }
      .hero-orbit-stage { width: min(300px, 100%); }
      .hero-mockup {
        max-width: 300px;
        height: auto;
        transform: none;
        padding: 0.55rem;
      }
      .hero-float-logo {
        width: 108px;
        height: 108px;
        right: -26px;
        left: auto;
        bottom: -36px;
      }
      .hero-trust {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        padding: 1.5rem;
      }
      .hero-trust-item:nth-child(2) {
        border-right: none;
      }
    }
    @media (max-width: 640px) {
      .hero {
        min-height: auto;
        padding: 2rem 0 2rem;
      }
      .hero-title {
        font-size: clamp(2rem, 8vw, 2.75rem);
        line-height: 1.1;
      }
      .hero-desc {
        font-size: 1rem;
      }
      .hero-actions {
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
      .btn-primary, .btn-secondary {
        width: 100%;
        max-width: 320px;
      }
      .hero-visual {
        min-height: auto;
        padding-bottom: 2.5rem;
      }
      .hero-float-logo {
        width: 96px;
        height: 96px;
        right: 5px;
        bottom: -10px;
      }
      .mockup-header {
        padding: 0.85rem 1rem;
      }
      .mockup-search {
        margin: 0.85rem 1rem 0.5rem;
        padding: 0.6rem 0.85rem;
      }
      .mockup-list {
        padding: 0.25rem 0.75rem 0.85rem;
      }
      .mockup-row {
        padding: 0.55rem 0.65rem;
      }
      .hero-trust {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
      .hero-trust-item {
        border-right: none !important;
      }
    }
    .brand-title {
      margin: 0; font-size: clamp(2rem, 5vw, 2.75rem); font-weight: 800;
      letter-spacing: -0.03em; line-height: 1.1;
    }
    .brand-title-vault { color: #f8fafc; }
    .brand-title-harbor {
      background: linear-gradient(135deg, #0ec9fc, #8b5af2);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .brand-slogan {
      margin: 0.25rem 0 0; font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.18em; color: #64748b; text-transform: uppercase;
    }
    section { padding: 3.5rem 0; }
    section:nth-child(even) { background: #0a1220; }
    .section-label {
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; color: #0ec9fc; margin-bottom: 0.5rem;
    }
    .section-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;
    }
    .section-desc { color: #cbd5e1; max-width: 40rem; font-size: 1.05rem; }
    #about { padding: 4.5rem 0; }
    .about-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2rem, 5vw, 3.5rem); align-items: stretch;
    }
    @media (max-width: 768px) {
      .about-grid { grid-template-columns: 1fr; gap: 2.5rem; }
    }
    @keyframes about-fade-up {
      from { opacity: 0; transform: translateY(18px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes about-fade-in-right {
      from { opacity: 0; transform: translateX(22px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes about-divider-grow {
      from { width: 0; opacity: 0.4; }
      to { width: 3.5rem; opacity: 1; }
    }
    @keyframes about-glow-pulse {
      0%, 100% { opacity: 0.72; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    }
    @keyframes about-logo-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes about-shimmer {
      0% { transform: translateX(-120%) rotate(12deg); }
      100% { transform: translateX(220%) rotate(12deg); }
    }
    .about-content .section-label {
      margin-bottom: 0.75rem; opacity: 0;
      animation: about-fade-up 0.65s ease forwards;
    }
    .about-title {
      font-size: clamp(1.75rem, 4vw, 2.35rem); font-weight: 700; color: #f1f5f9;
      line-height: 1.22; letter-spacing: -0.02em; margin-bottom: 1rem;
      opacity: 0; animation: about-fade-up 0.65s ease 0.1s forwards;
    }
    .about-title-accent {
      background: linear-gradient(135deg, #0ec9fc 0%, #0090f8 50%, #a855f7 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      background-size: 200% 200%;
      animation: about-fade-up 0.65s ease 0.1s forwards, about-accent-shift 6s ease-in-out infinite;
    }
    @keyframes about-accent-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .about-divider {
      width: 0; height: 3px; border-radius: 999px;
      background: linear-gradient(90deg, #0ec9fc, #a855f7); margin-bottom: 1.75rem;
      animation: about-divider-grow 0.7s ease 0.28s forwards;
    }
    .about-text p {
      color: #94a3b8; font-size: 1rem; line-height: 1.75; margin-bottom: 1.25rem;
      opacity: 0; animation: about-fade-up 0.65s ease forwards;
    }
    .about-text p:nth-child(1) { animation-delay: 0.38s; }
    .about-text p:nth-child(2) { animation-delay: 0.5s; }
    .about-text p:nth-child(3) { animation-delay: 0.62s; }
    .about-text p:last-child { margin-bottom: 0; }
    .about-visual {
      position: relative; overflow: hidden; height: 100%; min-height: 100%;
      background: linear-gradient(145deg, rgba(0, 8, 20, 0.92), rgba(22, 32, 50, 0.98));
      border: 1px solid rgba(14, 201, 252, 0.14); border-radius: 1rem;
      padding: clamp(2.5rem, 6vw, 4rem) clamp(1.75rem, 4vw, 2.5rem);
      text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;
      box-shadow: 0 0 0 1px rgba(139, 90, 242, 0.06) inset, 0 24px 48px rgba(0, 0, 0, 0.35);
      opacity: 0; animation: about-fade-in-right 0.75s ease 0.18s forwards;
      transition: transform 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease;
    }
    .about-visual::before {
      content: ""; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 78%; height: 55%;
      background: radial-gradient(ellipse at center, rgba(14, 201, 252, 0.16) 0%, transparent 72%);
      pointer-events: none;
      animation: about-glow-pulse 7s ease-in-out infinite;
    }
    .about-visual::after {
      content: ""; position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(105deg, transparent 42%, rgba(14, 201, 252, 0.07) 50%, transparent 58%);
      animation: about-shimmer 9s ease-in-out infinite;
    }
    .about-brand-logo {
      position: relative; width: clamp(168px, 36vw, 208px); height: auto; object-fit: contain;
      margin-bottom: 1.5rem; filter: drop-shadow(0 12px 24px rgba(14, 201, 252, 0.22));
      animation: about-logo-float 5.5s ease-in-out infinite;
      transition: transform 0.45s ease, filter 0.45s ease;
    }
    .about-visual .brand-title {
      position: relative; font-size: clamp(2.15rem, 5vw, 2.85rem); margin-bottom: 0;
    }
    .about-visual .brand-slogan {
      position: relative; letter-spacing: 0.24em; font-size: 0.65rem; color: #64748b; margin-top: 0.65rem;
    }
    @media (hover: hover) {
      .about-visual:hover {
        transform: translateY(-6px);
        border-color: rgba(14, 201, 252, 0.34);
        box-shadow:
          0 0 0 1px rgba(139, 90, 242, 0.1) inset,
          0 28px 56px rgba(0, 0, 0, 0.42),
          0 0 48px rgba(14, 201, 252, 0.14);
      }
      .about-visual:hover::before {
        animation-duration: 3.5s;
        opacity: 1;
      }
      .about-visual:hover .about-brand-logo {
        animation-play-state: paused;
        transform: translateY(-12px) scale(1.05);
        filter: drop-shadow(0 16px 32px rgba(14, 201, 252, 0.38)) drop-shadow(0 0 24px rgba(139, 90, 242, 0.28));
      }
    }
    @media (max-width: 768px) {
      .about-visual { height: auto; min-height: 18rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      .about-content .section-label,
      .about-title,
      .about-title-accent,
      .about-divider,
      .about-text p,
      .about-visual {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
      .about-divider { width: 3.5rem; }
      .about-visual::before,
      .about-visual::after,
      .about-brand-logo {
        animation: none !important;
      }
      .about-visual:hover {
        transform: none;
      }
      .about-visual:hover .about-brand-logo {
        transform: none;
      }
    }
    #features { padding: 3.75rem 0; }
    .features-header { text-align: center; max-width: 44rem; margin: 0 auto 2.25rem; }
    .features-title {
      font-size: clamp(1.75rem, 4vw, 2.35rem); font-weight: 700; color: #f8fafc;
      line-height: 1.22; letter-spacing: -0.025em; margin-bottom: 0.65rem;
    }
    .features-accent-cyan {
      background: linear-gradient(135deg, #0ec9fc 0%, #0ec9fc 55%, #0090f8 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .features-accent-purple {
      background: linear-gradient(135deg, #8b5af2 0%, #a855f7 55%, #c084fc 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .features-desc { color: #94a3b8; font-size: 0.925rem; line-height: 1.58; max-width: 38rem; margin: 0 auto; }
    .features-header .section-label { margin-bottom: 0.45rem; }
    .features-stage {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) clamp(6.75rem, 11vw, 8.5rem) minmax(0, 1fr);
      grid-template-rows: repeat(3, minmax(4.5rem, auto));
      column-gap: clamp(1.25rem, 3vw, 2.5rem);
      row-gap: clamp(1.75rem, 3.2vw, 2.35rem);
      align-items: center;
      margin-top: 0.5rem;
      width: 100%;
    }
    .features-wires {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 0; overflow: visible;
    }
    .features-hub-cell {
      grid-column: 2; grid-row: 1 / -1;
      display: flex; align-items: center; justify-content: center;
      position: relative; z-index: 2;
      width: 100%;
    }
    .features-hub-outer {
      position: relative; width: 100%; aspect-ratio: 1;
      display: flex; align-items: center; justify-content: center;
      background: rgba(6, 10, 20, 0.96);
      border: 1px solid rgba(148, 163, 184, 0.22);
      clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
    }
    .features-hub-core {
      position: relative; width: 62%; aspect-ratio: 1;
      display: flex; align-items: center; justify-content: center;
      background: rgba(4, 8, 18, 0.98);
      clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
      box-shadow:
        0 0 30px rgba(14, 201, 252, 0.24),
        0 0 44px rgba(139, 90, 242, 0.16);
    }
    .features-hub-core::before {
      content: ""; position: absolute; inset: -2px;
      background: linear-gradient(160deg, #0ec9fc 0%, #8b5af2 50%, #a855f7 100%);
      clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
      z-index: -1;
    }
    .features-hub-core::after {
      content: ""; position: absolute; inset: 2px;
      background: rgba(4, 8, 18, 0.98);
      clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
      z-index: -1;
    }
    .features-hub-keyhole {
      width: 42%; height: 42%; color: #f8fafc; position: relative; z-index: 1;
    }
    .feat-group {
      position: relative; z-index: 1;
      align-items: center;
      gap: clamp(0.75rem, 1.5vw, 1.1rem);
    }
    .feat-group--left {
      grid-column: 1;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      justify-items: end;
    }
    .feat-group--right {
      grid-column: 3;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      justify-items: start;
    }
    .feat-row-1 { grid-row: 1; }
    .feat-row-2 { grid-row: 2; }
    .feat-row-3 { grid-row: 3; }
    .feat-icon {
      flex-shrink: 0; width: 3rem; height: 3rem; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: rgba(6, 10, 22, 0.98);
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 2;
    }
    .feat-icon--left { grid-column: 2; grid-row: 1; }
    .feat-icon--right { grid-column: 1; grid-row: 1; }
    .feat-icon--left {
      border: 1px solid rgba(14, 201, 252, 0.42);
      box-shadow:
        0 0 0 3px rgba(14, 201, 252, 0.06),
        0 0 24px rgba(14, 201, 252, 0.22),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .feat-icon--right {
      border: 1px solid rgba(167, 139, 250, 0.45);
      box-shadow:
        0 0 0 3px rgba(168, 85, 247, 0.06),
        0 0 24px rgba(129, 140, 248, 0.24),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .feat-icon svg {
      width: 1.3rem; height: 1.3rem; stroke: url(#featIconGrad); fill: none;
      stroke-linecap: round; stroke-linejoin: round;
    }
    .feat-copy {
      min-width: 0;
      max-width: clamp(13.5rem, 28vw, 19.5rem);
    }
    .feat-copy--left {
      grid-column: 1; grid-row: 1;
      text-align: right;
      justify-self: end;
      padding-right: 0.15rem;
    }
    .feat-copy--right {
      grid-column: 2; grid-row: 1;
      text-align: left;
      justify-self: start;
      padding-left: 0.15rem;
    }
    .feat-copy h3 {
      font-size: 0.94rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.32rem; line-height: 1.3;
    }
    .feat-copy p { font-size: 0.8125rem; color: #94a3b8; line-height: 1.52; margin: 0; }
    @media (max-width: 900px) {
      .features-stage {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
        row-gap: 1.35rem;
        padding: 0;
      }
      .features-wires { display: none; }
      .features-hub-cell {
        grid-column: 1; grid-row: 1; width: auto; margin: 0 auto 0.75rem;
      }
      .features-hub-outer { width: 6.75rem; height: 6.75rem; }
      .features-hub-core { width: 62%; height: 62%; }
      .feat-group--left,
      .feat-group--right {
        grid-column: 1;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        justify-items: unset;
      }
      .feat-group--right { flex-direction: row; }
      .feat-icon--left,
      .feat-icon--right { grid-column: unset; grid-row: unset; }
      .feat-copy--left,
      .feat-copy--right {
        grid-column: unset; grid-row: unset;
        text-align: left;
        justify-self: unset;
        flex: 1;
        max-width: none;
        padding: 0;
      }
      .feat-row-1 { grid-row: 2; }
      .feat-group--right.feat-row-1 { grid-row: 3; }
      .feat-row-2 { grid-row: 4; }
      .feat-group--right.feat-row-2 { grid-row: 5; }
      .feat-row-3 { grid-row: 6; }
      .feat-group--right.feat-row-3 { grid-row: 7; }
    }
    .features-footer-banner {
      display: grid; grid-template-columns: 1fr auto 1fr; gap: 1.25rem 2rem; align-items: center;
      margin-top: 2.75rem; padding: 1.05rem clamp(1.5rem, 3vw, 2.25rem);
      background: linear-gradient(145deg, rgba(10, 16, 28, 0.92), rgba(16, 24, 40, 0.96));
      border: 1px solid rgba(14, 201, 252, 0.18); border-radius: 999px;
      box-shadow:
        0 0 0 1px rgba(139, 90, 242, 0.07) inset,
        0 12px 40px rgba(0, 0, 0, 0.24);
    }
    @media (max-width: 768px) {
      .features-footer-banner {
        grid-template-columns: 1fr; text-align: center; gap: 1rem;
        border-radius: 1.25rem; padding: 1.35rem 1.25rem;
      }
      .features-footer-left { justify-content: center; justify-self: center; }
      .features-footer-divider { display: none; }
      .features-footer-right p { text-align: center; justify-self: center; }
    }
    .features-footer-left {
      display: flex; align-items: center; gap: 0.85rem;
      justify-self: start;
    }
    .features-footer-shield-wrap {
      flex-shrink: 0; width: 2.35rem; height: 2.35rem; color: #0ec9fc;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      background: rgba(6, 10, 22, 0.82);
      border: 1px solid rgba(14, 201, 252, 0.35);
      box-shadow: 0 0 20px rgba(14, 201, 252, 0.16);
    }
    .features-footer-shield-wrap svg { width: 1.15rem; height: 1.15rem; }
    .features-footer-left strong {
      display: block; font-size: 0.85rem; color: #f1f5f9; margin-bottom: 0.1rem;
    }
    .features-footer-left p { font-size: 0.75rem; color: #64748b; margin: 0; line-height: 1.4; }
    .features-footer-divider {
      width: 1px; height: 2rem;
      background: linear-gradient(180deg, transparent, rgba(100, 116, 139, 0.55), transparent);
    }
    .features-footer-right p {
      font-size: 0.875rem; color: #cbd5e1; line-height: 1.5; margin: 0;
      text-align: right; justify-self: end;
    }
    .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 2rem; }
    @media (max-width: 768px) { .steps { grid-template-columns: 1fr; } }
    .step {
      text-align: center; padding: 1.5rem;
      background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem;
    }
    .step-num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 2.5rem; height: 2.5rem; border-radius: 50%;
      background: linear-gradient(135deg, #0090f8, #8b5af2);
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
    #install {
      position: relative; padding: 4.5rem 0; overflow: hidden;
    }
    #install::before {
      content: ""; position: absolute; right: -8%; bottom: -20%; width: 52%; height: 70%;
      background: radial-gradient(ellipse at center, rgba(14, 201, 252, 0.1) 0%, rgba(139, 90, 242, 0.06) 35%, transparent 72%);
      pointer-events: none;
    }
    .install-header { margin-bottom: 1.35rem; }
    .install-title {
      font-size: clamp(1.55rem, 3.5vw, 2rem); font-weight: 700; color: #f1f5f9;
      line-height: 1.22; letter-spacing: -0.02em; margin-bottom: 0.45rem;
    }
    .install-title-accent {
      background: linear-gradient(135deg, #0ec9fc 0%, #0090f8 50%, #a855f7 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .install-desc { color: #94a3b8; font-size: 0.88rem; max-width: 36rem; line-height: 1.5; }
    .install-grid {
      display: grid; grid-template-columns: 1.05fr 0.95fr; gap: clamp(1.25rem, 3vw, 2rem);
      align-items: start;
    }
    @media (max-width: 960px) {
      .install-grid { grid-template-columns: 1fr; }
      .install-visual { order: -1; }
    }
    .install-panel {
      position: relative;
      background: linear-gradient(145deg, rgba(0, 8, 20, 0.82), rgba(22, 32, 50, 0.9));
      border: 1px solid rgba(14, 201, 252, 0.14); border-radius: 0.85rem;
      padding: 1.1rem 1.15rem;
      box-shadow: 0 0 0 1px rgba(139, 90, 242, 0.05) inset, 0 20px 40px rgba(0, 0, 0, 0.28);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    }
    .install-download-btn {
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      width: 100%; padding: 0.65rem 1rem; border-radius: 0.55rem;
      background: linear-gradient(90deg, #0090f8 0%, #8b5af2 100%);
      color: #fff !important; font-size: 0.84rem; font-weight: 600; text-decoration: none !important;
      box-shadow: 0 6px 18px rgba(14, 201, 252, 0.24);
      transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    }
    .install-download-btn:hover {
      opacity: 0.96; transform: translateY(-1px);
      box-shadow: 0 10px 28px rgba(14, 201, 252, 0.36);
    }
    .install-download-btn svg { flex-shrink: 0; width: 16px; height: 16px; }
    .install-download-chevron { margin-left: auto; opacity: 0.9; width: 16px !important; height: 16px !important; }
    .install-build {
      display: flex; align-items: center; flex-wrap: wrap; gap: 0.4rem;
      margin: 0.65rem 0 0.85rem; font-size: 0.78rem; color: #94a3b8;
    }
    .install-build-pill {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.25rem 0.4rem 0.25rem 0.55rem;
      background: rgba(10, 15, 30, 0.75); border: 1px solid rgba(51, 65, 85, 0.8);
      border-radius: 0.4rem;
    }
    .install-build-pill code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.72rem; color: #0ec9fc; background: none; padding: 0;
    }
    .install-copy-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 1.45rem; height: 1.45rem; padding: 0; border: none; border-radius: 0.3rem;
      background: rgba(30, 41, 59, 0.8); color: #94a3b8; cursor: pointer;
      transition: color 0.2s ease, background 0.2s ease;
    }
    .install-copy-btn:hover { color: #e2e8f0; background: rgba(51, 65, 85, 0.9); }
    .install-copy-btn svg { width: 12px; height: 12px; }
    .install-steps {
      list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin: 0; padding: 0;
    }
    .install-steps li {
      display: flex; gap: 0.6rem; align-items: flex-start;
      font-size: 0.8rem; color: #cbd5e1; line-height: 1.45;
    }
    .install-step-num {
      flex-shrink: 0; width: 1.35rem; height: 1.35rem; margin-top: 0.05rem;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%; border: 1px solid rgba(14, 201, 252, 0.35);
      font-size: 0.65rem; font-weight: 700; color: #7dd3fc;
      background: rgba(14, 201, 252, 0.08);
    }
    .install-steps code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.74rem; color: #0ec9fc; background: rgba(0, 8, 20, 0.55);
      padding: 0.05rem 0.3rem; border-radius: 0.25rem;
    }
    .install-notice {
      display: flex; gap: 0.55rem; align-items: flex-start;
      margin-top: 0.85rem; padding: 0.65rem 0.75rem;
      background: rgba(10, 15, 30, 0.55); border: 1px solid rgba(51, 65, 85, 0.75);
      border-radius: 0.55rem; font-size: 0.76rem; color: #94a3b8; line-height: 1.45;
    }
    .install-notice svg {
      flex-shrink: 0; width: 0.95rem; height: 0.95rem; margin-top: 0.1rem; color: #0ec9fc;
    }
    .install-stores {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0.55rem; margin-top: 0.85rem;
    }
    @media (max-width: 520px) { .install-stores { grid-template-columns: 1fr; } }
    .install-store-card {
      display: flex; align-items: center; gap: 0.55rem;
      padding: 0.6rem 0.75rem;
      background: rgba(10, 15, 30, 0.45); border: 1px solid rgba(51, 65, 85, 0.65);
      border-radius: 0.55rem;
    }
    .install-store-card img { width: 22px; height: 22px; flex-shrink: 0; }
    .install-store-card strong {
      display: block; font-size: 0.76rem; font-weight: 600; color: #e2e8f0; line-height: 1.25;
    }
    .install-store-card span { font-size: 0.68rem; color: #64748b; }
    .install-help {
      display: flex; align-items: center; justify-content: center; gap: 0.4rem;
      margin-top: 1.5rem; font-size: 0.82rem; color: #94a3b8; text-align: center;
    }
    .install-help svg { width: 0.9rem; height: 0.9rem; color: #64748b; flex-shrink: 0; }
    .install-visual { position: relative; min-height: 28rem; overflow: visible; }
    .install-scene {
      position: relative; width: min(100%, 480px); min-height: 26rem; margin: 0 auto;
      overflow: visible;
    }
    .install-orbit-bg {
      position: absolute; inset: -22% -28% -18% -28%; width: 156%; height: 148%;
      pointer-events: none; opacity: 0.62;
      animation: install-orbit-drift 28s linear infinite;
      transform-origin: center center;
    }
    @keyframes install-orbit-drift {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .install-browser-window {
      position: relative; z-index: 1; width: 100%;
      background: linear-gradient(145deg, rgba(0, 8, 20, 0.78), rgba(10, 15, 30, 0.88));
      border: 1px solid rgba(148, 163, 184, 0.16); border-radius: 1.15rem;
      overflow: visible;
      box-shadow: 0 28px 56px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    }
    .install-window-bar {
      display: flex; align-items: center; gap: 0.7rem;
      padding: 0.8rem 1rem; border-bottom: 1px solid rgba(51, 65, 85, 0.55);
      background: rgba(0, 8, 20, 0.72);
      border-radius: 1.15rem 1.15rem 0 0;
      position: relative; z-index: 2; overflow: visible;
    }
    .install-window-dots { display: flex; gap: 0.35rem; flex-shrink: 0; }
    .install-window-dot { width: 0.55rem; height: 0.55rem; border-radius: 50%; }
    .install-window-dot--red { background: #ff5f57; }
    .install-window-dot--yellow { background: #febc2e; }
    .install-window-dot--green { background: #28c840; }
    .install-window-address {
      flex: 1; min-width: 0; height: 1.5rem; border-radius: 0.45rem;
      background: rgba(10, 15, 30, 0.75); border: 1px solid rgba(51, 65, 85, 0.65);
      padding: 0 0.55rem; display: flex; align-items: center;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.68rem; color: #64748b;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .install-window-ext {
      flex-shrink: 0; width: 1.85rem; height: 1.85rem; border-radius: 0.45rem;
      display: flex; align-items: center; justify-content: center;
      background: rgba(10, 15, 30, 0.8); border: 1px solid rgba(14, 201, 252, 0.25);
      box-shadow: 0 0 12px rgba(14, 201, 252, 0.18);
    }
    .install-window-ext-anchor { position: relative; flex-shrink: 0; z-index: 4; }
    .install-window-ext img { width: 1.45rem; height: 1.45rem; object-fit: contain; }
    .install-window-content {
      position: relative; min-height: 18rem; padding: 1.75rem 1.5rem 2.25rem;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .install-page-brand { text-align: center; z-index: 1; }
    .install-page-logo {
      width: clamp(120px, 30vw, 152px); height: auto; object-fit: contain;
      filter: drop-shadow(0 0 28px rgba(14, 201, 252, 0.35)) drop-shadow(0 0 18px rgba(139, 90, 242, 0.25));
      animation: install-page-logo-glow 6s ease-in-out infinite;
    }
    @keyframes install-page-logo-glow {
      0%, 100% { filter: drop-shadow(0 0 28px rgba(14, 201, 252, 0.35)) drop-shadow(0 0 18px rgba(139, 90, 242, 0.25)); }
      50% { filter: drop-shadow(0 0 36px rgba(14, 201, 252, 0.48)) drop-shadow(0 0 24px rgba(139, 90, 242, 0.38)); }
    }
    .install-page-title {
      margin-top: 0.75rem; font-size: clamp(1.5rem, 3.8vw, 1.85rem); font-weight: 800;
      letter-spacing: -0.02em; line-height: 1;
    }
    .install-page-skeleton {
      position: absolute; left: 1.35rem; bottom: 1.5rem;
      display: flex; flex-direction: column; gap: 0.45rem; width: 42%;
    }
    .install-page-skeleton span {
      display: block; height: 0.45rem; border-radius: 999px;
      background: rgba(51, 65, 85, 0.55);
    }
    .install-page-skeleton span:nth-child(1) { width: 88%; }
    .install-page-skeleton span:nth-child(2) { width: 72%; }
    .install-page-skeleton span:nth-child(3) { width: 56%; }
    .install-extension-popup {
      position: absolute; z-index: 3;
      top: calc(100% + 0.5rem); right: 0;
      width: 200px;
      background: linear-gradient(160deg, rgba(0, 8, 20, 0.92), rgba(22, 32, 50, 0.96));
      border: 1px solid rgba(14, 201, 252, 0.22); border-radius: 0.85rem;
      box-shadow: 0 20px 44px rgba(0, 0, 0, 0.5), 0 0 32px rgba(14, 201, 252, 0.1);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      animation: install-popup-float 5s ease-in-out infinite;
    }
    @keyframes install-popup-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .install-popup-pointer {
      position: absolute; top: -0.42rem; right: 0.5rem;
      width: 0.85rem; height: 0.85rem;
      background: linear-gradient(160deg, rgba(0, 8, 20, 0.92), rgba(22, 32, 50, 0.96));
      border-left: 1px solid rgba(14, 201, 252, 0.22);
      border-top: 1px solid rgba(14, 201, 252, 0.22);
      transform: rotate(45deg);
    }
    .install-popup-bar {
      display: flex; gap: 0.3rem; padding: 0.55rem 0.7rem 0.35rem;
    }
    .install-popup-dot { width: 0.42rem; height: 0.42rem; border-radius: 50%; }
    .install-popup-dot--red { background: #ff5f57; }
    .install-popup-dot--yellow { background: #febc2e; }
    .install-popup-dot--green { background: #28c840; }
    .install-popup-body {
      padding: 0.25rem 0.85rem 0.9rem; display: flex; flex-direction: column; align-items: center; gap: 0.55rem;
    }
    .install-popup-logo {
      width: 3.25rem; height: 3.25rem; object-fit: contain;
      filter: drop-shadow(0 0 14px rgba(14, 201, 252, 0.3));
    }
    .install-popup-skeleton { width: 100%; display: flex; flex-direction: column; gap: 0.35rem; }
    .install-popup-skeleton span {
      display: block; height: 0.38rem; border-radius: 999px; background: rgba(51, 65, 85, 0.65);
    }
    .install-popup-skeleton span:nth-child(1) { width: 78%; margin: 0 auto; }
    .install-popup-skeleton span:nth-child(2) { width: 62%; margin: 0 auto; }
    .install-popup-field {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 0.45rem 0.55rem; border-radius: 0.45rem;
      background: rgba(10, 15, 30, 0.85); border: 1px solid rgba(51, 65, 85, 0.75);
    }
    .install-popup-dots { font-size: 0.72rem; letter-spacing: 0.12em; color: #64748b; }
    .install-popup-field svg { width: 0.9rem; height: 0.9rem; color: #94a3b8; flex-shrink: 0; }
    .install-popup-btn {
      width: 100%; height: 1.65rem; border-radius: 0.45rem;
      background: linear-gradient(90deg, #0090f8 0%, #8b5af2 100%);
      box-shadow: 0 4px 16px rgba(14, 201, 252, 0.28);
    }
    @media (max-width: 960px) {
      .install-extension-popup { width: 190px; }
    }
    @media (max-width: 520px) {
      .install-extension-popup {
        position: absolute; top: calc(100% + 0.5rem); right: 0; width: min(72vw, 200px);
      }
      .install-popup-pointer { display: none; }
      .install-scene { min-height: auto; }
    }
    @media (prefers-reduced-motion: reduce) {
      .install-orbit-bg,
      .install-page-logo,
      .install-extension-popup { animation: none !important; }
    }
    .note { margin-top: 1rem; font-size: 0.9rem; color: #94a3b8; }
    .stores { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
    .store-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: #0a1220; border: 1px dashed #475569; color: #94a3b8;
      padding: 0.65rem 1.25rem; border-radius: 0.5rem; font-size: 0.9rem;
    }
    .store-badge svg { width: 20px; height: 20px; opacity: 0.5; }
    .faq-preview { margin: 2rem auto 0; max-width: 72rem; width: 100%; }
    .faq-preview .more-link { display: inline-block; margin-top: 1rem; font-weight: 600; }
    .support-section {
      padding: 4rem 0 3.5rem;
      background: #0a0e17;
    }
    .support-pill {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.35rem 1rem; margin-bottom: 2.5rem;
      border: 1px solid rgba(14, 201, 252, 0.45); border-radius: 999px;
      font-size: 0.7rem; font-weight: 600; letter-spacing: 0.14em;
      text-transform: uppercase; color: #7dd3fc;
    }
    .support-pill svg { width: 14px; height: 14px; color: #f472b6; }
    .support-wrap { text-align: center; }
    .support-hero {
      display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;
      align-items: center; text-align: left; margin-bottom: 2.5rem;
    }
    @media (max-width: 768px) {
      .support-hero { grid-template-columns: 1fr; text-align: center; gap: 2rem; }
      .support-copy { text-align: center; }
      .support-meta { justify-content: center; }
    }
    .support-brand { display: flex; flex-direction: column; align-items: center; }
    .support-brand-logo { width: 132px; height: 132px; object-fit: contain; margin-bottom: 0.75rem; }
    .support-brand .brand-title { font-size: 2.5rem; }
    .support-brand .brand-slogan {
      letter-spacing: 0.22em; font-size: 0.65rem; color: #64748b;
      text-transform: uppercase; margin-top: 0.35rem;
    }
    .support-eyebrow {
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em;
      text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem;
    }
    .support-heading {
      font-size: clamp(1.75rem, 3.5vw, 2.25rem); font-weight: 700;
      color: #f8fafc; line-height: 1.2; margin-bottom: 1rem;
    }
    .support-desc {
      color: #94a3b8; font-size: 0.95rem; line-height: 1.65; margin-bottom: 1.5rem; max-width: 28rem;
    }
    .btn-sponsor-gh {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.65rem;
      background: linear-gradient(90deg, #ec4899 0%, #db2777 45%, #be185d 100%);
      color: #fff; font-weight: 700; font-size: 1rem;
      padding: 0.85rem 1.75rem; border-radius: 999px; text-decoration: none;
      box-shadow: 0 0 32px rgba(236, 72, 153, 0.35);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .btn-sponsor-gh:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 40px rgba(236, 72, 153, 0.5);
      text-decoration: none; color: #fff;
    }
    .btn-sponsor-gh svg { width: 20px; height: 20px; flex-shrink: 0; }
    .btn-sponsor-gh .arrow { font-size: 1.1rem; opacity: 0.9; }
    .support-meta {
      display: flex; flex-wrap: wrap; gap: 1.25rem; margin-top: 1.25rem;
      font-size: 0.78rem; color: #64748b;
    }
    .support-meta span { display: inline-flex; align-items: center; gap: 0.35rem; }
    .support-meta svg { width: 14px; height: 14px; opacity: 0.7; }
    .support-meta a { color: #64748b; text-decoration: none; }
    .support-meta a:hover { color: #94a3b8; text-decoration: none; }
    .support-divider {
      display: flex; align-items: center; gap: 1rem;
      margin: 2rem 0 2.5rem; color: #475569;
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    }
    .support-divider::before, .support-divider::after {
      content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #334155, transparent);
    }
    .support-benefits {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; text-align: left;
    }
    @media (max-width: 900px) { .support-benefits { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .support-benefits { grid-template-columns: 1fr; } }
    .support-benefit { padding: 0.25rem 0; }
    .support-benefit-icon {
      width: 2.75rem; height: 2.75rem; border-radius: 0.65rem;
      display: flex; align-items: center; justify-content: center; margin-bottom: 0.85rem;
    }
    .support-benefit-icon svg { width: 1.35rem; height: 1.35rem; }
    .support-benefit-icon--cyan { background: rgba(34, 211, 238, 0.12); color: #0ec9fc; }
    .support-benefit-icon--purple { background: rgba(167, 139, 250, 0.12); color: #a78bfa; }
    .support-benefit-icon--teal { background: rgba(45, 212, 191, 0.12); color: #2dd4bf; }
    .support-benefit-icon--pink { background: rgba(244, 114, 182, 0.12); color: #f472b6; }
    .support-benefit h3 { font-size: 0.92rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.4rem; }
    .support-benefit p { font-size: 0.82rem; color: #64748b; line-height: 1.55; margin: 0; }
"""


def extension_popup_mockup_html(wrapper_class: str = "hero-mockup") -> str:
    search_icon = """<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>"""
    chevron_icon = """<svg class="mockup-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>"""
    github_logo = """<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 4.31 3.435 7.97 8.205 9.56.6.11.82-.26.82-.58 0-.28-.01-1.02-.01-2-3.338.73-4.043-1.61-4.043-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.74.084-.73.084-.73 1.205.08 1.838 1.24 1.838 1.24 1.07 1.83 2.79 1.3 3.47.99.11-.77.45-1.3.82-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.465-2.38 1.235-3.22-.135-.3-.54-1.525.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 19.97 24 16.307 24 12c0-6.63-5.37-12-12-12z"/></svg>"""
    notion_logo = """<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4.6 2.025h14.8c1.425 0 2.6 1.175 2.6 2.6v14.75c0 1.425-1.175 2.6-2.6 2.6H4.6c-1.425 0-2.6-1.175-2.6-2.6V4.625c0-1.425 1.175-2.6 2.6-2.6zm3.175 4.3v11.35h2.15v-5.95l3.8 5.95h2.475V6.325h-2.15v5.95l-3.8-5.95H7.775z"/></svg>"""
    google_logo = """<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.19-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>"""
    slack_logo = """<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#36C5F0" d="M5 10.5c0-1.38 1.12-2.5 2.5-2.5h2.5v2.5c0 1.38-1.12 2.5-2.5 2.5H5v-2.5zm5 0c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v2.5h-2.5c-1.38 0-2.5-1.12-2.5-2.5v-2.5z"/><path fill="#2EB67D" d="M13.5 5c1.38 0 2.5 1.12 2.5 2.5v2.5h-2.5C12.12 10 11 8.88 11 7.5S12.12 5 13.5 5zm0 5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5h-2.5v-2.5c0-1.38 1.12-2.5 2.5-2.5z"/><path fill="#ECB22E" d="M19 13.5c0 1.38-1.12 2.5-2.5 2.5h-2.5v-2.5c0-1.38 1.12-2.5 2.5-2.5H19v2.5zm-5 0c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5v-2.5h2.5c1.38 0 2.5 1.12 2.5 2.5v-2.5z"/><path fill="#E01E5A" d="M10.5 19c-1.38 0-2.5-1.12-2.5-2.5v-2.5h2.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5zm0-5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5h2.5v2.5c0 1.38-1.12 2.5-2.5 2.5z"/></svg>"""
    microsoft_logo = """<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#7fba00" d="M13 1h10v10H13z"/><path fill="#00a4ef" d="M1 13h10v10H1z"/><path fill="#ffb900" d="M13 13h10v10H13z"/></svg>"""
    return f"""
            <div class="{wrapper_class}" aria-hidden="true">
            <div class="mockup-header">
              <div class="mockup-brand">
                <img src="{LOGO_ICON}" alt="" width="28" height="28" />
                <span>VaultHarbor</span>
              </div>
              <div class="mockup-actions">
                <span class="mockup-btn">+</span>
                <span class="mockup-btn">⋯</span>
              </div>
            </div>
            <div class="mockup-search">
              {search_icon}
              <span>Search passwords…</span>
            </div>
            <div class="mockup-list">
              <div class="mockup-row">
                <div class="mockup-favicon mockup-favicon--gh">{github_logo}</div>
                <div class="mockup-row-body">
                  <div class="mockup-row-name">GitHub</div>
                  <div class="mockup-row-email">dev@example.com</div>
                </div>
                <span class="mockup-dots">•••••</span>
                {chevron_icon}
              </div>
              <div class="mockup-row">
                <div class="mockup-favicon mockup-favicon--no">{notion_logo}</div>
                <div class="mockup-row-body">
                  <div class="mockup-row-name">Notion</div>
                  <div class="mockup-row-email">workspace@example.com</div>
                </div>
                <span class="mockup-dots">•••••</span>
                {chevron_icon}
              </div>
              <div class="mockup-row">
                <div class="mockup-favicon mockup-favicon--go">{google_logo}</div>
                <div class="mockup-row-body">
                  <div class="mockup-row-name">Google</div>
                  <div class="mockup-row-email">user@example.com</div>
                </div>
                <span class="mockup-dots">•••••</span>
                {chevron_icon}
              </div>
              <div class="mockup-row">
                <div class="mockup-favicon mockup-favicon--sl">{slack_logo}</div>
                <div class="mockup-row-body">
                  <div class="mockup-row-name">Slack</div>
                  <div class="mockup-row-email">team@example.com</div>
                </div>
                <span class="mockup-dots">•••••</span>
                {chevron_icon}
              </div>
              <div class="mockup-row">
                <div class="mockup-favicon mockup-favicon--ms">{microsoft_logo}</div>
                <div class="mockup-row-body">
                  <div class="mockup-row-name">Microsoft</div>
                  <div class="mockup-row-email">office@example.com</div>
                </div>
                <span class="mockup-dots">•••••</span>
                {chevron_icon}
              </div>
            </div>
          </div>"""


def hero_section_html() -> str:
    download_svg = """<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>"""

    orbit_svg = """<svg class="hero-orbit-svg" viewBox="0 0 300 400" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="heroOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0ec9fc" stop-opacity="0.65"/>
          <stop offset="50%" stop-color="#8b5af2" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0.3"/>
        </linearGradient>
      </defs>
      <g class="hero-orbit-field">
        <!-- Equatorial plane (0°) -->
        <ellipse cx="150" cy="200" rx="162" ry="48" stroke="url(#heroOrbitGrad)" stroke-width="1.35" transform="rotate(0 150 200)" opacity="0.68"/>
        <ellipse cx="150" cy="200" rx="134" ry="40" stroke="url(#heroOrbitGrad)" stroke-width="1.1" transform="rotate(0 150 200)" opacity="0.52"/>
        <ellipse cx="150" cy="200" rx="106" ry="32" stroke="url(#heroOrbitGrad)" stroke-width="0.85" transform="rotate(0 150 200)" opacity="0.38"/>
        <!-- Polar plane (90°): crosses equatorial (+) -->
        <ellipse cx="150" cy="200" rx="162" ry="48" stroke="url(#heroOrbitGrad)" stroke-width="1.35" transform="rotate(90 150 200)" opacity="0.68"/>
        <ellipse cx="150" cy="200" rx="134" ry="40" stroke="url(#heroOrbitGrad)" stroke-width="1.1" transform="rotate(90 150 200)" opacity="0.52"/>
        <ellipse cx="150" cy="200" rx="106" ry="32" stroke="url(#heroOrbitGrad)" stroke-width="0.85" transform="rotate(90 150 200)" opacity="0.38"/>
        <!-- Inclined planes (±45°): star arms -->
        <ellipse cx="150" cy="200" rx="154" ry="46" stroke="url(#heroOrbitGrad)" stroke-width="1.2" transform="rotate(45 150 200)" opacity="0.58"/>
        <ellipse cx="150" cy="200" rx="128" ry="38" stroke="url(#heroOrbitGrad)" stroke-width="0.95" transform="rotate(45 150 200)" opacity="0.44"/>
        <ellipse cx="150" cy="200" rx="102" ry="30" stroke="url(#heroOrbitGrad)" stroke-width="0.75" transform="rotate(45 150 200)" opacity="0.3"/>
        <ellipse cx="150" cy="200" rx="154" ry="46" stroke="url(#heroOrbitGrad)" stroke-width="1.2" transform="rotate(-45 150 200)" opacity="0.58"/>
        <ellipse cx="150" cy="200" rx="128" ry="38" stroke="url(#heroOrbitGrad)" stroke-width="0.95" transform="rotate(-45 150 200)" opacity="0.44"/>
        <ellipse cx="150" cy="200" rx="102" ry="30" stroke="url(#heroOrbitGrad)" stroke-width="0.75" transform="rotate(-45 150 200)" opacity="0.3"/>
        <!-- High-inclination sync planes (±30° / ±60°): extra orbital lanes -->
        <ellipse cx="150" cy="200" rx="148" ry="44" stroke="url(#heroOrbitGrad)" stroke-width="1" transform="rotate(30 150 200)" opacity="0.42"/>
        <ellipse cx="150" cy="200" rx="148" ry="44" stroke="url(#heroOrbitGrad)" stroke-width="1" transform="rotate(-30 150 200)" opacity="0.42"/>
        <ellipse cx="150" cy="200" rx="140" ry="42" stroke="url(#heroOrbitGrad)" stroke-width="0.9" transform="rotate(60 150 200)" opacity="0.36"/>
        <ellipse cx="150" cy="200" rx="140" ry="42" stroke="url(#heroOrbitGrad)" stroke-width="0.9" transform="rotate(-60 150 200)" opacity="0.36"/>
      </g>
    </svg>"""

    return f"""
  <header class="hero">
    <div class="container hero-container">
      <div class="hero-grid">
        <div class="hero-content">
          <div class="hero-badge">🔒 Zero-knowledge. Always private.</div>
          <h1 class="hero-title">
            <span>Your passwords.</span>
            <span>Your encryption.</span>
            <span class="hero-title-gradient">Your control.</span>
          </h1>
          <p class="hero-desc">
            VaultHarbor is a zero-knowledge password manager. Credentials are encrypted on your device
            before they ever leave. The server only stores opaque blobs it cannot read.
          </p>
          <div class="hero-actions">
            <a class="btn-primary" href="#install">
              {download_svg}
              Get the extension
            </a>
            <a class="btn-secondary" href="#about">Learn more</a>
          </div>
          <div class="hero-availability">
            <span>Available for</span>
            <span class="hero-availability-icons">
              <img src="{BROWSER_ICON_CHROME}" alt="" width="22" height="22" loading="lazy" decoding="async" />
              <img src="{BROWSER_ICON_EDGE}" alt="" width="22" height="22" loading="lazy" decoding="async" />
              <img src="{BROWSER_ICON_BRAVE}" alt="" width="22" height="22" loading="lazy" decoding="async" />
              <img src="{BROWSER_ICON_STORE}" alt="" width="22" height="22" loading="lazy" decoding="async" />
            </span>
            <span>Chrome · Edge · Brave · More coming soon</span>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-orbit-stage">
            <div class="hero-visual-glow" aria-hidden="true"></div>
            {orbit_svg}
            {extension_popup_mockup_html()}
          <img class="hero-float-logo" src="{ICON_512}" alt="" width="108" height="108" />
          </div>
        </div>
      </div>

      <div class="hero-trust">
        <div class="hero-trust-item">
          <svg class="hero-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <h4>Zero-knowledge</h4>
            <p>Only you can decrypt your data.</p>
          </div>
        </div>
        <div class="hero-trust-item">
          <svg class="hero-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          <div>
            <h4>End-to-end encrypted</h4>
            <p>Encrypted on device before syncing.</p>
          </div>
        </div>
        <div class="hero-trust-item">
          <svg class="hero-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>
          <div>
            <h4>Secure sync</h4>
            <p>Reliable and fast sync across your devices.</p>
          </div>
        </div>
        <div class="hero-trust-item">
          <svg class="hero-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          <div>
            <h4>Open source</h4>
            <p>Transparent, auditable and community driven.</p>
          </div>
        </div>
      </div>
    </div>
  </header>"""


def about_section_html() -> str:
    return f"""
  <section id="about">
    <div class="container">
      <div class="about-grid">
        <div class="about-content">
          <p class="section-label">About</p>
          <h2 class="about-title">
            A password manager built on <span class="about-title-accent">trust</span>, not access
          </h2>
          <div class="about-divider" aria-hidden="true"></div>
          <div class="about-text">
            <p>
              VaultHarbor keeps your logins, passwords, and secure notes in an encrypted vault
              that lives on your devices. When you save a credential, it is encrypted locally
              with keys derived from your master password, then synced to the cloud as
              unreadable data.
            </p>
            <p>
              The browser extension brings VaultHarbor into your daily workflow: autofill on
              login pages, save new credentials as you sign up, update passwords when they
              change, and unlock your vault with a single master password.
            </p>
            <p>
              The sync backend is self-hosted and open source, so you choose where your encrypted
              vault lives, and no vendor holds the keys to your data.
            </p>
          </div>
        </div>
        <div class="about-visual">
          <img class="about-brand-logo" src="{ICON_512}" alt="" width="208" height="208" loading="lazy" decoding="async" />
          <h2 class="brand-title">
            <span class="brand-title-vault">Vault</span><span class="brand-title-harbor">Harbor</span>
          </h2>
          <p class="brand-slogan">Secure. Sync. Everywhere.</p>
        </div>
      </div>
    </div>
  </section>"""


def install_visual_html() -> str:
    lock_svg = """<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>"""
    orbit_svg = """<svg class="install-orbit-bg" viewBox="0 0 400 360" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="installOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0ec9fc" stop-opacity="0.5"/>
          <stop offset="50%" stop-color="#8b5af2" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0.25"/>
        </linearGradient>
      </defs>
      <g transform="translate(200 180)">
        <ellipse cx="0" cy="0" rx="182" ry="54" stroke="url(#installOrbitGrad)" stroke-width="1.2" opacity="0.58"/>
        <ellipse cx="0" cy="0" rx="148" ry="42" stroke="url(#installOrbitGrad)" stroke-width="0.95" opacity="0.44"/>
        <ellipse cx="0" cy="0" rx="118" ry="34" stroke="url(#installOrbitGrad)" stroke-width="0.75" opacity="0.32"/>
        <ellipse cx="0" cy="0" rx="182" ry="54" stroke="url(#installOrbitGrad)" stroke-width="1.2" transform="rotate(58)" opacity="0.5"/>
        <ellipse cx="0" cy="0" rx="148" ry="42" stroke="url(#installOrbitGrad)" stroke-width="0.95" transform="rotate(58)" opacity="0.38"/>
        <ellipse cx="0" cy="0" rx="118" ry="34" stroke="url(#installOrbitGrad)" stroke-width="0.75" transform="rotate(58)" opacity="0.28"/>
        <ellipse cx="0" cy="0" rx="182" ry="54" stroke="url(#installOrbitGrad)" stroke-width="1.2" transform="rotate(-58)" opacity="0.5"/>
        <ellipse cx="0" cy="0" rx="148" ry="42" stroke="url(#installOrbitGrad)" stroke-width="0.95" transform="rotate(-58)" opacity="0.38"/>
        <ellipse cx="0" cy="0" rx="118" ry="34" stroke="url(#installOrbitGrad)" stroke-width="0.75" transform="rotate(-58)" opacity="0.28"/>
        <ellipse cx="0" cy="0" rx="172" ry="50" stroke="url(#installOrbitGrad)" stroke-width="1" transform="rotate(90)" opacity="0.42"/>
        <ellipse cx="0" cy="0" rx="138" ry="40" stroke="url(#installOrbitGrad)" stroke-width="0.85" transform="rotate(90)" opacity="0.3"/>
      </g>
    </svg>"""
    return f"""
          <div class="install-scene" aria-hidden="true">
            {orbit_svg}
            <div class="install-browser-window">
              <div class="install-window-bar">
                <div class="install-window-dots">
                  <span class="install-window-dot install-window-dot--red"></span>
                  <span class="install-window-dot install-window-dot--yellow"></span>
                  <span class="install-window-dot install-window-dot--green"></span>
                </div>
                <div class="install-window-address">vaultharbor.manojhankare.in/login</div>
                <div class="install-window-ext-anchor">
                  <div class="install-window-ext">
                    <img src="{LOGO_ICON}" alt="" width="22" height="22" />
                  </div>
                  <div class="install-extension-popup">
                    <div class="install-popup-pointer"></div>
                    <div class="install-popup-bar">
                      <span class="install-popup-dot install-popup-dot--red"></span>
                      <span class="install-popup-dot install-popup-dot--yellow"></span>
                      <span class="install-popup-dot install-popup-dot--green"></span>
                    </div>
                    <div class="install-popup-body">
                      <img class="install-popup-logo" src="{ICON_128}" alt="" width="52" height="52" />
                      <div class="install-popup-skeleton">
                        <span></span><span></span>
                      </div>
                      <div class="install-popup-field">
                        <span class="install-popup-dots">••••••••</span>
                        {lock_svg}
                      </div>
                      <div class="install-popup-btn"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="install-window-content">
                <div class="install-page-brand">
                  <img class="install-page-logo" src="{ICON_512}" alt="" width="152" height="152" />
                  <h3 class="install-page-title">
                    <span class="brand-title-vault">Vault</span><span class="brand-title-harbor">Harbor</span>
                  </h3>
                </div>
                <div class="install-page-skeleton">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>"""


def install_section_html() -> str:
    download_svg = """<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>"""
    chevron_svg = """<svg class="install-download-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>"""
    copy_svg = """<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>"""
    info_svg = """<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>"""
    help_svg = """<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>"""
    zip_name = EXTENSION_RELEASE_ZIP

    return f"""
  <section id="install">
    <div class="container">
      <div class="install-header">
        <p class="section-label">Install</p>
        <h2 class="install-title">Get <span class="install-title-accent">VaultHarbor</span> on your browser</h2>
        <p class="install-desc">Available for Chromium browsers: Chrome, Microsoft Edge, and Brave.</p>
      </div>
      <div class="install-grid">
        <div class="install-panel">
          <a class="install-download-btn" href="{GITHUB_RELEASES}"{EXT_LINK}>
            {download_svg}
            Download from GitHub Releases
            {chevron_svg}
          </a>
          <div class="install-build">
            <span>Latest build:</span>
            <span class="install-build-pill">
              <code id="install-zip-name">{zip_name}</code>
              <button type="button" class="install-copy-btn" onclick="navigator.clipboard.writeText('{zip_name}')" aria-label="Copy filename">
                {copy_svg}
              </button>
            </span>
          </div>
          <ol class="install-steps">
            <li>
              <span class="install-step-num">1</span>
              <span>Download the release zip from <a href="{GITHUB_RELEASES}"{EXT_LINK}>GitHub Releases</a>.</span>
            </li>
            <li>
              <span class="install-step-num">2</span>
              <span>Unzip to a permanent folder; it must contain <code>manifest.json</code> at the root.</span>
            </li>
            <li>
              <span class="install-step-num">3</span>
              <span>Open <code>chrome://extensions</code> (Microsoft Edge: <code>edge://extensions</code>).</span>
            </li>
            <li>
              <span class="install-step-num">4</span>
              <span>Enable <strong>Developer mode</strong> (toggle in the top-right corner).</span>
            </li>
            <li>
              <span class="install-step-num">5</span>
              <span>Click <strong>Load unpacked</strong> and select the unzipped folder.</span>
            </li>
            <li>
              <span class="install-step-num">6</span>
              <span>Pin VaultHarbor to your toolbar and sign in to get started.</span>
            </li>
          </ol>
          <div class="install-notice">
            {info_svg}
            <span>Manual installs do not auto-update. Official store listings below will enable automatic updates once published.</span>
          </div>
          <div class="install-stores">
            <div class="install-store-card">
              <img src="{BROWSER_ICON_CHROME}" alt="" width="28" height="28" loading="lazy" decoding="async" />
              <div>
                <strong>Chrome Web Store</strong>
                <span>Coming soon</span>
              </div>
            </div>
            <div class="install-store-card">
              <img src="{BROWSER_ICON_EDGE}" alt="" width="28" height="28" loading="lazy" decoding="async" />
              <div>
                <strong>Microsoft Edge Add-ons</strong>
                <span>Coming soon</span>
              </div>
            </div>
          </div>
        </div>
        <div class="install-visual">
{install_visual_html()}
        </div>
      </div>
      <p class="install-help">
        {help_svg}
        <span>Need help? Check the <a href="/faq">FAQ</a> or contact <a href="/#support">support</a>.</span>
      </p>
    </div>
  </section>"""


def _feature_row(
    row: int,
    left_icon: str,
    left_title: str,
    left_desc: str,
    right_icon: str,
    right_title: str,
    right_desc: str,
) -> str:
    return f"""
        <div class="feat-group feat-group--left feat-row-{row}">
          <div class="feat-copy feat-copy--left">
            <h3>{left_title}</h3>
            <p>{left_desc}</p>
          </div>
          <div class="feat-icon feat-icon--left">{left_icon}</div>
        </div>
        <div class="feat-group feat-group--right feat-row-{row}">
          <div class="feat-icon feat-icon--right">{right_icon}</div>
          <div class="feat-copy feat-copy--right">
            <h3>{right_title}</h3>
            <p>{right_desc}</p>
          </div>
        </div>"""


def features_section_html() -> str:
    icon_lock = """<svg viewBox="0 0 24 24" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="15.3" r="1.1" fill="url(#featIconGrad)" stroke="none"/><path d="M12 16.3v2.1"/></svg>"""
    icon_sync = """<svg viewBox="0 0 24 24" stroke-width="1.5"><rect x="2" y="4" width="12" height="9" rx="1.5"/><rect x="10" y="9" width="12" height="11" rx="1.5"/><path d="M14 14.5a2.5 2.5 0 115 0"/><path d="M16.5 14.5V13"/><path d="M16.5 16v1.5"/></svg>"""
    icon_key = """<svg viewBox="0 0 24 24" stroke-width="1.5"><path d="M7 11a4 4 0 118 0 4 4 0 01-8 0z"/><path d="M11 14v7"/><path d="M9 21h4"/></svg>"""
    icon_autofill = """<svg viewBox="0 0 24 24" stroke-width="1.5"><path d="M13 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4"/><path d="M3 12h12"/><path d="M11 8l4 4-4 4"/></svg>"""
    icon_bell = """<svg viewBox="0 0 24 24" stroke-width="1.5"><path d="M17 8A5.5 5.5 0 006 8c0 6.25-2.5 8-2.5 8h13"/><path d="M12.7 19.5a1.8 1.8 0 01-3.1 0"/><circle cx="18" cy="17" r="4" fill="url(#featIconGrad)" stroke="none"/><path d="M16.3 17.15l1.15 1.15 2.25-2.3" stroke="#050914" stroke-width="1.4" fill="none"/></svg>"""
    icon_server = """<svg viewBox="0 0 24 24" stroke-width="1.5"><rect x="2" y="3" width="16" height="6" rx="1.5"/><rect x="2" y="15" width="16" height="6" rx="1.5"/><path d="M5 6h.01"/><path d="M5 18h.01"/><path d="M18.5 13.3l3 1.2v2.9c0 2.15-1.3 3.5-3 4.1-1.7-.6-3-1.95-3-4.1v-2.9z" fill="url(#featIconGrad)" stroke="none"/><path d="M17.15 16.75l1 .95 1.7-1.85" stroke="#050914" stroke-width="1.3" fill="none"/></svg>"""
    icon_keyhole = """<svg class="features-hub-keyhole" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.75a5.25 5.25 0 00-5.25 5.25c0 2.28 1.45 4.22 3.48 4.93L9.5 18.5h5l-.73-6.57A5.25 5.25 0 0012 1.75zm0 2a3.25 3.25 0 110 6.5 3.25 3.25 0 010-6.5z"/><rect x="10" y="18.5" width="4" height="4" rx="0.85"/></svg>"""
    icon_shield_keyhole = """<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#featIconGrad)" stroke="none"/><circle cx="12" cy="10.5" r="1.75" fill="#050914" stroke="none"/><path d="M11 12.2v3.3h2v-3.3" fill="#050914" stroke="none"/></svg>"""
    feature_wires = """<svg class="features-wires" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="featWireCyan" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0ec9fc" stop-opacity="0.85"/>
          <stop offset="50%" stop-color="#0ec9fc" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0ec9fc" stop-opacity="0.04"/>
        </linearGradient>
        <linearGradient id="featWirePurple" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#a855f7" stop-opacity="0.85"/>
          <stop offset="50%" stop-color="#8b5af2" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0.04"/>
        </linearGradient>
        <linearGradient id="featIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0ec9fc"/>
          <stop offset="55%" stop-color="#8b5af2"/>
          <stop offset="100%" stop-color="#a855f7"/>
        </linearGradient>
      </defs>
      <path d="M 46.5 50 C 44.5 49.5, 43 49.5, 42.2 50" stroke="url(#featWireCyan)" stroke-width="0.38" vector-effect="non-scaling-stroke"/>
      <path d="M 46.5 50 C 44.5 44.5, 43.2 24, 42.2 17" stroke="url(#featWireCyan)" stroke-width="0.38" vector-effect="non-scaling-stroke"/>
      <path d="M 46.5 50 C 44.5 55.5, 43.2 76, 42.2 83" stroke="url(#featWireCyan)" stroke-width="0.38" vector-effect="non-scaling-stroke"/>
      <path d="M 53.5 50 C 55.5 49.5, 57 49.5, 57.8 50" stroke="url(#featWirePurple)" stroke-width="0.38" vector-effect="non-scaling-stroke"/>
      <path d="M 53.5 50 C 55.5 44.5, 56.8 24, 57.8 17" stroke="url(#featWirePurple)" stroke-width="0.38" vector-effect="non-scaling-stroke"/>
      <path d="M 53.5 50 C 55.5 55.5, 56.8 76, 57.8 83" stroke="url(#featWirePurple)" stroke-width="0.38" vector-effect="non-scaling-stroke"/>
    </svg>"""

    rows_html = "".join([
        _feature_row(
            1, icon_lock,
            "Zero-knowledge encryption",
            "Your vault is encrypted with AES-GCM on your device. The server only stores ciphertext it can never decrypt.",
            icon_autofill,
            "One-click autofill",
            "Fill usernames and passwords on any site. VaultHarbor detects login fields and offers matching credentials.",
        ),
        _feature_row(
            2, icon_sync,
            "Cross-device sync",
            "Sign in on any browser with the extension. Your encrypted vault syncs automatically across devices.",
            icon_bell,
            "Save &amp; update prompts",
            "Get prompted to save new logins when you sign up, and to update entries when a password changes.",
        ),
        _feature_row(
            3, icon_key,
            "Master password unlock",
            "One master password derives your vault key locally. It never travels to the server, not even as a hash.",
            icon_server,
            "Self-hosted backend",
            "Run your own sync server or use the hosted instance. Your encrypted data stays under your control.",
        ),
    ])

    return f"""
  <section id="features">
    <div class="container">
      <div class="features-header">
        <p class="section-label">Features</p>
        <h2 class="features-title">
          The <span class="features-accent-cyan">essentials,</span> <span class="features-accent-purple">secured.</span> Nothing extra.
        </h2>
        <p class="features-desc">
          VaultHarbor includes only what matters in a password manager, so you can stay focused, safe, and in control.
        </p>
      </div>
      <div class="features-stage">
        {feature_wires}
{rows_html}
        <div class="features-hub-cell">
          <div class="features-hub-outer">
            <div class="features-hub-core">
              {icon_keyhole}
            </div>
          </div>
        </div>
      </div>
      <div class="features-footer-banner">
        <div class="features-footer-left">
          <div class="features-footer-shield-wrap">{icon_shield_keyhole}</div>
          <div>
            <strong>Privacy first. Performance always.</strong>
            <p>No tracking. No ads. No unnecessary extras.</p>
          </div>
        </div>
        <div class="features-footer-divider" aria-hidden="true"></div>
        <div class="features-footer-right">
          <p>Just a <span class="features-accent-cyan">secure</span> password manager that <span class="features-accent-purple">works the way it should.</span></p>
        </div>
      </div>
    </div>
  </section>"""


def support_section_html() -> str:
    github_icon = """<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>"""
    heart_icon = """<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>"""
    shield_icon = """<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>"""
    oss_icon = """<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><path d="M2 12h20"/></svg>"""
    return f"""
  <section id="support" class="support-section">
    <div class="container support-wrap">
      <div class="support-pill">{heart_icon} Support</div>

      <div class="support-hero">
        <div class="support-brand">
          <img class="support-brand-logo" src="{ICON_512}" alt="VaultHarbor" width="132" height="132" />
          <h2 class="brand-title">
            <span class="brand-title-vault">Vault</span><span class="brand-title-harbor">Harbor</span>
          </h2>
          <p class="brand-slogan">Secure · Sync · Everywhere</p>
        </div>

        <div class="support-copy">
          <p class="support-eyebrow">Keep it free &amp; independent</p>
          <h3 class="support-heading">Support VaultHarbor</h3>
          <p class="support-desc">
            VaultHarbor is open source and free to use. Your support helps maintain our
            infrastructure, publish on official browser stores, and ship new features for everyone.
          </p>
          <a class="btn-sponsor-gh" href="{GITHUB_SPONSORS}"{EXT_LINK}>
            {github_icon}
            Sponsor on GitHub
            <span class="arrow" aria-hidden="true">→</span>
          </a>
          <div class="support-meta">
            <span>{shield_icon} <a href="{GITHUB_REPO}/blob/main/LICENSE"{EXT_LINK}>MIT Licensed</a></span>
            <span>{oss_icon} <a href="{GITHUB_REPO}"{EXT_LINK}>Open Source</a></span>
          </div>
        </div>
      </div>

      <div class="support-divider">Your support helps us</div>

      <div class="support-benefits">
        <div class="support-benefit">
          <div class="support-benefit-icon support-benefit-icon--cyan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <h3>Store Publishing</h3>
          <p>Maintaining the app on the Chrome Web Store and Edge Add-ons for easy updates.</p>
        </div>
        <div class="support-benefit">
          <div class="support-benefit-icon support-benefit-icon--purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          </div>
          <h3>Sync Infrastructure</h3>
          <p>Keeping the sync API and database fast, reliable, and available worldwide.</p>
        </div>
        <div class="support-benefit">
          <div class="support-benefit-icon support-benefit-icon--teal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          </div>
          <h3>Security &amp; Compliance</h3>
          <p>Zero-knowledge architecture, secure hosting, and ongoing security improvements.</p>
        </div>
        <div class="support-benefit">
          <div class="support-benefit-icon support-benefit-icon--pink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <h3>New Features</h3>
          <p>Building autofill, sync, and vault tools based on community feedback.</p>
        </div>
      </div>
    </div>
  </section>"""


def nav_html(active: str = "") -> str:
    def cls(name: str) -> str:
        return ' class="active"' if active == name else ""

    return f"""
  <nav class="nav">
    <div class="container nav-inner">
      <a class="nav-brand" href="/">
        <img src="{LOGO_ICON}" alt="" width="36" height="36" />
        <span class="nav-brand-title">
          <span class="nav-brand-vault">Vault</span><span class="nav-brand-harbor">Harbor</span>
        </span>
      </a>
      <ul class="nav-links">
        <li><a href="/#about"{cls("about")}>About</a></li>
        <li><a href="/#features"{cls("features")}>Features</a></li>
        <li><a href="/#security"{cls("security")}>Security</a></li>
        <li><a href="/faq"{cls("faq")}>FAQ</a></li>
        <li><a href="/#support">Support</a></li>
        <li><a href="/#install" class="nav-cta">Install</a></li>
      </ul>
    </div>
  </nav>"""


def footer_html() -> str:
    return f"""
  <footer>
    <div class="container">
      <div class="footer-brand">
        <img src="{LOGO_ICON}" alt="" width="30" height="30" />
        VaultHarbor
      </div>
      <div class="footer-links">
        <a href="/faq">FAQ</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/#support">Support</a>
        <a href="{GITHUB_REPO}/blob/main/LICENSE"{EXT_LINK}>License (MIT)</a>
        <a href="{GITHUB_REPO}/blob/main/CONTRIBUTING.md"{EXT_LINK}>Contributing</a>
        <a href="{GITHUB_REPO}"{EXT_LINK}>GitHub</a>
      </div>
      <p class="footer-copy">&copy; 2026 VaultHarbor. Built by <a href="{AUTHOR_SITE}"{EXT_LINK}>Manoj Hankare</a>.</p>
    </div>
  </footer>"""


def head_html(title: str, description: str, path: str = "/") -> str:
    canonical = SITE_URL + (path if path != "/" else "")
    return f"""
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content="{description}" />
  <meta name="keywords" content="password manager, zero-knowledge, browser extension, VaultHarbor, privacy" />
  <meta name="author" content="Manoj Hankare" />
  <meta name="theme-color" content="#000814" />
  <meta name="robots" content="index, follow" />
  <link rel="icon" type="image/png" href="{LOGO_ICON}" />
  <link rel="canonical" href="{canonical}" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="VaultHarbor" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:image" content="{OG_IMAGE}" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />
  <meta name="twitter:image" content="{OG_IMAGE}" />
  <meta name="apple-mobile-web-app-title" content="VaultHarbor" />
  <link rel="apple-touch-icon" href="{ICON_512}" />"""


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
            "What is VaultHarbor?",
            "VaultHarbor is a zero-knowledge password manager. Your credentials are encrypted on your "
            "device before they are synced. The server stores only opaque encrypted blobs; it never "
            "sees your master password or plaintext vault contents.",
        ),
        (
            "Can VaultHarbor or the server see my passwords?",
            "No. Your master password and decrypted vault never leave your device. The server stores "
            "only encrypted data it cannot read. VaultHarbor is designed so that even the operator cannot "
            "access your secrets without your master password.",
        ),
        (
            "What is the difference between my account password and master password?",
            "Your <strong>account password</strong> signs you in to VaultHarbor and enables sync across "
            "devices. It is stored on the server as a secure hash. Your <strong>master password</strong> "
            "encrypts and decrypts your vault locally and is <strong>never</strong> sent to the server.",
        ),
        (
            "What if I forget my master password?",
            "If you set up a recovery key during vault creation, you can use it to regain access and "
            "set a new master password. Without your master password or recovery key, your encrypted "
            "vault cannot be decrypted. This is by design for zero-knowledge security.",
        ),
        (
            "What if I forget my account password?",
            "Use the password reset flow in the extension. You will receive a code by email. Resetting "
            "your account password changes API login only; your vault remains decryptable with your "
            "master password or recovery key.",
        ),
        (
            "Which browsers are supported?",
            "The VaultHarbor extension works on Chromium browsers: Google Chrome, Microsoft Edge, and "
            "Brave. Firefox support is experimental and not yet verified for production use.",
        ),
        (
            "How do I install the extension?",
            "Download the latest zip from "
            f'<a href="{GITHUB_RELEASES}"{EXT_LINK}>GitHub Releases</a>, unzip it, open '
            "<code>chrome://extensions</code> (or <code>edge://extensions</code>), enable Developer mode, "
            "and click Load unpacked. See the <a href=\"/#install\">install section</a> for full steps.",
        ),
        (
            "Will the extension update automatically?",
            "Installs from the Chrome Web Store or Microsoft Edge Add-ons will auto-update once store "
            "listings are live. Manual installs from a GitHub zip do not auto-update, so you must "
            "download and reload a newer version yourself.",
        ),
        (
            "Is VaultHarbor open source?",
            f'Yes. The source code is available on <a href="{GITHUB_REPO}"{EXT_LINK}>GitHub</a>. '
            "You can review the encryption design and self-host the backend.",
        ),
        (
            "Can I self-host VaultHarbor?",
            "Yes. The backend is a Flask API that can be deployed to your own infrastructure. Point "
            "the extension at your server URL during configuration. Your encrypted vault data stays "
            "under your control.",
        ),
        (
            "What data does VaultHarbor collect?",
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
            "Does VaultHarbor use cookies or tracking?",
            "The marketing website at vaultharbor.manojhankare.in does not use analytics cookies or "
            "third-party trackers. The extension uses local storage on your device for session tokens "
            "and vault cache, not advertising cookies.",
        ),
    ]
    parts = []
    for question, answer in items:
        parts.append(
            f"""    <details class="faq-item" name="faq">
      <summary>{question}</summary>
      <div class="faq-answer"><p>{answer}</p></div>
    </details>"""
        )
    return "\n".join(parts)


def faq_preview_html(count: int = 3) -> str:
    """First N FAQ items for the landing page."""
    marker = '<details class="faq-item" name="faq">'
    full = faq_items_html()
    items = full.split(marker)
    selected = [marker + items[i] for i in range(1, min(count + 1, len(items)))]
    return "\n".join(selected)