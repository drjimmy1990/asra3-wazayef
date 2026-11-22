// ==============================================================================
// ASRA3.COM — Foundation Pins Publisher (Instagram @asra3_jobs + Facebook Page)
// Publishes:
//   1) Optional live automated Job Reel smoke test on IG (before pins so Row 1 stays clean!)
//   2) Pin #3: Hero Offer & Exclusion Shield Reel (Video #8 — ASRA3VIP 20% OFF)
//   3) Pin #2: 7-Slide Obsidian-Gold 1080x1350 Guide Carousel
//   4) Pin #1: Hero Welcome Reel (Video #7 — Live Verified GCC Jobs Board)
// On Instagram, publishing in order [Job Test -> Pin 3 -> Pin 2 -> Pin 1] places
// the 3 Foundation Pins cleanly across Top Row 1 even before manual 1-tap pinning!
//
// Usage:
//   node scripts/publish-foundation-pins.mjs --dry-run
//   node scripts/publish-foundation-pins.mjs --publish [--include-job-reel-test]
// ==============================================================================

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const GRAPH = "https://graph.facebook.com/v21.0";
const SITE_URL = "https://asra3.com";
const EXISTING_FB_PIN1_REEL_ID = "1182872014308145";

function loadEnvLocal() {
  const env = {};
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env.local with Meta credentials");
  }
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, "").trim();
  }
  return env;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function graphRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${GRAPH}${endpoint}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok || json.error) {
    throw new Error(`Meta API error (${res.status}) on ${url}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function waitForIgContainer(creationId, igToken, label, maxAttempts = 20, intervalMs = 6000) {
  for (let i = 1; i <= maxAttempts; i++) {
    await sleep(intervalMs);
    const st = await graphRequest(
      `/${creationId}?fields=status_code,status&access_token=${encodeURIComponent(igToken)}`
    );
    const code = String(st.status_code || "").toUpperCase();
    console.log(`  [IG poll ${label} #${i}/${maxAttempts}] status_code=${code}${st.status ? ` (${st.status})` : ""}`);
    if (code === "FINISHED") return st;
    if (code === "ERROR" || code === "EXPIRED") {
      throw new Error(`IG container ${creationId} (${label}) failed: ${JSON.stringify(st)}`);
    }
  }
  throw new Error(`IG container ${creationId} (${label}) timed out waiting for FINISHED`);
}

async function fetchIgPermalink(mediaId, igToken) {
  try {
    const d = await graphRequest(
      `/${mediaId}?fields=id,permalink,media_type,media_product_type,timestamp&access_token=${encodeURIComponent(igToken)}`
    );
    return d.permalink || null;
  } catch {
    return null;
  }
}

async function publishIgReel({ igId, igToken, videoUrl, caption, label }) {
  console.log(`\n[IG Reel] Creating container for ${label} -> ${videoUrl}`);
  const created = await graphRequest(`/${igId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      media_type: "REELS",
      video_url: videoUrl,
      caption,
      share_to_feed: true,
      access_token: igToken,
    }),
  });
  await waitForIgContainer(created.id, igToken, label, 24, 6000);
  const published = await graphRequest(`/${igId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: created.id,
      access_token: igToken,
    }),
  });
  const permalink = await fetchIgPermalink(published.id, igToken);
  console.log(`  [IG Reel OK] ${label}: id=${published.id} permalink=${permalink}`);
  return { id: published.id, creation_id: created.id, permalink };
}

async function publishIgCarousel({ igId, igToken, imageUrls, caption, label }) {
  console.log(`\n[IG Carousel] Creating ${imageUrls.length} child containers for ${label}...`);
  const childIds = [];
  for (let i = 0; i < imageUrls.length; i++) {
    const imgUrl = imageUrls[i];
    const child = await graphRequest(`/${igId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imgUrl,
        is_carousel_item: true,
        access_token: igToken,
      }),
    });
    console.log(`  [IG Slide ${i + 1}/${imageUrls.length}] child_id=${child.id}`);
    childIds.push(child.id);
    await sleep(1200);
  }

  console.log(`  [IG Carousel] Creating parent container (${childIds.length} slides)...`);
  const parent = await graphRequest(`/${igId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      media_type: "CAROUSEL",
      children: childIds.join(","),
      caption,
      access_token: igToken,
    }),
  });

  await waitForIgContainer(parent.id, igToken, label, 15, 4000);

  const published = await graphRequest(`/${igId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: parent.id,
      access_token: igToken,
    }),
  });
  const permalink = await fetchIgPermalink(published.id, igToken);
  console.log(`  [IG Carousel OK] ${label}: id=${published.id} permalink=${permalink}`);
  return { id: published.id, creation_id: parent.id, child_ids: childIds, permalink };
}

async function publishFbReel({ fbId, fbToken, videoUrl, description, firstComment, label }) {
  console.log(`\n[FB Reel] Starting 3-phase upload for ${label} -> ${videoUrl}`);
  const started = await graphRequest(`/${fbId}/video_reels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upload_phase: "start", access_token: fbToken }),
  });

  await graphRequest(started.upload_url, {
    method: "POST",
    headers: {
      Authorization: `OAuth ${fbToken}`,
      file_url: videoUrl,
    },
  });

  const finished = await graphRequest(`/${fbId}/video_reels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      upload_phase: "finish",
      video_id: started.video_id,
      video_state: "PUBLISHED",
      description,
      access_token: fbToken,
    }),
  });

  console.log(`  [FB Reel Published] video_id=${started.video_id} post_id=${finished.post_id || "n/a"}, waiting 25s for comment...`);
  await sleep(25000);

  const commentTarget = finished.post_id
    ? String(finished.post_id).includes("_")
      ? String(finished.post_id)
      : `${fbId}_${finished.post_id}`
    : String(started.video_id);

  let commentId = null;
  if (firstComment) {
    try {
      const c = await graphRequest(`/${commentTarget}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: firstComment, access_token: fbToken }),
      });
      commentId = c.id || null;
      console.log(`  [FB 1st Comment OK] comment_id=${commentId}`);
    } catch (err) {
      if (commentTarget !== String(started.video_id)) {
        await sleep(10000);
        try {
          const c2 = await graphRequest(`/${started.video_id}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: firstComment, access_token: fbToken }),
          });
          commentId = c2.id || null;
          console.log(`  [FB 1st Comment Fallback OK] comment_id=${commentId}`);
        } catch (err2) {
          console.warn(`  [FB 1st Comment WARN] ${err2.message}`);
        }
      } else {
        console.warn(`  [FB 1st Comment WARN] ${err.message}`);
      }
    }
  }

  return {
    video_id: started.video_id,
    post_id: finished.post_id || null,
    comment_id: commentId,
    permalink_url: `https://www.facebook.com/reel/${started.video_id}/`,
  };
}

async function publishFbMultiPhotoPost({ fbId, fbToken, imageUrls, message, firstComment, label }) {
  console.log(`\n[FB Multi-Photo] Uploading ${imageUrls.length} unpublished slides for ${label}...`);
  const mediaFbIds = [];
  for (let i = 0; i < imageUrls.length; i++) {
    const up = await graphRequest(`/${fbId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: imageUrls[i],
        published: false,
        access_token: fbToken,
      }),
    });
    console.log(`  [FB Slide ${i + 1}/${imageUrls.length}] media_fbid=${up.id}`);
    mediaFbIds.push({ media_fbid: up.id });
    await sleep(600);
  }

  const post = await graphRequest(`/${fbId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      attached_media: mediaFbIds,
      access_token: fbToken,
    }),
  });
  console.log(`  [FB Multi-Photo Published] post_id=${post.id}`);

  let commentId = null;
  if (firstComment) {
    await sleep(3000);
    try {
      const c = await graphRequest(`/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: firstComment, access_token: fbToken }),
      });
      commentId = c.id || null;
      console.log(`  [FB 1st Comment OK] comment_id=${commentId}`);
    } catch (err) {
      console.warn(`  [FB 1st Comment WARN] ${err.message}`);
    }
  }

  let permalinkUrl = null;
  try {
    const info = await graphRequest(`/${post.id}?fields=permalink_url&access_token=${encodeURIComponent(fbToken)}`);
    permalinkUrl = info.permalink_url || null;
  } catch {}

  return { post_id: post.id, comment_id: commentId, permalink_url: permalinkUrl };
}

const CAPTIONS = {
  igPin1: [
    "أهلاً بك في أسرع — كيف تتوظف أسرع في الخليج بدون إعلانات وهمية أو روابط منتهية؟ ⚡",
    "",
    "في بوابة وظائف أسرع (Asra3):",
    "✅ كل وظيفة مفحوصة وموثقة عبر نطاق بريد الشركة الرسمي (DNS MX)",
    "✅ تقديم مباشر لقسم الموارد البشرية (HR) مجاناً",
    "✅ بطاقة وظيفة بكود QR جاهزة للمشاركة",
    "",
    "والأقوى؟ 👇",
    "بنقرة واحدة تفحص سيرتك الذاتية مجاناً لمعايير ATS وتوزّعها مع خطاب تقديم تنفيذي ذكي لمئات الشركات المماثلة في مدينتك وتخصصك — وبدرع سرية يحجب شركتك الحالية 100%!",
    "",
    '💬 اكتب كلمة "أسرع" أو "دبي" بالتعليقات الآن أو افتح الرابط في البايو 👇',
    "",
    "#وظائف_الخليج #وظائف_دبي #وظائف_الرياض #وظائف_الإمارات #وظائف_السعودية #Asra3",
  ].join("\n"),

  fbPin1FirstComment: [
    "✅ تصفّح أحدث الوظائف الحية الموثقة اليوم وافحص سيرتك الذاتية مجاناً للـ ATS عبر الرابط المباشر:",
    "https://asra3.com/jobs?utm_source=facebook&utm_medium=reel_pin&utm_campaign=pin1_live_jobs",
  ].join("\n"),

  igPin2: [
    "كيف تفحص سيرتك الذاتية مجاناً وترسلها مباشرة إلى 5,000+ شركة موثقة في الخليج؟ 🇦🇪🇸🇦🇶🇦🇰🇼",
    "",
    "اسحب الشرائح (01 ← 07) لتعرف:",
    "1️⃣ لماذا ترفض أنظمة ATS 80% من السير الذاتية قبل أن يراها بشري",
    "2️⃣ كيف تحصل على فحص ATS فوري مجاناً وتعرف عدد الشركات المطابقة لتخصصك",
    "3️⃣ تغطية الخليج الكاملة: الإمارات (1,450+) · السعودية (2,100+) · قطر (820+) · الكويت (640+)",
    "4️⃣ درع استبعاد شركتك الحالية 100% — مديرك الحالي لن يعرف نهائياً 🛡️",
    "5️⃣ مقارنة باقات الدفعة الواحدة: Launch (129) · Turbo (229) · Hyper VIP (349)",
    "",
    "🎟️ خصم إضافي 20% لفترة محدودة بكود: ASRA3VIP",
    "",
    "🔖 احفظ المنشور للرجوع إليه وقت التقديم",
    '💬 اكتب كلمة "أسرع" أو "VIP" بالتعليقات أو افتح الرابط في البايو 👇',
    "",
    "#وظائف_الخليج #السيرة_الذاتية #وظائف_دبي #وظائف_الرياض #ATS #Asra3",
  ].join("\n"),

  fbPin2: [
    "كيف تفحص سيرتك الذاتية مجاناً وترسلها مباشرة إلى 5,000+ شركة موثقة في الخليج؟ 🇦🇪🇸🇦🇶🇦🇰🇼",
    "",
    "تصفّح دليل أسرع الكامل (7 شرائح) لتعرف:",
    "✅ لماذا لا يرد الـ HR على 80% من المتقدمين في الخليج",
    "✅ كيف تحصل على فحص ATS فوري مجاناً خلال 10 ثوانٍ",
    "✅ تغطية موثقة DNS MX: الإمارات (1,450+) · السعودية (2,100+) · قطر (820+) · الكويت (640+)",
    "✅ درع استبعاد شركتك الحالية 100% — قدّم بسرية تامة 🛡️",
    "✅ مقارنة باقات الدفعة الواحدة: Launch (129) · Turbo (229) · Hyper VIP (349)",
    "",
    "🎟️ خصم إضافي 20% بكود: ASRA3VIP",
    "🔗 رابط الفحص المجاني وتفعيل العرض في أول تعليق 👇",
    "",
    "#وظائف_الخليج #وظائف_دبي #وظائف_الرياض #السيرة_الذاتية #ATS #توظيف #Asra3",
  ].join("\n"),

  fbPin2FirstComment: [
    "✅ ابدأ فحص سيرتك الذاتية مجاناً للـ ATS واستفد من خصم 20% إضافي بكود ASRA3VIP:",
    "https://asra3.com/?utm_source=facebook&utm_medium=carousel_pin&utm_campaign=pin2_guide",
  ].join("\n"),

  igPin3: [
    "عرض الإطلاق الحصري على أسرع + درع سرية يحجب مديرك الحالي 100%! 🛡️🔥",
    "",
    "انسخ كود الخصم: ASRA3VIP 🎟️",
    "واحصل فوراً على خصم 20% إضافي على جميع باقات توزيع سيرتك الذاتية لمئات الشركات الموثقة في:",
    "🇦🇪 الإمارات (1,450+ شركة)",
    "🇸🇦 السعودية (2,100+ شركة)",
    "🇶🇦 قطر (820+ شركة)",
    "🇰🇼 الكويت (640+ شركة)",
    "",
    "مع كل باقة تحصل على:",
    "✅ فحص توافق ATS مجاني لسيرتك الذاتية",
    "✅ درع استبعاد شركتك الحالية بنسبة 100% — قدّم بسرية تامة",
    "✅ خطاب تقديم تنفيذي ذكي يزيد فرص المقابلات 3×",
    "✅ دفعة واحدة بدون أي اشتراك شهري (Apple Pay · Visa · Mastercard · Mada)",
    "",
    '💬 اكتب كلمة "VIP" في التعليقات الآن أو افتح الرابط في البايو لتفعيل كود ASRA3VIP 👇',
    "",
    "#وظائف_الخليج #وظائف_الإمارات #وظائف_السعودية #وظائف_دبي #وظائف_الرياض #Asra3",
  ].join("\n"),

  fbPin3: [
    "عرض الإطلاق الحصري على أسرع + درع سرية يحجب مديرك الحالي 100%! 🛡️⚡",
    "",
    "انسخ كود الخصم: ASRA3VIP 🎟️",
    "واحصل فوراً على خصم 20% إضافي على جميع باقات توزيع سيرتك الذاتية لمئات الشركات الموثقة في الإمارات والسعودية وقطر والكويت!",
    "",
    "✅ فحص ATS مجاني + خطاب تقديم تنفيذي ذكي يزيد المقابلات 3×",
    "✅ درع سرية يحجب شركتك الحالية بنسبة 100%",
    "✅ دفعة واحدة فقط بدون أي اشتراك شهري (Apple Pay · Visa · Mastercard · Mada)",
    "✅ مساعد ذكي يرد على استفساراتك 24/7",
    "",
    "🔗 رابط العرض وتفعيل كود ASRA3VIP في أول تعليق 👇",
    "",
    "#وظائف_الخليج #وظائف_دبي #وظائف_الرياض #توظيف #السيرة_الذاتية #Asra3",
  ].join("\n"),

  fbPin3FirstComment: [
    "🎟️ فعّل كود الخصم ASRA3VIP (خصم 20% إضافي) وابدأ فحص سيرتك الذاتية مجاناً الآن:",
    "https://asra3.com/?utm_source=facebook&utm_medium=reel_pin&utm_campaign=pin3_asra3vip#wizard-section",
  ].join("\n"),
};

async function verifyAssetUrls(urls) {
  for (const url of urls) {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) {
      throw new Error(`Hosted asset check FAILED (${res.status}): ${url}`);
    }
    const ct = res.headers.get("content-type");
    const cl = res.headers.get("content-length");
    console.log(`  [Asset OK] ${url} -> ${res.status} (${ct}, ${Math.round(Number(cl) / 1024)} KB)`);
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run") || !process.argv.includes("--publish");
  const includeJobReelTest = process.argv.includes("--include-job-reel-test");
  const env = loadEnvLocal();

  const igId = env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const igToken = env.INSTAGRAM_ACCESS_TOKEN;
  const fbId = env.FACEBOOK_PAGE_ID;
  const fbToken = env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const webhookSecret = env.N8N_WEBHOOK_SECRET;

  const pin1VideoUrl = `${SITE_URL}/api/social-media/pin1-v7-live-jobs.mp4`;
  const pin3VideoUrl = `${SITE_URL}/api/social-media/pin3-v8-flash-offer.mp4`;
  const pin2SlideUrls = Array.from({ length: 7 }, (_, i) =>
    `${SITE_URL}/api/social-media/pin2-slide-${String(i + 1).padStart(2, "0")}.jpg`
  );

  console.log("Verifying hosted HTTPS assets on asra3.com...");
  await verifyAssetUrls([pin1VideoUrl, pin3VideoUrl, ...pin2SlideUrls]);

  if (dryRun) {
    console.log("\n[DRY RUN] All 9 hosted assets verified OK. Re-run with --publish to post live.");
    return;
  }

  const report = { instagram: {}, facebook: {}, live_job_reel_test: null };

  // Optional: publish 1 live automated Job Reel to @asra3_jobs BEFORE the 3 Foundation Pins
  // so we verify the live VPS /api/reel/job/[slug] -> Instagram Reels pipeline end-to-end
  // while keeping the 3 Foundation Pins cleanly across Top Row 1 of @asra3_jobs!
  if (includeJobReelTest) {
    console.log("\n=== STEP 0: Live Automated Job Reel End-to-End Verification on @asra3_jobs ===");
    const qRes = await fetch(`${SITE_URL}/api/webhooks/jobs-social?limit=1`, {
      headers: { "x-webhook-secret": webhookSecret },
    });
    const qData = await qRes.json();
    const job = qData.items?.[0];
    if (!job) {
      throw new Error("No unposted job available in /api/webhooks/jobs-social for live Reel test");
    }
    console.log(`  Selected job: ${job.slug} (${job.title_en})`);

    const prepRes = await fetch(job.reel_prepare_url, {
      headers: { "x-webhook-secret": webhookSecret },
    });
    const prep = await prepRes.json();
    if (!prep.ok || !prep.reel_url) {
      throw new Error(`Reel prepare failed: ${JSON.stringify(prep)}`);
    }
    console.log(`  Prepared Job Reel: ${prep.reel_url} (${Math.round(prep.file_size / 1024)} KB, cached=${prep.cached}, ${prep.render_ms}ms)`);

    const igJobRes = await publishIgReel({
      igId,
      igToken,
      videoUrl: prep.reel_url,
      caption: job.instagram_reel_caption,
      label: `AutoJobReel:${job.slug}`,
    });

    // Also publish same job to Facebook + 1st comment and mark BOTH fb_post_id + ig_post_id!
    const fbJobRes = await publishFbReel({
      fbId,
      fbToken,
      videoUrl: prep.reel_url,
      description: job.facebook_reel_caption,
      firstComment: job.facebook_first_comment,
      label: `AutoJobReel:${job.slug}`,
    });

    const fbPostId = fbJobRes.post_id
      ? String(fbJobRes.post_id).includes("_")
        ? String(fbJobRes.post_id)
        : `${fbId}_${fbJobRes.post_id}`
      : String(fbJobRes.video_id);

    const cbRes = await fetch(`${SITE_URL}/api/webhooks/jobs-social`, {
      method: "POST",
      headers: {
        "x-webhook-secret": webhookSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: job.id,
        fb_post_id: fbPostId,
        ig_post_id: igJobRes.id,
      }),
    });
    const cbJson = await cbRes.json();
    console.log(`  [Callback /api/webhooks/jobs-social] status=${cbRes.status} body=${JSON.stringify(cbJson)}`);
    report.live_job_reel_test = {
      job_id: job.id,
      slug: job.slug,
      ig: igJobRes,
      fb: fbJobRes,
      callback: cbJson,
    };
  }

  // Check existing IG media to avoid duplicates
  const existingIg = await graphRequest(
    `/${igId}/media?fields=id,caption,permalink&limit=10&access_token=${encodeURIComponent(igToken)}`
  );
  const existingIgCaptions = (existingIg.data || []).map((m) => m.caption || "");

  console.log("\n=== PUBLISHING 3 FOUNDATION PINS TO INSTAGRAM (@asra3_jobs) ===");
  // Publish order on IG: Pin 3 -> Pin 2 Carousel -> Pin 1 (so Top Row 1 = [Pin 1 | Pin 2 | Pin 3])
  if (!existingIgCaptions.some((c) => c.includes("عرض الإطلاق الحصري على أسرع + درع سرية"))) {
    report.instagram.pin3_offer_reel = await publishIgReel({
      igId,
      igToken,
      videoUrl: pin3VideoUrl,
      caption: CAPTIONS.igPin3,
      label: "Pin3-ASRA3VIP-Offer-Reel",
    });
  } else {
    console.log("  [Skip] IG Pin 3 already exists");
  }

  if (!existingIgCaptions.some((c) => c.includes("اسحب الشرائح (01 ← 07)"))) {
    report.instagram.pin2_guide_carousel = await publishIgCarousel({
      igId,
      igToken,
      imageUrls: pin2SlideUrls,
      caption: CAPTIONS.igPin2,
      label: "Pin2-ObsidianGold-7Slide-Carousel",
    });
  } else {
    console.log("  [Skip] IG Pin 2 Carousel already exists");
  }

  if (!existingIgCaptions.some((c) => c.includes("أهلاً بك في أسرع — كيف تتوظف أسرع في الخليج"))) {
    report.instagram.pin1_welcome_reel = await publishIgReel({
      igId,
      igToken,
      videoUrl: pin1VideoUrl,
      caption: CAPTIONS.igPin1,
      label: "Pin1-Welcome-LiveJobs-Reel",
    });
  } else {
    console.log("  [Skip] IG Pin 1 already exists");
  }

  console.log("\n=== PUBLISHING FOUNDATION PINS TO FACEBOOK PAGE (Asra3) ===");
  // Pin 1 on FB already exists at EXISTING_FB_PIN1_REEL_ID — ensure its 1st comment exists!
  const pin1Comments = await graphRequest(
    `/${EXISTING_FB_PIN1_REEL_ID}/comments?fields=id,message&limit=5&access_token=${encodeURIComponent(fbToken)}`
  );
  let pin1CommentId = pin1Comments.data?.[0]?.id || null;
  if (!pin1CommentId) {
    try {
      const c = await graphRequest(`/${EXISTING_FB_PIN1_REEL_ID}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: CAPTIONS.fbPin1FirstComment,
          access_token: fbToken,
        }),
      });
      pin1CommentId = c.id || null;
      console.log(`  [FB Pin 1] Added missing 1st comment to existing Video #7 Reel: ${pin1CommentId}`);
    } catch (err) {
      console.warn(`  [FB Pin 1 Comment WARN] ${err.message}`);
    }
  } else {
    console.log(`  [FB Pin 1] Existing Video #7 Reel already has comment ${pin1CommentId}`);
  }
  report.facebook.pin1_welcome_reel = {
    existing_reel_id: EXISTING_FB_PIN1_REEL_ID,
    permalink_url: `https://www.facebook.com/reel/${EXISTING_FB_PIN1_REEL_ID}/`,
    comment_id: pin1CommentId,
  };

  // Check recent FB posts to avoid duplicates
  const existingFbPosts = await graphRequest(
    `/${fbId}/posts?fields=id,message&limit=10&access_token=${encodeURIComponent(fbToken)}`
  );
  const existingFbMessages = (existingFbPosts.data || []).map((p) => p.message || "");

  if (!existingFbMessages.some((m) => m.includes("تصفّح دليل أسرع الكامل (7 شرائح)"))) {
    report.facebook.pin2_guide_carousel = await publishFbMultiPhotoPost({
      fbId,
      fbToken,
      imageUrls: pin2SlideUrls,
      message: CAPTIONS.fbPin2,
      firstComment: CAPTIONS.fbPin2FirstComment,
      label: "FB-Pin2-7Slide-Guide",
    });
  } else {
    console.log("  [Skip] FB Pin 2 Carousel already exists");
  }

  if (!existingFbMessages.some((m) => m.includes("عرض الإطلاق الحصري على أسرع + درع سرية"))) {
    report.facebook.pin3_offer_reel = await publishFbReel({
      fbId,
      fbToken,
      videoUrl: pin3VideoUrl,
      description: CAPTIONS.fbPin3,
      firstComment: CAPTIONS.fbPin3FirstComment,
      label: "FB-Pin3-ASRA3VIP-Offer-Reel",
    });
  } else {
    console.log("  [Skip] FB Pin 3 Offer Reel already exists");
  }

  console.log("\n=== FINAL PUBLISH REPORT ===");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
