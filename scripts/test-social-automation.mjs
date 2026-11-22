// ==============================================================================
// ASRA3.COM — Automated Tests for Social Cadence, Media Security & Carousel QA
// Run: node --test scripts/test-social-automation.mjs
// ==============================================================================

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");

import * as cadence from "../src/lib/social-cadence.ts";

test("isValidSocialMediaFilename & safeDecodeSocialMediaFilename block traversal, bad extensions & malformed URIs", () => {
  assert.equal(cadence.isValidSocialMediaFilename("pin2-slide-01.jpg"), true);
  assert.equal(cadence.isValidSocialMediaFilename("pin1-v7-live-jobs.mp4"), true);
  assert.equal(cadence.isValidSocialMediaFilename("hero_banner.PNG"), true);

  // Path traversal & dangerous inputs
  assert.equal(cadence.isValidSocialMediaFilename(""), false);
  assert.equal(cadence.isValidSocialMediaFilename("../.env"), false);
  assert.equal(cadence.isValidSocialMediaFilename("..%2f.env"), false);
  assert.equal(cadence.isValidSocialMediaFilename("sub/dir.jpg"), false);
  assert.equal(cadence.isValidSocialMediaFilename("sub\\dir.jpg"), false);
  assert.equal(cadence.isValidSocialMediaFilename(".hidden.jpg"), false);
  assert.equal(cadence.isValidSocialMediaFilename("secret.json"), false);
  assert.equal(cadence.isValidSocialMediaFilename("payload.svg"), false);
  assert.equal(cadence.isValidSocialMediaFilename("a".repeat(130) + ".jpg"), false);

  // Safe URI decoding (must never throw URIError -> 500)
  assert.equal(cadence.safeDecodeSocialMediaFilename("pin2-slide-01.jpg"), "pin2-slide-01.jpg");
  assert.equal(cadence.safeDecodeSocialMediaFilename("%ZZ"), null);
  assert.equal(cadence.safeDecodeSocialMediaFilename("%E0%A4%A"), null);
  assert.equal(cadence.safeDecodeSocialMediaFilename("%2e%2e%2f.env"), null);
  assert.equal(cadence.safeDecodeSocialMediaFilename("..%2Fsecret.jpg"), null);
});

test("parseByteRange follows RFC 9110 clamping and rejects unsatisfiable ranges", () => {
  // Normal bounded range
  assert.deepEqual(cadence.parseByteRange("bytes=0-1023", 5000), { start: 0, end: 1023 });
  // Oversized end must clamp to totalSize - 1 (RFC 9110 §14.1.2)
  assert.deepEqual(cadence.parseByteRange("bytes=0-99999999", 117468), { start: 0, end: 117467 });
  // Open-ended range
  assert.deepEqual(cadence.parseByteRange("bytes=500-", 1000), { start: 500, end: 999 });
  // Suffix ranges
  assert.deepEqual(cadence.parseByteRange("bytes=-200", 1000), { start: 800, end: 999 });
  assert.deepEqual(cadence.parseByteRange("bytes=-99999999", 1000), { start: 0, end: 999 });

  // Unsatisfiable / malformed ranges -> null (416)
  assert.equal(cadence.parseByteRange("bytes=-0", 1000), null);
  assert.equal(cadence.parseByteRange("bytes=1000-", 1000), null);
  assert.equal(cadence.parseByteRange("bytes=500-100", 1000), null);
  assert.equal(cadence.parseByteRange("bytes=-", 1000), null);
  assert.equal(cadence.parseByteRange("items=0-10", 1000), null);
  assert.equal(cadence.parseByteRange("bytes=0-10", 0), null);
});

test("getSocialMediaContentType maps extensions accurately", () => {
  assert.equal(cadence.getSocialMediaContentType("a.mp4"), "video/mp4");
  assert.equal(cadence.getSocialMediaContentType("a.PNG"), "image/png");
  assert.equal(cadence.getSocialMediaContentType("a.jpg"), "image/jpeg");
  assert.equal(cadence.getSocialMediaContentType("a.jpeg"), "image/jpeg");
});

test("GST clock & Gulf peak slot classification across all 24 hours", () => {
  // 04:00 UTC -> 08:00 GST -> morning
  const morning = cadence.getGstClock(new Date("2026-11-22T04:00:00Z"));
  assert.equal(morning.gstDateKey, "2026-11-22");
  assert.equal(morning.gstHour, 8);
  assert.equal(cadence.getGulfPeakSlot(morning.gstHour), "morning");

  // 21:00 UTC -> 01:00 GST next day -> null (asleep)
  const rollover = cadence.getGstClock(new Date("2026-11-22T21:00:00Z"));
  assert.equal(rollover.gstDateKey, "2026-11-23");
  assert.equal(rollover.gstHour, 1);
  assert.equal(cadence.getGulfPeakSlot(rollover.gstHour), null);

  // Verify EVERY possible 4-hour schedule offset (0, 1, 2, 3) hits all 3 slots once per day!
  for (let offset = 0; offset < 4; offset++) {
    const slotsHit = new Set();
    for (let h = offset; h < 24; h += 4) {
      const slot = cadence.getGulfPeakSlot(h);
      if (slot) slotsHit.add(slot);
    }
    assert.deepEqual(
      Array.from(slotsHit).sort(),
      ["evening", "midday", "morning"],
      `4h offset ${offset} must hit morning, midday, and evening`
    );
  }
});

test("evaluateInstagramEligibility enforces daily cap, slot dedupe, peak window & spacing", () => {
  const morningUtc = new Date("2026-11-22T04:30:00Z"); // 08:30 GST (morning)
  const sleepUtc = new Date("2026-11-22T00:30:00Z"); // 04:30 GST (off-peak)

  // Fresh morning run -> eligible
  const ok = cadence.evaluateInstagramEligibility({
    now: morningUtc,
    dailyCap: 3,
    publishedTodayGst: 0,
    slotsUsedToday: [],
    lastIgPostedAt: null,
  });
  assert.equal(ok.eligible_now, true);
  assert.equal(ok.peak_slot, "morning");
  assert.equal(ok.remaining_today, 3);

  // Sleeping hours -> rejected
  const sleep = cadence.evaluateInstagramEligibility({
    now: sleepUtc,
    dailyCap: 3,
    publishedTodayGst: 0,
  });
  assert.equal(sleep.eligible_now, false);
  assert.equal(sleep.skip_reason, "outside_gulf_peak_hours");

  // Cap = 0 -> paused
  const paused = cadence.evaluateInstagramEligibility({
    now: morningUtc,
    dailyCap: 0,
    publishedTodayGst: 0,
  });
  assert.equal(paused.eligible_now, false);
  assert.equal(paused.skip_reason, "daily_cap_zero");

  // Daily cap reached (3/3) -> rejected
  const capped = cadence.evaluateInstagramEligibility({
    now: morningUtc,
    dailyCap: 3,
    publishedTodayGst: 3,
  });
  assert.equal(capped.eligible_now, false);
  assert.equal(capped.skip_reason, "daily_cap_reached");
  assert.equal(capped.remaining_today, 0);

  // Same peak slot already used -> rejected
  const dupSlot = cadence.evaluateInstagramEligibility({
    now: morningUtc,
    dailyCap: 3,
    publishedTodayGst: 1,
    slotsUsedToday: ["morning"],
  });
  assert.equal(dupSlot.eligible_now, false);
  assert.equal(dupSlot.skip_reason, "peak_slot_morning_already_used");

  // Spacing < 3.5h -> rejected
  const tooSoon = cadence.evaluateInstagramEligibility({
    now: new Date("2026-11-22T08:00:00Z"), // 12:00 GST (midday)
    dailyCap: 3,
    publishedTodayGst: 1,
    slotsUsedToday: ["morning"],
    lastIgPostedAt: "2026-11-22T06:00:00Z", // only 2h ago
  });
  assert.equal(tooSoon.eligible_now, false);
  assert.equal(tooSoon.skip_reason, "min_spacing_guard");

  // Spacing >= 3.5h -> allowed
  const spacedOk = cadence.evaluateInstagramEligibility({
    now: new Date("2026-11-22T08:00:00Z"), // 12:00 GST (midday)
    dailyCap: 3,
    publishedTodayGst: 1,
    slotsUsedToday: ["morning"],
    lastIgPostedAt: "2026-11-22T04:00:00Z", // 4h ago
  });
  assert.equal(spacedOk.eligible_now, true);
  assert.equal(spacedOk.peak_slot, "midday");
});

test("formatBilingualJobTitle & buildInstagramReelCaption deduplicate titles, strip URLs, format salary & keep 4-6 hashtags", () => {
  // Harvester pattern where titleAr already embeds titleEn -> must NOT duplicate "| English"
  assert.equal(
    cadence.formatBilingualJobTitle(
      "Arabic Speaking Office Manager — الموارد البشرية والإدارة",
      "Arabic Speaking Office Manager"
    ),
    "Arabic Speaking Office Manager — الموارد البشرية والإدارة"
  );
  assert.equal(
    cadence.formatBilingualJobTitle("مدير مالي أول", "Senior Finance Manager"),
    "مدير مالي أول | Senior Finance Manager"
  );

  const caption = cadence.buildInstagramReelCaption({
    countryCode: "AE",
    countryNameAr: "الإمارات العربية المتحدة",
    cityNameAr: "دبي",
    titleAr: "Title: Senior Finance Manager — المالية https://spam.example.com",
    titleEn: "Title: Senior Finance Manager",
    companyName: "Emaar Properties www.emaar.com",
    salaryMin: 24000,
    salaryMax: 32000,
    salaryCurrency: "AED",
    commentKeyword: "دبي",
  });

  assert.equal(/https?:\/\//i.test(caption), false, "IG caption must NOT contain http(s) URLs");
  assert.equal(/\bwww\./i.test(caption), false, "IG caption must NOT contain www URLs");
  assert.equal(/title\s*:/i.test(caption), false, "Title: prefix should be stripped");
  assert.equal(
    (caption.match(/Senior Finance Manager/g) || []).length,
    1,
    "Embedded English title must appear once, not duplicated"
  );
  assert.match(caption, /دبي/);
  assert.match(caption, /24,000 – 32,000 AED/);
  assert.match(caption, /البايو/);

  // Equal min/max salary should not repeat "18,000 – 18,000"
  const flatSalaryCap = cadence.buildInstagramReelCaption({
    countryCode: "SA",
    countryNameAr: "السعودية",
    cityNameAr: "الرياض",
    titleAr: "مهندس برمجيات",
    titleEn: "Software Engineer",
    companyName: "Tech Corp",
    salaryMin: 18000,
    salaryMax: 18000,
    salaryCurrency: "SAR",
    commentKeyword: "الرياض",
  });
  assert.match(flatSalaryCap, /18,000 SAR/);
  assert.equal(flatSalaryCap.includes("18,000 – 18,000"), false);

  const tags = caption.match(/#[^\s#]+/g) || [];
  assert.ok(tags.length >= 4 && tags.length <= 6, `Expected 4–6 hashtags, got ${tags.length}`);
  assert.equal(tags.includes("#fyp"), false);
  assert.equal(tags.includes("#viral"), false);
});

test("Pin #2 rendered carousel slides exist with exact 1080x1350 JPEG format", () => {
  const dir = path.join(ROOT, "video-studio/out/carousels/pin2-asra3-guide");
  for (let i = 1; i <= 7; i++) {
    const file = path.join(dir, `pin2-slide-${String(i).padStart(2, "0")}.jpg`);
    assert.ok(fs.existsSync(file), `Missing ${file}`);
    const buf = fs.readFileSync(file);
    assert.ok(buf.byteLength > 20_000, `Slide ${i} JPEG unexpectedly small`);
    // JPEG SOI magic bytes 0xFF 0xD8
    assert.equal(buf[0], 0xff);
    assert.equal(buf[1], 0xd8);

    const probe = JSON.parse(
      execFileSync(
        "ffprobe",
        ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,codec_name", "-of", "json", file],
        { encoding: "utf8" }
      )
    );
    assert.equal(probe.streams[0].width, 1080);
    assert.equal(probe.streams[0].height, 1350);
    assert.equal(probe.streams[0].codec_name, "mjpeg");
  }
});

test("Sanitized n8n workflow template has 4h cadence, hardened IG branch, and zero leaked secrets", () => {
  const wfPath = path.join(ROOT, "n8n-workflows/asra3-jobs-facebook-autopilot.json");
  const raw = fs.readFileSync(wfPath, "utf8");
  assert.equal(/EAA[A-Za-z0-9]{20,}/.test(raw), false, "Must NEVER contain raw Meta access tokens!");

  const wf = JSON.parse(raw);
  const cfg = wf.nodes.find((n) => n.name === "configCredentials");
  const assignments = Object.fromEntries(
    (cfg?.parameters?.assignments?.assignments || []).map((a) => [a.name, a.value])
  );
  assert.equal(assignments.webhookSecret, "YOUR_N8N_WEBHOOK_SECRET_OR_ADMIN_PASSCODE");
  assert.equal(assignments.facebookPageId, "YOUR_FACEBOOK_PAGE_ID");
  assert.equal(assignments.facebookPageAccessToken, "YOUR_FACEBOOK_PAGE_ACCESS_TOKEN");
  assert.equal(assignments.instagramAccountId, "YOUR_INSTAGRAM_BUSINESS_ACCOUNT_ID");
  assert.equal(assignments.instagramAccessToken, "YOUR_INSTAGRAM_ACCESS_TOKEN");

  // If .env.local exists on this machine, verify NONE of its live secret values leaked into the template
  const envLocalPath = path.join(ROOT, ".env.local");
  if (fs.existsSync(envLocalPath)) {
    for (const line of fs.readFileSync(envLocalPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^(N8N_WEBHOOK_SECRET|FACEBOOK_PAGE_ACCESS_TOKEN|INSTAGRAM_ACCESS_TOKEN|ADMIN_PASSCODE|SUPABASE_SERVICE_ROLE_KEY)=(.+)$/);
      if (m) {
        const val = m[2].replace(/^['"]|['"]$/g, "").trim();
        if (val.length >= 6) {
          assert.equal(raw.includes(val), false, `Live secret ${m[1]} leaked into n8n template!`);
        }
      }
    }
  }

  const sched = wf.nodes.find((n) => n.id === "schedule-3h");
  assert.equal(sched.parameters.rule.interval[0].hoursInterval, 4, "Schedule interval must be tuned to 4h");

  const byName = Object.fromEntries(wf.nodes.map((n) => [n.name, n]));
  for (const required of [
    "evaluateInstagramGate",
    "ifPublishInstagram",
    "igCreateReelContainer",
    "igPreparePoll",
    "waitIgProcessing",
    "igCheckContainerStatus",
    "igEvaluatePoll",
    "igPublishReel",
    "igRecordPublished",
    "markJobPosted",
  ]) {
    assert.ok(byName[required], `Missing required n8n node: ${required}`);
  }

  // Hardening invariants on n8n nodes
  assert.equal(byName.postFirstCommentLink.alwaysOutputData, true);
  assert.equal(byName.markJobPosted.retryOnFail, true);
  assert.ok(byName.markJobPosted.maxTries >= 3);
  assert.ok((byName.igPublishReel.parameters.options?.timeout || 0) >= 60000);

  for (const codeNodeName of ["igPreparePoll", "igEvaluatePoll", "igRecordPublished"]) {
    const code = byName[codeNodeName].parameters.jsCode || "";
    assert.equal(
      /\$json\./.test(code),
      false,
      `${codeNodeName} must use $input.first()?.json instead of bare $json in runOnceForAllItems mode`
    );
  }
  assert.match(byName.igEvaluatePoll.parameters.jsCode, /\$runIndex/);
  assert.match(byName.igEvaluatePoll.parameters.jsCode, /PUBLISHED/);
  assert.match(byName.igRecordPublished.parameters.jsCode, /ig_count_today/);
});
