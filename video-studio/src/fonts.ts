import { useEffect, useState } from "react";
import { loadFont } from "@remotion/fonts";
import { staticFile, useDelayRender } from "remotion";

const ARABIC_RANGE =
  "U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FEFF";
const LATIN_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

let fontLoadPromise: Promise<void> | null = null;

export const loadAsra3Fonts = (): Promise<void> => {
  if (fontLoadPromise) {
    return fontLoadPromise;
  }

  fontLoadPromise = Promise.all([
    loadFont({
      family: "IBM Plex Sans Arabic",
      url: staticFile("fonts/9da48a48bf6500f8-s.p.woff2"),
      format: "woff2",
      weight: "400",
      display: "block",
      unicodeRange: ARABIC_RANGE,
    }),
    loadFont({
      family: "IBM Plex Sans Arabic",
      url: staticFile("fonts/17efc7caebbb6a73-s.p.woff2"),
      format: "woff2",
      weight: "400",
      display: "block",
      unicodeRange: LATIN_RANGE,
    }),
    loadFont({
      family: "IBM Plex Sans Arabic",
      url: staticFile("fonts/f022b1629605b85c-s.p.woff2"),
      format: "woff2",
      weight: "500",
      display: "block",
      unicodeRange: ARABIC_RANGE,
    }),
    loadFont({
      family: "IBM Plex Sans Arabic",
      url: staticFile("fonts/e4efb0298547fad0-s.p.woff2"),
      format: "woff2",
      weight: "600",
      display: "block",
      unicodeRange: ARABIC_RANGE,
    }),
    loadFont({
      family: "IBM Plex Sans Arabic",
      url: staticFile("fonts/fb66eb17bf011c3b-s.p.woff2"),
      format: "woff2",
      weight: "700",
      display: "block",
      unicodeRange: ARABIC_RANGE,
    }),
    loadFont({
      family: "IBM Plex Sans Arabic",
      url: staticFile("fonts/99dc19e540dbb87b-s.p.woff2"),
      format: "woff2",
      weight: "700",
      display: "block",
      unicodeRange: LATIN_RANGE,
    }),
    loadFont({
      family: "Plus Jakarta Sans",
      url: staticFile("fonts/636a5ac981f94f8b-s.p.woff2"),
      format: "woff2",
      weight: "400 800",
      display: "block",
      unicodeRange: LATIN_RANGE,
    }),
    loadFont({
      family: "Cormorant Garamond",
      url: staticFile("fonts/7b89a4fd5e90ede0-s.p.woff2"),
      format: "woff2",
      weight: "600 700",
      display: "block",
      unicodeRange: LATIN_RANGE,
    }),
  ]).then(() => undefined);

  return fontLoadPromise;
};

export const useAsra3Fonts = (): boolean => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [loaded, setLoaded] = useState(false);
  const [handle] = useState(() => delayRender("Loading self-hosted Asra3 fonts"));

  useEffect(() => {
    let active = true;
    loadAsra3Fonts()
      .then(() => {
        if (!active) return;
        setLoaded(true);
        continueRender(handle);
      })
      .catch((err) => {
        cancelRender(err);
      });

    return () => {
      active = false;
    };
  }, [handle, continueRender, cancelRender]);

  return loaded;
};
