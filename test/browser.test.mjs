/**
 * End-to-end checks that need a real browser: navigator tracking, what the
 * guest sees when the server answers oddly, and form accessibility.
 *
 *   npm i -D playwright && npx playwright install chromium   (once)
 *   NEXT_PUBLIC_RSVP_ENDPOINT=https://rsvp.test/exec npm run build
 *   npm start -- -p 3400 &
 *   PORT=3400 npm run test:browser
 *
 * The endpoint is baked in at build time, which is why it goes on the build
 * command; the submit checks intercept requests to it.
 */
import { chromium, devices } from "playwright";
import assert from "node:assert";

const PORT = process.env.PORT ?? "3400";
const URL = `http://localhost:${PORT}/`;
const ENDPOINT_GLOB = "https://rsvp.test/**";

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

const fails = [];
const check = async (name, fn) => {
  try {
    await fn();
    console.log("  ok  ", name);
  } catch (error) {
    fails.push(`${name}: ${error.message}`);
    console.log("  FAIL", name, "->", error.message);
  }
};

const LABELS = {
  welcome: "Welcome",
  "the-day": "The day",
  rsvp: "RSVP",
  "around-town": "Around town",
};

// ---------------------------------------------------------------------------
console.log("\nPageNav — the lit dot must match the page on screen");
{
  const page = await (
    await browser.newContext({ viewport: { width: 1280, height: 900 } })
  ).newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const activeLabel = () =>
    page.evaluate(
      () =>
        document
          .querySelector("nav button[aria-current]")
          ?.getAttribute("aria-label") ?? null,
    );

  // scroll-behavior is smooth site-wide, so wait for the position to settle
  // rather than guessing at a delay.
  const settle = () =>
    page.evaluate(
      () =>
        new Promise((resolve) => {
          let last = -1;
          let still = 0;
          const step = () => {
            if (window.scrollY === last) {
              if (++still > 3) return resolve(window.scrollY);
            } else {
              still = 0;
              last = window.scrollY;
            }
            requestAnimationFrame(step);
          };
          step();
        }),
    );

  await check("starts on Welcome", async () =>
    assert.equal(await activeLabel(), "Welcome"),
  );

  for (const id of ["the-day", "rsvp", "around-town"]) {
    await check(`scrolling into #${id} activates "${LABELS[id]}"`, async () => {
      await page.evaluate((target) => {
        const el = document.getElementById(target);
        window.scrollTo(0, el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2);
      }, id);
      await settle();
      await page.waitForTimeout(120);
      assert.equal(await activeLabel(), LABELS[id]);
    });
  }

  await check("the bottom of the document activates the last page", async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await settle();
    await page.waitForTimeout(120);
    assert.equal(await activeLabel(), "Around town");
  });

  await check("exactly one dot is ever current", async () =>
    assert.equal(await page.locator("nav button[aria-current]").count(), 1),
  );

  await page.close();
}

// ---------------------------------------------------------------------------
console.log("\nPageNav — creeping down a short viewport, as a thumb does");
{
  // A short viewport makes each page many screens tall, shrinking the visible
  // share of any one of them. An earlier ratio-based implementation stayed on
  // "The day" for the whole of the RSVP page here.
  const page = await (
    await browser.newContext({ viewport: { width: 390, height: 380 } })
  ).newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  const sections = await page.evaluate(() =>
    ["welcome", "the-day", "rsvp", "around-town"].map((id) => ({
      id,
      top: document.getElementById(id).offsetTop,
    })),
  );

  const mismatches = [];
  const height = await page.evaluate(() => document.body.scrollHeight);

  for (let y = 0; y < height; y += 260) {
    await page.evaluate((value) => window.scrollTo({ top: value, behavior: "instant" }), y);
    await page.waitForTimeout(45);

    const lit = await page.evaluate(
      () =>
        document
          .querySelector("nav button[aria-current]")
          ?.getAttribute("aria-label") ?? "NONE",
    );
    const expected = sections.filter((s) => s.top <= y + 190).at(-1)?.id ?? "welcome";
    if (lit !== LABELS[expected]) mismatches.push(`y=${y} lit=${lit} expected=${expected}`);
  }

  await check("the dot never lags a whole page behind", async () =>
    assert.equal(mismatches.length, 0, mismatches.slice(0, 5).join("; ")),
  );

  await page.close();
}

// ---------------------------------------------------------------------------
console.log("\nRSVP submit — what the server says must reach the guest");

const submit = async (fulfil) => {
  const page = await (await browser.newContext({ ...devices["iPhone 13"] })).newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.route(ENDPOINT_GLOB, (route) => route.fulfill(fulfil));

  await page.locator("form").scrollIntoViewIfNeeded();
  await page.fill("form input[type=text]", "Alex & Sam Lee");
  await page.getByText("Joyfully accepts").click();
  await page.waitForTimeout(200);
  await page.getByRole("group", { name: "Attending ceremony?" }).getByText("Yes").click();
  await page.getByRole("group", { name: "Attending reception?" }).getByText("Yes").click();
  await page.getByRole("group", { name: "Any dietary restrictions?" }).getByText("No").click();
  await page.locator("form button[type=submit]").click();
  await page.waitForTimeout(700);

  const body = await page.locator("body").textContent();
  await page.close();
  return body;
};

const json = (value) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(value),
});

await check("a well-formed success shows the confirmation", async () => {
  const body = await submit(json({ ok: true, data: { attending: "accepts" } }));
  assert.ok(/See you there/.test(body), "expected the confirmation");
});

await check("a 200 with an unexpected body is not a success", async () => {
  const body = await submit(json({ unexpected: "shape" }));
  assert.ok(!/See you there/.test(body), "junk must not confirm");
  assert.ok(/went wrong/.test(body), "expected a visible error, got silence");
});

await check("a bare {ok:true} with no data is not a success", async () => {
  // A stale deployment or the wrong URL can answer this. Thanking a guest for
  // a reply nobody recorded is worse than showing an error.
  const body = await submit(json({ ok: true }));
  assert.ok(!/See you there|Thank you for telling us/.test(body), "confirmed a reply that was never recorded");
  assert.ok(/went wrong/.test(body));
});

await check("an HTML error page is not a success", async () => {
  const body = await submit({ status: 200, contentType: "text/html", body: "<html>nope</html>" });
  assert.ok(!/See you there/.test(body));
  assert.ok(/went wrong/.test(body));
});

await check("a server rejection shows the server's own message", async () => {
  const body = await submit(
    json({ ok: false, error: "RATE_LIMITED", message: "We already have that — thank you!" }),
  );
  assert.ok(/already have that/.test(body));
});

// ---------------------------------------------------------------------------
console.log("\nOlder iOS Safari — AbortSignal.timeout does not exist there");
{
  const context = await browser.newContext({ ...devices["iPhone 13"] });
  await context.addInitScript(() => {
    delete AbortSignal.timeout;
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.route(ENDPOINT_GLOB, (route) =>
    route.fulfill(json({ ok: true, data: { attending: "accepts" } })),
  );

  await page.locator("form").scrollIntoViewIfNeeded();
  await page.fill("form input[type=text]", "Alex & Sam Lee");
  await page.getByText("Joyfully accepts").click();
  await page.waitForTimeout(200);
  await page.getByRole("group", { name: "Attending ceremony?" }).getByText("Yes").click();
  await page.getByRole("group", { name: "Attending reception?" }).getByText("Yes").click();
  await page.getByRole("group", { name: "Any dietary restrictions?" }).getByText("No").click();
  await page.locator("form button[type=submit]").click();
  await page.waitForTimeout(800);

  const body = await page.locator("body").textContent();
  await check("a guest on iOS 15 can still submit", async () => {
    assert.ok(/See you there/.test(body), `got: ${body.slice(0, 160)}`);
    assert.equal(pageErrors.length, 0, pageErrors.join(", "));
  });

  await page.close();
}

// ---------------------------------------------------------------------------
console.log("\nA browser with no AbortSignal at all");
{
  // Older than the polyfill's own target. Whatever happens, the guest must
  // never be left on a disabled "Sending" button with no way to retry.
  const context = await browser.newContext({ ...devices["iPhone 13"] });
  await context.addInitScript(() => {
    delete window.AbortSignal;
    delete window.AbortController;
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.route(ENDPOINT_GLOB, (route) =>
    route.fulfill(json({ ok: true, data: { attending: "declines" } })),
  );

  await page.locator("form").scrollIntoViewIfNeeded();
  await page.fill("form input[type=text]", "Alex & Sam Lee");
  await page.getByText("Regretfully declines").click();
  await page.locator("form button[type=submit]").click();
  await page.waitForTimeout(900);

  const button = page.locator("form button[type=submit]");

  await check("the button recovers instead of latching on Sending", async () => {
    assert.equal((await button.textContent()).trim(), "Submit");
    assert.equal(await button.isDisabled(), false);
  });

  await check("the guest is told something went wrong", async () => {
    assert.ok(/went wrong|could not reach/.test(await page.locator("form").textContent()));
  });

  await check("and can try again", async () => {
    await button.click();
    await page.waitForTimeout(600);
    assert.equal(await button.isDisabled(), false, "a retry re-latched the guard");
  });

  await page.close();
}

// ---------------------------------------------------------------------------
console.log("\nForm — accessibility, and parity with the backend's rules");
{
  const page = await (await browser.newContext({ ...devices["iPhone 13"] })).newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.locator("form").scrollIntoViewIfNeeded();

  await check("a one-character name is caught here, as the backend would", async () => {
    await page.fill("form input[type=text]", "A");
    await page.locator("form button[type=submit]").click();
    await page.waitForTimeout(300);
    const shown = await page.locator("form p:not([hidden])").allTextContents();
    assert.ok(shown.some((t) => /who you are/.test(t)));
  });

  await check("radio-group errors are announced, not just drawn", async () => {
    const linked = await page.evaluate(() => {
      const fieldset = [...document.querySelectorAll("fieldset")].find((f) =>
        f.querySelector("legend")?.textContent?.includes("attending our wedding"),
      );
      const id = fieldset.getAttribute("aria-describedby");
      return {
        id,
        text: id ? document.getElementById(id)?.textContent : null,
        invalid: fieldset.getAttribute("aria-invalid"),
      };
    });
    assert.ok(linked.id, "fieldset has no aria-describedby");
    assert.ok(/join us/.test(linked.text || ""), `points at "${linked.text}"`);
    assert.equal(linked.invalid, "true");
  });

  await check("focusing a visually hidden radio outlines its visible bar", async () => {
    await page.evaluate(() => document.querySelector("fieldset input[type=radio]").focus());
    const outline = await page.evaluate(
      () => getComputedStyle(document.querySelector("fieldset label")).outlineStyle,
    );
    assert.notEqual(outline, "none");
  });

  await page.close();
}

// ---------------------------------------------------------------------------
console.log("\nLayout — nothing may push the page sideways");
{
  for (const [name, viewport] of [
    ["iPhone SE", { width: 320, height: 568 }],
    ["iPhone 13", { width: 390, height: 844 }],
    ["landscape", { width: 844, height: 390 }],
  ]) {
    const page = await (await browser.newContext({ viewport })).newPage();
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    await check(`no horizontal overflow at ${name} (${viewport.width}px)`, async () =>
      assert.ok(overflow <= 1, `overflows by ${overflow}px`),
    );
    await page.close();
  }
}

// ---------------------------------------------------------------------------
console.log("\nFilmstrips — indicate only where they actually scroll");
{
  // Column widths round a few pixels past the container at the grid
  // breakpoint, which once left a dead "Swipe for more" under a desktop grid.
  for (const [width, shouldSwipe] of [
    [1280, false],
    [1024, false],
    [768, false],
    [767, true],
    [390, true],
  ]) {
    const page = await (
      await browser.newContext({ viewport: { width, height: 900 } })
    ).newPage();
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 500));
    });
    await page.waitForTimeout(1200);

    const hints = await page.evaluate(
      () =>
        [...document.querySelectorAll("p")].filter(
          (p) => p.textContent === "Swipe for more",
        ).length,
    );

    await check(
      `${width}px shows ${shouldSwipe ? "both" : "no"} swipe hints`,
      async () => assert.equal(hints, shouldSwipe ? 2 : 0),
    );
    await page.close();
  }
}

// ---------------------------------------------------------------------------
console.log("\nGallery photographs");
{
  const page = await (await browser.newContext({ ...devices["iPhone 13"] })).newPage();
  const failed = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && /image/.test(r.url())) failed.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.locator('ul[aria-label="Photographs of Dan and Tien"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  await check("every frame loads and is described", async () => {
    const frames = await page.evaluate(() =>
      [...document.querySelectorAll('ul[aria-label="Photographs of Dan and Tien"] img')].map(
        (img) => ({ w: img.naturalWidth, alt: img.alt }),
      ),
    );
    assert.equal(frames.length, 3);
    frames.forEach((f, i) => {
      assert.ok(f.w > 0, `frame ${i + 1} did not decode`);
      assert.ok(f.alt.length > 10, `frame ${i + 1} needs real alt text`);
    });
    assert.equal(failed.length, 0, failed.join(", "));
  });

  await check("frames keep the comp's 215x279 ratio", async () => {
    const ratio = await page.evaluate(() => {
      const box = document
        .querySelector('ul[aria-label="Photographs of Dan and Tien"] img')
        .parentElement.getBoundingClientRect();
      return box.width / box.height;
    });
    assert.ok(Math.abs(ratio - 215 / 279) < 0.01, `ratio ${ratio.toFixed(3)}, comp is 0.771`);
  });

  await page.close();
}

{
  // The comps are a 1087px-wide design, so the grid proportions are checked at
  // that width. Phones use a tighter gap so the next frame still peeks.
  const page = await (
    await browser.newContext({ viewport: { width: 1087, height: 900 } })
  ).newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.locator('ul[aria-label="Photographs of Dan and Tien"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  const geometry = await page.evaluate(() => {
    const li = [...document.querySelectorAll('ul[aria-label="Photographs of Dan and Tien"] li')];
    const rects = li.map((el) => el.getBoundingClientRect());
    return {
      width: rects[0].width,
      gap: rects[1].left - rects[0].right,
      row: rects[2].right - rects[0].left,
    };
  });

  // Comp: three 215px frames, 93px apart, spanning 829 of 1087px.
  await check("frame width matches the comp", async () =>
    assert.ok(Math.abs(geometry.width - 215) < 8, `${geometry.width.toFixed(0)}px vs 215px`),
  );
  await check("gap matches the comp", async () =>
    assert.ok(Math.abs(geometry.gap - 93) < 8, `${geometry.gap.toFixed(0)}px vs 93px`),
  );
  await check("the row spans what the comp's row spans", async () =>
    assert.ok(Math.abs(geometry.row - 829) < 16, `${geometry.row.toFixed(0)}px vs 829px`),
  );

  await page.close();
}

// ---------------------------------------------------------------------------
console.log("\nSchedule illustrations");
{
  const page = await (await browser.newContext({ viewport: { width: 1087, height: 900 } })).newPage();
  const failed = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && /icons/.test(r.url())) failed.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.locator("#the-day-heading").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);

  const drawn = await page.evaluate(() =>
    [...document.querySelectorAll("ol li img")].map((i) => ({
      w: Math.round(i.getBoundingClientRect().width),
      h: Math.round(i.getBoundingClientRect().height),
      loaded: i.naturalWidth > 0,
    })),
  );

  await check("all six illustrations load", async () => {
    assert.equal(drawn.length, 6, `found ${drawn.length}`);
    drawn.forEach((d, i) => assert.ok(d.loaded, `illustration ${i + 1} did not load`));
    assert.equal(failed.length, 0, failed.join(", "));
  });

  await check("they keep the comp's proportions to one another", async () => {
    // Comp artwork, in order: rings 66x37, camera 85x57, fountain 62x66,
    // glasses 82x72, table 80x67, car 73x74. Only the ratios are pinned, since
    // the whole set scales with --icon-unit.
    const comp = [66 / 37, 85 / 57, 62 / 66, 82 / 72, 80 / 67, 73 / 74];
    drawn.forEach((d, i) => {
      const ratio = d.w / d.h;
      assert.ok(
        Math.abs(ratio - comp[i]) < 0.08,
        `illustration ${i + 1} is ${ratio.toFixed(2)}, comp is ${comp[i].toFixed(2)}`,
      );
    });
  });

  await page.close();
}

// ---------------------------------------------------------------------------
console.log("\nAdversarial form use");
{
  // A deliberately slow server, so the in-flight window is wide enough to poke.
  const open = async () => {
    const page = await (await browser.newContext({ ...devices["iPhone 13"] })).newPage();
    await page.goto(URL, { waitUntil: "networkidle" });
    const sent = [];
    await page.route(ENDPOINT_GLOB, async (route) => {
      sent.push(JSON.parse(route.request().postData()));
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill(json({ ok: true, data: { attending: "accepts" } }));
    });
    await page.locator("form").scrollIntoViewIfNeeded();
    return { page, sent };
  };

  const answer = async (page, group, value) =>
    page.getByRole("group", { name: group }).getByText(value).click();

  await check("hammering submit sends exactly one reply", async () => {
    const { page, sent } = await open();
    await page.fill("form input[type=text]", "Alex & Sam Lee");
    await page.getByText("Regretfully declines").click();
    // Raw clicks, so the guard is exercised rather than waited on: taps in the
    // same tick all read the pre-render value of React state.
    await page.evaluate(() => {
      const button = document.querySelector("form button[type=submit]");
      for (let i = 0; i < 5; i++) {
        button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
    });
    await page.waitForTimeout(1500);
    assert.equal(sent.length, 1, `sent ${sent.length} replies`);
    await page.close();
  });

  await check("declining sends nulls, never stale answers", async () => {
    const { page, sent } = await open();
    await page.fill("form input[type=text]", "Jo Park");
    await page.getByText("Joyfully accepts").click();
    await page.waitForTimeout(150);
    await answer(page, "Attending ceremony?", "Yes");
    await answer(page, "Attending reception?", "Yes");
    await answer(page, "Any dietary restrictions?", "Yes");
    await page.waitForTimeout(150);
    await page.locator("form input[type=text]").last().fill("No shellfish");
    await page.getByText("Regretfully declines").click();
    await page.waitForTimeout(150);
    await page.locator("form button[type=submit]").click();
    await page.waitForTimeout(900);

    assert.equal(sent[0].attending, "declines");
    for (const key of ["ceremony", "reception", "dietaryRestrictions"]) {
      assert.equal(sent[0][key], null, `${key} should be null`);
    }
    assert.equal(sent[0].dietaryNotes, "", "a stale note rode along with a decline");
    await page.close();
  });

  await check("switching dietary back to No drops the note already typed", async () => {
    const { page, sent } = await open();
    await page.fill("form input[type=text]", "Sam Lee");
    await page.getByText("Joyfully accepts").click();
    await page.waitForTimeout(150);
    await answer(page, "Attending ceremony?", "Yes");
    await answer(page, "Attending reception?", "No");
    await answer(page, "Any dietary restrictions?", "Yes");
    await page.waitForTimeout(150);
    await page.locator("form input[type=text]").last().fill("Peanuts");
    await answer(page, "Any dietary restrictions?", "No");
    await page.waitForTimeout(150);
    await page.locator("form button[type=submit]").click();
    await page.waitForTimeout(900);

    assert.equal(sent[0].dietaryRestrictions, false);
    assert.equal(sent[0].dietaryNotes, "");
    await page.close();
  });

  await check("a very long name is capped before it is sent", async () => {
    const { page, sent } = await open();
    await page.fill("form input[type=text]", "N".repeat(5000));
    await page.getByText("Regretfully declines").click();
    await page.locator("form button[type=submit]").click();
    await page.waitForTimeout(900);
    assert.ok(sent[0].names.length <= 200, `sent ${sent[0].names.length} characters`);
    await page.close();
  });
}

await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED:\n${fails.join("\n")}` : "\nbrowser: all checks passed");
process.exit(fails.length ? 1 : 0);
