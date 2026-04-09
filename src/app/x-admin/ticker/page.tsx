// src/app/x-admin/ticker/page.tsx
// Admin ticker management UI.
// Loads current ticker + live feed headlines for easy picking.

import { isAdminAuthenticated } from "@/lib/auth";
import { readTicker, type TickerItem } from "@/lib/ticker";
import { fetchFeed, FEEDS } from "@/lib/feed";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function TickerAdminPage() {
  if (!isAdminAuthenticated()) redirect("/x-admin");

  const [store, latestArticles] = await Promise.all([
    readTicker(),
    fetchFeed("latest"),
  ]);

  const tickerJson = JSON.stringify(store);
  const feedJson = JSON.stringify(
    latestArticles.slice(0, 40).map((a) => ({ title: a.title, link: a.link }))
  );

  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>مدیریت خط خبری — فردا سبک</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root {
            --bg: #0d0d0d; --surface: #161616; --surface2: #1e1e1e;
            --border: #2a2a2a; --text: #e8e6e0; --muted: #7a7870;
            --accent: #c8a84b; --green: #4a9a4a; --red: #cc4444; --blue: #4a7acc;
          }
          html, body { font-family: "Vazirmatn","Tahoma",system-ui,sans-serif; background: var(--bg); color: var(--text); font-size: 14px; line-height: 1.6; }
          .adm-header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; }
          .adm-logo { font-size: 1rem; font-weight: 700; color: var(--accent); }
          .adm-nav a { font-size: 0.78rem; color: var(--muted); margin-right: 14px; text-decoration: none; }
          .adm-nav a:hover { color: var(--text); }
          .adm-body { max-width: 900px; margin: 0 auto; padding: 24px 20px; }

          /* ── Ticker preview ── */
          .ticker-preview {
            background: var(--accent); color: #0d0d0d;
            padding: 7px 0; overflow: hidden; margin-bottom: 24px;
            border-radius: 4px; position: relative;
          }
          .ticker-preview-label {
            position: absolute; right: 0; top: 0; bottom: 0;
            background: #0d0d0d; color: var(--accent);
            padding: 0 12px; display: flex; align-items: center;
            font-size: 0.72rem; font-weight: 700; z-index: 2; white-space: nowrap;
          }
          .ticker-preview-track {
            display: flex; gap: 0; padding-right: 90px;
            animation: ticker-scroll 20s linear infinite;
          }
          @keyframes ticker-scroll {
            0%   { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .ticker-preview-item { white-space: nowrap; font-size: 0.82rem; font-weight: 600; padding: 0 16px; }
          .ticker-sep { opacity: 0.7; padding: 0 4px; }

          /* ── Cards ── */
          .card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 18px; margin-bottom: 20px; }
          .card-title { font-size: 0.8rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px; }

          /* ── Item list ── */
          .item-list { list-style: none; }
          .item-row {
            display: flex; align-items: center; gap: 8px;
            padding: 8px 0; border-bottom: 1px solid var(--border);
          }
          .item-row:last-child { border-bottom: none; }
          .item-toggle { width: 16px; height: 16px; cursor: pointer; accent-color: var(--accent); flex-shrink: 0; }
          .item-text-input {
            flex: 1; background: var(--surface2); border: 1px solid var(--border);
            border-radius: 3px; padding: 5px 8px; font-size: 0.82rem;
            color: var(--text); font-family: inherit; direction: rtl;
          }
          .item-text-input:focus { outline: none; border-color: var(--accent); }
          .item-del {
            background: none; border: 1px solid var(--border); border-radius: 3px;
            color: var(--red); cursor: pointer; padding: 4px 8px; font-size: 0.72rem; flex-shrink: 0;
          }
          .item-del:hover { background: #2a0f0f; }
          .item-drag { color: var(--muted); cursor: grab; font-size: 12px; flex-shrink: 0; user-select: none; }

          /* ── Controls row ── */
          .controls { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 14px; }
          .btn {
            background: var(--surface2); border: 1px solid var(--border); border-radius: 4px;
            padding: 7px 14px; font-size: 0.82rem; color: var(--text);
            cursor: pointer; font-family: inherit;
          }
          .btn:hover { border-color: var(--muted); }
          .btn-primary { background: var(--accent); color: #0d0d0d; border-color: var(--accent); font-weight: 700; }
          .btn-primary:hover { opacity: 0.9; }

          /* ── Settings row ── */
          .settings-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 14px; }
          .settings-row label { font-size: 0.78rem; color: var(--muted); display: flex; align-items: center; gap: 6px; }
          .settings-row select {
            background: var(--surface2); border: 1px solid var(--border); border-radius: 3px;
            padding: 4px 8px; font-size: 0.82rem; color: var(--text); font-family: inherit;
          }
          .sep-btn {
            background: var(--surface2); border: 1px solid var(--border); border-radius: 4px;
            padding: 4px 10px; cursor: pointer; font-size: 1rem; transition: border-color 0.15s;
          }
          .sep-btn:hover, .sep-btn.active { border-color: var(--accent); }

          /* ── Feed picker ── */
          .feed-list { list-style: none; max-height: 280px; overflow-y: auto; }
          .feed-item {
            display: flex; align-items: center; justify-content: space-between;
            padding: 7px 0; border-bottom: 1px solid var(--border); gap: 8px;
          }
          .feed-item:last-child { border-bottom: none; }
          .feed-item-title { font-size: 0.82rem; flex: 1; color: var(--text); }
          .feed-add-btn {
            background: none; border: 1px solid var(--border); border-radius: 3px;
            color: var(--accent); cursor: pointer; padding: 3px 8px; font-size: 0.72rem; white-space: nowrap; flex-shrink: 0;
          }
          .feed-add-btn:hover { background: var(--surface2); }

          /* ── Toast ── */
          #toast {
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(60px);
            background: var(--green); color: #fff; border-radius: 4px;
            padding: 10px 20px; font-size: 0.85rem; opacity: 0;
            transition: all 0.3s; z-index: 999; pointer-events: none;
          }
          #toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
          #toast.error { background: var(--red); }
        `}</style>
      </head>
      <body>
        <div className="adm-header">
          <div className="adm-logo">فردا سبک — خط خبری</div>
          <nav className="adm-nav">
            <a href="/x-admin/dashboard">داشبورد</a>
            <a href="/" target="_blank">سایت ↗</a>
            <a href="/x-admin/logout" style={{ color: "var(--red)" }}>خروج</a>
          </nav>
        </div>

        <div className="adm-body">

          {/* ── Live preview ── */}
          <div className="ticker-preview" id="preview-bar">
            <div className="ticker-preview-label">فوری</div>
            <div className="ticker-preview-track" id="preview-track">
              {/* filled by JS */}
            </div>
          </div>

          {/* ── Settings ── */}
          <div className="card">
            <div className="card-title">تنظیمات نوار خبری</div>
            <div className="settings-row">
              <label>
                جداکننده:
                {["🔴","◆","●","▸","—","·","★","⚡"].map((s) => (
                  <button key={s} className="sep-btn" data-sep={s}>{s}</button>
                ))}
              </label>
              <label>
                سرعت:
                <select id="speed-select">
                  <option value="slow">آرام</option>
                  <option value="normal">معمولی</option>
                  <option value="fast">سریع</option>
                </select>
              </label>
            </div>
          </div>

          {/* ── Current ticker items ── */}
          <div className="card">
            <div className="card-title">خبرهای نوار ({store.items.length})</div>
            <ul className="item-list" id="item-list">
              {store.items.map((item) => (
                <li className="item-row" key={item.id} data-id={item.id}>
                  <span className="item-drag" title="جابجایی">⠿</span>
                  <input
                    type="checkbox"
                    className="item-toggle"
                    defaultChecked={item.active}
                    data-field="active"
                    title="نمایش / پنهان"
                  />
                  <input
                    type="text"
                    className="item-text-input"
                    defaultValue={item.text}
                    data-field="text"
                    placeholder="متن خبر..."
                    maxLength={300}
                  />
                  <button className="item-del" data-action="delete" title="حذف">✕</button>
                </li>
              ))}
            </ul>

            <div className="controls">
              <button className="btn" id="add-manual-btn">+ افزودن خبر دستی</button>
              <button className="btn btn-primary" id="save-btn">ذخیره تغییرات</button>
            </div>
          </div>

          {/* ── Feed picker ── */}
          <div className="card">
            <div className="card-title">انتخاب از اخبار موجود</div>
            <ul className="feed-list" id="feed-list">
              {latestArticles.slice(0, 40).map((article, i) => (
                <li className="feed-item" key={i}>
                  <span className="feed-item-title">{article.title}</span>
                  <button
                    className="feed-add-btn"
                    data-title={article.title}
                    data-link={article.link}
                  >
                    + افزودن به نوار
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div id="toast"></div>

        <script dangerouslySetInnerHTML={{ __html: `
          // ── State ────────────────────────────────────────────────────────────
          var store = ${tickerJson};
          var feedItems = ${feedJson};
          var sep = store.separator || "🔴";
          var speed = store.speed || "normal";

          // ── Init UI ──────────────────────────────────────────────────────────
          document.getElementById("speed-select").value = speed;
          document.querySelectorAll(".sep-btn").forEach(function(btn) {
            if (btn.dataset.sep === sep) btn.classList.add("active");
          });

          updatePreview();

          // ── Preview renderer ─────────────────────────────────────────────────
          function updatePreview() {
            var active = getItems().filter(function(i){ return i.active; });
            var track = document.getElementById("preview-track");
            if (!active.length) { track.innerHTML = "<span class='ticker-preview-item'>خبری موجود نیست</span>"; return; }
            var html = "";
            active.forEach(function(item, idx) {
              if (idx > 0) html += "<span class='ticker-sep'>" + sep + "</span>";
              html += "<span class='ticker-preview-item'>" + escHtml(item.text) + "</span>";
            });
            // duplicate for seamless loop
            html += html;
            track.innerHTML = html;
            var dur = speed === "slow" ? 40 : speed === "fast" ? 12 : 22;
            track.style.animationDuration = dur + "s";
          }

          function escHtml(s) {
            return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
          }

          // ── Read items from DOM ───────────────────────────────────────────────
          function getItems() {
            var rows = document.querySelectorAll("#item-list .item-row");
            var items = [];
            rows.forEach(function(row) {
              var id = row.dataset.id;
              var text = row.querySelector("[data-field='text']").value.trim();
              var active = row.querySelector("[data-field='active']").checked;
              if (text) items.push({ id: id, text: text, active: active, addedAt: new Date().toISOString() });
            });
            return items;
          }

          // ── Add a blank manual row ────────────────────────────────────────────
          function addRow(text, url, active) {
            text = text || "";
            active = active !== undefined ? active : true;
            var id = "item-" + Date.now();
            var li = document.createElement("li");
            li.className = "item-row";
            li.dataset.id = id;
            li.innerHTML =
              "<span class='item-drag' title='جابجایی'>⠿</span>" +
              "<input type='checkbox' class='item-toggle' " + (active ? "checked" : "") + " data-field='active' title='نمایش'>" +
              "<input type='text' class='item-text-input' value='" + escHtml(text) + "' data-field='text' placeholder='متن خبر...' maxlength='300'>" +
              "<button class='item-del' data-action='delete'>✕</button>";
            document.getElementById("item-list").appendChild(li);
            li.querySelector("[data-field='text']").addEventListener("input", updatePreview);
            li.querySelector("[data-field='active']").addEventListener("change", updatePreview);
            li.querySelector("[data-action='delete']").addEventListener("click", function() {
              li.remove(); updatePreview();
            });
            updatePreview();
          }

          // ── Wire existing rows ────────────────────────────────────────────────
          document.querySelectorAll("#item-list .item-row").forEach(function(row) {
            row.querySelector("[data-field='text']").addEventListener("input", updatePreview);
            row.querySelector("[data-field='active']").addEventListener("change", updatePreview);
            row.querySelector("[data-action='delete']").addEventListener("click", function() {
              row.remove(); updatePreview();
            });
          });

          // ── Add manual btn ────────────────────────────────────────────────────
          document.getElementById("add-manual-btn").addEventListener("click", function() {
            addRow("", "", true);
            document.querySelector("#item-list .item-row:last-child [data-field='text']").focus();
          });

          // ── Feed picker ───────────────────────────────────────────────────────
          document.querySelectorAll(".feed-add-btn").forEach(function(btn) {
            btn.addEventListener("click", function() {
              addRow(btn.dataset.title, btn.dataset.link, true);
              btn.textContent = "✓ اضافه شد";
              btn.disabled = true;
            });
          });

          // ── Separator buttons ─────────────────────────────────────────────────
          document.querySelectorAll(".sep-btn").forEach(function(btn) {
            btn.addEventListener("click", function() {
              sep = btn.dataset.sep;
              document.querySelectorAll(".sep-btn").forEach(function(b){ b.classList.remove("active"); });
              btn.classList.add("active");
              updatePreview();
            });
          });

          // ── Speed select ──────────────────────────────────────────────────────
          document.getElementById("speed-select").addEventListener("change", function() {
            speed = this.value;
            updatePreview();
          });

          // ── Save ─────────────────────────────────────────────────────────────
          document.getElementById("save-btn").addEventListener("click", async function() {
            var btn = this;
            btn.disabled = true;
            btn.textContent = "در حال ذخیره...";
            var payload = {
              items: getItems(),
              separator: sep,
              speed: speed,
              updatedAt: new Date().toISOString(),
            };
            try {
              var res = await fetch("/x-admin/ticker/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              if (res.ok) {
                showToast("✓ نوار خبری ذخیره شد", false);
              } else {
                showToast("خطا در ذخیره‌سازی", true);
              }
            } catch(e) {
              showToast("خطا در اتصال", true);
            }
            btn.disabled = false;
            btn.textContent = "ذخیره تغییرات";
          });

          // ── Toast ─────────────────────────────────────────────────────────────
          function showToast(msg, isError) {
            var t = document.getElementById("toast");
            t.textContent = msg;
            t.className = "show" + (isError ? " error" : "");
            setTimeout(function(){ t.className = ""; }, 3000);
          }

          // ── Drag-to-reorder (simple) ─────────────────────────────────────────
          var dragged = null;
          document.getElementById("item-list").addEventListener("dragstart", function(e) {
            dragged = e.target.closest(".item-row");
            if (dragged) dragged.style.opacity = "0.5";
          });
          document.getElementById("item-list").addEventListener("dragend", function() {
            if (dragged) { dragged.style.opacity = "1"; dragged = null; updatePreview(); }
          });
          document.getElementById("item-list").addEventListener("dragover", function(e) {
            e.preventDefault();
            var target = e.target.closest(".item-row");
            if (target && target !== dragged) {
              var rect = target.getBoundingClientRect();
              if (e.clientY < rect.top + rect.height / 2) {
                target.parentNode.insertBefore(dragged, target);
              } else {
                target.parentNode.insertBefore(dragged, target.nextSibling);
              }
            }
          });
          document.querySelectorAll(".item-row").forEach(function(row) {
            row.setAttribute("draggable", "true");
          });
        `}} />
      </body>
    </html>
  );
}
