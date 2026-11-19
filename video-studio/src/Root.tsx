import React from "react";
import { Composition, Folder, Still } from "remotion";
import { Asra3Promo, Asra3PromoSchema } from "./Asra3Promo";
import { FPS, TOTAL_DURATION_FRAMES } from "./theme";
import { Scene07EndCard } from "./scenes/Scene07EndCard";
import { Video02AtsPain, Video02AtsSchema } from "./v2/Video02AtsPain";
import { V2_TOTAL_FRAMES } from "./v2/v2Theme";
import { Video03Shield, Video03ShieldSchema } from "./v3/Video03Shield";
import { V3_TOTAL_FRAMES } from "./v3/v3Theme";
import { Video04Flagship, Video04FlagshipSchema } from "./v4/Video04Flagship";
import { V4_TOTAL_FRAMES } from "./v4/v4Theme";
import { Video05Cinematic, Video05CinematicSchema } from "./v5/Video05Cinematic";
import { V5_TOTAL_FRAMES } from "./v5/v5Theme";
import {
  Video06MotionFilm,
  Video06MotionFilmSchema,
} from "./v6/Video06MotionFilm";
import { V6_TOTAL_FRAMES } from "./v6/motionCore";
import {
  Asra3CarouselSlide,
  Asra3ComparisonPost,
  Asra3FacebookCover,
  Asra3FacebookCoverSchema,
  Asra3LinkedInCover,
  Asra3ProfileAvatar,
  CarouselSlideSchema,
} from "./BrandKit";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Asra3-Facebook-Ads">
        <Composition
          id="Asra3-Feed-4x5"
          component={Asra3Promo}
          schema={Asra3PromoSchema}
          durationInFrames={TOTAL_DURATION_FRAMES}
          fps={FPS}
          width={1080}
          height={1350}
          defaultProps={{
            format: "feed-4x5",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "افحص سيرتك مجاناً الآن",
            ctaUrl: "asra3.com",
            priceNote: "دفعة واحدة تبدأ من 129 د.إ / ر.س • بدون اشتراك شهري",
          }}
        />

        <Composition
          id="Asra3-Reels-9x16"
          component={Asra3Promo}
          schema={Asra3PromoSchema}
          durationInFrames={TOTAL_DURATION_FRAMES}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={{
            format: "reels-9x16",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "افحص سيرتك مجاناً الآن",
            ctaUrl: "asra3.com",
            priceNote: "دفعة واحدة تبدأ من 129 د.إ / ر.س • بدون اشتراك شهري",
          }}
        />

        <Still
          id="Asra3-Poster-4x5"
          component={Scene07EndCard}
          width={1080}
          height={1350}
          defaultProps={{
            isReels: false,
            staticPoster: true,
            ctaLabel: "افحص سيرتك مجاناً الآن",
            ctaUrl: "asra3.com",
            priceNote: "دفعة واحدة تبدأ من 129 د.إ / ر.س • بدون اشتراك شهري",
          }}
        />
      </Folder>

      <Folder name="Asra3-Video-02-ATS">
        <Composition
          id="Asra3-V2-ATS-Feed-4x5"
          component={Video02AtsPain}
          durationInFrames={V2_TOTAL_FRAMES}
          fps={FPS}
          width={1080}
          height={1350}
          schema={Video02AtsSchema}
          defaultProps={{
            format: "feed-4x5",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "ابدأ فحص ATS مجاناً الآن",
            ctaUrl: "asra3.com",
            priceNote: "فحص مجاني فوري لسيرتك الذاتية • بدون تسجيل مسبق",
          }}
        />
        <Composition
          id="Asra3-V2-ATS-TikTok-9x16"
          component={Video02AtsPain}
          durationInFrames={V2_TOTAL_FRAMES}
          fps={FPS}
          width={1080}
          height={1920}
          schema={Video02AtsSchema}
          defaultProps={{
            format: "reels-9x16",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "ابدأ فحص ATS مجاناً الآن",
            ctaUrl: "asra3.com",
            priceNote: "فحص مجاني فوري لسيرتك الذاتية • بدون تسجيل مسبق",
          }}
        />
      </Folder>

      <Folder name="Asra3-Video-03-Shield">
        <Composition
          id="Asra3-V3-Shield-Feed-4x5"
          component={Video03Shield}
          durationInFrames={V3_TOTAL_FRAMES}
          fps={FPS}
          width={1080}
          height={1350}
          schema={Video03ShieldSchema}
          defaultProps={{
            format: "feed-4x5",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "ابدأ حملتك بسرية تامة الآن",
            ctaUrl: "asra3.com",
            priceNote: "حظر 100% لشركتك الحالية • دفعة واحدة تبدأ من 129 د.إ / ر.س",
          }}
        />
        <Composition
          id="Asra3-V3-Shield-TikTok-9x16"
          component={Video03Shield}
          durationInFrames={V3_TOTAL_FRAMES}
          fps={FPS}
          width={1080}
          height={1920}
          schema={Video03ShieldSchema}
          defaultProps={{
            format: "reels-9x16",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "ابدأ حملتك بسرية تامة الآن",
            ctaUrl: "asra3.com",
            priceNote: "حظر 100% لشركتك الحالية • دفعة واحدة تبدأ من 129 د.إ / ر.س",
          }}
        />
      </Folder>

      <Folder name="Asra3-Video-04-Flagship">
        <Composition
          id="Asra3-V4-Flagship-Feed-4x5"
          component={Video04Flagship}
          durationInFrames={V4_TOTAL_FRAMES}
          fps={FPS}
          width={1080}
          height={1350}
          schema={Video04FlagshipSchema}
          defaultProps={{
            format: "feed-4x5",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "ابدأ الفحص المجاني الآن",
            ctaUrl: "asra3.com",
            priceNote: "5,010+ شركة خليجية موثقة • تبدأ من 129 د.إ / ر.س دفعة واحدة",
          }}
        />
        <Composition
          id="Asra3-V4-Flagship-TikTok-9x16"
          component={Video04Flagship}
          durationInFrames={V4_TOTAL_FRAMES}
          fps={FPS}
          width={1080}
          height={1920}
          schema={Video04FlagshipSchema}
          defaultProps={{
            format: "reels-9x16",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "ابدأ الفحص المجاني الآن",
            ctaUrl: "asra3.com",
            priceNote: "5,010+ شركة خليجية موثقة • تبدأ من 129 د.إ / ر.س دفعة واحدة",
          }}
        />
      </Folder>

      <Folder name="Asra3-Video-05-Cinema">
        <Composition
          id="Asra3-V5-Cinema-Feed-4x5"
          component={Video05Cinematic}
          durationInFrames={V5_TOTAL_FRAMES}
          fps={FPS}
          width={1080}
          height={1350}
          schema={Video05CinematicSchema}
          defaultProps={{
            format: "feed-4x5",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "ابدأ الفحص المجاني الآن",
            ctaUrl: "asra3.com",
            priceNote: "5,010+ شركة خليجية موثقة • تبدأ من 129 د.إ / ر.س دفعة واحدة",
          }}
        />
        <Composition
          id="Asra3-V5-Cinema-TikTok-9x16"
          component={Video05Cinematic}
          durationInFrames={V5_TOTAL_FRAMES}
          fps={FPS}
          width={1080}
          height={1920}
          schema={Video05CinematicSchema}
          defaultProps={{
            format: "reels-9x16",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "ابدأ الفحص المجاني الآن",
            ctaUrl: "asra3.com",
            priceNote: "5,010+ شركة خليجية موثقة • تبدأ من 129 د.إ / ر.س دفعة واحدة",
          }}
        />
      </Folder>

      <Folder name="Asra3-Video-06-MotionFilm">
        <Composition
          id="Asra3-V6-MotionFilm-Feed-4x5"
          component={Video06MotionFilm}
          durationInFrames={V6_TOTAL_FRAMES}
          fps={FPS}
          width={1080}
          height={1350}
          schema={Video06MotionFilmSchema}
          defaultProps={{
            format: "feed-4x5",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "ابدأ الفحص المجاني الآن",
            ctaUrl: "asra3.com",
            priceNote: "5,010+ شركة خليجية موثقة • تبدأ من 129 د.إ / ر.س دفعة واحدة",
          }}
        />
        <Composition
          id="Asra3-V6-MotionFilm-TikTok-9x16"
          component={Video06MotionFilm}
          durationInFrames={V6_TOTAL_FRAMES}
          fps={FPS}
          width={1080}
          height={1920}
          schema={Video06MotionFilmSchema}
          defaultProps={{
            format: "reels-9x16",
            showCaptions: true,
            musicGain: 0.72,
            ctaLabel: "ابدأ الفحص المجاني الآن",
            ctaUrl: "asra3.com",
            priceNote: "5,010+ شركة خليجية موثقة • تبدأ من 129 د.إ / ر.س دفعة واحدة",
          }}
        />
      </Folder>

      <Folder name="Asra3-Brand-And-Posts">
        <Still
          id="Asra3-Profile-Avatar"
          component={Asra3ProfileAvatar}
          width={1080}
          height={1080}
        />

        <Still
          id="Asra3-Facebook-Cover"
          component={Asra3FacebookCover}
          schema={Asra3FacebookCoverSchema}
          width={1640}
          height={624}
          defaultProps={{
            headline: "توظَّف أسرع.. نوصل سيرتك مباشرة لمديري الـ HR في الخليج",
            subheadline:
              "فحص ATS ذكي + خطاب تقديم تنفيذي + توزيع مباشر لـ 5,010+ شركة موثقة عبر الإمارات والسعودية وقطر والكويت",
            ctaText: "افحص سيرتك مجاناً",
          }}
        />

        <Still
          id="Asra3-LinkedIn-Cover"
          component={Asra3LinkedInCover}
          width={1584}
          height={396}
        />

        <Still
          id="Asra3-Comparison-Post"
          component={Asra3ComparisonPost}
          width={1080}
          height={1350}
        />

        <Still
          id="Asra3-Carousel-01"
          component={Asra3CarouselSlide}
          schema={CarouselSlideSchema}
          width={1080}
          height={1350}
          defaultProps={{
            slideNumber: 1,
            totalSlides: 5,
            eyebrow: "دليل التوظيف الذكي في الخليج 2026",
            title: "ليش سيرتك الذاتية القوية ما بتجيب مقابلات في الخليج؟",
            body: "السبب مو في خبرتك... السبب في الطريقة التي تصل بها سيرتك لإدارات الموارد البشرية. تعرف على الأخطاء الثلاثة وطريقة تخطيها خلال 3 دقائق.",
            highlightValue: "3.4×",
            highlightLabel: "وصول أسرع لمقابلات التوظيف",
            dark: true,
          }}
        />

        <Still
          id="Asra3-Carousel-02"
          component={Asra3CarouselSlide}
          schema={CarouselSlideSchema}
          width={1080}
          height={1350}
          defaultProps={{
            slideNumber: 2,
            totalSlides: 5,
            eyebrow: "الخطأ الأول · زحمة الإعلانات العامة",
            title: "التقديم في طابور يضم أكثر من 1,000 متقدم",
            body: "عندما تقدم على وظيفة منشورة، يُدفن ملفك بين مئات السير الذاتية المتشابهة. شركات الخليج الكبرى تفرز بالوصول المباشر أو الترشيحات قبل مراجعة البوابات.",
            highlightValue: "1,200+",
            highlightLabel: "متوسط المتقدمين لكل إعلان عام",
            dark: false,
          }}
        />

        <Still
          id="Asra3-Carousel-03"
          component={Asra3CarouselSlide}
          schema={CarouselSlideSchema}
          width={1080}
          height={1350}
          defaultProps={{
            slideNumber: 3,
            totalSlides: 5,
            eyebrow: "الخطأ الثاني · فلترة أنظمة الـ ATS",
            title: "الاستبعاد الآلي قبل أن يرى مسؤول التوظيف اسمك",
            body: "محرك أسرع يقرأ نص ملفك الحقيقي، يرفع توافق الـ ATS من 58% حتى 96%، ويصيغ خطاب تقديم تنفيذي مخصص لخبراتك ومجالك.",
            highlightValue: "96%",
            highlightLabel: "نسبة التوافق مع أنظمة الفرز ATS",
            dark: true,
          }}
        />

        <Still
          id="Asra3-Carousel-04"
          component={Asra3CarouselSlide}
          schema={CarouselSlideSchema}
          width={1080}
          height={1350}
          defaultProps={{
            slideNumber: 4,
            totalSlides: 5,
            eyebrow: "ميزة حصرية · السرية التامة",
            title: "ابحث عن ترقية أفضل بدون أن تعرف شركتك الحالية",
            body: "في خطوة الإطلاق، أدخل نطاق بريد شركتك الحالية ليقوم درع الخصوصية في أسرع بحجبه بنسبة 100% — وتصلك ردود الشركات الأخرى على بريدك الشخصي فقط.",
            highlightValue: "100%",
            highlightLabel: "حجب مضمون لنطاق جهة عملك",
            dark: false,
          }}
        />

        <Still
          id="Asra3-Carousel-05"
          component={Asra3CarouselSlide}
          schema={CarouselSlideSchema}
          width={1080}
          height={1350}
          defaultProps={{
            slideNumber: 5,
            totalSlides: 5,
            eyebrow: "الخطوة الأخيرة · ابدأ الآن",
            title: "أوصل ملفك مباشرة إلى 5,010+ شركة موثقة في الخليج",
            body: "اختر الإمارات أو السعودية أو قطر أو الكويت، وتابع كل شركة فتحت ملفك في سجل التتبع الحي. دفعة واحدة تبدأ من 129 د.إ / ر.س بدون اشتراكات.",
            highlightValue: "3 min",
            highlightLabel: "أطلق حملتك الآن عبر Asra3.com",
            dark: true,
          }}
        />
      </Folder>
    </>
  );
};
