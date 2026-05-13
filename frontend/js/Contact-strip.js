// ── Contact strip — renders anywhere you drop <div id="contact-strip"></div>
function renderContactStrip() {
  const els = document.querySelectorAll(".contact-strip-root");
  if (!els.length) return;

  const html = `
    <div style="
      background: var(--surface-muted, #faf9f8);
      border: 1px solid var(--border, #ebebeb);
      border-radius: 14px;
      padding: 1rem 1.25rem 1.1rem;
      margin-top: 1.25rem;
    ">
      <p style="
        font-size: 0.68rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.08em;
        color: var(--text-hint, #aaa); margin: 0 0 0.6rem;
      ">Need help with your order?</p>

      <div style="display: flex; flex-direction: column; gap: 8px;">

        <a href="https://wa.me/96103819412" target="_blank" rel="noopener" style="
          display: flex; align-items: center; gap: 10px;
          padding: 10px 13px; border-radius: 10px;
          background: #25D366; color: #fff;
          text-decoration: none; font-family: inherit;
          font-size: 0.82rem; font-weight: 600;
          transition: opacity 0.15s;
        " onmouseover="this.style.opacity='.88'" onmouseout="this.style.opacity='1'">
          <div style="
            width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
            background: rgba(255,255,255,0.22);
            display: flex; align-items: center; justify-content: center;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.38 1.26 4.79L2 22l5.45-1.43a9.86 9.86 0 0 0 4.59 1.14c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.52 14.15c-.23.65-1.33 1.24-1.84 1.32-.47.07-1.07.1-1.72-.11a15.7 15.7 0 0 1-1.56-.58c-2.73-1.18-4.51-3.93-4.65-4.12-.13-.18-1.1-1.46-1.1-2.79 0-1.32.69-1.97 1-2.24.28-.25.6-.31.8-.31l.58.01c.19 0 .44-.07.69.52.26.62.87 2.12.95 2.28.08.15.13.33.03.53-.1.2-.15.32-.3.5l-.45.52c-.15.15-.3.32-.13.62.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.44.3.14.47.12.64-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.96.3.15.5.22.57.34.07.13.07.74-.16 1.39Z"/>
            </svg>
          </div>
          <div style="flex:1; line-height: 1.2;">
            Message us on WhatsApp
            <span style="display:block; font-size:0.7rem; font-weight:400; opacity:.8; margin-top:1px;">
              Usually replies in minutes 💬
            </span>
          </div>
        </a>

        <a href="tel:+96103819412" style="
          display: flex; align-items: center; gap: 10px;
          padding: 10px 13px; border-radius: 10px;
          background: var(--surface, #fff);
          color: var(--text-primary, #111);
          border: 1px solid var(--border, #ebebeb);
          text-decoration: none; font-family: inherit;
          font-size: 0.82rem; font-weight: 600;
          transition: opacity 0.15s;
        " onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
          <div style="
            width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
            background: var(--brand-light, #fdeee8);
            display: flex; align-items: center; justify-content: center;
            color: var(--brand, #E85C2A); font-size: 15px;
          ">
            <i class="ti ti-phone"></i>
          </div>
          <div style="flex:1; line-height: 1.2;">
            Call us
            <span style="display:block; font-size:0.7rem; font-weight:400; opacity:.7; margin-top:1px;">
              +961 03 819 412
            </span>
          </div>
        </a>

      </div>
    </div>
  `;

  els.forEach(el => el.innerHTML = html);
}

document.addEventListener("DOMContentLoaded", renderContactStrip);