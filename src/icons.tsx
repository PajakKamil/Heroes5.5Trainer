import type { ReactElement } from "react";
import {
  GiCrown,
  GiScrollUnfurled,
  GiBroadsword,
  GiShield,
  GiBookCover,
  GiPotionBall,
  GiBoots,
  GiSnowflake1,
  GiPapers,
  GiClover,
  GiJeweledChalice,
  GiEagleEmblem,
  GiSunkenEye,
  GiPowder,
  GiCutDiamond,
  GiTwoCoins,
  GiCrystalGrowth,
  GiWoodPile,
  GiStonePile,
  GiCauldron,
} from "react-icons/gi";
import { FaWandSparkles } from "react-icons/fa6";

import type { IconKey } from "./types";

export const ICONS: Record<IconKey, ReactElement> = {
  crown: <GiCrown />,
  scroll: <GiScrollUnfurled />,
  sword: <GiBroadsword />,
  shield: <GiShield />,
  book: <GiBookCover />,
  wand: <FaWandSparkles />,
  flask: <GiPotionBall />,
  chalice: <GiJeweledChalice />,
  boot: <GiBoots />,
  snow: <GiSnowflake1 />,
  eye: <GiSunkenEye />,
  dump: <GiPapers />,
  smile: <GiEagleEmblem />,
  cloverleaf: <GiClover />,
  wood: <GiWoodPile />,
  ore: <GiStonePile />,
  mercury: <GiCauldron />,
  sulfur: <GiPowder />,
  crystal: <GiCrystalGrowth  />,
  gems: <GiCutDiamond />,
  gold: <GiTwoCoins />,
};

const CornerSym = () => (
  <svg viewBox="0 0 14 14">
    <path d="M1 13 V5 Q1 1 5 1 H13" fill="none" stroke="currentColor" strokeWidth="1" />
    <circle cx="5" cy="5" r="1.4" fill="currentColor" />
  </svg>
);

export const FiligreeSym = () => (
  <svg className="filigree" viewBox="0 0 20 20">
    <path d="M2 10 Q10 2 18 10 Q10 18 2 10 Z M10 6 V14 M6 10 H14" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export const Corners = () => (
  <>
    <span className="corner tl"><CornerSym /></span>
    <span className="corner tr"><CornerSym /></span>
    <span className="corner bl"><CornerSym /></span>
    <span className="corner br"><CornerSym /></span>
  </>
);
