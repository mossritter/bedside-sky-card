/*! Bedside Sky Card 1.2.0 | a bedside screen for Home Assistant and View Assist, made for the Echo Show 5 (960x480) | MIT License */
(() => {
'use strict';
const VERSION = '1.2.0';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap';
const STYLE = String.raw`  /* The card: the 960 x 480 screen scaled to fill the card, which keeps a 2:1 shape (full screen on an Echo Show 5). */
  :host { display: block; position: relative; width: 100%; aspect-ratio: 2 / 1; max-height: 100vh; overflow: hidden; background: #000; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .fit { position: absolute; left: 0; top: 0; width: 960px; height: 480px; transform-origin: 0 0;
         font-family: "Figtree", system-ui, sans-serif; -webkit-user-select: none; user-select: none; }

  /* ---------- the screen: 960 x 480 at native pixels ----------
     Grid: 24 px inset, 16 px gaps. Left column (24 to 560) is text on the sky,
     right column (584 to 936) holds the glass. Nothing smaller than 22 px. */
  .scr { position: absolute; width: 960px; height: 480px; overflow: hidden; background: #000; border-radius: 0; font-family: "Figtree", system-ui, sans-serif;
         color: var(--ink); --ink: #FFFFFF; --ink2: rgba(255,255,255,.74); --track: rgba(255,255,255,.25); --accent: #8FC2FF; --alert: #FF8A8A; --inv: #141A2E; }
  #bg, #gl, #bg2, #rain { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; }
  #bg2, #rain { pointer-events: none; }
  #bg2 { opacity: 0; } /* holds the outgoing page's frame while it fades into the next one */
  .scr { touch-action: none; -webkit-user-select: none; user-select: none; } /* every touch is ours: swipes, holds, sliders */
  .view { position: absolute; inset: 0; }
  .scr [hidden] { display: none !important; }
  .g { position: absolute; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; text-align: left; -webkit-tap-highlight-color: transparent; }
  button.g, .tap { cursor: pointer; }
  :where(.scr button) { font: inherit; color: inherit; border: 0; background: transparent; padding: 0; text-align: left; -webkit-tap-highlight-color: transparent; }
  .scr :focus-visible { outline: 3px solid #FFFFFF; outline-offset: 4px; box-shadow: 0 0 0 8px rgba(58,123,213,.85); }
  .ta { display: block; width: max-content; }
  svg.i { width: 1em; height: 1em; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex: none; }
  .dot { width: 12px; height: 12px; border-radius: 50%; flex: none; --c: 127,224,180;
         background: radial-gradient(circle at 36% 32%, rgba(255,255,255,.7) 0 2px, rgb(var(--c)) 3px); box-shadow: 0 0 10px 3px rgba(var(--c),.55); }
  .dot.warn { --c: 255,194,77; }

  /* status line, alarm sheet only: the small time and date, since the sheet covers the big clock */
  .sb { position: absolute; left: 24px; top: 22px; z-index: 2; }
  .sb-left { display: flex; align-items: center; font-size: 22px; font-weight: 500; color: var(--ink2); white-space: nowrap; height: 30px; }
  .sb-t { display: inline-block; overflow: hidden; max-width: 0; opacity: 0; transition: max-width .35s ease, opacity .25s ease; }
  .sb-t.show { max-width: 200px; opacity: 1; }
  .micoff { color: var(--alert); font-size: 26px; margin-left: 12px; }

  /* left column: the clock pinned to the bottom-left with the date and weather on the line above it.
     An alert, when there is one, is a glass pill
     in the top-left corner. */
  .clock { position: absolute; left: 24px; top: 296px; }
  .time { font-size: 200px; font-weight: 300; line-height: .86; letter-spacing: -7px; margin-left: -4px; }
  .wxl { position: absolute; left: 24px; top: 252px; height: 36px; display: flex; align-items: center; gap: 10px; font-size: 26px; font-weight: 500; color: var(--ink2); white-space: nowrap; }
  .wxl svg { font-size: 24px; }
  .wxl { z-index: 1; } /* the big clock's glyph box reaches up past its line, so keep these lines on top for taps */
  .ctx { position: absolute; left: 24px; height: 56px; display: flex; align-items: center; gap: 10px; font-size: 28px; font-weight: 500; white-space: nowrap; }
  .ctx b { font-weight: 600; }
  .ctx .mut { color: var(--ink2); }
  .ctx svg { font-size: 26px; }
  .wxl .micoff { margin-left: 4px; }
  .alertrow { position: absolute; left: 24px; top: 24px; display: flex; } /* top-left corner, level with the top of the glass on the right */
  .alert .dot { --c: var(--warn, 255,194,77); } /* deeper amber when the ink goes dark, so the dot holds on light glass */
  .alert { position: relative; height: 56px; border-radius: 28px; padding: 0 24px; display: flex; align-items: center; gap: 12px; font-size: 24px; font-weight: 500; white-space: nowrap; }
  .alert:has(.acount:not([hidden])) { padding-right: 16px; }
  .acount { height: 28px; min-width: 34px; padding: 0 9px; border-radius: 14px; display: grid; place-items: center; font-size: 18px; font-weight: 700; background: var(--ink); color: var(--inv); }
  .achev { font-size: 22px; margin-left: -4px; color: var(--ink2); transition: transform .2s; }
  .alert[aria-expanded="true"] .achev { transform: rotate(180deg); }
  /* the full list drops down under the pill; it has its own frosted backing so it reads over anything below */
  .amenu { position: absolute; z-index: 4; left: 24px; top: 88px; min-width: 320px; padding: 6px 0; border-radius: 28px; color: #FFFFFF; list-style: none;
           background: rgba(20,22,36,.74); -webkit-backdrop-filter: blur(20px) saturate(1.2); backdrop-filter: blur(20px) saturate(1.2);
           box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.22), 0 18px 40px rgba(0,0,12,.35);
           opacity: 0; transform: translateY(-8px); pointer-events: none; transition: opacity .2s, transform .2s; }
  .amenu.on { opacity: 1; transform: none; pointer-events: auto; }
  .amenu li { display: flex; align-items: center; gap: 14px; height: 56px; padding: 0 26px 0 22px; font-size: 24px; font-weight: 500; white-space: nowrap; }
  .amenu li + li { box-shadow: inset 0 1px 0 rgba(255,255,255,.12); }
  /* weather is tappable: the icon and temperature on the date line, and the big forecast row on the Today card */
  /* the forecast opens from the whole top half of the Today card */
  .wxhit { position: absolute; z-index: 1; left: 0; top: 0; right: 0; height: 172px; border-radius: 36px 36px 0 0; cursor: pointer; } /* above the text it covers */

  /* right column: three big targets, 352 x 133 (about 45 x 17 mm on the Echo Show 5) */
  .bb { left: 584px; width: 352px; height: 133px; border-radius: 36px; display: flex; align-items: center; gap: 18px; padding: 0 22px; }
  /* right-column slots: the ceiling light's hold menu uses all three, the day view's ceiling light sits in the last */
  .b1 { top: 24px; } .b2 { top: 173px; height: 132px; } .b3, .bm { top: 321px; height: 135px; }
  .bb.inert { cursor: default; }
  .hold { -webkit-touch-callout: none; touch-action: manipulation; }
  .clock.hold .time { transition: opacity .15s; } .clock.hold:active .time { opacity: .72; } /* a little give while it's held */
  .chip { width: 64px; height: 64px; border-radius: 32px; display: grid; place-items: center; font-size: 30px; flex: none;
          box-shadow: inset 0 0 0 2px var(--track); transition: background .2s, color .2s, box-shadow .2s; }
  .chip.on { background: var(--ink); color: var(--inv); box-shadow: none; }
  .chip.lit { background: #FFC44D; color: #3A2600; box-shadow: 0 0 18px rgba(255,196,77,.55); }
  .chip.gn { background: #3D7BFF; color: #FFFFFF; box-shadow: none; }
  .bt { display: block; font-size: 32px; font-weight: 600; line-height: 1.1; }
  .bs { display: block; font-size: 22px; font-weight: 500; color: var(--ink2); margin-top: 6px; line-height: 1.2; }
  .bb[data-g="thumb"] { color: #FFFFFF; }
  .bb[data-g="thumb"] .bs { color: rgba(255,255,255,.9); }
  .bb[data-g="thumb"] .chip { background: rgba(255,255,255,.2); color: #FFFFFF; box-shadow: none; }

  /* today card (day view) */
  .brief { left: 584px; top: 24px; width: 352px; height: 281px; border-radius: 36px; }
  .k { position: absolute; left: 28px; display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 600; color: var(--ink2); }
  .k svg { font-size: 20px; }
  .k1 { top: 25px; } .k2 { top: 187px; }
  .hi { position: absolute; left: 26px; top: 57px; display: flex; align-items: center; gap: 14px; font-size: 52px; font-weight: 500; letter-spacing: -1px; line-height: 1; }
  .hi svg { font-size: 44px; }
  .rainl { position: absolute; left: 28px; top: 127px; display: flex; align-items: center; gap: 8px; font-size: 22px; font-weight: 500; color: var(--ink2); }
  .rainl svg { font-size: 20px; }
  .rule { position: absolute; left: 28px; right: 28px; top: 169px; height: 2px; border-radius: 1px; background: var(--track); }
  .ev { position: absolute; left: 28px; right: 24px; top: 219px; display: flex; align-items: baseline; gap: 10px; white-space: nowrap; }
  .ev b { font-size: 32px; font-weight: 600; } .ev b:empty { display: none; } .ev span { font-size: 22px; font-weight: 500; color: var(--ink2); overflow: hidden; text-overflow: ellipsis; }

  /* ---------- pages: swipe left and right on the day screen ---------- */
  .page { position: absolute; inset: 0; }
  .dots { position: absolute; z-index: 2; left: 50%; top: 4px; transform: translateX(-50%); display: flex; gap: 2px; }
  .dots button { position: relative; width: 22px; height: 18px; display: grid; place-items: center; cursor: pointer; }
  .dots button::after { content: ""; width: 7px; height: 7px; border-radius: 4px; background: var(--ink); opacity: .38; transition: width .25s, opacity .25s; }
  .dots button[aria-current="true"]::after { width: 20px; opacity: .9; }
  .dots button[aria-current="true"] { width: 34px; }
  /* house: lights on top, sensors below */
  .tile { width: 216px; height: 208px; border-radius: 32px; }
  .c1 { left: 24px; } .c2 { left: 256px; } .c3 { left: 488px; } .c4 { left: 720px; } .r1 { top: 24px; } .r2 { top: 248px; }
  .tile .chip { position: absolute; left: 20px; top: 20px; }
  .tile .chip.warn { background: #FFC44D; color: #3A2600; box-shadow: 0 0 18px rgba(255,196,77,.5); }
  .tl-v { position: absolute; right: 22px; top: 26px; font-size: 40px; font-weight: 500; letter-spacing: -1px; line-height: 1.1; }
  .tl-t { position: absolute; left: 22px; top: 100px; font-size: 26px; font-weight: 600; white-space: nowrap; }
  .tl-s { position: absolute; left: 22px; right: 16px; top: 138px; font-size: 20px; font-weight: 500; line-height: 1.3; color: var(--ink2); }
  /* music */
  .art { position: absolute; left: 24px; top: 24px; width: 280px; height: 280px; border-radius: 28px; overflow: hidden; transition: background .4s;
         box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.18), 0 18px 40px rgba(0,0,20,.35); }
  .art svg { position: absolute; left: 50%; top: 50%; width: 72px; height: 72px; margin: -36px 0 0 -36px; color: rgba(255,255,255,.55); }
  /* the song's details sit on glass: at sunset the sky behind them is too busy for small text */
  .mu-info { left: 328px; top: 24px; width: 608px; height: 176px; border-radius: 32px; }
  .mu-t { position: absolute; left: 26px; right: 26px; top: 20px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 36px; font-weight: 600; }
  .mu-a { position: absolute; left: 26px; right: 26px; top: 70px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 24px; font-weight: 500; color: var(--ink2); }
  .mu-bar { position: absolute; left: 26px; right: 26px; top: 120px; height: 6px; border-radius: 3px; background: var(--track); }
  .mu-bar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px; background: var(--ink); }
  .mu-p, .mu-l { position: absolute; top: 134px; font-size: 18px; font-weight: 500; color: var(--ink2); font-variant-numeric: tabular-nums; }
  .mu-p { left: 26px; } .mu-l { right: 26px; }
  .mb { top: 216px; height: 88px; border-radius: 44px; display: grid; place-items: center; font-size: 32px; }
  .mb.prev { left: 328px; width: 120px; } .mb.play { left: 464px; width: 152px; font-size: 36px; } .mb.next { left: 632px; width: 120px; }
  .mb.play[data-g="thumb"] { color: #FFFFFF; }
  /* sliders: the whole bar is the touch target */
  .sl { display: flex; align-items: center; gap: 18px; padding: 0 34px 0 22px; cursor: pointer; }
  .sl-l { width: 168px; flex: none; } .sl-l b { display: block; font-size: 28px; font-weight: 600; } .sl-l span { display: block; margin-top: 4px; font-size: 20px; font-weight: 500; color: var(--ink2); }
  .sl-track { position: relative; flex: 1; height: 12px; border-radius: 6px; background: var(--track); }
  .sl-track i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 6px; background: var(--ink); }
  .sl-track b { position: absolute; top: 50%; width: 30px; height: 30px; margin: -15px 0 0 -15px; border-radius: 50%; background: var(--ink); box-shadow: 0 2px 8px rgba(0,0,20,.3); }
  .vol { left: 24px; top: 320px; width: 912px; height: 136px; border-radius: 36px; }
  /* front door */
  .cam { position: absolute; left: 24px; top: 24px; width: 640px; height: 360px; border-radius: 28px; overflow: hidden;
         box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.16), 0 18px 40px rgba(0,0,20,.35); }
  .cam > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .cam-live, .cam-time { position: absolute; top: 16px; height: 32px; padding: 0 12px; border-radius: 16px; display: flex; align-items: center; gap: 8px;
                         font-size: 18px; font-weight: 700; color: #FFFFFF; background: rgba(0,0,0,.45); font-variant-numeric: tabular-nums; }
  .cam-live { left: 16px; } .cam-time { right: 16px; font-weight: 600; }
  .cam-live i { width: 10px; height: 10px; border-radius: 50%; background: #FF4D4D; animation: blink 1.6s ease-in-out infinite; }
  @keyframes blink { 50% { opacity: .25; } }
  .cam-name { position: absolute; left: 24px; top: 394px; font-size: 28px; font-weight: 600; }
  .cam-sub { position: absolute; left: 24px; top: 430px; font-size: 20px; font-weight: 500; color: var(--ink2); }
  .evs { left: 680px; top: 24px; width: 256px; height: 432px; border-radius: 32px; }
  .evs .k { top: 22px; left: 24px; }
  .evs ul { position: absolute; left: 0; right: 0; top: 60px; list-style: none; }
  .evs li { display: flex; align-items: center; gap: 14px; height: 84px; padding: 0 20px 0 22px; }
  .evs li + li { box-shadow: inset 0 1px 0 var(--track); }
  .evs li .chip { width: 48px; height: 48px; font-size: 24px; }
  .evs li b { display: block; font-size: 22px; font-weight: 600; } .evs li span span { display: block; font-size: 18px; font-weight: 500; color: var(--ink2); margin-top: 2px; }
  /* settings: two sliders, then three switches */
  .sbar { left: 24px; width: 912px; height: 132px; border-radius: 36px; } .s1 { top: 24px; } .s2 { top: 172px; }
  .set-row { position: absolute; left: 24px; right: 24px; top: 320px; display: flex; gap: 16px; }
  .stog { position: relative; flex: 1; height: 136px; border-radius: 36px; display: flex; align-items: center; gap: 14px; padding: 0 18px; }
  .stog .chip { width: 56px; height: 56px; font-size: 26px; }
  .stog .bt { font-size: 24px; } .stog .bs { font-size: 20px; }

  /* forecast: full screen, closes itself after 12 s */
  .fcs { left: 24px; top: 24px; width: 912px; height: 432px; border-radius: 40px; color: #FFFFFF; }
  .fc-now { position: absolute; left: 32px; top: 20px; height: 84px; display: flex; align-items: center; gap: 16px; }
  .fc-ico { font-size: 60px; }
  .fc-t { font-size: 84px; font-weight: 300; line-height: 1; letter-spacing: -3px; }
  .fc-c { display: flex; flex-direction: column; gap: 4px; margin-left: 10px; }
  .fc-c b { font-size: 30px; font-weight: 600; } .fc-c span { font-size: 22px; font-weight: 500; color: rgba(255,255,255,.84); }
  .fc-x { right: 20px; top: 20px; width: 64px; height: 64px; border-radius: 32px; display: grid; place-items: center; font-size: 28px; }
  .fc-k { position: absolute; left: 32px; font-size: 18px; font-weight: 600; color: rgba(255,255,255,.8); }
  .fc-k1 { top: 116px; } .fc-k2 { top: 276px; }
  .fc-rule { position: absolute; left: 32px; right: 32px; top: 262px; height: 2px; border-radius: 1px; background: rgba(255,255,255,.16); }
  .fc-row { position: absolute; left: 16px; right: 16px; display: flex; }
  .fc-hours { top: 142px; height: 108px; } .fc-days { top: 302px; height: 108px; }
  .fc-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
  .fc-col .a { font-size: 20px; font-weight: 500; color: rgba(255,255,255,.84); }
  .fc-col svg { font-size: 32px; }
  .fc-col .b { font-size: 26px; font-weight: 600; } .fc-col .b i { font-style: normal; font-weight: 500; color: rgba(255,255,255,.72); }
  .fc-col .p { height: 20px; font-size: 17px; font-weight: 600; color: #9CCBFF; }

  /* alarm: the same full-screen sheet as the forecast (shares .fcs, .fc-now, .fc-k, .fc-rule and .fc-x) */
  .sheet .fc-t { transition: opacity .2s; } .sheet[data-off="1"] .fc-t { opacity: .45; }
  .onoff, .astep, .sunr, .day { display: grid; place-items: center; color: #FFFFFF; font-weight: 600; }
  .onoff { right: 100px; top: 27px; width: 112px; height: 50px; border-radius: 25px; font-size: 22px; }
  .a-steps { position: absolute; left: 32px; right: 32px; top: 150px; display: flex; gap: 16px; }
  .astep { position: relative; flex: 1; height: 92px; border-radius: 46px; font-size: 28px; }
  .days { --x0: 32px; --dx: 86px; }
  .day { left: calc(var(--x0) + var(--i) * var(--dx)); top: 320px; width: 74px; height: 72px; border-radius: 36px; font-size: 24px; }
  .sunr { left: 640px; top: 320px; width: 240px; height: 72px; border-radius: 36px; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 22px; }
  .sunr .dot { --c: 255,255,255; background: transparent; box-shadow: inset 0 0 0 2px rgba(255,255,255,.8); }
  .sunr[data-on="1"] .dot { --c: 255,194,77; background: radial-gradient(circle at 36% 32%, rgba(255,255,255,.7) 0 2px, rgb(var(--c)) 3px); box-shadow: 0 0 10px 3px rgba(var(--c),.55); }

  /* ringing */
  .r-glow { position: absolute; left: 300px; top: -20px; width: 360px; height: 360px; border-radius: 50%; pointer-events: none;
            background: radial-gradient(circle, rgba(255,220,160,.55), rgba(255,170,110,.18) 45%, rgba(255,170,110,0) 70%); animation: pulse 2.4s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { transform: scale(.85); opacity: .6; } 50% { transform: scale(1.06); opacity: 1; } }
  .r-time, .r-sub { position: absolute; left: 0; right: 0; margin-inline: auto; }
  .r-time { top: 52px; font-size: 168px; font-weight: 300; line-height: .86; letter-spacing: -6px; }
  .r-sub { top: 228px; font-size: 28px; font-weight: 500; color: var(--ink2); }
  .snooze, .stop { display: grid; place-items: center; font-weight: 600; }
  .snooze { left: 150px; top: 300px; width: 310px; height: 100px; border-radius: 50px; font-size: 28px; }
  .stop { left: 500px; top: 300px; width: 310px; height: 100px; border-radius: 50px; font-size: 32px; color: #FFFFFF; }

  /* night: black, dim warm clock. A tap shows three outline buttons for 10 s instead of lighting the whole screen. */
  .night { position: absolute; inset: 0; z-index: 3; display: none; cursor: pointer; background: #000; --nc: rgba(150,80,42,.78); --nc2: rgba(150,80,42,.5); }
  .night.on { display: block; }
  .n-time { position: absolute; left: 0; right: 0; top: 100px; text-align: center; font-size: 190px; font-weight: 300; line-height: .86; letter-spacing: -7px; color: var(--nc); }
  .n-sub { position: absolute; left: 0; right: 0; top: 300px; display: flex; justify-content: center; gap: 24px; font-size: 26px; font-weight: 500; color: var(--nc2); }
  .n-sub > span { display: inline-flex; align-items: center; gap: 10px; }
  .n-sub .dot { --c: 190,120,50; box-shadow: none; }
  .nbs { position: absolute; left: 0; right: 0; top: 376px; display: flex; justify-content: center; gap: 24px; opacity: 0; pointer-events: none; transition: opacity .3s; }
  .night.woken .nbs { opacity: 1; pointer-events: auto; }
  .nb { width: 264px; height: 80px; border-radius: 40px; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 26px; font-weight: 600;
        color: var(--nc); box-shadow: inset 0 0 0 2px var(--nc2); text-align: center; }
  .nb[aria-pressed="true"] { background: rgba(150,80,42,.24); }

  /* toasts sit at the top of the left column, centred over it; at night, top centre of the screen */
  .toast { position: absolute; z-index: 6; left: 292px; top: 24px; transform: translate(-50%, -16px); opacity: 0; transition: opacity .25s, transform .25s;
           display: flex; align-items: center; gap: 10px; padding: 12px 22px; border-radius: 32px; font-size: 22px; font-weight: 500; color: #FFFFFF; white-space: nowrap;
           background: rgba(20,22,36,.55); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.25); }
  .toast.on { opacity: 1; transform: translate(-50%, 0); }
  .scr.has-alert .toast { top: 92px; }
  #wxPopW { display: inline-flex; align-items: center; gap: 8px; }
  .g[aria-disabled="true"] { cursor: default; }
  .g { transition: background-color .12s ease; } /* pressed: a light wash on the button itself, no canvas redraw */
  .g[data-pressed="1"] { background-color: rgba(255,255,255,.16); }
  .dbg { position: absolute; z-index: 9; right: 8px; bottom: 6px; padding: 3px 9px; border-radius: 9px; font: 600 13px ui-monospace, Menlo, monospace;
         color: #FFFFFF; background: rgba(0,0,0,.6); pointer-events: none; white-space: nowrap; }
  .cam-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; -webkit-user-drag: none; } /* a drag on the picture still turns the page */
  .cam-wait { position: absolute; left: 0; right: 0; bottom: 22px; text-align: center; font-size: 20px; font-weight: 600; color: rgba(255,255,255,.82); }
  .evs li.none b { font-weight: 500; color: var(--ink2); } /* drop below the alert pill instead of covering it */
  .scr[data-v="night"] .toast, .scr[data-v="ring"] .toast, .scr[data-v="alarm"] .toast, .scr[data-v="fc"] .toast { left: 480px; top: 22px; transform: translate(-50%, -16px); }
  .scr[data-v="night"] .toast.on, .scr[data-v="ring"] .toast.on, .scr[data-v="alarm"] .toast.on, .scr[data-v="fc"] .toast.on { transform: translate(-50%, 0); }
  .toast.dim { filter: brightness(.5); }
  .toast svg { font-size: 1.15em; }

  @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;
const MARKUP = String.raw`<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-mic" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></symbol>
    <symbol id="i-micoff" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M4 4l16 16"/></symbol>
    <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 21a2.2 2.2 0 0 0 4 0"/></symbol>
    <symbol id="i-home" viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/></symbol>
    <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></symbol>
    <symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></symbol>
    <symbol id="i-wave" viewBox="0 0 24 24"><path d="M3 12h1.5M7 9v6M11 5.5v13M15 8v8M19 10.5v3M21.5 12h0"/></symbol>
    <symbol id="i-rain" viewBox="0 0 24 24"><path d="M7 15.5a4.5 4.5 0 1 1 1.4-8.8A5.5 5.5 0 0 1 18.5 9a3.5 3.5 0 0 1-.5 6.5z"/><path d="M9 18.5l-1 2.5M13 18.5l-1 2.5M17 18.5l-1 2.5"/></symbol>
    <symbol id="i-stop" viewBox="0 0 24 24"><rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/></symbol>
    <symbol id="i-minus" viewBox="0 0 24 24"><path d="M5.5 12h13"/></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5.5v13M5.5 12h13"/></symbol>
    <symbol id="i-bulb" viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1v.1h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z"/></symbol>
    <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></symbol>
    <symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3.5s-6 6.6-6 10.7a6 6 0 0 0 12 0c0-4.1-6-10.7-6-10.7z"/></symbol>
    <symbol id="i-cloud" viewBox="0 0 24 24"><path d="M7 18.5a4.5 4.5 0 1 1 1.4-8.8A5.5 5.5 0 0 1 18.5 12a3.25 3.25 0 0 1-.5 6.5z"/></symbol>
    <symbol id="i-clouds" viewBox="0 0 24 24"><path d="M7.2 9.8A4.6 4.6 0 0 1 16 8.2a3.4 3.4 0 0 1 4.2 3.6"/><path d="M7 20.5a3.9 3.9 0 1 1 1.2-7.6A4.8 4.8 0 0 1 17 14.6a2.9 2.9 0 0 1-.4 5.9z"/></symbol>
    <symbol id="i-cloudsun" viewBox="0 0 24 24"><path d="M5.3 11.4A3.6 3.6 0 1 1 11.6 8"/><path d="M8.6 1.6v1.6M2.4 7.8H1M3.9 3.1l1.1 1.1M13.3 3.1l-1.1 1.1"/><path d="M9.5 21a3.8 3.8 0 1 1 1.2-7.4A4.6 4.6 0 0 1 19.2 15.6a2.7 2.7 0 0 1-.4 5.4z"/></symbol>
    <symbol id="i-cloudmoon" viewBox="0 0 24 24"><path d="M5 12.2A5.5 5.5 0 0 1 9.8 3.3a4.6 4.6 0 0 0 4.7 6.4"/><path d="M9.5 21a3.8 3.8 0 1 1 1.2-7.4A4.6 4.6 0 0 1 19.2 15.6a2.7 2.7 0 0 1-.4 5.4z"/></symbol>
    <symbol id="i-music" viewBox="0 0 24 24"><path d="M9 18V5.5l10-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></symbol>
    <symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5.2v13.6L19.2 12z" fill="currentColor"/></symbol>
    <symbol id="i-pause" viewBox="0 0 24 24"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/></symbol>
    <symbol id="i-prev" viewBox="0 0 24 24"><path d="M18.5 6v12l-9-6z" fill="currentColor"/><path d="M6.5 6v12"/></symbol>
    <symbol id="i-next" viewBox="0 0 24 24"><path d="M5.5 6v12l9-6z" fill="currentColor"/><path d="M17.5 6v12"/></symbol>
    <symbol id="i-vol" viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></symbol>
    <symbol id="i-cam" viewBox="0 0 24 24"><rect x="2.5" y="6.5" width="12.5" height="11" rx="2.5"/><path d="M15 10.5l5.5-3v9l-5.5-3z"/></symbol>
    <symbol id="i-person" viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></symbol>
    <symbol id="i-motion" viewBox="0 0 24 24"><path d="M4.5 13a7.5 7.5 0 0 1 15 0M8 13a4 4 0 0 1 8 0"/><circle cx="12" cy="13" r="1.2" fill="currentColor"/></symbol>
    <symbol id="i-therm" viewBox="0 0 24 24"><path d="M10 13.6V5a2 2 0 0 1 4 0v8.6a4 4 0 1 1-4 0z"/><path d="M12 10v6.5"/></symbol>
    <symbol id="i-washer" viewBox="0 0 24 24"><rect x="4.5" y="3" width="15" height="18" rx="2.5"/><circle cx="12" cy="13" r="4.5"/><path d="M7.5 6.5h2"/></symbol>
    <symbol id="i-list" viewBox="0 0 24 24"><path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10"/><circle cx="5" cy="6.5" r="1.1" fill="currentColor"/><circle cx="5" cy="12" r="1.1" fill="currentColor"/><circle cx="5" cy="17.5" r="1.1" fill="currentColor"/></symbol>
    <symbol id="i-dnd" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M8 12h8"/></symbol>
    <symbol id="i-auto" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></symbol>
    <symbol id="i-x" viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></symbol>
    <symbol id="i-chev" viewBox="0 0 24 24"><path d="M6.5 9.5 12 15l5.5-5.5"/></symbol>
    <symbol id="i-alert" viewBox="0 0 24 24"><path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.1"/></symbol>
    <symbol id="i-car" viewBox="0 0 24 24"><path d="M3.5 16.5h17M4.5 16.5v-4l2.2-5h10.6l2.2 5v4"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/></symbol>
    <symbol id="i-paw" viewBox="0 0 24 24"><circle cx="6.5" cy="10" r="1.8"/><circle cx="10" cy="5.8" r="1.8"/><circle cx="14" cy="5.8" r="1.8"/><circle cx="17.5" cy="10" r="1.8"/><path d="M12 11c-3 0-5.5 3.6-5.5 5.8 0 1.5 1.2 2.7 2.7 2.7.9 0 1.7-.5 2.8-.5s1.9.5 2.8.5c1.5 0 2.7-1.2 2.7-2.7 0-2.2-2.5-5.8-5.5-5.8z"/></symbol>
  </defs>
</svg>
<div class="fit" id="fit">
        <div class="scr" id="scr" data-v="home">
          <canvas id="bg" width="960" height="480" aria-hidden="true"></canvas>
          <canvas id="bg2" width="960" height="480" aria-hidden="true"></canvas>
          <canvas id="rain" width="960" height="480" aria-hidden="true"></canvas>

          <div class="sb" id="sb">
            <span class="sb-left ta" id="sbLeft"><span class="sb-t" id="sbT">21:10 ·&nbsp;</span><span class="js-date">Sunday, October 4</span><svg class="i micoff js-mic" role="img" aria-label="Microphone muted" hidden><use href="#i-micoff"/></svg></span>
          </div>

          <!-- DAY: from the alarm until bedtime -->
          <section class="view" data-view="home" aria-label="Day">
            <div class="dots" id="dots" role="tablist" aria-label="Pages"></div>
            <div class="page" data-page="home" aria-label="Home">
            <div class="alertrow js-alert" hidden><button class="g alert tap" data-act="alerts" aria-expanded="false"><span class="dot warn"></span><span class="js-alertT"></span><span class="acount js-acount" hidden>+1</span><svg class="i achev js-achev" hidden><use href="#i-chev"/></svg></button></div>
            <div class="wxl ta"><span class="js-date">Sunday, October 4</span><span>·</span><svg class="i"><use class="js-wxi" href="#i-sun"/></svg><span class="js-out">19°</span><svg class="i micoff js-mic" role="img" aria-label="Microphone muted" hidden><use href="#i-micoff"/></svg></div>
            <div class="clock hold"><div class="time ta js-time">6:31</div></div>
            <div class="g brief rcol" aria-label="Today">
              <button class="wxhit" data-act="forecast" aria-label="Open the forecast"></button>
              <span class="k k1">Today</span>
              <span class="hi"><svg class="i"><use id="hiUse" href="#i-cloudsun"/></svg><span id="mHL">–</span></span>
              <span class="rainl"><span id="wxCond"></span><span id="wxPopW"><span>·</span><svg class="i"><use href="#i-drop"/></svg><span id="wxPop"></span></span></span>
              <span class="rule"></span>
              <span class="k k2"><svg class="i"><use id="k2Use" href="#i-cal"/></svg><span id="k2T">Next</span></span>
              <span class="ev"><b id="evT"></b><span id="evN"></span></span>
            </div>
            <button class="g bb bm tap hold rcol js-ceil" data-act="ceiling" id="bCeil"><span class="chip js-ceilChip"><svg class="i"><use href="#i-bulb"/></svg></span><span><span class="bt">Ceiling light</span><span class="bs js-ceilS">Off</span></span></button>
            <!-- hold the ceiling light: three placeholder presets in place of the right column -->
            <div class="cmenu" hidden>
              <button class="g bb b1 tap" data-act="cmenukeep"><span class="chip"><svg class="i"><use href="#i-sun"/></svg></span><span><span class="bt">Bright</span><span class="bs">Placeholder</span></span></button>
              <button class="g bb b2 tap" data-act="cmenukeep"><span class="chip"><svg class="i"><use href="#i-bulb"/></svg></span><span><span class="bt">Relax</span><span class="bs">Placeholder</span></span></button>
              <button class="g bb b3 tap" data-act="cmenukeep"><span class="chip"><svg class="i"><use href="#i-moon"/></svg></span><span><span class="bt">Nightlight</span><span class="bs">Placeholder</span></span></button>
            </div>
            </div>

            <!-- HOUSE: lights, then sensors -->
            <div class="page" data-page="house" aria-label="House" hidden>
              <button class="g tile c1 r1 tap js-ceil" data-act="ceiling" id="hCeil"><span class="chip js-ceilChip"><svg class="i"><use href="#i-bulb"/></svg></span><span class="tl-t">Ceiling</span><span class="tl-s js-ceilS">Off</span></button>
              <button class="g tile c2 r1 tap" data-act="lamp" id="hLamp"><span class="chip" id="hLampChip"><svg class="i"><use href="#i-bulb"/></svg></span><span class="tl-t">Lamp</span><span class="tl-s" id="hLampS">On</span></button>
              <button class="g tile c3 r1 tap" data-act="hall" id="hHall"><span class="chip" id="hHallChip"><svg class="i"><use href="#i-bulb"/></svg></span><span class="tl-t">Hall</span><span class="tl-s" id="hHallS">Off</span></button>
              <button class="g tile c4 r1 tap" data-act="hood" id="hHood"><span class="chip" id="hHoodChip"><svg class="i"><use href="#i-bulb"/></svg></span><span class="tl-t">Kitchen hood</span><span class="tl-s" id="hHoodS">Off</span></button>
              <div class="g tile c1 r2" id="hClim"><span class="chip"><svg class="i"><use href="#i-therm"/></svg></span><span class="tl-v" id="hTemp">21°</span><span class="tl-t">Hall</span><span class="tl-s" id="hHum">59% humidity</span></div>
              <div class="g tile c2 r2"><span class="chip" id="hLaunChip"><svg class="i"><use href="#i-washer"/></svg></span><span class="tl-t">Laundry</span><span class="tl-s" id="hLaun">Door closed<br>Washer idle</span></div>
              <div class="g tile c3 r2"><span class="chip" id="hLeakChip"><svg class="i"><use href="#i-drop"/></svg></span><span class="tl-t">Leaks</span><span class="tl-s" id="hLeak">All 3 sensors dry</span></div>
              <div class="g tile c4 r2"><span class="chip"><svg class="i"><use href="#i-list"/></svg></span><span class="tl-v" id="hShopN">0</span><span class="tl-t">Shopping</span><span class="tl-s" id="hShop">List is empty</span></div>
            </div>

            <!-- MUSIC: this speaker (or Spotify) -->
            <div class="page" data-page="music" aria-label="Music" hidden>
              <div class="art" id="muArt" aria-hidden="true"><svg class="i"><use href="#i-music"/></svg></div>
              <div class="g mu-info">
                <div class="mu-t" id="muT"></div>
                <div class="mu-a" id="muA"></div>
                <div class="mu-bar"><i id="muFill"></i></div>
                <span class="mu-p" id="muP"></span><span class="mu-l" id="muL"></span>
              </div>
              <button class="g mb prev tap" data-act="muprev" aria-label="Previous track"><svg class="i"><use href="#i-prev"/></svg></button>
              <button class="g mb play tap" data-act="muplay" id="muPlay" aria-label="Play"><svg class="i"><use id="muPlayUse" href="#i-play"/></svg></button>
              <button class="g mb next tap" data-act="munext" aria-label="Next track"><svg class="i"><use href="#i-next"/></svg></button>
              <div class="g vol sl" data-slider="mvol" role="slider" aria-label="Music volume" aria-valuemin="0" aria-valuemax="100"><span class="chip"><svg class="i"><use href="#i-vol"/></svg></span><span class="sl-l"><b>Volume</b><span id="mvolV"></span></span><span class="sl-track"><i id="mvolFill"></i><b id="mvolKnob"></b></span></div>
            </div>

            <!-- CAMERAS: the front door (picture is a placeholder drawing) -->
            <div class="page" data-page="cams" aria-label="Front door" hidden>
              <div class="cam" role="img" aria-label="Front door camera">
                <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <defs>
                    <linearGradient id="camWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3F4B"/><stop offset="1" stop-color="#23262E"/></linearGradient>
                    <radialGradient id="camLamp" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(476 104) scale(170)"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".5"/><stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></radialGradient>
                    <radialGradient id="camVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".65"/></radialGradient>
                  </defs>
                  <rect width="640" height="360" fill="url(#camWall)"/>
                  <rect y="274" width="640" height="86" fill="#1C1E24"/><path d="M0 274.5h640" stroke="#4A4F5B"/>
                  <rect x="252" y="66" width="150" height="208" rx="4" fill="#3B3029"/>
                  <rect x="266" y="80" width="122" height="82" rx="3" fill="#4A3D33"/><rect x="266" y="174" width="122" height="88" rx="3" fill="#4A3D33"/>
                  <circle cx="380" cy="180" r="5" fill="#C9A86A"/>
                  <rect x="190" y="264" width="80" height="12" rx="3" fill="#2B2E35"/>
                  <circle cx="476" cy="104" r="170" fill="url(#camLamp)"/><rect x="469" y="88" width="14" height="26" rx="4" fill="#FFE6B8"/>
                  <rect width="640" height="360" fill="url(#camVig)"/>
                </svg>
                <img class="cam-img" id="camImg" alt="" draggable="false" hidden><span class="cam-wait" id="camWait">Waiting for the camera…</span>
                <span class="cam-live" id="camLive" hidden><i></i>LIVE</span><span class="cam-time" id="camTime"></span>
              </div>
              <div class="cam-name ta">Front door</div>
              <div class="cam-sub ta" id="camSub"></div>
              <div class="g evs"><span class="k">Recent</span><ul id="camEv"></ul></div>
            </div>

            <!-- SETTINGS: this Echo Show -->
            <div class="page" data-page="settings" aria-label="Settings" hidden>
              <div class="g sl sbar s1" data-slider="bright" role="slider" aria-label="Screen brightness" aria-valuemin="0" aria-valuemax="100"><span class="chip"><svg class="i"><use href="#i-sun"/></svg></span><span class="sl-l"><b>Brightness</b><span id="brV">50%</span></span><span class="sl-track"><i id="brFill"></i><b id="brKnob"></b></span></div>
              <div class="g sl sbar s2" data-slider="vol" role="slider" aria-label="Volume" aria-valuemin="0" aria-valuemax="15"><span class="chip"><svg class="i"><use href="#i-vol"/></svg></span><span class="sl-l"><b>Volume</b><span id="volV"></span></span><span class="sl-track"><i id="volFill"></i><b id="volKnob"></b></span></div>
              <div class="set-row">
                <button class="g stog tap" data-act="dnd" id="sDnd"><span class="chip" id="sDndChip"><svg class="i"><use href="#i-dnd"/></svg></span><span><span class="bt">Do not disturb</span><span class="bs" id="sDndS">Off</span></span></button>
                <button class="g stog tap" data-act="autob" id="sAuto"><span class="chip" id="sAutoChip"><svg class="i"><use href="#i-auto"/></svg></span><span><span class="bt">Auto brightness</span><span class="bs" id="sAutoS">On</span></span></button>
                <button class="g stog tap" data-act="wakeword" id="sWake"><span class="chip"><svg class="i"><use href="#i-mic"/></svg></span><span><span class="bt">Wake word</span><span class="bs" id="sWakeS">Ok Nabu</span></span></button>
              </div>
            </div>
          </section>

          <!-- ALARM SHEET -->
          <section class="view" data-view="alarm" aria-label="Alarm" hidden>
            <div class="g fcs sheet" data-g="smoke" role="dialog" aria-label="Alarm settings">
              <div class="fc-now"><svg class="i fc-ico"><use href="#i-bell"/></svg><span class="fc-t" id="aTime">6:30</span><span class="fc-c"><b>Alarm</b><span id="aIn">Rings in 9 h 20 m · Every day</span></span></div>
              <button class="g onoff tap" data-g="thumb" data-on="1" data-act="almtoggle" aria-pressed="true" id="onoff">On</button>
              <button class="g fc-x tap" data-g="smokebtn" data-act="done" aria-label="Close alarm settings"><svg class="i"><use href="#i-x"/></svg></button>
              <div class="fc-k fc-k1">Time</div>
              <div class="a-steps" role="group" aria-label="Change the time">
                <button class="g astep tap" data-g="smokebtn" data-act="almstep" data-d="-60" aria-label="1 hour earlier">−1 h</button>
                <button class="g astep tap" data-g="smokebtn" data-act="almstep" data-d="-5" aria-label="5 minutes earlier">−5 min</button>
                <button class="g astep tap" data-g="smokebtn" data-act="almstep" data-d="5" aria-label="5 minutes later">+5 min</button>
                <button class="g astep tap" data-g="smokebtn" data-act="almstep" data-d="60" aria-label="1 hour later">+1 h</button>
              </div>
              <div class="fc-rule"></div>
              <div class="fc-k fc-k2">Repeat</div>
              <div class="days" role="group" aria-label="Days" id="days"></div>
              <button class="g sunr tap" data-g="thumb" data-on="1" data-act="sunrise" aria-pressed="true" id="sunr"><span class="dot"></span>Sunrise light</button>
            </div>
          </section>

          <!-- FORECAST: tap any weather icon -->
          <section class="view" data-view="fc" aria-label="Forecast" hidden>
            <div class="g fcs" data-g="smoke" role="dialog" aria-label="Forecast">
              <div class="fc-now"><svg class="i fc-ico"><use id="fcUse" href="#i-cloudsun"/></svg><span class="fc-t" id="fcT">19°</span><span class="fc-c"><b id="fcCond">Partly cloudy</b><span id="fcHL">H 23° · L 17° · 10% rain</span></span></div>
              <button class="g fc-x tap" data-g="smokebtn" data-act="fcclose" aria-label="Close the forecast"><svg class="i"><use href="#i-x"/></svg></button>
              <div class="fc-k fc-k1">Next hours</div>
              <div class="fc-row fc-hours" id="fcHours"></div>
              <div class="fc-rule"></div>
              <div class="fc-k fc-k2">Next days</div>
              <div class="fc-row fc-days" id="fcDays"></div>
            </div>
          </section>

          <!-- RINGING -->
          <section class="view" data-view="ring" aria-label="Alarm ringing" hidden>
            <div class="r-glow"></div>
            <div class="r-time ta" id="rTime">6:30</div>
            <div class="r-sub ta" id="rSub">Alarm · Every day</div>
            <button class="g snooze tap" data-act="snooze">Snooze 9 min</button>
            <button class="g stop tap" data-g="thumb" data-on="1" data-act="stop">Stop</button>
          </section>

          <div class="night" id="night" role="button" tabindex="0" aria-label="Night clock. Tap for the lamp, sounds and alarm.">
            <div class="n-time" id="nTime">23:10</div>
            <div class="n-sub">
              <span id="nAlm"><svg class="i"><use href="#i-bell"/></svg><b id="nAlmT">6:30</b></span>
              <span><svg class="i"><use id="nWxUse" href="#i-moon"/></svg><b class="js-out">18°</b></span>
              <span id="nSleep" hidden><svg class="i"><use href="#i-rain"/></svg><span id="nSleepT">Rain · 30 min</span></span>
              <span class="js-alert" hidden><span class="dot"></span><span><span class="js-alertT"></span><span class="js-acountN"></span></span></span>
              <span id="nMic" hidden><svg class="i"><use href="#i-micoff"/></svg>Muted</span>
            </div>
            <div class="nbs" role="group" aria-label="Night controls">
              <button class="nb" data-act="lamp" id="nbLamp" aria-pressed="false"><svg class="i"><use href="#i-bulb"/></svg>Lamp</button>
              <button class="nb" id="nbSound" aria-disabled="true"><svg class="i"><use href="#i-wave"/></svg>Sounds</button>
              <button class="nb" data-act="alarm" id="nbAlarm"><svg class="i"><use href="#i-bell"/></svg><span id="nbAlarmT">6:30</span></button>
            </div>
          </div>

          <ul class="amenu" id="amenu" aria-label="All alerts"></ul>
          <div class="toast" id="toast" role="status"><svg class="i"><use id="toastUse" href="#i-moon"/></svg><span id="toastTxt"></span></div>
          <div class="dbg" id="dbg" hidden></div>
        </div>
</div>`;

function mount(root, host, C) {
  const DAY = 1440;
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const STORE = 'bedside-sky:' + (C.id || C.device || 'default');
  const hm = v => { const [h, m] = String(v).split(':').map(Number); return h * 60 + (m || 0); };
  let alive = false, hassRef = null;
  const intervals = [];

  /* ---------- small math ---------- */
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const pad2 = n => String(n).padStart(2, '0');

  /* ---------- clock text: H:MM, no leading zero ---------- */
  const fmt = m => { const t = Math.floor(((m % DAY) + DAY) % DAY); return `${Math.floor(t / 60)}:${pad2(t % 60)}`; };
  const dur = k => { const h = Math.floor(k / 60), mm = k % 60; return h ? (mm ? `${h} h ${mm} m` : `${h} h`) : `${mm} m`; };

  /* ---------- color: sRGB <-> OKLab ---------- */
  const hex = s => { const n = parseInt(s.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; };
  const s2l = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  const l2s = v => { v = v <= .0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - .055; return Math.min(255, Math.max(0, v * 255)); };
  function toLab(c) {
    const r = s2l(c[0]), g = s2l(c[1]), b = s2l(c[2]);
    const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
    const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
    const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
    return [.2104542553 * l + .7936177850 * m - .0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .8086757660 * s];
  }
  function fromLab(L) {
    const l = (L[0] + .3963377774 * L[1] + .2158037573 * L[2]) ** 3;
    const m = (L[0] - .1055613458 * L[1] - .0638541728 * L[2]) ** 3;
    const s = (L[0] - .0894841775 * L[1] - 1.2914855480 * L[2]) ** 3;
    return [l2s(4.0767416621 * l - 3.3077115913 * m + .2309699292 * s), l2s(-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s), l2s(-.0041960863 * l - .7034186147 * m + 1.7076147010 * s)];
  }
  const mixLab = (a, b, k) => fromLab([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]);
  const css = c => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
  const rgba = (c, a) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
  const LUT = new Float32Array(256); for (let i = 0; i < 256; i++) LUT[i] = s2l(i);
  const lumOf = c => .2126 * s2l(c[0]) + .7152 * s2l(c[1]) + .0722 * s2l(c[2]);
  const contrast = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);

  /* ---------- the day as keyframes (same palette as the NSPanel v5 page) ---------- */
  const SKY_OFF = [0, .3, .5, .64];
  const NIGHT = {
    sky: ['#060D24', '#0C1736', '#112047', '#142450'],
    waves: ['#1A2A52', '#18264C', '#132045', '#111D3F', '#0E1836', '#0C1531', '#0A122B', '#091027'],
    dark: '#102A3E', light2: '#DCE4F5', g: [.08, .95, 1.12, 0],
  };
  const KF = [
    { t: 0, ...NIGHT },
    { t: 4.75, sky: ['#08112B', '#111D42', '#1B2852', '#283462'], waves: ['#1E2C56', '#1B284F', '#162248', '#141F42', '#101A38', '#0E1733', '#0B132C', '#0A1128'], dark: '#102A3E', light2: '#DCE4F5', g: [.08, .95, 1.12, 0] },
    { t: 5.5, sky: ['#151D48', '#2E3170', '#6B4A82', '#C47786'], waves: ['#4A3F78', '#433972', '#352F66', '#302B5E', '#251F50', '#211C49', '#181640', '#15133A'], dark: '#2B2230', light2: '#F0EAF5', g: [.09, .92, 1.13, .02] },
    { t: 6.25, sky: ['#5560A0', '#A08ABB', '#E7A5A8', '#F7C4A0'], waves: ['#9C6F96', '#93688F', '#7E5C8C', '#735486', '#5A4882', '#51417A', '#3D366E', '#363064'], dark: '#2B2230', light2: '#FFFFFF', g: [.12, .82, 1.12, .06] },
    { t: 6.9, sky: ['#E9C9CF', '#F1C9C0', '#F4C2B0', '#F6BFA6'], waves: ['#E9A9A6', '#E39FA6', '#D08CA6', '#C483A6', '#A579B3', '#9670AE', '#7F67AA', '#7260A2'], dark: '#2B2230', light2: '#FFFFFF', g: [.15, .74, 1.11, .09] },
    { t: 7.5, sky: ['#FBE5D2', '#F9D6C2', '#F6C9B9', '#F3BFBA'], waves: ['#F4B9AE', '#F1AFB0', '#EE9CA8', '#E68FAA', '#CF94C8', '#B988C5', '#A07FC2', '#8E74BC'], dark: '#2B2230', light2: '#FFFFFF', g: [.16, .70, 1.10, .10] },
    { t: 10, sky: ['#A3CFEC', '#C6E0F0', '#E2EBF0', '#EEE6E2'], waves: ['#BFD9D8', '#B5D3D6', '#93C2D6', '#86B9D3', '#6FA6CF', '#6399C9', '#5687BF', '#4D7AB4'], dark: '#102A3E', light2: '#FFFFFF', g: [.16, .72, 1.10, .10] },
    { t: 13, sky: ['#62AEE4', '#87C3EC', '#A3D5F1', '#B3DDF3'], waves: ['#A6DCE8', '#9AD5E5', '#72C2DE', '#63B6DA', '#4C9FD7', '#438FD0', '#3A7FC6', '#346FB9'], dark: '#102A3E', light2: '#FFFFFF', g: [.16, .75, 1.10, .10] },
    { t: 16, sky: ['#5DA2DA', '#88BFE7', '#B9D8EA', '#DDE3DF'], waves: ['#A9D4DC', '#9DCBD8', '#78B5D0', '#6AA9CB', '#5290C6', '#4882BD', '#3F70B0', '#3863A3'], dark: '#102A3E', light2: '#FFFFFF', g: [.16, .75, 1.10, .10] },
    { t: 17.25, sky: ['#7096CF', '#AAB2D2', '#EAC3A8', '#F7C891'], waves: ['#E7B79A', '#DFAA92', '#C98E95', '#BC8392', '#8F6D9C', '#806397', '#5E5288', '#544A80'], dark: '#28223C', light2: '#FFFFFF', g: [.14, .80, 1.12, .08] },
    { t: 18, sky: ['#272457', '#5A3A7E', '#B0657F', '#E58F72'], waves: ['#7C4B8C', '#6F4486', '#59397F', '#4E3378', '#3B2C6C', '#33275F', '#271F52', '#221B4A'], dark: '#28223C', light2: '#FFFFFF', g: [.10, .90, 1.15, .04] },
    { t: 19, sky: ['#141A44', '#2A2964', '#553B76', '#865276'], waves: ['#3E2F6A', '#382A62', '#2C2458', '#271F50', '#1D1A45', '#19163E', '#131233', '#10102D'], dark: '#102A3E', light2: '#EEF0FA', g: [.09, .93, 1.13, .02] },
    { t: 20.25, ...NIGHT },
    { t: 24, ...NIGHT },
  ].map(k => ({ t: k.t, sky: k.sky.map(c => toLab(hex(c))), waves: k.waves.map(c => toLab(hex(c))), dark: toLab(hex(k.dark)), light2: toLab(hex(k.light2)), g: k.g }));
  function frameAt(m) {
    const h = Math.min(24, Math.max(0, m / 60));
    let i = 0; while (i < KF.length - 2 && KF[i + 1].t <= h) i++;
    const A = KF[i], B = KF[i + 1], k = (h - A.t) / (B.t - A.t);
    const sky = A.sky.map((c, j) => mixLab(c, B.sky[j], k));
    const wv = A.waves.map((c, j) => mixLab(c, B.waves[j], k));
    const g = A.g.map((v, j) => lerp(v, B.g[j], k));
    return { sky: sky.map((c, j) => [SKY_OFF[j], css(c)]), skyRGB: sky, waves: [0, 1, 2, 3].map(j => [css(wv[j * 2]), css(wv[j * 2 + 1])]),
             dark: mixLab(A.dark, B.dark, k), light2: mixLab(A.light2, B.light2, k), tint: g[0], rim: g[1], sat: g[2], edge: g[3] };
  }


  /* ---------- screen geometry per layout ---------- */
  const DIMS = { S: { W: 960, H: 480 } };
  // Sun and moon arcs sit where each layout leaves open sky. kb sizes sun, moon and clouds.
  const SKYGEO = {
    S: { sun: { cx: 735, rx: 170 }, moon: { cx: 760, rx: 110 }, horizon: 320, arcH: 250, kb: 1.3 },
  };
  const SUN_T = { rise: 360, len: 720 }, MOON_T = { rise: 1110, len: 720 };
  const sunElev = m => Math.sin(Math.PI * (m - SUN_T.rise) / SUN_T.len);
  function arcAt(m, T, a, geo) {
    let u = (m - T.rise) / T.len; if (u < -.5) u += DAY / T.len;
    if (u < -.06 || u > 1.06) return null;
    const th = Math.PI * u;
    return { x: a.cx - a.rx * Math.cos(th), y: geo.horizon - geo.arcH * Math.sin(th) };
  }
  const SUNSTYLE = [
    [0,   hex('#FFD9A8'), hex('#FFAE7E'), [255, 150, 100], .55, 25, 135],
    [.35, hex('#FFF7E0'), hex('#FFE6AE'), [255, 224, 170], .60, 26, 130],
    [.85, hex('#FFFFFF'), hex('#F4FBFF'), [255, 255, 255], .75, 22, 120],
  ];
  function sunStyle(e) {
    e = clamp01(e);
    const i = e < SUNSTYLE[1][0] ? 0 : 1, A = SUNSTYLE[i], B = SUNSTYLE[i + 1], k = clamp01((e - A[0]) / (B[0] - A[0]));
    const mix3 = (a, b) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    return { core: mix3(A[1], B[1]), edge: mix3(A[2], B[2]), glow: mix3(A[3], B[3]), ga: lerp(A[4], B[4], k), r: lerp(A[5], B[5], k), gr: lerp(A[6], B[6], k) };
  }
  const HILLS = [{ y: .5875, a: 9, f: .021, p: .6 }, { y: .69, a: 15, f: .017, p: 2.1 }, { y: .817, a: 17, f: .015, p: 4.0 }, { y: .9375, a: 11, f: .020, p: 1.2 }];
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const SKYSET = {};
  function skySet(o) {
    if (SKYSET[o]) return SKYSET[o];
    const { W, H } = DIMS[o], geo = SKYGEO[o];
    const r = rng(7), stars = [];
    for (let i = 0, n = Math.round(70 * W * H / 153600 * .45); i < n; i++) stars.push({ x: r() * W, y: r() * geo.horizon * .92, s: (.45 + r() * .8) * 1.3, a: .35 + r() * .6, thr: r() });
    const r2 = rng(21), wins = [];
    for (let i = 0, n = Math.round(W / 320 * 30); i < n; i++) {
      const x = 6 + r2() * (W - 12), y = H * .70 + r2() * H * .28, s = (.7 + r2() * .8) * 1.4, on = 17.6 + r2() * 1.6, late = r2(), q = r2();
      wins.push({ x, y, s, on, off: late < .25 ? 29.8 + q * .8 : 22.3 + q * 4.5 });
    }
    const clouds = [{ x: .64, y: .30, s: 1, v: .056 }, { x: .91, y: .27, s: .7, v: .081 }, { x: .12, y: .43, s: .85, v: .04 }, { x: .38, y: .19, s: .8, v: .05 }, { x: .8, y: .4, s: .9, v: .065 }]
      .slice(0, W > H ? 5 : 3);
    return (SKYSET[o] = { stars, wins, clouds });
  }
  const inRects = (x, y, rs) => rs.some(r => x > r.x - 8 && x < r.x + r.w + 8 && y > r.y - 8 && y < r.y + r.h + 8);
  function body(ctx, x, y, r, core, edge, glow, ga, gr, alpha) {
    ctx.save(); ctx.globalAlpha = alpha;
    const gl = ctx.createRadialGradient(x, y, 0, x, y, gr);
    gl.addColorStop(0, rgba(glow, ga)); gl.addColorStop(1, rgba(glow, 0));
    ctx.fillStyle = gl; ctx.fillRect(x - gr, y - gr, gr * 2, gr * 2);
    const disc = ctx.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r);
    disc.addColorStop(0, css(core)); disc.addColorStop(1, css(edge));
    ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.restore();
  }

  /* ---------- weather: cloud cover eases toward the condition; clouds drift in real time ---------- */
  const WX = {
    // cover: how much of the sky has cloud. wet: how dark and grey it gets. rain: falling drops.
    clear:    { cover: .12, wet: 0,   rain: 0, name: 'Clear',         pop: 0,  day: '#i-sun',      night: '#i-moon' },
    partly:   { cover: .38, wet: 0,   rain: 0, name: 'Partly cloudy', pop: 10, day: '#i-cloudsun', night: '#i-cloudmoon' },
    cloudy:   { cover: .78, wet: 0,   rain: 0, name: 'Cloudy',        pop: 30, day: '#i-cloud',    night: '#i-cloud' },
    overcast: { cover: 1,   wet: .45, rain: 0, name: 'Overcast',      pop: 40, day: '#i-clouds',   night: '#i-clouds' },
    rain:     { cover: 1,   wet: 1,   rain: 1, name: 'Rain',          pop: 90, day: '#i-rain',     night: '#i-rain' },
  };
  const T0 = performance.now();
  let coverT = T0;
  function weatherNow() {
    const now = performance.now(), T = WX[state.wx], f = 1 - Math.exp(-(now - coverT) / 900); coverT = now;
    ['cover', 'wet', 'rain'].forEach(k => { state[k] += (T[k] - state[k]) * f; if (Math.abs(T[k] - state[k]) < .004) state[k] = T[k]; });
    const live = state.liveFreeze ?? sky.t;
    return { cover: state.cover, wet: state.wet, live, wind: lerp(.35, .8, state.wet), sig: [state.cover, state.wet].map(v => v.toFixed(3)).join(',') + ':' + live.toFixed(2) };
  }
  // 14 clouds, spread evenly across the sky. Each one shows once the cover passes its threshold.
  const CLOUDS = (() => {
    const r = rng(33), out = [], N = 14;
    for (let i = 0; i < N; i++) {
      const s = .7 + r() * .55, n = 4 + Math.floor(r() * 3), puffs = [];
      for (let j = 0; j < n; j++) puffs.push({ dx: (j - (n - 1) / 2) * 18 + (r() - .5) * 8, dy: (r() - .5) * 8 - Math.sin(Math.PI * (j + .5) / n) * 9, rad: 18 + r() * 9, ph: r() * 6.283, per: 14 + r() * 16 });
      out.push({ x: (i * .618 + .13) % 1, y: .1 + ((i * .382 + .05) % 1) * .34, s, v: .035 + r() * .03, drift: .7 + s * .5, th: .02 + i / N * .9, puffs });
    }
    return out;
  })();
  let cloudCv = null, cloudSoft = null;
  const cloudCanvas = (W, H) => (cloudCv && cloudCv.width === W && cloudCv.height === H) ? cloudCv : (cloudCv = makeCanvas(W, H));
  const rgbOf = s => s.match(/[\d.]+/g).slice(0, 3).map(Number);
  const greyMix = (c, k, dk) => { const l = .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; return c.map(v => lerp(v, l, k) * dk); };

  /* ---------- rain: its own layer, animated every frame, kept off the glass and behind the text ---------- */
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let glassNow = [], rainLast = 0, rainDrawn = false;
  const DROPS = (() => {
    const r = rng(57), out = [];
    for (let i = 0; i < 170; i++) { const z = r(); out.push({ x: r() * 1140 - 90, y: r() * 540 - 40, z, len: 10 + z * 18, v: 520 + z * 560, w: .8 + z * 1.1, a: .16 + z * .32 }); }
    return out.sort((a, b) => a.z - b.z); // far drops first
  })();
  function rrPath(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function rainFrame(ts) {
    if (rainDrawn && ts - rainLast < 31) { if (alive) requestAnimationFrame(rainFrame); return; }
    const rc = $('#rain').getContext('2d'), dt = rainLast && !reduceMotion ? Math.min(.05, (ts - rainLast) / 1000) : 0; rainLast = ts;
    const k = state.rain * (state.view === 'night' && state.nightAlpha > .99 ? 0 : 1); // eases in and out with the weather
    if (k > .01 && !document.hidden && screenOn()) {
      rc.clearRect(0, 0, 960, 480);
      const lit = smooth(-.15, .2, sunElev(skyM(state.m))), col = [lerp(160, 228, lit), lerp(176, 236, lit), lerp(212, 248, lit)].map(Math.round).join(',');
      const slant = .2; // a little wind from the left
      rc.save();
      rc.beginPath(); rc.rect(0, 0, 960, 480); glassNow.forEach(g => rrPath(rc, g.x, g.y, g.w, g.h, g.r)); rc.clip('evenodd');
      rc.lineCap = 'round';
      DROPS.forEach(d => {
        d.y += d.v * dt; d.x += d.v * slant * dt;
        if (d.y - d.len > 480) { d.y = -Math.random() * 60; d.x = Math.random() * 1140 - 180; }
        rc.strokeStyle = `rgba(${col},${(d.a * k * lerp(.7, 1, lit)).toFixed(3)})`; rc.lineWidth = d.w;
        rc.beginPath(); rc.moveTo(d.x, d.y); rc.lineTo(d.x - d.len * slant, d.y - d.len); rc.stroke();
      });
      rc.restore(); rainDrawn = true;
    } else if (rainDrawn) { rc.clearRect(0, 0, 960, 480); rainDrawn = false; }
    if (alive) requestAnimationFrame(rainFrame);
  }

  /* ---------- wallpaper painter ---------- */
  function paintWallpaper(ctx, o, P, m, geo) {
    const { W, H } = DIMS[o], SK = skySet(o), k = H / 480, KB = geo.kb, wx = geo.wx, cov = wx.cover;
    const ov = smooth(.45, 1, cov), wet = wx.wet; // a thick cover greys the sky; overcast and rain also darken it
    const g = ctx.createLinearGradient(0, 0, 0, H);
    P.skyRGB.forEach((c, j) => g.addColorStop(SKY_OFF[j], css(greyMix(c, .62 * ov, 1 - .28 * wet))));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const e = sunElev(m), night = clamp01((-e - .02) / .3), day = smooth(-.05, .25, e), h = m / 60;
    const starA = 1 - smooth(.25, .75, cov);
    if (night > 0 && starA > 0) SK.stars.forEach(s => {
      const a = clamp01((night - s.thr * .75) / .25) * starA; if (a <= 0 || inRects(s.x, s.y, geo.avoid)) return;
      ctx.fillStyle = `rgba(235,240,255,${s.a * a})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 7); ctx.fill();
    });
    const mp = arcAt(m, MOON_T, geo.moon, geo);
    if (mp) { const a = smooth(geo.moonFloor - 26, geo.moonFloor - 44, mp.y) * (1 - .55 * day) * (1 - .85 * smooth(.4, .9, cov)); if (a > 0) body(ctx, mp.x, mp.y, 16 * KB, hex('#F7F3E6'), hex('#E7E2D2'), [190, 205, 255], .28, 90 * KB, a); }
    const sp = arcAt(m, SUN_T, geo.sun, geo);
    if (sp) { const st = sunStyle(e); body(ctx, sp.x, sp.y, st.r * KB, st.core, st.edge, st.glow, st.ga, st.gr * KB, 1 - .9 * smooth(.45, .95, cov)); }
    // Clouds: sunlit by day, warm at sunrise and sunset, a shade above the sky at night; grey and darker as the cover thickens.
    const lit = smooth(-.3, .05, e), warm = 1 - smooth(.08, .45, e), dim = smooth(0, -.25, e);
    let cc = [lerp(255, 150, dim), lerp(lerp(255, 196, warm), 120, dim), lerp(lerp(255, 180, warm), 170, dim)];
    cc = cc.map((v, i) => lerp(v, [52, 60, 92][i], night));
    cc = greyMix(cc, .7 * ov, 1 - .42 * wet);
    const visA = Math.max(lit, .6 * smooth(.15, .7, cov)); // at night only a cloudy sky shows its clouds
    if (visA > .01) {
      // Puffs go on their own layer, which is then softened, so each cloud reads as one shape rather than a stack of discs.
      const cl = cloudCanvas(W >> 1, H >> 1), x = cl.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.setTransform(.5, 0, 0, .5, 0, 0);
      const big = 1 + .45 * ov, thin = lerp(.55, 1, smooth(.1, .4, cov)), op = lerp(.62, .8, ov), t = wx.live;
      CLOUDS.forEach(c => {
        const a = smooth(c.th, c.th + .08, cov) * visA * thin; if (a <= .01) return;
        const sc = c.s * KB * big, span = W + 220 * KB;
        const cx0 = ((c.x * W + c.v * W * h + c.drift * wx.wind * t) % span + span) % span - 110 * KB, cy0 = c.y * H;
        // a flat, wide base so the underside is level, like a real cumulus
        const bw = (c.puffs.length * 9 + 22) * sc, bb = Math.sin(2 * Math.PI * t / 23 + c.x * 9);
        x.save(); x.translate(cx0, cy0 + 8 * sc); x.scale(1, .42);
        const bg2 = x.createRadialGradient(0, 0, 0, 0, 0, bw * (1 + .03 * bb));
        bg2.addColorStop(0, rgba(cc, op * a)); bg2.addColorStop(.65, rgba(cc, op * .5 * a)); bg2.addColorStop(1, rgba(cc, 0));
        x.fillStyle = bg2; x.fillRect(-bw * 1.1, -bw * 1.1, bw * 2.2, bw * 2.2); x.restore();
        c.puffs.forEach(p => {
          const w = Math.sin(2 * Math.PI * t / p.per + p.ph); // each puff swells and bobs a little
          const R = p.rad * sc * (1 + .05 * w), cx = cx0 + p.dx * sc, cy = cy0 + p.dy * sc + 1.5 * w;
          const cg = x.createRadialGradient(cx, cy, 0, cx, cy, R);
          cg.addColorStop(0, rgba(cc, op * a)); cg.addColorStop(.6, rgba(cc, op * .56 * a)); cg.addColorStop(1, rgba(cc, 0));
          x.fillStyle = cg; x.fillRect(cx - R, cy - R, R * 2, R * 2);
        });
      });
      const c2 = cloudSoft || (cloudSoft = makeCanvas(W >> 1, H >> 1)), x2 = c2.getContext('2d'); x2.clearRect(0, 0, c2.width, c2.height);
      if (canFilter) x2.filter = `blur(${(2 * KB).toFixed(1)}px)`; x2.drawImage(cl, 0, 0); x2.filter = 'none';
      ctx.drawImage(c2, 0, 0, W, H);
    }
    HILLS.forEach((w, j) => {
      const y0 = w.y * H, a = w.a * k, f = w.f / k;
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) ctx.lineTo(x, y0 + a * Math.sin(x * f + w.p) + a * .35 * Math.sin(x * f * 2.3 + w.p * 1.7));
      ctx.lineTo(W, H); ctx.closePath();
      const lg = ctx.createLinearGradient(0, y0 - a, 0, H);
      lg.addColorStop(0, css(greyMix(rgbOf(P.waves[j][0]), .35 * ov, 1 - .2 * wet))); lg.addColorStop(1, css(greyMix(rgbOf(P.waves[j][1]), .35 * ov, 1 - .2 * wet)));
      ctx.fillStyle = lg; ctx.fill();
    });
    if (day < 1) {
      const hh = h < 12 ? h + 24 : h;
      SK.wins.forEach(L => {
        const a = smooth(L.on, L.on + .15, hh) * (1 - smooth(L.off - .15, L.off, hh)) * (1 - day);
        if (a <= .01) return;
        const lg2 = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.s * 4);
        lg2.addColorStop(0, `rgba(255,200,112,${.55 * a})`); lg2.addColorStop(1, 'rgba(255,200,112,0)');
        ctx.fillStyle = lg2; ctx.fillRect(L.x - L.s * 4, L.y - L.s * 4, L.s * 8, L.s * 8);
        ctx.fillStyle = `rgba(255,211,138,${a})`; ctx.beginPath(); ctx.arc(L.x, L.y, L.s, 0, 7); ctx.fill();
      });
    }
  }
  /* ---------- pixel helpers ---------- */
  function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function toRGB(data) { const out = new Float32Array(data.length / 4 * 3); for (let i = 0, j = 0; i < data.length; i += 4, j += 3) { out[j] = data[i]; out[j + 1] = data[i + 1]; out[j + 2] = data[i + 2]; } return out; }
  function boxH(s, d, w, h, r) { const n = 2 * r + 1; for (let y = 0; y < h; y++) { const row = y * w; for (let c = 0; c < 3; c++) { let acc = 0; for (let k = -r; k <= r; k++) acc += s[(row + Math.min(w - 1, Math.max(0, k))) * 3 + c]; for (let x = 0; x < w; x++) { d[(row + x) * 3 + c] = acc / n; acc += s[(row + Math.min(w - 1, x + r + 1)) * 3 + c] - s[(row + Math.max(0, x - r)) * 3 + c]; } } } }
  function boxV(s, d, w, h, r) { const n = 2 * r + 1; for (let x = 0; x < w; x++) { for (let c = 0; c < 3; c++) { let acc = 0; for (let k = -r; k <= r; k++) acc += s[(Math.min(h - 1, Math.max(0, k)) * w + x) * 3 + c]; for (let y = 0; y < h; y++) { d[(y * w + x) * 3 + c] = acc / n; acc += s[(Math.min(h - 1, y + r + 1) * w + x) * 3 + c] - s[(Math.max(0, y - r) * w + x) * 3 + c]; } } } }
  function blurRGB(rgb, w, h, r) { const a = Float32Array.from(rgb), b = new Float32Array(rgb.length); if (r < 1) return a; for (let p = 0; p < 3; p++) { boxH(a, b, w, h, r); boxV(b, a, w, h, r); } return a; }
  const canFilter = (() => { try { const a = makeCanvas(9, 9), b = makeCanvas(9, 9), x = a.getContext('2d'), y = b.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(4, 4, 1, 1); y.filter = 'blur(1px)'; y.drawImage(a, 0, 0); return y.getImageData(2, 4, 1, 1).data[3] > 0; } catch (_) { return false; } })();
  const surfaces = {};
  function surface(o) {
    if (!surfaces[o]) { const { W, H } = DIMS[o], p = makeCanvas(W, H), b = makeCanvas(W, H); surfaces[o] = { p, px: p.getContext('2d', { willReadFrequently: true }), b, bx: b.getContext('2d', { willReadFrequently: true }) }; }
    return surfaces[o];
  }
  function blurFrom(srcCanvas, srcData, w, h, r, sf) {
    if (!canFilter) return blurRGB(toRGB(srcData), w, h, r);
    const hc = sf.h || (sf.h = makeCanvas(w >> 1, h >> 1)), hx = hc.getContext('2d', { willReadFrequently: true }); hx.clearRect(0, 0, hc.width, hc.height);
    hx.filter = `blur(${(Math.sqrt(((2 * r + 1) ** 2 - 1) / 4) / 2).toFixed(2)}px)`; hx.drawImage(srcCanvas, 0, 0, hc.width, hc.height); hx.filter = 'none';
    const out = toRGB(hx.getImageData(0, 0, hc.width, hc.height).data); out.w = hc.width; out.h = hc.height; out.k = .5; return out;
  }
  function sample(buf, w, h, x, y, c) {
    x = Math.min(w - 1.001, Math.max(0, x)); y = Math.min(h - 1.001, Math.max(0, y));
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    const i00 = (y0 * w + x0) * 3 + c, i10 = i00 + 3, i01 = i00 + w * 3, i11 = i01 + 3;
    return (buf[i00] * (1 - fx) + buf[i10] * fx) * (1 - fy) + (buf[i01] * (1 - fx) + buf[i11] * fx) * fy;
  }

  /* ---------- the liquid glass shader (same as the NSPanel page) ---------- */
  function glass(out, src, w, h, sh, o) {
    const x0 = Math.max(0, Math.floor(sh.x) - 1), y0 = Math.max(0, Math.floor(sh.y) - 1);
    const x1 = Math.min(w, Math.ceil(sh.x + sh.w) + 1), y1 = Math.min(h, Math.ceil(sh.y + sh.h) + 1);
    const cx = sh.x + sh.w / 2, cy = sh.y + sh.h / 2, hw = sh.w / 2, hh = sh.h / 2, r = Math.min(sh.r, hw, hh);
    const bez = o.bezel, D = o.refract, Lx = -0.55, Ly = -0.835, rimW = o.rimW ?? 2.2;
    const tint = o.tint ?? .12, rim = o.rim ?? .8, sat = o.sat ?? 1.1, edge = o.edge ?? 0, keep = 1 - (o.dim ?? 0);
    const tc = o.tintColor, tm = o.tintMix ?? 0, top = sh.y, hgt = sh.h;
    const sw = src.w || w, sh2 = src.h || h, sk = src.k || 1, so = sk === 1 ? 0 : -.25; // the blurred sky may be half size
    for (let py = y0; py < y1; py++) {
      const vy = 1 - (py - top) / hgt;
      for (let px = x0; px < x1; px++) {
        const X = px + .5 - cx, Y = py + .5 - cy, ax = Math.abs(X), ay = Math.abs(Y);
        const qx = ax - hw + r, qy = ay - hh + r;
        let d, nx, ny;
        if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy); d = l - r; nx = qx / l * Math.sign(X); ny = qy / l * Math.sign(Y); }
        else { d = Math.max(qx, qy) - r; if (qx > qy) { nx = Math.sign(X) || 1; ny = 0; } else { nx = 0; ny = Math.sign(Y) || 1; } }
        const cov = Math.min(1, Math.max(0, .5 - d));
        if (cov <= 0) continue;
        const dist = Math.max(0, -d), t = Math.min(1, dist / bez), u = 1 - t, f = u > 0 ? Math.pow(u, 2.2) : 0;
        let R, G, B;
        if (f > 0) {
          const ox = nx * D * f, oy = ny * D * f, sx = px - ox, sy = py - oy;
          R = sample(src, sw, sh2, (sx + ox * .1) * sk + so, (sy + oy * .1) * sk + so, 0); G = sample(src, sw, sh2, sx * sk + so, sy * sk + so, 1); B = sample(src, sw, sh2, (sx - ox * .1) * sk + so, (sy - oy * .1) * sk + so, 2);
        } else { const j = sk === 1 ? (py * w + px) * 3 : ((py >> 1) * sw + (px >> 1)) * 3; R = src[j]; G = src[j + 1]; B = src[j + 2]; }
        const lum = .2126 * R + .7152 * G + .0722 * B;
        R = lum + (R - lum) * sat; G = lum + (G - lum) * sat; B = lum + (B - lum) * sat;
        if (tc) { R += (tc[0] - R) * tm; G += (tc[1] - G) * tm; B += (tc[2] - B) * tm; }
        const lift = tint + .07 * vy;
        R += (255 - R) * lift; G += (255 - G) * lift; B += (255 - B) * lift;
        const ndl = nx * Lx + ny * Ly;
        const rimLine = Math.max(0, 1 - dist / rimW), soft = u * u * u;
        const mul = (1 - (f * Math.max(0, -ndl) * .10 + edge * soft)) * keep;
        R *= mul; G *= mul; B *= mul;
        let spec = soft * Math.max(0, ndl) * .18;
        if (rimLine > 0) spec += rimLine * (.22 + .78 * Math.pow(Math.max(0, ndl), 1.4)) + rimLine * Math.max(0, -ndl) * .35;
        spec = Math.min(1, spec * rim);
        R += (255 - R) * spec; G += (255 - G) * spec; B += (255 - B) * spec;
        const i = (py * w + px) * 4;
        out[i] += (R - out[i]) * cov; out[i + 1] += (G - out[i + 1]) * cov; out[i + 2] += (B - out[i + 2]) * cov;
      }
    }
  }
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }


  /* ---------- state ---------- */
  const BED = hm(C.bedtime);
  const saved = (() => { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) { return {}; } })();
  const LIGHTS = ['ceiling', 'lamp', 'hall', 'hood'], LIGHT_NAMES = { ceiling: 'Ceiling light', lamp: 'Lamp', hall: 'Hall light', hood: 'Kitchen hood light' };
  const state = {
    m: 0, lay: 'S', view: '',
    relays: [false, false], alerts: [], alertKeys: [], muted: false, // relays: ceiling, lamp
    lights: Object.fromEntries(LIGHTS.map(k => [k, { on: false, n: 0, avail: false }])),
    wx: 'clear', wxName: '', out: null, hi: null, lo: null, precip: null, hourly: [], daily: [],
    cover: .12, wet: 0, rain: 0, liveFreeze: null,
    sun: { rise: 360, set: 1080 }, // minutes; replaced by the real times from sun.sun
    sleep: { on: false, endT: 0 },
    alarm: { on: true, t: 6 * 60 + 30, days: saved.days || [1, 1, 1, 1, 1, 1, 1], sunrise: saved.sunrise ?? true },
    next: null, sheet: false, ringing: false, ringT: 0, snoozing: false, snoozeT: 0,
    nightForced: false, override: null, wokenUntil: 0, nightAlpha: 0, doorUntil: 0,
    page: 0, touchAt: 0,
    house: { temp: null, hum: null, door: false, washer: '', wet: [], shopN: null, shop: [] },
    music: { st: '', playing: false, title: '', artist: '', source: '', name: '', pic: '', pos: 0, dur: 0, posAt: 0, vol: null },
    dev: { bright: null, auto: null, dnd: null, wake: '', wakeOpts: [], vol: null, volMax: 15 },
    cam: { events: [], at: 0 },
    fc: false, fcUntil: 0, sheetUntil: 0, cmenu: false, cmenuUntil: 0, amenu: false, amenuUntil: 0, // forecast, ceiling menu, alert list
    P: null, ink: null, connected: false,
  };
  function save() { try { localStorage.setItem(STORE, JSON.stringify({ days: state.alarm.days, sunrise: state.alarm.sunrise })); } catch (e) {} }
  // The sky's minute and cloud clock only move on with the live tick, so a redraw for any other reason
  // (a light changing, the clock's minute, a page's text) finds the same sky and skips the canvas.
  const sky = { m: null, t: 0 };
  const advanceSky = () => { sky.m = skyM(state.m); sky.t = (performance.now() - T0) / 1000; };
  let frameSig = '', lastWall = null;
  const perf = { full: 0, quick: 0, pre: 0, ms: 0, busy: [], since: 0, long: 0, longMax: 0 };
  const screenOn = () => { const s = C.screen && st(C.screen); return !s || s.state !== 'off'; };
  // Map the real time of day onto the sky's model day (sunrise at 6:00, sunset at 18:00).
  function skyM(m) {
    const R = state.sun.rise, len = (state.sun.set - R + DAY) % DAY || 720, d = (m - R + DAY) % DAY;
    return (d < len ? 360 + d / len * 720 : 1080 + (d - len) / (DAY - len) * 720) % DAY;
  }
  const PAGE_ALL = { home: 'Home', house: 'House', music: 'Music', cams: 'Front door', settings: 'Settings' };
  const PAGE_ON = {
    home: true, music: !!C.music, cams: !!C.camera,
    house: LIGHTS.some(k => C[k].length) || !!(C.temperature || C.laundryDoor || C.washerPower || C.leaks.length || C.shopping),
    settings: !!(C.brightness || C.volume || C.dnd || C.autoBrightness || C.wakeWord),
  };
  const PAGES = ['home', ...C.pages.filter(p => p !== 'home' && PAGE_ON[p])], PAGE_NAMES = PAGES.map(p => PAGE_ALL[p]);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  /* ---------- DOM ---------- */
  const scr = $('#scr'), bg = $('#bg');
  let bctx = bg.getContext('2d', { willReadFrequently: true });

  /* ---------- WebGL compositor (1.2.0) ----------
     The sky is still painted with the 2D canvas. Blurring it, the shadows and the glass itself run on the GPU.
     Falls back to the canvas path when WebGL is missing, software-only or lost, or with renderer: canvas. */
  const GLX = (() => {
    if (C.renderer === 'canvas') return null;
    let cv, gl;
    try { cv = makeCanvas(960, 480); gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: true, premultipliedAlpha: false }); } catch (e) { gl = null; }
    if (!gl) return null;
    const ri = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(ri ? gl.getParameter(ri.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    if (C.renderer !== 'webgl' && /swiftshader|llvmpipe|softpipe|software/i.test(name)) return null; // a software GPU is slower than the canvas path
    const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    const head = `precision ${hp && hp.precision > 0 ? 'highp' : 'mediump'} float;varying vec2 v_px;uniform vec2 u_size;\n`;
    const VS = 'attribute vec2 a;uniform vec4 u_rect;uniform vec2 u_size;uniform float u_flip;varying vec2 v_px;\n' +
      'void main(){vec2 px=u_rect.xy+a*u_rect.zw;v_px=px;gl_Position=vec4(px.x/u_size.x*2.0-1.0,(1.0-px.y/u_size.y*2.0)*u_flip,0.0,1.0);}';
    const WB = [.179, .162, .120, .0729, .0362, .0147, .0048]; // gaussian, sigma 2.24 at half size: the canvas path's blur
    const FS = {
      copy: head + 'uniform sampler2D u_t;void main(){gl_FragColor=vec4(texture2D(u_t,v_px/u_size).rgb,1.0);}',
      blur: head + 'uniform sampler2D u_t;uniform vec2 u_d;void main(){vec2 uv=v_px/u_size;vec3 s=texture2D(u_t,uv).rgb*' + WB[0].toFixed(4) + ';' +
        WB.slice(1).map((w, i) => `s+=(texture2D(u_t,uv+u_d*${(i + 1).toFixed(1)}).rgb+texture2D(u_t,uv-u_d*${(i + 1).toFixed(1)}).rgb)*${w.toFixed(4)};`).join('') + 'gl_FragColor=vec4(s,1.0);}',
      base: head + 'uniform sampler2D u_sky;uniform sampler2D u_sh;uniform float u_k;void main(){vec2 uv=v_px/u_size;vec3 c=texture2D(u_sky,uv).rgb;vec4 s=texture2D(u_sh,uv);gl_FragColor=vec4(mix(c,s.rgb,s.a*u_k),1.0);}',
      // the canvas path's glass(), line for line
      glass: head + `uniform sampler2D u_b;uniform vec4 u_box;uniform float u_r;uniform vec4 u_p1;uniform vec4 u_p2;uniform vec4 u_tc;uniform vec2 u_vy;
float sg(float v){return v<0.0?-1.0:1.0;}
void main(){
  vec2 P=v_px,X=P-u_box.xy,q=abs(X)-u_box.zw+u_r;float d;vec2 n;
  if(q.x>0.0&&q.y>0.0){float l=length(q);d=l-u_r;n=vec2(q.x/l*sg(X.x),q.y/l*sg(X.y));}
  else{d=max(q.x,q.y)-u_r;n=q.x>q.y?vec2(sg(X.x),0.0):vec2(0.0,sg(X.y));}
  float cov=clamp(0.5-d,0.0,1.0);if(cov<=0.0)discard;
  float dist=max(0.0,-d),t=min(1.0,dist/u_p1.x),u=1.0-t,f=u>0.0?pow(u,2.2):0.0;
  vec3 c;
  if(f>0.0){vec2 o=n*u_p1.y*f,s=P-o;c=vec3(texture2D(u_b,(s+o*0.1)/u_size).r,texture2D(u_b,s/u_size).g,texture2D(u_b,(s-o*0.1)/u_size).b);}
  else c=texture2D(u_b,P/u_size).rgb;
  c*=255.0;
  float lum=dot(c,vec3(0.2126,0.7152,0.0722));c=lum+(c-lum)*u_p2.y;
  c+=(u_tc.rgb-c)*u_tc.a;
  c+=(255.0-c)*(u_p2.x+0.07*(1.0-(P.y-0.5-u_vy.x)/u_vy.y));
  float ndl=-0.55*n.x-0.835*n.y,rimLine=max(0.0,1.0-dist/u_p1.z),soft=u*u*u;
  c*=(1.0-(f*max(0.0,-ndl)*0.10+u_p2.z*soft))*u_p2.w;
  float spec=soft*max(0.0,ndl)*0.18;
  if(rimLine>0.0)spec+=rimLine*(0.22+0.78*pow(max(ndl,1e-6),1.4))+rimLine*max(0.0,-ndl)*0.35;
  c+=(255.0-c)*min(1.0,spec*u_p1.w);
  gl_FragColor=vec4(clamp(c/255.0,0.0,1.0),cov);
}`,
    };
    const prog = {};
    try {
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const v = sh(gl.VERTEX_SHADER, VS);
      for (const k in FS) {
        const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS[k])); gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        prog[k] = { p, u: {} };
      }
    } catch (e) { console.warn('bedside-sky-card: WebGL off:', e.message); return null; }
    const U = (pr, n) => pr.u[n] ?? (pr.u[n] = gl.getUniformLocation(pr.p, n));
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const tex = (w, h) => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
      if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      return t;
    };
    const fbo = t => { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return f; };
    const tSky = tex(), tSh = tex(), tImg = tex(), tA = tex(480, 240), tB = tex(480, 240), fA = fbo(tA), fB = fbo(tB);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    const upload = (t, canvas) => { gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas); };
    const use = (k, texs) => { const pr = prog[k]; gl.useProgram(pr.p); texs.forEach(([n, t], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(U(pr, n), i); }); return pr; };
    // u_flip -1 draws into the half-size buffers top row first, so every texture reads top-down like the canvas
    const quad = (pr, rect, size, flip) => { gl.uniform4f(U(pr, 'u_rect'), ...rect); gl.uniform2f(U(pr, 'u_size'), ...size); gl.uniform1f(U(pr, 'u_flip'), flip); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    const screen = () => { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, 960, 480); gl.disable(gl.BLEND); };
    let lost = false, shadowSrc = null, blurred = false;
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); lost = true; onGLLost(); });
    return {
      cv, name, get ok() { return !lost; },
      sky(canvas) { upload(tSky, canvas); blurred = false; },
      shadows(canvas) { if (canvas !== shadowSrc) { upload(tSh, canvas); shadowSrc = canvas; } },
      blur() {
        if (blurred) return; blurred = true;
        gl.disable(gl.BLEND); gl.viewport(0, 0, 480, 240);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fA); quad(use('copy', [['u_t', tSky]]), [0, 0, 480, 240], [480, 240], -1);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fB); let pr = use('blur', [['u_t', tA]]); gl.uniform2f(U(pr, 'u_d'), 1 / 480, 0); quad(pr, [0, 0, 480, 240], [480, 240], -1);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fA); pr = use('blur', [['u_t', tB]]); gl.uniform2f(U(pr, 'u_d'), 0, 1 / 240); quad(pr, [0, 0, 480, 240], [480, 240], -1);
      },
      base(withShadows) { screen(); const pr = use('base', [['u_sky', tSky], ['u_sh', tSh]]); gl.uniform1f(U(pr, 'u_k'), withShadows && shadowSrc ? 1 : 0); quad(pr, [0, 0, 960, 480], [960, 480], 1); },
      glass(it, o) {
        const pr = use('glass', [['u_b', tA]]), hw = it.w / 2, hh = it.h / 2, tc = o.tintColor || [0, 0, 0];
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.uniform4f(U(pr, 'u_box'), it.x + hw, it.y + hh, hw, hh); gl.uniform1f(U(pr, 'u_r'), Math.min(it.r, hw, hh));
        gl.uniform4f(U(pr, 'u_p1'), o.bezel, o.refract, o.rimW ?? 2.2, o.rim ?? .8);
        gl.uniform4f(U(pr, 'u_p2'), o.tint ?? .12, o.sat ?? 1.1, o.edge ?? 0, 1 - (o.dim ?? 0));
        gl.uniform4f(U(pr, 'u_tc'), tc[0], tc[1], tc[2], o.tintColor ? (o.tintMix ?? 0) : 0);
        gl.uniform2f(U(pr, 'u_vy'), it.y, it.h);
        const x0 = Math.floor(it.x) - 1, y0 = Math.floor(it.y) - 1;
        quad(pr, [x0, y0, Math.ceil(it.x + it.w) + 1 - x0, Math.ceil(it.y + it.h) + 1 - y0], [960, 480], 1);
      },
      blit(canvas) { upload(tImg, canvas); screen(); quad(use('copy', [['u_t', tImg]]), [0, 0, 960, 480], [960, 480], 1); },
      clear() { screen(); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); },
    };
  })();
  let outCanvas = bg; // what's on screen: the WebGL canvas, or the 2D one
  if (GLX) { GLX.cv.id = 'gl'; GLX.cv.setAttribute('aria-hidden', 'true'); bg.after(GLX.cv); bg.style.display = 'none'; outCanvas = GLX.cv; }
  const useGL = () => !!GLX && GLX.ok;
  function onGLLost() { bg.style.display = ''; outCanvas = bg; frameSig = ''; staleShown = null; requestRender(true); }
  const night = $('#night');
  const radii = new WeakMap(); // corner radii don't change, so getComputedStyle runs once per element
  const radiusOf = el => { let r = radii.get(el); if (r == null) { r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0; radii.set(el, r); } return r; };

  // Glass shapes come from the DOM: every visible .g element, measured in screen px.
  function rectOf(el) {
    let x = 0, y = 0, e = el;
    while (e && e !== scr) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }
  function collectGlass() {
    const els = $$(`.scr .sb .g, .scr .view:not([hidden]) .g`).filter(el => el.offsetParent !== null && !el.closest('.leaving'));
    return els.map(el => {
      const r = rectOf(el), kind = el.dataset.g || 'glass';
      return { el, ...r, r: radiusOf(el), kind, on: el.dataset.on === '1', pressed: false };
    }).filter(it => it.kind !== 'thumb' || it.on);
  }
  const inkTextRects = () => $$('.scr .sb .ta, .scr .view:not([hidden]) .ta').filter(el => el.offsetParent !== null && !el.closest('.leaving')).map(rectOf);

  /* ---------- wallpaper cache ---------- */
  const wallCache = new Map();
  function getWall(o, P, m, geo) {
    const key = o + '|' + m.toFixed(2) + '|' + geo.sig;
    if (wallCache.has(key)) return wallCache.get(key);
    const { W, H } = DIMS[o], sf = surface(o);
    sf.px.setTransform(1, 0, 0, 1, 0, 0); paintWallpaper(sf.px, o, P, m, geo);
    const im = sf.px.getImageData(0, 0, W, H);
    const v = { im, blur: blurFrom(sf.p, im.data, W, H, 4, sf) };
    wallCache.set(key, v); if (wallCache.size > 3) wallCache.delete(wallCache.keys().next().value);
    return v;
  }
  const shadowCache = new Map();
  function shadowLayer(o, items) {
    const key = o + '|' + items.filter(it => it.kind !== 'thumb').map(it => [it.x, it.y, it.w, it.h].join(',')).join(';');
    if (shadowCache.has(key)) return shadowCache.get(key);
    const { W, H } = DIMS[o], c = makeCanvas(W, H), x = c.getContext('2d');
    items.forEach(it => {
      if (it.kind === 'thumb' || it.kind === 'smokebtn') return;
      const big = it.kind === 'smoke';
      x.save(); x.shadowColor = `rgba(12,10,40,${big ? .3 : .22})`; x.shadowBlur = big ? 60 : 30; x.shadowOffsetX = 10000; x.shadowOffsetY = big ? 18 : 11;
      x.fillStyle = '#000'; rr(x, it.x - 10000, it.y, it.w, it.h, it.r); x.fill(); x.restore();
    });
    shadowCache.set(key, c); if (shadowCache.size > 8) shadowCache.delete(shadowCache.keys().next().value);
    return c;
  }

  /* ---------- ink + adaptive glass (as on the NSPanel page) ---------- */
  const TARGET = 4.5, HEAD_T = 3.3;
  function areaLum(d, w, x, y, ww, hh) {
    let sum = 0, n = 0; const st = 5;
    for (let py = Math.round(y); py < Math.round(y + hh); py += st)
      for (let px = Math.round(x); px < Math.round(x + ww); px += st) { const i = (py * w + px) * 4; sum += .2126 * LUT[d[i]] + .7152 * LUT[d[i + 1]] + .0722 * LUT[d[i + 2]]; n++; }
    return n ? sum / n : 0;
  }
  function pickInk(heads, P) {
    const dl = lumOf(P.dark), score = L => Math.min(...heads.map(b => contrast(L, b)));
    return score(1) >= score(dl)
      ? { light: true, fg: [255, 255, 255], fg2: P.light2, fg2a: .74, L: 1 }
      : { light: false, fg: P.dark, fg2: P.dark, fg2a: .66, L: dl };
  }
  const minContrast = (ink, lums) => lums.length ? Math.min(...lums.map(l => contrast(ink.L, l))) : 21;
  function fixGlass(ink, lums) {
    const aim = TARGET + .3;
    if (ink.light) { const vT = l2s(1.05 / aim - .05) / 255, vg = l2s(Math.max(...lums)) / 255; return { lift: 0, dim: Math.min(.6, Math.max(0, 1 - vT / vg)) }; }
    const vT = l2s(aim * (ink.L + .05) - .05) / 255, vg = l2s(Math.min(...lums)) / 255;
    return { lift: Math.min(.6, Math.max(0, 1.3 * (vT - vg) / (1 - vg))), dim: 0 };
  }
  function optsFor(it, P, adj) {
    const bez = Math.min(24, Math.min(it.w, it.h) * .3);
    let o = { tint: 1 - (1 - P.tint) * (1 - adj.lift), dim: adj.dim, rim: P.rim, sat: P.sat, edge: P.edge, bezel: bez, refract: bez * .55, rimW: 2.2 };
    if (it.kind === 'thumb') o = { ...o, dim: 0, tintColor: [52, 116, 240], tintMix: .70, tint: .06, rim: 1, edge: 0 };
    else if (it.kind === 'smoke') o = { ...o, dim: 0, tint: .04, tintColor: [16, 18, 32], tintMix: .62, rim: .85, sat: 1.05, edge: 0, bezel: 30, refract: 16 };
    else if (it.kind === 'smokebtn') o = { ...o, dim: 0, tint: .14, tintColor: [16, 18, 32], tintMix: .42, rim: .9, edge: 0 };
    if (it.el.classList.contains('dock')) o.tint *= .8;
    if (it.el.classList.contains('fcs')) o.tintMix = .72;
    if (it.kind === 'smokebtn' && it.el.closest('.fcs')) { o.tint = .06; o.tintMix = .64; } // buttons on the big sheets stay dark enough for white text
    if (it.pressed) { o.tint = Math.min(.9, o.tint + .14); o.rim *= 1.2; o.refract *= 1.35; }
    return o;
  }
  function paintGlass(under, wall, items, P, adj, W, H) {
    const comp = new ImageData(new Uint8ClampedArray(under.data), W, H);
    items.forEach(it => glass(comp.data, wall.blur, W, H, it, optsFor(it, P, adj)));
    return comp;
  }
  function glassZones(items) {
    const z = [];
    items.forEach(it => {
      if (it.kind !== 'glass' || it.el.classList.contains('dock')) return;
      const ins = Math.min(14, it.h * .2);
      z.push([it.x + ins, it.y + ins, it.w - ins * 2, it.h - ins * 2]);
    });
    $$('.scr .view:not([hidden]) .thumb').forEach(t => { if (t.dataset.on !== '1') { const r = rectOf(t); z.push([r.x + 16, r.y + 12, r.w - 32, r.h - 24]); } });
    return z;
  }


  /* ---------- schedule ---------- */
  const wakeT = () => state.alarm.on ? state.alarm.t : 7 * 60;
  // The schedule only trusts alarm times between 4:00 and 12:00; anything else (a nap alarm) still rings but doesn't move the modes.
  const schedWake = () => { const t = wakeT(); return t >= 240 && t < 720 ? t : 7 * 60; };
  const inRange = (m, a, b) => (m - a + DAY) % DAY < (b - a + DAY) % DAY;
  function baseMode(m) {
    if (inRange(m, BED, schedWake())) return 'night';
    return 'home';
  }
  const scheduleMode = m => state.nightForced || state.snoozing ? 'night' : baseMode(m);
  const MODE_NAME = { home: 'Day', night: 'Night', ring: 'Ringing', alarm: 'Alarm settings', fc: 'Forecast' };

  /* ---------- night + sunrise ---------- */
  function rampP(m) {
    if (state.snoozing) return 1;
    if (!state.alarm.on || !state.alarm.sunrise) return 0;
    const k = (m - (state.alarm.t - 30) + DAY) % DAY;
    return k < 30 ? k / 30 : 0;
  }
  const sleepLeft = () => Math.max(1, Math.ceil((state.sleep.endT - state.m + DAY) % DAY));
  function updateNight() {
    const p = rampP(state.m), e = p * p * (3 - 2 * p);
    const a = state.snoozing ? .35 : 1 - .78 * e;
    state.nightAlpha = a;
    night.style.background = `rgba(0,0,0,${a.toFixed(3)})`;
    const c = [lerp(150, 255, e), lerp(80, 246, e), lerp(42, 232, e)];
    night.style.setProperty('--nc', rgba(c, lerp(.78, 1, e)));
    night.style.setProperty('--nc2', rgba(c, lerp(.5, .82, e)));
    $('#nTime').textContent = fmt(state.m);
    $('#nAlmT').textContent = state.snoozing ? `Snoozing until ${fmt(state.snoozeT)}` : state.alarm.on ? fmt(state.alarm.t) : 'No alarm';
    $('#nWxUse').setAttribute('href', wxIcon(state.m));
    $('#nSleep').hidden = !state.sleep.on;
    if (state.sleep.on) $('#nSleepT').textContent = `Rain · ${sleepLeft()} min`;
    $('#nMic').hidden = !state.muted;
  }

  // Clouds move behind the text now, so the ink only flips when the other colour is clearly better.
  // Otherwise a passing cloud could make the clock flicker between white and dark.
  let lastInk = null;
  const inkOf = (light, P) => light ? { light: true, fg: [255, 255, 255], fg2: P.light2, fg2a: .74, L: 1 } : { light: false, fg: P.dark, fg2: P.dark, fg2a: .66, L: lumOf(P.dark) };
  function stickyInk(heads, P) {
    const fresh = pickInk(heads, P);
    if (lastInk && lastInk.light !== fresh.light) {
      const sc = L => Math.min(...heads.map(b => contrast(L, b))), prev = inkOf(lastInk.light, P);
      if (sc(prev.L) >= HEAD_T && sc(fresh.L) < sc(prev.L) * 1.25) return (lastInk = prev);
    }
    return (lastInk = fresh);
  }
  /* ---------- the WebGL path's sky: painted in 2D, read back only at quarter size for the ink and contrast ---------- */
  let glWallKey = '', glWall = null, glSurf = null;
  function getWallGL(o, P, m, geo) {
    const key = o + '|' + m.toFixed(2) + '|' + geo.sig;
    if (key === glWallKey && glWall) return glWall;
    const { W, H } = DIMS[o];
    if (!glSurf) { const p = makeCanvas(W, H), pr = makeCanvas(W >> 2, H >> 2); glSurf = { p, px: p.getContext('2d'), pr, prx: pr.getContext('2d', { willReadFrequently: true }) }; }
    glSurf.px.setTransform(1, 0, 0, 1, 0, 0); paintWallpaper(glSurf.px, o, P, m, geo);
    glSurf.prx.drawImage(glSurf.p, 0, 0, W >> 2, H >> 2);
    glWallKey = key;
    return (glWall = { gl: true, probe: glSurf.prx.getImageData(0, 0, W >> 2, H >> 2).data, pw: W >> 2, canvas: glSurf.p, ctx: glSurf.px, fresh: true });
  }
  // average luminance of a screen rectangle: from the whole wallpaper (canvas path) or the quarter-size probe (WebGL)
  function wallLum(wall, x, y, w, h) {
    if (!wall.gl) return areaLum(wall.im.data, DIMS.S.W, x, y, w, h);
    const d = wall.probe, pw = wall.pw, ph = d.length / 4 / pw; let sum = 0, n = 0;
    for (let py = Math.max(0, Math.floor(y / 4)); py < Math.min(ph, Math.ceil((y + h) / 4)); py++)
      for (let px = Math.max(0, Math.floor(x / 4)); px < Math.min(pw, Math.ceil((x + w) / 4)); px++) { const i = (py * pw + px) * 4; sum += .2126 * LUT[d[i]] + .7152 * LUT[d[i + 1]] + .0722 * LUT[d[i + 2]]; n++; }
    return n ? sum / n : 0;
  }
  // The glass's own brightness for the WebGL path, worked out from the probe: inside a pane it's the sky through the same
  // saturation, tint, lift and dim as the shader (the rim and refraction only touch the edges).
  function estGlassLums(wall, items, P, adj) {
    const out = [], d = wall.probe, pw = wall.pw, ph = d.length / 4 / pw, L8 = v => LUT[Math.max(0, Math.min(255, Math.round(v)))];
    items.forEach(it => {
      if (it.kind !== 'glass' || it.el.classList.contains('dock')) return;
      const o = optsFor(it, P, adj), ins = Math.min(14, it.h * .2), zx = it.x + ins, zy = it.y + ins, zw = it.w - ins * 2, zh = it.h - ins * 2;
      const tc = o.tintColor, tm = tc ? o.tintMix ?? 0 : 0, sat = o.sat ?? 1.1, keep = 1 - (o.dim ?? 0), tint = o.tint ?? .12;
      let sum = 0, n = 0;
      for (let py = Math.max(0, Math.floor(zy / 4)); py < Math.min(ph, Math.ceil((zy + zh) / 4)); py++) {
        const lift = tint + .07 * (1 - (py * 4 + 2 - it.y) / it.h);
        for (let px = Math.max(0, Math.floor(zx / 4)); px < Math.min(pw, Math.ceil((zx + zw) / 4)); px++) {
          const i = (py * pw + px) * 4; let R = d[i], G = d[i + 1], B = d[i + 2];
          const l = .2126 * R + .7152 * G + .0722 * B; R = l + (R - l) * sat; G = l + (G - l) * sat; B = l + (B - l) * sat;
          if (tc) { R += (tc[0] - R) * tm; G += (tc[1] - G) * tm; B += (tc[2] - B) * tm; }
          R = (R + (255 - R) * lift) * keep; G = (G + (255 - G) * lift) * keep; B = (B + (255 - B) * lift) * keep;
          sum += .2126 * L8(R) + .7152 * L8(G) + .0722 * L8(B); n++;
        }
      }
      out.push(n ? sum / n : 0);
    });
    return out;
  }
  // Text on bare sky is all large, so it needs 3:1. Where no single ink gets there, a soft halo darkens or lightens that patch.
  function drawHalos(ctx, avoid, heads, ink) {
    let halo = 0; const hit = [];
    avoid.forEach((r, i) => {
      if (contrast(ink.L, heads[i]) >= HEAD_T) return;
      const v = l2s(heads[i]) / 255;
      const a = ink.light ? clamp01((v - l2s(1.05 / (HEAD_T + .3) - .05) / 255) / (v - .05)) * 1.2
                          : clamp01((l2s((HEAD_T + .3) * (ink.L + .05) - .05) / 255 - v) / (1 - v)) * 1.2;
      if (a <= 0) return;
      halo = Math.max(halo, a); hit.push(i);
      ctx.save(); ctx.shadowColor = ink.light ? `rgba(10,14,32,${Math.min(.85, a)})` : `rgba(255,255,255,${Math.min(.85, a)})`;
      ctx.shadowBlur = 44; ctx.shadowOffsetX = 10000; ctx.fillStyle = '#000';
      rr(ctx, r.x - 10000 - 14, r.y - 10, r.w + 28, r.h + 20, 24); ctx.fill(); ctx.restore();
    });
    return { halo, hit };
  }
  function composeCanvas(o, wall, items, avoid, P, W, H) {
    bctx.putImageData(wall.im, 0, 0);
    bctx.drawImage(shadowLayer(o, items), 0, 0);
    const under = bctx.getImageData(0, 0, W, H);
    const heads = avoid.map(r => areaLum(wall.im.data, W, r.x, r.y, r.w, r.h));
    // pages with no text on the sky pick their ink from the sky as a whole, so night stays dark glass with white text
    const ink = stickyInk(heads.length ? heads : [areaLum(wall.im.data, W, 0, 0, W, H)], P), zones = glassZones(items);
    let adj = { lift: 0, dim: 0 }, comp = paintGlass(under, wall, items, P, adj, W, H);
    let lums = zones.map(z => areaLum(comp.data, W, ...z));
    if (minContrast(ink, lums) < TARGET) { adj = fixGlass(ink, lums); comp = paintGlass(under, wall, items, P, adj, W, H); lums = zones.map(z => areaLum(comp.data, W, ...z)); }
    bctx.putImageData(comp, 0, 0);
    const { halo } = drawHalos(bctx, avoid, heads, ink);
    const final = halo ? bctx.getImageData(0, 0, W, H).data : wall.im.data;
    const heads2 = halo ? avoid.map(r => areaLum(final, W, r.x, r.y, r.w, r.h)) : heads;
    return { ink, lums, adj, halo, heads2 };
  }
  function composeGL(o, wall, items, avoid, P, W, H) {
    const heads = avoid.map(r => wallLum(wall, r.x, r.y, r.w, r.h));
    const ink = stickyInk(heads.length ? heads : [wallLum(wall, 0, 0, W, H)], P);
    let adj = { lift: 0, dim: 0 }, lums = estGlassLums(wall, items, P, adj);
    if (minContrast(ink, lums) < TARGET) { adj = fixGlass(ink, lums); lums = estGlassLums(wall, items, P, adj); }
    if (wall.fresh) { const h = drawHalos(wall.ctx, avoid, heads, ink); wall.halo = h.halo; wall.hit = h.hit; GLX.sky(wall.canvas); wall.fresh = false; }
    GLX.shadows(shadowLayer(o, items)); GLX.blur(); GLX.base(true);
    items.forEach(it => GLX.glass(it, optsFor(it, P, adj)));
    return { ink, lums, adj, halo: wall.halo || 0, heads2: heads.map((h, i) => (wall.hit || []).includes(i) ? null : h) }; // null: haloed up to 3.3:1
  }

  /* ---------- finished frames, kept per page and sheet (1.2.0) ----------
     When a frame is slow to draw (the canvas path on an Echo Show 5), a swipe or a sheet shows its last frame at once,
     and the live tick dissolves a fresh one in a few seconds later. Pages not opened lately are drawn in the background. */
  const frameCache = {};
  let inkVars = {}, inkRedirect = false, renderKey = null, staleShown = null, preTick = 0;
  const inkVar = (k, v) => { inkVars[k] = v; if (!inkRedirect) scr.style.setProperty(k, v); };
  const viewKey = () => state.view === 'home' ? 'home:' + PAGES[state.page] : state.view;
  const cacheable = k => /^home:|^fc$|^alarm$/.test(k);
  const fastFrames = () => perf.ms > 0 && perf.ms < 120;
  const itemsSigOf = items => items.map(it => `${it.x},${it.y},${it.w},${it.h},${it.kind},${it.on ? 1 : 0}`).join(';');
  const slot = k => frameCache[k] || (frameCache[k] = { cv: makeCanvas(960, 480) });
  const slotCtx = c => c.ctx || (c.ctx = c.cv.getContext('2d', { willReadFrequently: !useGL() }));
  function cacheStore(key, isig, items, ink) {
    if (!cacheable(key)) return;
    const c = slot(key);
    if (!(renderKey && !useGL())) slotCtx(c).drawImage(outCanvas, 0, 0); // a background frame on the canvas path was drawn straight into it
    Object.assign(c, { vars: { ...inkVars }, ink, lastInk, isig, rects: items.map(({ x, y, w, h, r, kind }) => ({ x, y, w, h, r, kind })), m: sky.m, wx: state.wx, cover: state.cover, at: performance.now() });
  }
  function cacheValid(c, isig) {
    if (!c || !c.vars || c.isig !== isig || c.wx !== state.wx || Math.abs(c.cover - state.cover) > .05 || performance.now() - c.at > 600000) return false;
    return Math.abs(((sky.m - c.m) % DAY + DAY + 720) % DAY - 720) <= 4; // within a few minutes of sky
  }
  function showCached(key) {
    const c = frameCache[key]; if (!c || sky.m == null) return false;
    const isig = itemsSigOf(collectGlass());
    if (!cacheValid(c, isig)) return false;
    if (useGL()) GLX.blit(c.cv); else bctx.drawImage(c.cv, 0, 0);
    Object.entries(c.vars).forEach(([k, v]) => scr.style.setProperty(k, v));
    state.ink = c.ink; lastInk = c.lastInk; glassNow = c.rects;
    staleShown = { key, isig }; frameSig = '';
    syncText(); updateNight();
    return true;
  }
  // the frame on screen came from the cache: fade a freshly drawn one over it
  function dissolveRefresh() {
    const ov = $('#bg2'), ox = ov.getContext('2d');
    ox.clearRect(0, 0, 960, 480); ox.drawImage(outCanvas, 0, 0); ov.style.transition = 'none'; ov.style.opacity = '1';
    staleShown = null; frameSig = ''; advanceSky(); drawFrame();
    void ov.offsetWidth; ov.style.transition = 'opacity .6s ease'; ov.style.opacity = '0';
  }
  // the bare sky, on screen or into another canvas, while new glass is on its way
  function bareSkyOut() { if (!lastWall) return; if (lastWall.gl) { if (useGL()) GLX.base(false); } else bctx.putImageData(lastWall.im, 0, 0); frameSig = ''; staleShown = null; }
  function bareSkyTo(ctx) { if (!lastWall) return false; if (lastWall.gl) ctx.drawImage(lastWall.canvas, 0, 0); else ctx.putImageData(lastWall.im, 0, 0); return true; }
  // Draw another page or sheet into its slot without showing it: it's laid out invisibly, drawn, and put back,
  // all in one go so the screen never shows the in-between.
  function preRender(key) {
    const cur = viewKey(); if (key === cur || state.view !== 'home') return;
    const [v, p] = key.split(':'), undo = [];
    const keep = { frameSig, lastInk, ink: state.ink, P: state.P, glassNow, lastWall, bctx, inkVars, staleShown, view: state.view };
    const show = el => { const h = el.hidden, vis = el.style.visibility; el.hidden = false; el.style.visibility = 'hidden'; undo.push(() => { el.hidden = h; el.style.visibility = vis; }); };
    if (v === 'home') { const c = $(`.page[data-page="${PAGES[state.page]}"]`); c.classList.add('leaving'); undo.push(() => c.classList.remove('leaving')); show($(`.page[data-page="${p}"]`)); }
    else { const hv = $('.view[data-view="home"]'); hv.hidden = true; undo.push(() => { hv.hidden = false; }); show($(`.view[data-view="${v}"]`)); state.view = v; }
    const c = slot(key);
    renderKey = key; inkRedirect = true; frameSig = ''; staleShown = null; if (c.lastInk) lastInk = c.lastInk;
    if (!useGL()) bctx = slotCtx(c);
    try { render(); }
    finally {
      state.view = keep.view; renderKey = null; inkRedirect = false; undo.reverse().forEach(f => f());
      ({ frameSig, lastInk, glassNow, lastWall, bctx, inkVars, staleShown } = keep); state.ink = keep.ink; state.P = keep.P;
      if (useGL()) { glWallKey = ''; const cc = frameCache[cur]; if (cc && cc.vars) GLX.blit(cc.cv); else frameSig = ''; }
      syncText();
    }
  }
  function maybePreRender() {
    if (fastFrames() || !perf.ms || state.view !== 'home' || state.ringing || performance.now() - state.touchAt < 10000) return;
    const keys = [...PAGES.map(p => 'home:' + p), 'fc', 'alarm'].filter(k => k !== viewKey());
    if (++preTick % (keys.some(k => !frameCache[k]) ? 2 : 5)) return; // warm up every other tick, then one every ~30 s
    keys.sort((a, b) => ((frameCache[a] || {}).at || 0) - ((frameCache[b] || {}).at || 0));
    const t0 = performance.now(); preRender(keys[0]); perf.pre++; perf.busy.push([t0, performance.now() - t0]);
  }

  /* ---------- main render ---------- */
  function render() {
    if (sky.m == null) advanceSky();
    const o = state.lay, { W, H } = DIMS[o], P = frameAt(sky.m);
    state.P = P;
    if (bg.width !== W || bg.height !== H) { bg.width = W; bg.height = H; }
    syncText(); updateNight();
    // Deep night: the overlay is solid black, so don't spend anything on the sky.
    if (state.view === 'night' && state.nightAlpha > .99) { if (useGL()) GLX.clear(); else { bctx.fillStyle = '#000'; bctx.fillRect(0, 0, W, H); } frameSig = ''; staleShown = null; return false; }
    const items = collectGlass(); glassNow = items; // the rain layer stays off these
    const moonA = SKYGEO[o].moon, band = [moonA.cx - moonA.rx - 70, moonA.cx + moonA.rx + 70];
    const floor = Math.min(H, ...items.filter(it => !it.el.closest('.sb') && it.x < band[1] && it.x + it.w > band[0]).map(it => it.y));
    const avoid = inkTextRects();
    const wx = weatherNow();
    const geo = { ...SKYGEO[o], moonFloor: floor, avoid, wx, sig: wx.sig + '|' + floor + ':' + avoid.map(r => `${r.x},${r.y},${r.w},${r.h}`).join(';') };
    const wall = useGL() ? getWallGL(o, P, sky.m, geo) : getWall(o, P, sky.m, geo); lastWall = wall;
    const isig = itemsSigOf(items), rkey = renderKey || viewKey();
    // a kept frame is on screen: it stays until the live tick replaces it, unless the glass itself changed
    if (staleShown && staleShown.key === rkey && staleShown.isig === isig) { perf.quick++; return false; }
    staleShown = null;
    // Same sky, same glass, same text boxes: the frame would come out identical, so only the text was updated.
    const fsig = sky.m.toFixed(2) + '|' + geo.sig + '#' + isig;
    if (fsig === frameSig) { perf.quick++; return false; }
    frameSig = fsig; perf.full++;
    const { ink, lums, adj, halo, heads2 } = useGL() ? composeGL(o, wall, items, avoid, P, W, H) : composeCanvas(o, wall, items, avoid, P, W, H);
    ink.halo = halo;
    ink.head = heads2.length ? Math.min(...heads2.map(b => b == null ? HEAD_T : contrast(ink.L, b))) : 21; ink.glass = minContrast(ink, lums); ink.adj = adj;
    ink.score = Math.min(ink.head, ink.glass);
    state.ink = ink; inkVars = {};
    inkVar('--ink', css(ink.fg));
    inkVar('--ink2', rgba(ink.fg2, ink.fg2a));
    inkVar('--track', rgba(ink.fg, .25));
    inkVar('--accent', ink.light ? '#8FC2FF' : '#1F5FD1');
    inkVar('--alert', ink.light ? '#FF8A8A' : '#C62828');
    inkVar('--inv', ink.light ? '#141A2E' : '#FFFFFF');
    inkVar('--warn', ink.light ? '255,194,77' : '214,134,10');
    cacheStore(rkey, isig, items, ink);
    return true;
  }
  const DAYNAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  function daysLabel() {
    const d = state.alarm.days, n = d.filter(Boolean).length;
    if (n === 7) return 'Every day';
    if (n === 0) return 'Once';
    if (n === 5 && d.slice(0, 5).every(Boolean)) return 'Weekdays';
    if (n === 2 && d[5] && d[6]) return 'Weekends';
    return DAYNAMES.filter((_, i) => d[i]).map(s => s.slice(0, 3)).join(', ');
  }
  const wxIcon = m => WX[state.wx][sunElev(skyM(m)) > 0 ? 'day' : 'night'];
  const untilAlarm = () => { const k = (state.alarm.t - Math.floor(state.m) + DAY) % DAY; return k || DAY; };
  const lightsLabel = () => { const [c, l] = state.relays; return c && l ? 'Both on' : l ? 'Lamp on' : c ? 'Ceiling on' : 'All off'; };
  const setAll = (sel, fn) => $$(sel).forEach(fn);
  // Text that depends on state; must be set before measuring layout.
  function syncText() {
    const m = state.m, t = fmt(m), A = state.alarm, v = state.view;
    setAll('.js-time', e => { e.textContent = t; });
    $('#sbT').textContent = `${t} · `; // nbsp: a plain trailing space collapses
    $('#sbT').classList.toggle('show', v === 'alarm'); // the big clock is covered by the sheet
    setAll('.js-mic', e => e.toggleAttribute('hidden', !state.muted)); // an svg has no .hidden property
    setAll('.js-wxi', u => u.setAttribute('href', wxIcon(m)));
    const now = new Date(), dateS = now.toLocaleDateString(C.locale, { weekday: 'long', month: 'long', day: 'numeric' });
    setAll('.js-date', e => { if (e.textContent !== dateS) e.textContent = dateS; });
    $('#hiUse').setAttribute('href', WX[state.wx].day); $('#wxCond').textContent = state.wxName || '–';
    const mm = mmText(state.precip); $('#wxPop').textContent = mm; $('#wxPopW').hidden = !mm;
    setAll('.js-out', e => { e.textContent = state.out != null ? `${Math.round(state.out)}°` : '–'; });
    // alerts: the pill shows the first one and a count; the rest are in the drop-down
    const al = state.alerts, more = al.length - 1;
    setAll('.js-alert', e => { e.hidden = !al.length; });
    scr.classList.toggle('has-alert', al.length > 0);
    setAll('.js-alertT', e => { e.textContent = al[0] || ''; });
    setAll('.js-acount', e => { e.hidden = more < 1; e.textContent = `+${more}`; });
    setAll('.js-achev', e => e.toggleAttribute('hidden', more < 1));
    setAll('.js-acountN', e => { e.textContent = more > 0 ? ` +${more}` : ''; });
    setAll('.alert', e => { e.setAttribute('aria-expanded', state.amenu); e.setAttribute('aria-label', more > 0 ? `${al.length} alerts: ${al.join(', ')}` : al[0] || ''); });
    const am = al.map(t => `<li><span class="dot warn"></span>${esc(t)}</li>`).join('');
    if (am !== amHTML) { $('#amenu').innerHTML = amHTML = am; }
    $('#amenu').classList.toggle('on', state.amenu && more > 0);
    // day
    if (C.calendar) {
      const ev = state.next;
      $('#k2Use').setAttribute('href', '#i-cal'); $('#k2T').textContent = 'Next';
      $('#evT').textContent = ev ? ev.time : ''; $('#evN').textContent = ev ? ev.text : 'Nothing else today';
    } else { // no calendar: the line shows the alarm instead
      $('#k2Use').setAttribute('href', '#i-bell'); $('#k2T').textContent = 'Alarm';
      $('#evT').textContent = A.on ? fmt(A.t) : ''; $('#evN').textContent = A.on ? daysLabel() : 'Off';
    }
    // holding the ceiling light swaps the right column for its menu
    setAll('.js-ceilS', e => { e.textContent = lightText('ceiling'); });
    setAll('.js-ceil', e => e.setAttribute('aria-disabled', !C.ceiling.length));
    setAll('.js-ceilChip', e => e.classList.toggle('lit', state.relays[0]));
    setAll('.js-ceil', e => e.setAttribute('aria-pressed', state.relays[0]));
    setAll('.cmenu', e => { e.hidden = !state.cmenu; });
    setAll('.rcol', e => { e.hidden = state.cmenu; });
    $('#mHL').textContent = state.hi == null ? '–' : state.lo == null ? `${Math.round(state.hi)}°` : `${Math.round(state.hi)}°/${Math.round(state.lo)}°`;
    // alarm sheet
    $('#aTime').textContent = fmt(A.t);
    $('#aIn').textContent = A.on ? `Rings in ${dur(untilAlarm())} · ${daysLabel()}` : 'Off';
    $('.sheet').dataset.off = A.on ? '0' : '1';
    const oo = $('#onoff'); oo.textContent = A.on ? 'On' : 'Off'; oo.dataset.g = A.on ? 'thumb' : 'smokebtn'; oo.dataset.on = A.on ? '1' : '0'; oo.setAttribute('aria-pressed', A.on);
    const sr = $('#sunr'); sr.dataset.g = A.sunrise ? 'thumb' : 'smokebtn'; sr.dataset.on = A.sunrise ? '1' : '0'; sr.setAttribute('aria-pressed', A.sunrise);
    $$('.day').forEach((b, i) => { b.dataset.g = A.days[i] ? 'thumb' : 'smokebtn'; b.dataset.on = A.days[i] ? '1' : '0'; b.setAttribute('aria-pressed', !!A.days[i]); });
    // ringing
    $('#rTime').textContent = t;
    $('#rSub').textContent = state.snoozing ? 'Snoozed alarm' : `Alarm · ${daysLabel()}`;
    // night buttons
    $('#nbLamp').setAttribute('aria-pressed', state.relays[1]);
    $('#nbAlarmT').textContent = A.on ? fmt(A.t) : 'Alarm';
    syncPages();
    if (v === 'fc') fillForecast();
  }

  /* ---------- pages ---------- */
  const mmss = sec => `${Math.floor(sec / 60)}:${pad2(Math.floor(sec % 60))}`;
  const lit = (sel, on) => $(sel).classList.toggle('lit', !!on);
  const clockOf = ms => { const d = new Date(ms); return fmt(d.getHours() * 60 + d.getMinutes()); };
  const ago = ms => { const k = Math.max(0, Math.round((Date.now() - ms) / 60000)); return k < 1 ? 'just now' : k < 60 ? `${k} min ago` : k < 1440 ? `${Math.floor(k / 60)} h ago` : `${Math.floor(k / 1440)} d ago`; };
  const mmText = p => p == null || !(p > 0) ? '' : `${p < 1 ? (+p).toFixed(1) : Math.round(p)} mm`;
  function lightText(k) {
    const ids = C[k], X = state.lights[k];
    if (!ids.length) return 'Not set up';
    if (!X.avail) return 'Unavailable';
    if (!X.on) return 'Off';
    return ids.length > 1 ? (X.n === ids.length ? 'All on' : `${X.n} of ${ids.length} on`) : 'On';
  }
  function lightTile(k, id) {
    const b = $(`#${id}`); if (!b) return;
    $(`#${id}S`).textContent = lightText(k); lit(`#${id}Chip`, state.lights[k].on);
    b.setAttribute('aria-disabled', !C[k].length); b.setAttribute('aria-pressed', state.lights[k].on);
  }
  function setSliderUI(fill, knob, f) { $(fill).style.width = `${f * 100}%`; $(knob).style.left = `${f * 100}%`; }
  let camEvHTML = '', artSrc = null;
  function syncPages() {
    // dots
    if (!$('#dots').children.length) $('#dots').innerHTML = PAGE_NAMES.map((n, i) => `<button type="button" role="tab" data-pg="${i}" aria-label="${n}"></button>`).join('');
    $('#dots').hidden = PAGES.length < 2;
    $$('#dots button').forEach((b, i) => { b.setAttribute('aria-current', i === state.page); b.setAttribute('aria-selected', i === state.page); });
    // house
    lightTile('lamp', 'hLamp'); lightTile('hall', 'hHall'); lightTile('hood', 'hHood');
    const H = state.house;
    $('#hTemp').textContent = H.temp == null ? '–' : `${Math.round(H.temp)}°`;
    $('#hHum').textContent = H.hum != null ? `${Math.round(H.hum)}% humidity` : C.temperature ? '' : 'Not set up';
    const laun = [C.laundryDoor && `Door ${H.door ? 'open' : 'closed'}`, C.washerPower && `Washer ${H.washer || '–'}`].filter(Boolean);
    $('#hLaun').innerHTML = laun.length ? laun.map(esc).join('<br>') : 'Not set up'; $('#hLaunChip').classList.toggle('warn', !!H.door);
    const n = C.leaks.length, wet = H.wet;
    $('#hLeak').textContent = !n ? 'Not set up' : wet.length === 1 ? `${wet[0]} is wet` : wet.length ? `${wet.length} sensors are wet` : n === 1 ? 'Sensor is dry' : `All ${n} sensors dry`;
    $('#hLeakChip').classList.toggle('warn', wet.length > 0);
    $('#hShopN').textContent = H.shopN == null ? '–' : H.shopN;
    $('#hShop').textContent = !C.shopping ? 'Not set up' : !H.shopN ? 'List is empty' : H.shop.length ? H.shop.slice(0, 2).join(', ') + (H.shopN > 2 ? '…' : '') : `${H.shopN} to buy`;
    // music
    const M = state.music;
    $('#muT').textContent = M.title || ({ off: 'Off', unavailable: 'Unavailable', '': 'Not connected' }[M.st] ?? 'Nothing playing');
    $('#muA').textContent = [M.artist, M.source].filter(Boolean).join(' · ') || M.name;
    if (M.pic !== artSrc) {
      artSrc = M.pic;
      $('#muArt').style.background = M.pic ? `center / cover no-repeat url("${hassUrl(M.pic).replace(/"/g, '%22')}"), #1B1F3A`
        : 'radial-gradient(circle at 28% 30%, #7B5CFF 0, transparent 58%), radial-gradient(circle at 78% 74%, #FF8A65 0, transparent 52%), linear-gradient(140deg, #1B1F3A, #3A2E6E)';
      $('#muArt svg').style.display = M.pic ? 'none' : '';
    }
    const play = $('#muPlay'); play.dataset.g = M.playing ? 'thumb' : 'glass'; play.dataset.on = M.playing ? '1' : '0';
    play.setAttribute('aria-label', M.playing ? 'Pause' : 'Play'); $('#muPlayUse').setAttribute('href', M.playing ? '#i-pause' : '#i-play');
    $('#mvolV').textContent = M.vol == null ? '–' : `${Math.round(M.vol * 100)}%`; setSliderUI('#mvolFill', '#mvolKnob', M.vol || 0);
    $('[data-slider="mvol"]').setAttribute('aria-valuenow', Math.round((M.vol || 0) * 100));
    syncProgress();
    // settings
    const D = state.dev, ns = id => C[id] ? '–' : 'Not set up';
    $('#volV').textContent = D.vol == null ? ns('volume') : `${D.vol} of ${D.volMax}`; setSliderUI('#volFill', '#volKnob', D.vol == null ? 0 : D.vol / D.volMax);
    $('[data-slider="vol"]').setAttribute('aria-valuenow', D.vol ?? 0); $('[data-slider="vol"]').setAttribute('aria-valuemax', D.volMax);
    $('[data-slider="vol"]').setAttribute('aria-disabled', !C.volume);
    $('#brV').textContent = D.bright == null ? ns('brightness') : D.auto ? `${D.bright}% · auto` : `${D.bright}%`; setSliderUI('#brFill', '#brKnob', (D.bright ?? 0) / 100);
    $('[data-slider="bright"]').setAttribute('aria-valuenow', D.bright ?? 0); $('[data-slider="bright"]').setAttribute('aria-disabled', !C.brightness);
    const tog = (id, key, v) => { $(`#${id}S`).textContent = !C[key] ? 'Not set up' : v == null ? '–' : v ? 'On' : 'Off'; $(`#${id}Chip`).classList.toggle('on', !!v); $(`#${id}`).setAttribute('aria-pressed', !!v); $(`#${id}`).setAttribute('aria-disabled', !C[key]); };
    tog('sDnd', 'dnd', D.dnd); tog('sAuto', 'autoBrightness', D.auto);
    $('#sWakeS').textContent = C.wakeWord ? D.wake || '–' : 'Not set up'; $('#sWake').setAttribute('aria-disabled', !C.wakeWord);
    // front door: the latest detections from the doorbell's sensors
    const E = state.cam.events;
    const ev = E.length ? E.slice(0, 4).map(e => `<li><span class="chip"><svg class="i"><use href="${e.icon}"/></svg></span><span><b>${esc(e.name)}</b><span>${e.on ? 'Now' : `${clockOf(e.t)} · ${ago(e.t)}`}</span></span></li>`).join('')
      : '<li class="none"><span><b>Nothing yet</b></span></li>';
    if (ev !== camEvHTML) $('#camEv').innerHTML = camEvHTML = ev;
    const last = E[0];
    $('#camSub').textContent = last ? `${C.cameraName} · ${last.name.toLowerCase()} ${last.on ? 'now' : ago(last.t)}` : C.cameraName;
  }
  const musicPos = () => { const M = state.music; return Math.max(0, Math.min(M.dur || Infinity, M.pos + (M.playing ? (Date.now() - M.posAt) / 1000 : 0))); };
  function syncProgress() {
    const M = state.music, p = musicPos();
    $('#muFill').style.width = M.dur ? `${Math.min(100, p / M.dur * 100)}%` : '0%';
    $('#muP').textContent = M.dur ? mmss(p) : ''; $('#muL').textContent = M.dur ? `−${mmss(Math.max(0, M.dur - p))}` : '';
    const d = new Date(); $('#camTime').textContent = `${fmt(d.getHours() * 60 + d.getMinutes())}:${pad2(d.getSeconds())}`;
    const fresh = state.cam.at && Date.now() - state.cam.at < Math.max(10000, C.cameraRefresh * 3000);
    $('#camLive').hidden = !fresh; $('#camWait').hidden = !!state.cam.at; $('#camImg').hidden = !state.cam.at;
  }
  // The camera: a fresh still from HA every couple of seconds while the page is open. Cheaper on the Echo Show 5 than a video stream.
  let camBusy = false, camLast = 0;
  function camTick(force) {
    const cam = st(C.camera), pic = cam && cam.attributes.entity_picture;
    if (!pic || camBusy || !alive) return;
    if (!force && performance.now() - camLast < C.cameraRefresh * 1000) return;
    camBusy = true; camLast = performance.now();
    const img = new Image(), done = () => { camBusy = false; };
    img.onload = () => { done(); $('#camImg').src = img.src; state.cam.at = Date.now(); syncProgress(); };
    img.onerror = done; setTimeout(done, 8000);
    img.src = hassUrl(`${pic}${pic.includes('?') ? '&' : '?'}width=${C.cameraWidth}&t=${Date.now()}`);
  }
  function secondTick() { // the song plays on, the camera clock ticks
    if (state.view !== 'home' || !state.page) return;
    syncProgress();
    if (PAGES[state.page] === 'cams') camTick();
  }

  // Page changes cross-fade: the old frame (sky and glass) is held on a second canvas and fades out over the new one,
  // while the old page's text slides away and the new page's text slides in.
  let pageTimer = 0, glassTimer = 0;
  function goPage(i, dir) {
    if (i < 0 || i >= PAGES.length || i === state.page || state.view !== 'home') return false;
    dir = dir || Math.sign(i - state.page);
    const from = $(`.page[data-page="${PAGES[state.page]}"]`), to = $(`.page[data-page="${PAGES[i]}"]`);
    clearTimeout(pageTimer); $$('.page').forEach(p => { if (p !== from) { p.classList.remove('leaving'); p.style.cssText = ''; if (p !== to) p.hidden = true; } });
    const ov = $('#bg2'), ox = ov.getContext('2d');
    ox.clearRect(0, 0, 960, 480); ox.drawImage(outCanvas, 0, 0);
    ov.style.transition = 'none'; ov.style.opacity = '1';
    clearTimeout(glassTimer);
    from.classList.add('leaving'); from.style.transition = 'none';
    to.hidden = false; to.style.transition = 'none'; to.style.opacity = '0'; to.style.transform = `translateX(${dir * 36}px)`;
    state.page = i; state.cmenu = false; state.amenu = false; state.touchAt = performance.now();
    if (PAGES[i] === 'cams') camTick(true);
    // The new page's glass: drawn now when frames are quick, else its kept frame, else it dissolves in once drawn.
    // The slide never waits for a slow frame.
    const how = fastFrames() ? (drawFrame(), 'drawn') : showCached(viewKey()) ? 'kept' : (bareSkyOut(), syncText(), 'later');
    void to.offsetWidth; // commit the start positions before animating
    const T = 'opacity .3s ease, transform .3s ease';
    to.style.transition = T; to.style.opacity = '1'; to.style.transform = 'none';
    from.style.transition = T; from.style.opacity = '0'; from.style.transform = `translateX(${-dir * 36}px)`;
    ov.style.transition = how === 'later' ? 'opacity .22s ease' : 'opacity .3s ease'; ov.style.opacity = '0';
    if (how === 'later') glassTimer = setTimeout(() => {
      if (bareSkyTo(ox)) { ov.style.transition = 'none'; ov.style.opacity = '1'; }
      drawFrame();
      void ov.offsetWidth; ov.style.transition = 'opacity .25s ease'; ov.style.opacity = '0';
    }, 240);
    pageTimer = setTimeout(() => { from.hidden = true; from.classList.remove('leaving'); from.style.cssText = ''; to.style.cssText = ''; }, 320);
    return true;
  }
  function resetPage() { // instant, used when the screen leaves the day view
    clearTimeout(pageTimer); clearTimeout(glassTimer); state.page = 0;
    $$('.page').forEach(p => { p.hidden = p.dataset.page !== 'home'; p.classList.remove('leaving'); p.style.cssText = ''; });
    $('#bg2').style.opacity = '0';
  }

  /* ---------- forecast: the weather entity's hourly and daily forecasts ---------- */
  function forecast() {
    const m = Math.floor(state.m), now = Date.now();
    const iconOf = (cond, t) => { const k = (COND[cond] || ['partly'])[0]; return WX[k][t == null || sunElev(skyM(t)) > 0 ? 'day' : 'night']; };
    const hrs = state.hourly.filter(f => Date.parse(f.datetime) > now).slice(0, 7).map(f => {
      const d = new Date(f.datetime), t = d.getHours() * 60 + d.getMinutes();
      return { label: fmt(t), icon: iconOf(f.condition, t), temp: f.temperature, precip: f.precipitation };
    });
    const hours = [{ label: 'Now', icon: wxIcon(m), temp: state.out, precip: state.hourly[0] ? state.hourly[0].precipitation : null }, ...hrs];
    const today = new Date().toDateString();
    const t0 = new Date(); t0.setHours(0, 0, 0, 0);
    const days = state.daily.filter(f => Date.parse(f.datetime) >= +t0).slice(0, 5).map(f => {
      const d = new Date(f.datetime);
      const isToday = d.toDateString() === today; // today's column uses the high and low kept for the whole day
      return { label: isToday ? 'Today' : d.toLocaleDateString(C.locale, { weekday: 'short' }), icon: iconOf(f.condition), hi: isToday && state.hi != null ? state.hi : f.temperature, lo: isToday && state.lo != null ? state.lo : f.templow, precip: f.precipitation };
    });
    return { now: { icon: wxIcon(m), temp: state.out, name: state.wxName, hi: state.hi, lo: state.lo, precip: state.precip }, hours, days };
  }
  let fcSig = '', amHTML = '';
  function fillForecast() {
    const F = forecast(), pop = mmText, deg = v => v == null ? '–' : `${Math.round(v)}°`;
    const col = (a, icon, b, p) => `<div class="fc-col"><span class="a">${a}</span><svg class="i"><use href="${icon}"/></svg><span class="b">${b}</span><span class="p">${pop(p)}</span></div>`;
    const hours = F.hours.map(h => col(h.label, h.icon, deg(h.temp), h.precip)).join('');
    const days = F.days.map(d => col(d.label, d.icon, `${deg(d.hi)}<i>/${deg(d.lo)}</i>`, d.precip)).join('');
    const sig = JSON.stringify(F.now) + hours + days; if (sig === fcSig) return; fcSig = sig;
    $('#fcUse').setAttribute('href', F.now.icon); $('#fcT').textContent = deg(F.now.temp); $('#fcCond').textContent = F.now.name || '–';
    $('#fcHL').textContent = `H ${deg(F.now.hi)} · L ${deg(F.now.lo)} · ${mmText(F.now.precip) ? `${mmText(F.now.precip)} rain` : 'no rain'}`;
    $('#fcHours').innerHTML = hours; $('#fcDays').innerHTML = days;
  }

  /* ---------- views ---------- */
  function desiredView() {
    if (state.ringing) return 'ring';
    if (state.fc) return 'fc';
    if (state.sheet) return 'alarm';
    if (performance.now() < state.doorUntil) return 'home';
    return state.override || scheduleMode(state.m);
  }
  function setView(v) {
    state.view = v; scr.dataset.v = v;
    state.cmenu = false; state.amenu = false; // menus never survive a change of screen
    if (v !== 'home') resetPage();
    $$('.scr .view').forEach(s => { s.hidden = s.dataset.view !== v; });
    night.classList.toggle('on', v === 'night');
    $('#sb').hidden = true; // the alarm sheet now covers the top too
    $('#toast').classList.toggle('dim', v === 'night');
    if (v !== 'night') state.wokenUntil = 0;
    // the forecast, the alarm sheet and the pages: drawn at once when frames are quick, else their kept frame
    if (v === 'home' || v === 'fc' || v === 'alarm') { if (fastFrames()) drawFrame(); else if (!showCached(viewKey())) requestRender(true); }
    else requestRender(true);
  }
  function applyView() {
    const now = performance.now();
    if (state.fc && now > state.fcUntil) state.fc = false;
    if (state.sheet && now > state.sheetUntil) state.sheet = false; // left open: close quietly after 30 s
    if (state.cmenu && now > state.cmenuUntil) { state.cmenu = false; requestRender(true); }
    if (state.amenu && now > state.amenuUntil) { state.amenu = false; requestRender(true); }
    if (state.page && state.view === 'home' && now - state.touchAt > 60000) goPage(0, -1); // a minute alone: back to Home
    const v = desiredView(); if (v !== state.view) setView(v);
    const wk = state.view === 'night' && performance.now() < state.wokenUntil;
    if (night.classList.contains('woken') !== wk) night.classList.toggle('woken', wk);
  }

  /* ---------- actions ---------- */
  // Service calls go through the dashboard's own connection, so the card holds no token.
  function call(domain, service, data) {
    const h = getHass();
    if (!h) { toast('#i-alert', 'Not connected to Home Assistant'); return Promise.resolve(); }
    return Promise.resolve(h.callService(domain, service, data)).catch(() => toast('#i-alert', `Couldn't run ${domain}.${service}`));
  }
  // A tap shows its result straight away and keeps it until HA reports back (or 4 s pass).
  const holdUntil = {};
  const held = k => performance.now() < (holdUntil[k] || 0);
  const hold = k => { holdUntil[k] = performance.now() + 4000; setTimeout(() => syncFromHass(true), 4100); };
  const later = {};
  const debounce = (k, ms, fn) => { clearTimeout(later[k]); later[k] = setTimeout(fn, ms); };
  const syncRelays = () => { state.relays = [state.lights.ceiling.on, state.lights.lamp.on]; };
  function setLight(k, on) {
    const ids = C[k]; if (!ids.length) return;
    const X = state.lights[k];
    if (!X.avail) { toast('#i-alert', `${LIGHT_NAMES[k]} is unavailable`); return; }
    X.on = on; X.n = on ? ids.length : 0; hold('l:' + k); syncRelays(); requestRender(true);
    call('homeassistant', on ? 'turn_on' : 'turn_off', { entity_id: ids });
  }
  function setRelay(i, on) { setLight(i ? 'lamp' : 'ceiling', on); }
  function setSleep() {} // Sounds is a placeholder for now
  let almTimer = 0;
  function pushAlarm() {
    hold('alarm'); requestRender(true);
    clearTimeout(almTimer);
    almTimer = setTimeout(() => {
      const h = getHass(); if (!h) return;
      if (C.alarmTime && h.states[C.alarmTime]) call('input_datetime', 'set_datetime', { entity_id: C.alarmTime, time: `${pad2(Math.floor(state.alarm.t / 60))}:${pad2(state.alarm.t % 60)}:00` });
      if (C.alarmOn && h.states[C.alarmOn]) call('input_boolean', state.alarm.on ? 'turn_on' : 'turn_off', { entity_id: C.alarmOn });
    }, 700);
  }
  let toastTimer = 0;
  function toast(icon, text) {
    $('#toastUse').setAttribute('href', icon); $('#toastTxt').textContent = text;
    const t = $('#toast'); t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
  }
  function goodNight(quiet) {
    setRelay(0, false); setRelay(1, false);
    const al = state.alerts;
    let icon = '#i-moon', msg = 'Good night · lights off';
    if (al.length) { icon = '#i-alert'; msg = al.length > 1 ? `Good night · ${al.length} alerts` : `Good night · ${al[0]}`; }
    state.sheet = false; state.override = null; state.nightForced = true; state.wokenUntil = 0;
    applyView();
    if (!quiet) toast(icon, msg);
  }
  function ring() {
    state.ringing = true; state.ringT = state.m; state.sheet = false; state.fc = false; state.override = null;
    $('#toast').classList.remove('on'); // the ringing screen gets the whole display
    applyView();
  }
  const ACTIONS = {
    alarm: () => { state.sheet = true; state.sheetUntil = performance.now() + 30000; applyView(); },
    lights: () => { if (state.relays.some(Boolean)) { setRelay(0, false); setRelay(1, false); } else setRelay(1, true); },
    ceiling: () => setRelay(0, !state.relays[0]),
    lamp: () => setRelay(1, !state.relays[1]),
    sleep: () => setSleep(!state.sleep.on),
    goodnight: () => goodNight(false),
    almtoggle: () => { state.alarm.on = !state.alarm.on; pushAlarm(); },
    almminus: () => { state.alarm.t = (Math.round(state.alarm.t / 5) * 5 - 5 + DAY) % DAY; pushAlarm(); },
    almstep: el => { state.alarm.t = ((Math.round(state.alarm.t / 5) * 5 + +el.dataset.d) % DAY + DAY) % DAY; pushAlarm(); },
    almplus: () => { state.alarm.t = (Math.round(state.alarm.t / 5) * 5 + 5) % DAY; pushAlarm(); },
    sunrise: () => { state.alarm.sunrise = !state.alarm.sunrise; save(); requestRender(true); },
    done: () => { state.sheet = false; applyView(); toast('#i-bell', state.alarm.on ? `Alarm ${fmt(state.alarm.t)} · ${dur(untilAlarm())} from now` : 'Alarm off'); },
    hall: () => setLight('hall', !state.lights.hall.on),
    hood: () => setLight('hood', !state.lights.hood.on),
    muplay: () => { if (!C.music) return; const M = state.music, p = musicPos(); M.playing = !M.playing; M.pos = p; M.posAt = Date.now(); hold('mplay'); requestRender(true); call('media_player', 'media_play_pause', { entity_id: C.music }); },
    muprev: () => { if (C.music) call('media_player', 'media_previous_track', { entity_id: C.music }); },
    munext: () => { if (C.music) call('media_player', 'media_next_track', { entity_id: C.music }); },
    dnd: () => { if (!C.dnd) return; state.dev.dnd = !state.dev.dnd; hold('dnd'); requestRender(true); call('switch', state.dev.dnd ? 'turn_on' : 'turn_off', { entity_id: C.dnd }); },
    autob: () => { if (!C.autoBrightness) return; state.dev.auto = !state.dev.auto; hold('auto'); requestRender(true); call('switch', state.dev.auto ? 'turn_on' : 'turn_off', { entity_id: C.autoBrightness }); },
    wakeword: () => {
      const D = state.dev, o = D.wakeOpts; if (!C.wakeWord || !o.length) return;
      D.wake = o[(o.indexOf(D.wake) + 1) % o.length]; hold('wake'); requestRender(true);
      debounce('wake', 1200, () => { hold('wake'); call('select', 'select_option', { entity_id: C.wakeWord, option: D.wake }); }); // a pause before it switches models
    },
    alerts: () => { if (state.alerts.length < 2) return; state.amenu = !state.amenu; state.amenuUntil = performance.now() + 8000; requestRender(true); },
    forecast: () => { state.fc = true; state.fcUntil = performance.now() + 12000; state.sheet = false; $('#toast').classList.remove('on'); applyView(); },
    fcclose: () => { state.fc = false; applyView(); },
    cmenukeep: () => { state.cmenuUntil = performance.now() + 3000; }, // placeholders: nothing to do yet
    snooze: () => { state.ringing = false; state.snoozing = true; state.snoozeT = (Math.floor(state.m) + 9) % DAY; applyView(); },
    stop: () => { state.ringing = false; state.snoozing = false; state.nightForced = false; state.override = null; applyView(); },
  };
  $('#days').innerHTML = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) =>
    `<button class="g day tap" style="--i:${i}" data-g="thumb" data-on="1" data-day="${i}" aria-pressed="true" aria-label="${DAYNAMES[i]}">${d}</button>`).join('');
  root.addEventListener('click', e => {
    const a = e.target.closest('.scr [data-act]'); if (a) { if (a.getAttribute('aria-disabled') !== 'true') ACTIONS[a.dataset.act](a); return; }
    const d = e.target.closest('.scr [data-day]'); if (d) { const i = +d.dataset.day; state.alarm.days[i] = state.alarm.days[i] ? 0 : 1; save(); requestRender(true); }
  });
  const wake = () => { state.wokenUntil = performance.now() + 10000; applyView(); };
  night.addEventListener('click', wake);
  night.addEventListener('keydown', e => { if (e.target === night && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); wake(); } });
  const press = (el, v) => { if (!el) return; if (v) el.dataset.pressed = '1'; else delete el.dataset.pressed; }; // CSS shows it; no redraw
  scr.addEventListener('pointerdown', e => { const t = e.target.closest('.g.tap:not([aria-disabled="true"])') || (e.target.closest('.wxhit') && e.target.closest('.brief')); if (t) { press(t, true); const up = () => { press(t, false); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); }; addEventListener('pointerup', up); addEventListener('pointercancel', up); } });

  /* ---------- press and hold ----------
     Half a second on the clock opens the alarm; on the ceiling light, its menu. A hold never also counts as a tap. */
  let holdTimer = 0, holdFired = false, holdXY = null;
  const HOLDS = [['.clock', () => ACTIONS.alarm()], ['.page[data-page="home"] .js-ceil', () => openCmenu()]];
  function openCmenu() { state.cmenu = true; state.amenu = false; state.cmenuUntil = performance.now() + 3000; requestRender(true); }
  scr.addEventListener('pointerdown', e => {
    holdFired = false; clearTimeout(holdTimer);
    const h = HOLDS.find(([sel]) => e.target.closest(sel)); if (!h) return;
    holdXY = [e.clientX, e.clientY];
    holdTimer = setTimeout(() => { holdFired = true; h[1](); }, 550);
  });
  scr.addEventListener('pointermove', e => { if (holdXY && Math.hypot(e.clientX - holdXY[0], e.clientY - holdXY[1]) > 12) clearTimeout(holdTimer); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => scr.addEventListener(t, () => { clearTimeout(holdTimer); holdXY = null; }));
  scr.addEventListener('contextmenu', e => e.preventDefault()); // Android shows a menu on long-press otherwise
  // Taps that only close something: the release after a hold, and a tap outside an open menu.
  /* ---------- swipe between pages, drag sliders ----------
     A sideways drag of about 60 px on the day screen turns the page. Sliders take the drag instead. */
  let sw = null, swiped = false, slide = null;
  const nativeScale = () => scr.getBoundingClientRect().width / 960;
  scr.addEventListener('pointerdown', e => {
    state.touchAt = performance.now(); swiped = false;
    // a slider takes the drag from its track; its icon and label end still turns the page
    const sl = e.target.closest('[data-slider]');
    if (sl && sl.getAttribute('aria-disabled') !== 'true' && e.clientX >= sl.querySelector('.sl-track').getBoundingClientRect().left - 28 * nativeScale()) { slide = sl; setSlider(sl, e); scr.setPointerCapture?.(e.pointerId); return; }
    sw = state.view === 'home' ? { x: e.clientX, y: e.clientY, done: false } : null;
  });
  scr.addEventListener('pointermove', e => {
    if (slide) { setSlider(slide, e); return; }
    if (!sw || sw.done) return;
    const k = nativeScale(), dx = (e.clientX - sw.x) / k, dy = (e.clientY - sw.y) / k;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      sw.done = true; swiped = true; clearTimeout(holdTimer);
      $$('[data-pressed]').forEach(el => delete el.dataset.pressed);
      if (!goPage(state.page + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1)) requestRender(true);
    }
  });
  ['pointerup', 'pointercancel'].forEach(t => scr.addEventListener(t, () => { sw = null; slide = null; }));
  function setSlider(el, e) {
    const tr = el.querySelector('.sl-track').getBoundingClientRect(), f = Math.min(1, Math.max(0, (e.clientX - tr.left) / tr.width));
    const k = el.dataset.slider, D = state.dev, M = state.music;
    if (el.getAttribute('aria-disabled') === 'true') return;
    if (k === 'mvol') { M.vol = Math.round(f * 100) / 100; hold('mvol'); debounce('mvol', 200, () => { hold('mvol'); call('media_player', 'volume_set', { entity_id: C.music, volume_level: M.vol }); }); }
    else if (k === 'vol') { D.vol = Math.round(f * D.volMax); hold('vol'); debounce('vol', 200, () => { hold('vol'); call('number', 'set_value', { entity_id: C.volume, value: D.vol }); }); }
    else {
      D.bright = Math.round(f * 100); hold('bright'); debounce('bright', 200, () => { hold('bright'); call('number', 'set_value', { entity_id: C.brightness, value: D.bright }); });
      if (D.auto && C.autoBrightness) { D.auto = false; hold('auto'); call('switch', 'turn_off', { entity_id: C.autoBrightness }); } // moving it by hand switches auto off, like a phone
    }
    requestRender(true);
  }
  scr.addEventListener('click', e => {
    if (swiped) { swiped = false; e.stopPropagation(); e.preventDefault(); return; }
    const dot = e.target.closest('#dots [data-pg]'); if (dot) { goPage(+dot.dataset.pg); e.stopPropagation(); return; }
    if (holdFired) { holdFired = false; e.stopPropagation(); e.preventDefault(); return; }
    if (state.cmenu && !e.target.closest('.cmenu')) { state.cmenu = false; requestRender(true); e.stopPropagation(); return; }
    if (state.amenu && !e.target.closest('.amenu, .alert')) { state.amenu = false; requestRender(true); e.stopPropagation(); }
  }, true);
  scr.addEventListener('pointerdown', e => { // still using it: keep the sheet open
    if (!e.target.closest('.fcs')) return;
    if (state.fc) state.fcUntil = performance.now() + 12000; else if (state.sheet) state.sheetUntil = performance.now() + 30000;
  });

  /* ---------- Home Assistant ----------
     HA hands the card its hass object (states and service calls) directly; no token involved. */
  const getHass = () => hassRef && hassRef.states ? hassRef : null;
  const hassUrl = p => hassRef && hassRef.hassUrl && p.startsWith('/') ? hassRef.hassUrl(p) : p;
  const st = id => { const h = getHass(); return id && h ? h.states[id] : undefined; };
  const ok = s => !!s && !['unavailable', 'unknown'].includes(s.state);
  const isOn = id => { const s = st(id); return !!s && s.state === 'on'; };
  const num = id => { const s = st(id); const v = s ? parseFloat(s.state) : NaN; return isFinite(v) ? v : null; };
  const todMin = v => { const d = new Date(v); return isNaN(d) ? null : d.getHours() * 60 + d.getMinutes(); };
  const COND = {
    'sunny': ['clear', 'Sunny'], 'clear-night': ['clear', 'Clear'], 'partlycloudy': ['partly', 'Partly cloudy'],
    'cloudy': ['cloudy', 'Cloudy'], 'fog': ['cloudy', 'Fog'], 'windy': ['partly', 'Windy'], 'windy-variant': ['cloudy', 'Windy'],
    'rainy': ['rain', 'Rain'], 'pouring': ['rain', 'Heavy rain'], 'lightning-rainy': ['rain', 'Storms'], 'lightning': ['overcast', 'Storms'],
    'hail': ['rain', 'Hail'], 'snowy': ['rain', 'Snow'], 'snowy-rainy': ['rain', 'Sleet'], 'exceptional': ['overcast', 'Unusual weather'],
  };
  const watched = () => [...LIGHTS.flatMap(k => C[k]), C.weather, C.sun, C.alarmTime, C.alarmOn, C.calendar, C.mute, C.temperature, C.humidity,
    C.laundryDoor, C.washerPower, C.shopping, C.music, C.camera, C.doorbell, C.person, C.volume, C.brightness, C.dnd, C.autoBrightness, C.wakeWord, C.screen,
    ...C.leaks.map(l => l.entity), ...C.alerts.map(a => a.entity), ...C.cameraEvents.map(e => e.entity)].filter(Boolean);
  // hass changes whenever anything in the house changes; only redraw for what this card shows
  const relevantSig = S => watched().map(id => { const s = S[id]; if (!s) return '-'; const a = s.attributes || {};
    return [s.state, s.last_changed, a.temperature, a.cloud_coverage, a.next_rising, a.next_setting, a.message, a.start_time, a.media_title, a.media_position, a.volume_level, a.entity_picture, a.options && a.options.length].join('|'); }).join(';');
  let lastStates = null, lastSig = '', fcEntity = '', fcUnsubs = [], shopN = -1;
  function subscribeForecast(h) {
    fcEntity = C.weather; unsubForecast();
    ['daily', 'hourly'].forEach(type => {
      try {
        const u = h.connection.subscribeMessage(msg => {
          const f = msg.forecast || [];
          if (type === 'hourly') state.hourly = f;
          else { state.daily = f; todayHiLo(); }
          requestRender(true);
        }, { type: 'weather/subscribe_forecast', forecast_type: type, entity_id: C.weather });
        fcUnsubs.push(u); Promise.resolve(u).catch(() => { fcEntity = ''; });
      } catch (e) { fcEntity = ''; }
    });
  }
  function unsubForecast() { fcUnsubs.splice(0).forEach(u => Promise.resolve(u).then(f => f && f()).catch(() => {})); }
  // Today's high and low. The daily forecast for today only covers the hours that are left (Met.no does this), so its
  // high falls through the afternoon. Keep the highest and lowest seen today: the forecast's, the readings, and HA's
  // history since midnight (so a reload doesn't forget the morning).
  const DAYSTORE = STORE + ':today';
  let dayT = (() => { try { return JSON.parse(localStorage.getItem(DAYSTORE) || 'null') || {}; } catch (e) { return {}; } })(), histDay = '';
  function noteToday(vals) {
    const d = new Date().toDateString();
    if (dayT.d !== d) dayT = { d, hi: null, lo: null };
    let ch = false;
    vals.forEach(v => { if (v == null || v === '') return; v = +v; if (!isFinite(v)) return; if (dayT.hi == null || v > dayT.hi) { dayT.hi = v; ch = true; } if (dayT.lo == null || v < dayT.lo) { dayT.lo = v; ch = true; } });
    if (ch) try { localStorage.setItem(DAYSTORE, JSON.stringify(dayT)); } catch (e) {}
  }
  function todayHiLo() {
    const d0 = state.daily[0], today = !!d0 && new Date(d0.datetime).toDateString() === new Date().toDateString();
    noteToday([state.out, today ? d0.temperature : null, today ? d0.templow : null]);
    const known = today || dayT.hist; // until the forecast or the history is in, a lone reading isn't a high and low
    state.hi = known ? dayT.hi : null; state.lo = known ? dayT.lo : null;
    state.precip = today ? d0.precipitation ?? null : null;
  }
  function loadTodayHistory(h) {
    const d = new Date().toDateString(); if (histDay === d || !C.weather || !h.callWS) return; histDay = d;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    try {
      Promise.resolve(h.callWS({ type: 'history/history_during_period', start_time: start.toISOString(), entity_ids: [C.weather], minimal_response: false, no_attributes: false, significant_changes_only: false }))
        .then(r => { noteToday(((r && r[C.weather]) || []).map(x => (x.a || x.attributes || {}).temperature)); dayT.hist = dayT.hi != null; todayHiLo(); requestRender(true); })
        .catch(() => { histDay = ''; });
    } catch (e) { histDay = ''; }
  }
  function nextEvent(c) {
    const a = c.attributes; if (!a.start_time) return null;
    const s = new Date(String(a.start_time).replace(' ', 'T')), now = new Date();
    if (s.toDateString() !== now.toDateString() && c.state !== 'on') return null; // only today's
    return { time: a.all_day ? '' : fmt(s.getHours() * 60 + s.getMinutes()), text: a.message || 'Event' };
  }
  function loadShopping(h) {
    try {
      Promise.resolve(h.callWS({ type: 'todo/item/list', entity_id: C.shopping })).then(r => {
        state.house.shop = (r && r.items || []).filter(i => i.status === 'needs_action').map(i => i.summary); requestRender(true);
      }).catch(() => {});
    } catch (e) {}
  }
  // The doorbell (always) or a person at the door (not at night) brings up the Front door page for a minute.
  const prevOn = {};
  const rose = id => { if (!id) return false; const now = isOn(id), was = prevOn[id]; prevOn[id] = now; return was === false && now; };
  function showDoor(ring) {
    const i = PAGES.indexOf('cams'); if (i < 0 || state.ringing) return;
    if (!ring && state.view === 'night') return;
    state.fc = false; state.sheet = false; state.doorUntil = performance.now() + 60000; state.touchAt = performance.now();
    applyView();
    if (state.page !== i) goPage(i); else camTick(true); // the page itself is the notice: no toast over the picture
  }
  function syncFromHass(force) {
    const h = getHass();
    state.connected = !!h;
    if (!h || !alive) return;
    if (!force && h.states === lastStates) return;
    lastStates = h.states;
    const sig = relevantSig(h.states); if (!force && sig === lastSig) return; lastSig = sig;
    const S = h.states;
    // lights
    LIGHTS.forEach(k => {
      if (held('l:' + k)) return;
      const ids = C[k], X = state.lights[k];
      X.n = ids.filter(isOn).length; X.on = X.n > 0; X.avail = ids.some(id => ok(S[id]));
    });
    syncRelays();
    // weather and the sun
    const w = S[C.weather];
    if (w) {
      let [k, name] = COND[w.state] || ['partly', w.state];
      if (w.state === 'cloudy' && w.attributes.cloud_coverage >= 90) { k = 'overcast'; name = 'Overcast'; } // HA has no overcast state
      state.wx = k; state.wxName = name; state.out = w.attributes.temperature ?? null;
      todayHiLo(); loadTodayHistory(h);
      if (fcEntity !== C.weather) subscribeForecast(h);
    }
    const sun = S[C.sun];
    if (sun) {
      const r = todMin(sun.attributes.next_rising ?? (S['sensor.sun_next_rising'] || {}).state), s = todMin(sun.attributes.next_setting ?? (S['sensor.sun_next_setting'] || {}).state);
      if (r != null && s != null && (s - r + DAY) % DAY > 240) state.sun = { rise: r, set: s };
    }
    // alarm
    if (!held('alarm')) {
      const at = S[C.alarmTime], ao = S[C.alarmOn];
      if (at && /^\d+:\d+/.test(at.state)) state.alarm.t = hm(at.state);
      if (ao && ok(ao)) state.alarm.on = ao.state === 'on';
    }
    // alerts: the first one to start stays first; ones already on when the card loads go oldest first
    const keys = C.alerts.filter(a => isOn(a.entity)).map(a => a.entity);
    const kept = state.alertKeys.filter(k => keys.includes(k));
    const fresh = keys.filter(k => !kept.includes(k)).sort((a, b) => Date.parse(S[a].last_changed) - Date.parse(S[b].last_changed));
    state.alertKeys = [...kept, ...fresh];
    state.alerts = state.alertKeys.map(k => C.alerts.find(a => a.entity === k).text || `${S[k].attributes.friendly_name || k} is on`);
    if (state.alerts.length < 2) state.amenu = false;
    state.muted = isOn(C.mute);
    // house
    const H = state.house;
    H.temp = num(C.temperature); H.hum = num(C.humidity); H.door = isOn(C.laundryDoor);
    const pw = num(C.washerPower); H.washer = pw == null ? '' : pw >= C.washerWatts ? 'running' : 'idle';
    H.wet = C.leaks.filter(l => isOn(l.entity)).map(l => l.name || (S[l.entity].attributes.friendly_name || l.entity));
    if (C.shopping) { const n = num(C.shopping); H.shopN = n; if (n !== shopN) { shopN = n; if (n) loadShopping(h); else H.shop = []; } }
    // music
    const mp = S[C.music], M = state.music;
    if (mp) {
      const a = mp.attributes;
      M.st = mp.state; M.title = a.media_title || ''; M.artist = a.media_artist || a.media_album_artist || ''; M.source = a.source || a.app_name || '';
      M.name = a.friendly_name || ''; M.pic = ['playing', 'paused'].includes(mp.state) ? a.entity_picture || '' : '';
      if (!held('mplay')) {
        M.playing = mp.state === 'playing'; M.dur = a.media_duration || 0; M.pos = a.media_position || 0;
        M.posAt = a.media_position_updated_at ? Date.parse(a.media_position_updated_at) : Date.now();
      }
      if (!held('mvol')) M.vol = a.volume_level ?? null;
    }
    // this Echo Show
    const D = state.dev;
    if (!held('bright')) D.bright = num(C.brightness) == null ? null : Math.round(num(C.brightness));
    if (!held('auto') && C.autoBrightness) D.auto = ok(S[C.autoBrightness]) ? isOn(C.autoBrightness) : null;
    if (!held('dnd') && C.dnd) D.dnd = ok(S[C.dnd]) ? isOn(C.dnd) : null;
    const vo = S[C.volume]; if (!held('vol') && vo) { D.vol = num(C.volume) == null ? null : Math.round(num(C.volume)); D.volMax = +vo.attributes.max || 15; }
    const ww = S[C.wakeWord]; if (!held('wake') && ww) { D.wake = ww.state; D.wakeOpts = (ww.attributes.options || []).filter(o => o !== 'None'); }
    // front door
    state.cam.events = C.cameraEvents.map(e => { const s = S[e.entity]; if (!ok(s)) return null; const on = s.state === 'on';
      return { icon: e.icon, name: e.name, on, t: on ? Date.now() : Date.parse(s.last_changed) }; }).filter(Boolean).sort((a, b) => (b.on - a.on) || b.t - a.t);
    const ring = rose(C.doorbell), person = rose(C.person);
    if (ring || person) showDoor(ring);
    const c = S[C.calendar]; state.next = c ? nextEvent(c) : null;
    requestRender(true);
  }

  /* ---------- fill the card ---------- */
  function fit() {
    const W = host.clientWidth || 960, H = host.clientHeight || 480, s = Math.min(W / 960, H / 480) || 1;
    $('#fit').style.transform = `translate(${((W - 960 * s) / 2).toFixed(1)}px, ${((H - 480 * s) / 2).toFixed(1)}px) scale(${s})`;
  }
  const ro = new ResizeObserver(fit);

  /* ---------- the real clock ---------- */
  let lastMinute = -1;
  function setTime(m) {
    const prev = state.m;
    state.m = ((m % DAY) + DAY) % DAY;
    const d = (state.m - prev + DAY) % DAY;
    if (d > 0 && d < 720) { // fire whatever the clock just passed
      const crossed = t => { const k = (t - prev + DAY) % DAY; return k > 0 && k <= d; };
      if (state.nightForced && crossed(schedWake())) state.nightForced = false;
      const today = (new Date().getDay() + 6) % 7; // Monday = 0
      if (state.snoozing && crossed(state.snoozeT)) { state.snoozing = false; ring(); }
      else if (state.alarm.on && state.alarm.days[today] && crossed(state.alarm.t) && (state.m - state.alarm.t + DAY) % DAY < 20) ring();
    }
    if (state.ringing && (state.m - state.ringT + DAY) % DAY >= 20) state.ringing = false; // alarms give up after 20 min
    if (Math.floor(state.m) !== lastMinute) { lastMinute = Math.floor(state.m); requestRender(true); }
    applyView();
  }
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; };
  let pending = false;
  function requestRender() {
    if (pending || !alive) return;
    pending = true; requestAnimationFrame(() => { pending = false; if (alive) drawFrame(); });
  }
  // Every redraw goes through here so the debug readout can show what it costs.
  function drawFrame() {
    const t0 = performance.now(), full = render(), ms = performance.now() - t0;
    if (full) perf.ms = perf.ms ? perf.ms * .7 + ms * .3 : ms;
    perf.busy.push([t0, ms]);
    return full;
  }

  // Live sky: the clouds move on every few seconds (they drift about 20 px a minute, so each step is a pixel or two).
  // Touch comes first: no sky redraw for a few seconds after a tap or swipe, so nothing waits behind a frame.
  // Nothing is drawn in deep night, while the page is hidden or while the Echo's screen is off.
  const TOUCH_HOLD = 3000;
  let liveTimer = 0;
  function liveTick() {
    const quiet = performance.now() - state.touchAt;
    let wait;
    if (quiet < TOUCH_HOLD) wait = TOUCH_HOLD - quiet + 50;
    else {
      if (!document.hidden && screenOn() && !(state.view === 'night' && state.nightAlpha > .99)) { if (staleShown) dissolveRefresh(); else { advanceSky(); drawFrame(); } maybePreRender(); }
      const easing = ['cover', 'wet', 'rain'].some(k => state[k] !== WX[state.wx][k]); // weather changing: smaller, quicker steps
      wait = easing ? Math.max(250, perf.ms * 3) : Math.max(C.skyInterval * 1000, perf.ms * 10);
    }
    if (alive) liveTimer = setTimeout(liveTick, wait);
  }

  // debug: true puts the real cost in the bottom-right corner
  let longObs = null;
  function debugTick() {
    if (!C.debug) return;
    const now = performance.now(); perf.busy = perf.busy.filter(b => now - b[0] < 60000);
    const busy = perf.busy.reduce((s, b) => s + b[1], 0), span = Math.max(1000, Math.min(60000, now - perf.since));
    const el = $('#dbg'); el.hidden = false;
    el.textContent = `${useGL() ? 'webgl' : 'canvas'} ${Math.round(perf.ms)} ms · kept ${Object.keys(frameCache).length} (${perf.pre} ahead) · card CPU ${(busy / span * 100).toFixed(1)}% · ${perf.full} full / ${perf.quick} text-only · page long tasks ${perf.long}, max ${Math.round(perf.longMax)} ms`;
  }

  // for checks from the browser console: document.querySelector(...)._debug in the dashboard
  host._debug = { state, C, PAGES, perf, render, drawFrame, frames: frameCache, preRender, viewKey, kept: () => staleShown, gl: () => useGL() && GLX.name, out: () => outCanvas, today: () => dayT, applyView, sync: () => syncFromHass(true), page: i => goPage(i), act: k => ACTIONS[k](), live: t => { state.liveFreeze = t; if (t != null) sky.t = t; else advanceSky(); frameSig = ''; }, tick: () => { advanceSky(); return drawFrame(); }, skyM };

  /* ---------- start and stop with the card ---------- */
  const fontsReady = Promise.race([Promise.all(['300 200px', '400 22px', '500 28px', '600 32px'].map(f => document.fonts.load(`${f} Figtree`))), new Promise(r => setTimeout(r, 2000))]);
  function start() {
    if (alive) return;
    alive = true; lastStates = null; lastSig = ''; frameSig = ''; perf.since = performance.now();
    state.m = nowMin(); setTime(nowMin()); fit(); syncFromHass(true);
    intervals.push(setInterval(() => setTime(nowMin()), 1000), setInterval(applyView, 500), setInterval(secondTick, 1000), setInterval(debugTick, 1000));
    liveTimer = setTimeout(liveTick, 1000);
    requestAnimationFrame(rainFrame);
    ro.observe(host);
    if (C.debug && !longObs) try { longObs = new PerformanceObserver(l => l.getEntries().forEach(e => { perf.long++; perf.longMax = Math.max(perf.longMax, e.duration); })); longObs.observe({ type: 'longtask' }); } catch (e) { longObs = null; }
    fontsReady.then(() => { frameSig = ''; requestRender(true); });
  }
  function stop() {
    alive = false;
    intervals.splice(0).forEach(clearInterval); clearTimeout(liveTimer); ro.disconnect();
    if (longObs) { longObs.disconnect(); longObs = null; }
    unsubForecast(); fcEntity = '';
  }
  return { setHass(h) { hassRef = h; if (alive) syncFromHass(); }, start, stop };
}

// Card options (YAML) to the names the screen uses. Entity lists may be YAML lists or comma-separated.
const EVENT_ICONS = { bell: '#i-bell', doorbell: '#i-bell', person: '#i-person', motion: '#i-motion', car: '#i-car', vehicle: '#i-car', animal: '#i-paw', pet: '#i-paw' };
function normalize(c) {
  c = c || {};
  const one = x => Array.isArray(x) ? String(x[0] || '') : x == null ? '' : String(x).trim();
  const many = x => (Array.isArray(x) ? x : x == null ? [] : String(x).split(',')).map(v => String(v).trim()).filter(Boolean);
  const dev = one(c.device), vaca = (dom, name) => dev ? `${dom}.vaca_${dev}_${name}` : '';
  const pick = (k, dflt) => c[k] === undefined ? dflt : one(c[k]); // set an option to '' to switch it off
  const alerts = (Array.isArray(c.alerts) ? c.alerts : c.alerts ? [c.alerts] : []).map(a =>
    typeof a === 'string' ? (a.includes('=') ? { entity: a.slice(0, a.indexOf('=')).trim(), text: a.slice(a.indexOf('=') + 1).trim() } : { entity: a.trim(), text: '' })
      : { entity: one(a.entity), text: String(a.text || a.name || '') }).filter(a => a.entity);
  const leaks = (Array.isArray(c.leaks) ? c.leaks : many(c.leaks)).map(l => typeof l === 'string' ? { entity: l, name: '' } : { entity: one(l.entity), name: String(l.name || '') }).filter(l => l.entity);
  const doorbell = one(c.doorbell), person = one(c.person);
  const evs = c.camera_events ? (Array.isArray(c.camera_events) ? c.camera_events : [c.camera_events]) : [
    doorbell && { entity: doorbell, name: 'Doorbell', icon: 'bell' }, person && { entity: person, name: 'Person', icon: 'person' }].filter(Boolean);
  const pages = many(c.pages).length ? many(c.pages).map(p => p === 'cameras' || p === 'camera' || p === 'front_door' ? 'cams' : p) : ['home', 'house', 'music', 'cams', 'settings'];
  return {
    id: one(c.id), device: dev, locale: one(c.locale) || undefined,
    ceiling: many(c.ceiling), lamp: many(c.lamp), hall: many(c.hall), hood: many(c.hood),
    weather: one(c.weather), sun: pick('sun', 'sun.sun'), calendar: one(c.calendar),
    alarmTime: one(c.alarm_time), alarmOn: one(c.alarm_on), bedtime: one(c.bedtime) || '22:30',
    temperature: one(c.temperature), humidity: one(c.humidity), laundryDoor: one(c.laundry_door),
    washerPower: one(c.washer_power), washerWatts: +c.washer_running_watts || 5, leaks, shopping: one(c.shopping),
    music: one(c.music), camera: one(c.camera), cameraName: one(c.camera_name) || 'Doorbell camera',
    cameraRefresh: Math.max(1, +c.camera_refresh || 2), cameraWidth: Math.max(160, +c.camera_width || 640),
    doorbell, person, cameraEvents: evs.map(e => ({ entity: one(e.entity), name: String(e.name || 'Motion'), icon: EVENT_ICONS[e.icon] || '#i-motion' })).filter(e => e.entity),
    alerts, pages,
    mute: pick('mute', vaca('switch', 'mute')), dnd: pick('do_not_disturb', vaca('switch', 'do_not_disturb')),
    autoBrightness: pick('auto_brightness', vaca('switch', 'auto_brightness')), brightness: pick('brightness', vaca('number', 'screen_brightness')),
    volume: pick('volume', vaca('number', 'music_volume')), wakeWord: pick('wake_word', vaca('select', 'wake_word')),
    screen: pick('screen', vaca('switch', 'screen')), debug: !!c.debug, skyInterval: Math.max(2, +c.sky_interval || 6),
    renderer: ['canvas', 'webgl'].includes(one(c.renderer)) ? one(c.renderer) : 'auto',
  };
}

function loadFont() {
  // @font-face doesn't work inside a shadow root, so the font goes on the page itself
  if (document.querySelector('link[data-bedside-sky-font]')) return;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = FONT_URL; l.dataset.bedsideSkyFont = '1';
  document.head.appendChild(l);
}

class BedsideSkyCard extends HTMLElement {
  static getStubConfig(hass) {
    const ids = Object.keys((hass && hass.states) || {});
    const sat = ids.find(i => /^assist_satellite\.vaca_/.test(i));
    return { device: sat ? sat.slice('assist_satellite.vaca_'.length) : '', weather: ids.find(i => i.startsWith('weather.')) || '' };
  }
  setConfig(config) {
    if (!config || typeof config !== 'object') throw new Error('bedside-sky-card: invalid configuration');
    this._config = normalize(config);
    if (this._api) { this._api.stop(); this._api = null; if (this.isConnected) this._mount(); }
  }
  set hass(h) { this._hass = h; if (this._api) this._api.setHass(h); }
  get hass() { return this._hass; }
  connectedCallback() { loadFont(); if (!this._api) this._mount(); else this._api.start(); }
  disconnectedCallback() { if (this._api) this._api.stop(); }
  _mount() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = '<style>' + STYLE + '</style>' + MARKUP;
    this._api = mount(this.shadowRoot, this, this._config || normalize({}));
    if (this._hass) this._api.setHass(this._hass);
    this._api.start();
  }
  getCardSize() { return 9; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
}

if (!customElements.get('bedside-sky-card')) {
  customElements.define('bedside-sky-card', BedsideSkyCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: 'bedside-sky-card', name: 'Bedside Sky', description: 'Bedside clock with a live sky, alarm, forecast, lights, music and the front door, for a 960x480 View Assist screen.', preview: false });
  console.info(`%c BEDSIDE-SKY-CARD %c ${VERSION} `, 'background:#3D7BFF;color:#fff;border-radius:3px 0 0 3px', 'background:#222;color:#fff;border-radius:0 3px 3px 0');
}
})();
