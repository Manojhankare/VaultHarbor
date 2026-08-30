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
GITHUB_SPONSORS = "https://github.com/sponsors/Manojhankare"
EXT_LINK = ' target="_blank" rel="noopener noreferrer"'
BROWSER_ICON_CHROME = "/pages-static/browser-icons/chrome.svg"
BROWSER_ICON_EDGE = "/pages-static/browser-icons/edge.svg"
BROWSER_ICON_BRAVE = "/pages-static/browser-icons/brave.svg"
BROWSER_ICON_STORE = "/pages-static/browser-icons/chromewebstore.svg"

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
      background: linear-gradient(
        180deg,
        rgba(15, 23, 42, 0.68) 0%,
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
    .nav-brand img { width: 30px; height: 30px; display: block; flex-shrink: 0; }
    .nav-brand-title {
      font-weight: 700; font-size: 1.15rem; letter-spacing: -0.02em; line-height: 1;
    }
    .nav-brand-vault { color: #f8fafc; }
    .nav-brand-sync {
      background: linear-gradient(135deg, #38bdf8 0%, #60a5fa 45%, #818cf8 100%);
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
    .nav-links a:hover, .nav-links a.active { color: #38bdf8; text-decoration: none; }
    .nav-cta {
      background: linear-gradient(90deg, #0ea5e9 0%, #6366f1 100%);
      color: #fff !important; padding: 0.48rem 1.15rem; border-radius: 999px;
      font-size: 0.875rem; font-weight: 600;
      box-shadow: 0 4px 14px rgba(14, 165, 233, 0.28);
      transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    }
    .nav-cta:hover {
      opacity: 0.95; text-decoration: none !important;
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(14, 165, 233, 0.34);
    }
    footer { border-top: 1px solid #334155; padding: 2.5rem 0; text-align: center; margin-top: auto; }
    .footer-brand {
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      margin-bottom: 1rem; font-weight: 600; color: #cbd5e1;
    }
    .footer-brand img { width: 24px; height: 24px; display: block; }
    .footer-links { display: flex; justify-content: center; gap: 1.25rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .footer-links a { color: #94a3b8; font-size: 0.88rem; }
    .footer-copy { font-size: 0.8rem; color: #64748b; }
    .footer-copy a { color: #94a3b8; text-decoration: none; }
    .footer-copy a:hover { color: #38bdf8; text-decoration: underline; }
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
      color: #22d3ee;
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
      background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%);
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
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
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
      background: rgba(15, 23, 42, 0.4);
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
      background: rgba(15, 23, 42, 0.6);
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
      background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.22) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%);
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
      filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.2));
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
        border-color: rgba(56, 189, 248, 0.48);
        box-shadow:
          32px 42px 78px rgba(0, 0, 0, 0.62),
          14px 20px 36px rgba(0, 0, 0, 0.42),
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          0 0 72px rgba(56, 189, 248, 0.22);
      }
      .hero-orbit-stage:hover .hero-orbit-svg {
        transform: translate(-50%, -50%) scale(1.07);
        filter: drop-shadow(0 0 24px rgba(56, 189, 248, 0.38));
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
        filter: drop-shadow(0 0 42px rgba(56, 189, 248, 0.65)) drop-shadow(0 0 28px rgba(168, 85, 247, 0.55));
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
      border: 1.5px solid rgba(56, 189, 248, 0.28);
      border-radius: 20px;
      box-shadow:
        28px 38px 70px rgba(0, 0, 0, 0.6),
        12px 18px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.06),
        0 0 52px rgba(56, 189, 248, 0.12);
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
      border: 1px solid rgba(56, 189, 248, 0.1);
      box-shadow: inset 0 0 24px rgba(56, 189, 248, 0.04);
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
      background: rgba(15, 23, 42, 0.35);
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
      width: 22px;
      height: 22px;
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
      color: #38bdf8;
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
      width: 88px;
      height: 88px;
      bottom: -32px;
      right: -22px;
      left: auto;
      transform: rotateY(-12deg) rotateX(8deg);
      transform-style: preserve-3d;
      filter: drop-shadow(0 0 35px rgba(56, 189, 248, 0.5)) drop-shadow(0 0 20px rgba(168, 85, 247, 0.4));
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
      .hero-float-logo { width: 82px; height: 82px; right: -18px; bottom: -28px; }
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
        width: 88px;
        height: 88px;
        right: -22px;
        left: auto;
        bottom: -32px;
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
        width: 80px;
        height: 80px;
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
    .brand-title-sync {
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .brand-slogan {
      margin: 0.25rem 0 0; font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.18em; color: #64748b; text-transform: uppercase;
    }
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
      background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%);
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
      background: linear-gradient(90deg, #22d3ee, #a855f7); margin-bottom: 1.75rem;
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
      background: linear-gradient(145deg, rgba(15, 23, 42, 0.92), rgba(22, 32, 50, 0.98));
      border: 1px solid rgba(56, 189, 248, 0.14); border-radius: 1rem;
      padding: clamp(2.5rem, 6vw, 4rem) clamp(1.75rem, 4vw, 2.5rem);
      text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;
      box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.06) inset, 0 24px 48px rgba(0, 0, 0, 0.35);
      opacity: 0; animation: about-fade-in-right 0.75s ease 0.18s forwards;
      transition: transform 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease;
    }
    .about-visual::before {
      content: ""; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 78%; height: 55%;
      background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.16) 0%, transparent 72%);
      pointer-events: none;
      animation: about-glow-pulse 7s ease-in-out infinite;
    }
    .about-visual::after {
      content: ""; position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(105deg, transparent 42%, rgba(56, 189, 248, 0.07) 50%, transparent 58%);
      animation: about-shimmer 9s ease-in-out infinite;
    }
    .about-brand-logo {
      position: relative; width: clamp(140px, 32vw, 176px); height: auto; object-fit: contain;
      margin-bottom: 1.5rem; filter: drop-shadow(0 12px 24px rgba(56, 189, 248, 0.22));
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
        border-color: rgba(56, 189, 248, 0.34);
        box-shadow:
          0 0 0 1px rgba(99, 102, 241, 0.1) inset,
          0 28px 56px rgba(0, 0, 0, 0.42),
          0 0 48px rgba(56, 189, 248, 0.14);
      }
      .about-visual:hover::before {
        animation-duration: 3.5s;
        opacity: 1;
      }
      .about-visual:hover .about-brand-logo {
        animation-play-state: paused;
        transform: translateY(-12px) scale(1.05);
        filter: drop-shadow(0 16px 32px rgba(56, 189, 248, 0.38)) drop-shadow(0 0 24px rgba(168, 85, 247, 0.28));
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
    .support-section {
      padding: 4rem 0 3.5rem;
      background: #0a0e17;
    }
    .support-pill {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.35rem 1rem; margin-bottom: 2.5rem;
      border: 1px solid rgba(56, 189, 248, 0.45); border-radius: 999px;
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
    .support-brand-logo { width: 112px; height: 112px; object-fit: contain; margin-bottom: 0.75rem; }
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
    .support-benefit-icon--cyan { background: rgba(34, 211, 238, 0.12); color: #22d3ee; }
    .support-benefit-icon--purple { background: rgba(167, 139, 250, 0.12); color: #a78bfa; }
    .support-benefit-icon--teal { background: rgba(45, 212, 191, 0.12); color: #2dd4bf; }
    .support-benefit-icon--pink { background: rgba(244, 114, 182, 0.12); color: #f472b6; }
    .support-benefit h3 { font-size: 0.92rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.4rem; }
    .support-benefit p { font-size: 0.82rem; color: #64748b; line-height: 1.55; margin: 0; }
"""


def hero_section_html() -> str:
    download_svg = """<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>"""
    search_icon = """<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>"""
    chevron_icon = """<svg class="mockup-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>"""
    
    github_logo = """<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 4.31 3.435 7.97 8.205 9.56.6.11.82-.26.82-.58 0-.28-.01-1.02-.01-2-3.338.73-4.043-1.61-4.043-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.74.084-.73.084-.73 1.205.08 1.838 1.24 1.838 1.24 1.07 1.83 2.79 1.3 3.47.99.11-.77.45-1.3.82-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.465-2.38 1.235-3.22-.135-.3-.54-1.525.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 19.97 24 16.307 24 12c0-6.63-5.37-12-12-12z"/></svg>"""
    notion_logo = """<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4.6 2.025h14.8c1.425 0 2.6 1.175 2.6 2.6v14.75c0 1.425-1.175 2.6-2.6 2.6H4.6c-1.425 0-2.6-1.175-2.6-2.6V4.625c0-1.425 1.175-2.6 2.6-2.6zm3.175 4.3v11.35h2.15v-5.95l3.8 5.95h2.475V6.325h-2.15v5.95l-3.8-5.95H7.775z"/></svg>"""
    google_logo = """<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.19-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>"""
    slack_logo = """<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#36C5F0" d="M5 10.5c0-1.38 1.12-2.5 2.5-2.5h2.5v2.5c0 1.38-1.12 2.5-2.5 2.5H5v-2.5zm5 0c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v2.5h-2.5c-1.38 0-2.5-1.12-2.5-2.5v-2.5z"/><path fill="#2EB67D" d="M13.5 5c1.38 0 2.5 1.12 2.5 2.5v2.5h-2.5C12.12 10 11 8.88 11 7.5S12.12 5 13.5 5zm0 5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5h-2.5v-2.5c0-1.38 1.12-2.5 2.5-2.5z"/><path fill="#ECB22E" d="M19 13.5c0 1.38-1.12 2.5-2.5 2.5h-2.5v-2.5c0-1.38 1.12-2.5 2.5-2.5H19v2.5zm-5 0c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5v-2.5h2.5c1.38 0 2.5 1.12 2.5 2.5v-2.5z"/><path fill="#E01E5A" d="M10.5 19c-1.38 0-2.5-1.12-2.5-2.5v-2.5h2.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5zm0-5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5h2.5v2.5c0 1.38-1.12 2.5-2.5 2.5z"/></svg>"""
    microsoft_logo = """<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#7fba00" d="M13 1h10v10H13z"/><path fill="#00a4ef" d="M1 13h10v10H1z"/><path fill="#ffb900" d="M13 13h10v10H13z"/></svg>"""

    orbit_svg = """<svg class="hero-orbit-svg" viewBox="0 0 300 400" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="heroOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.65"/>
          <stop offset="50%" stop-color="#6366f1" stop-opacity="0.45"/>
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
            VaultSync is a zero-knowledge password manager. Credentials are encrypted on your device
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
            <div class="hero-mockup" aria-hidden="true">
            <div class="mockup-header">
              <div class="mockup-brand">
                <img src="{LOGO_ICON}" alt="" width="22" height="22" />
                <span>VaultSync</span>
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
          </div>
          <img class="hero-float-logo" src="{ICON_128}" alt="" width="88" height="88" />
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
              VaultSync keeps your logins, passwords, and secure notes in an encrypted vault
              that lives on your devices. When you save a credential, it is encrypted locally
              with keys derived from your master password, then synced to the cloud as
              unreadable data.
            </p>
            <p>
              The browser extension brings VaultSync into your daily workflow: autofill on
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
          <img class="about-brand-logo" src="{ICON_128}" alt="" width="176" height="176" loading="lazy" decoding="async" />
          <h2 class="brand-title">
            <span class="brand-title-vault">Vault</span><span class="brand-title-sync">Sync</span>
          </h2>
          <p class="brand-slogan">Secure. Sync. Everywhere.</p>
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
          <img class="support-brand-logo" src="{ICON_128}" alt="VaultSync" width="112" height="112" />
          <h2 class="brand-title">
            <span class="brand-title-vault">Vault</span><span class="brand-title-sync">Sync</span>
          </h2>
          <p class="brand-slogan">Secure · Sync · Everywhere</p>
        </div>

        <div class="support-copy">
          <p class="support-eyebrow">Keep it free &amp; independent</p>
          <h3 class="support-heading">Support VaultSync</h3>
          <p class="support-desc">
            VaultSync is open source and free to use. Your support helps maintain our
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
        <img src="{LOGO_ICON}" alt="" width="30" height="30" />
        <span class="nav-brand-title">
          <span class="nav-brand-vault">Vault</span><span class="nav-brand-sync">Sync</span>
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
        <img src="{LOGO_ICON}" alt="" width="24" height="24" />
        VaultSync
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
      <p class="footer-copy">&copy; 2026 VaultSync. Built by <a href="{AUTHOR_SITE}"{EXT_LINK}>Manoj Hankare</a>.</p>
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
            "device before they are synced. The server stores only opaque encrypted blobs; it never "
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
            "The VaultSync extension works on Chromium browsers: Google Chrome, Microsoft Edge, and "
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
            "Is VaultSync open source?",
            f'Yes. The source code is available on <a href="{GITHUB_REPO}"{EXT_LINK}>GitHub</a> under the '
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
            "and vault cache, not advertising cookies.",
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
