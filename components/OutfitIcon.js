import React from "react";
import Svg, { G, Path } from "react-native-svg";
import { getOutfitIconType } from "../services/outfitTypes";
import { colors123 } from "../utils/theme";

const TOP = "M23 9 15 12 7 25 15 30 19 23V48H45V23L49 30 57 25 49 12 41 9";
const LONG_TOP = "M25 7 17 11 9 31 16 34 21 22 18 52H46L43 22 48 34 55 31 47 11 39 7";
const PANTS = "M19 8H45L48 55H35L32 28 29 55H16Z M19 15H45 M32 8V21";
const DRESS = "M25 7 18 13 14 24 21 27 24 22 22 31 12 55H52L42 31 40 22 43 27 50 24 46 13 39 7 M22 31H42 M25 7Q32 19 39 7";
const JACKET = "M25 8 17 12 8 34 16 37 21 23V54H43V23L48 37 56 34 47 12 39 8 M25 8 32 30 39 8 M25 8 22 20 32 30 42 20 39 8 M32 30V54 M24 40H28 M36 40H40";

export default function OutfitIcon({ outfit, size = 30, color = colors123.primary, style }) {
  const type = getOutfitIconType(outfit);
  let drawing;
  switch (type) {
    case "pants":
      drawing = <Path d={PANTS} />;
      break;
    case "kurta":
      drawing = <><Path d={LONG_TOP} /><Path d="M25 7Q32 16 39 7 M32 13V29 M28 45V49 M36 45V49" /></>;
      break;
    case "set":
      drawing = <><Path d={LONG_TOP} transform="translate(0 -1) scale(1 .8)" /><Path d="M23 42 21 57H29L32 47 35 57H43L41 42 M32 13V24" /></>;
      break;
    case "suit":
      drawing = <><Path d={JACKET} transform="translate(0 -1) scale(1 .8)" /><Path d="M23 43 21 57H29L32 47 35 57H43L41 43" /></>;
      break;
    case "jacket":
      drawing = <Path d={JACKET} />;
      break;
    case "vest":
      drawing = <Path d="M24 8 18 12V24L21 29V53L32 48 43 53V29L46 24V12L40 8 32 25Z M32 25V48 M25 38H29 M35 38H39" />;
      break;
    case "dress":
      drawing = <Path d={DRESS} />;
      break;
    case "skirt":
      drawing = <Path d="M23 10H41L53 54H11Z M22 16H42 M27 18 23 49 M37 18 41 49 M32 18V49" />;
      break;
    case "lehenga":
      drawing = <><Path d="M25 6 18 10 11 21 18 25 23 19V27H41V19L46 25 53 21 46 10 39 6 M25 6Q32 17 39 6 M23 33H41L54 57H10Z M27 37 23 52 M37 37 41 52" /></>;
      break;
    case "saree":
      drawing = <Path d="M24 7 17 12 11 24 18 28 23 20 21 32 17 56H47L43 32 41 20 46 28 53 24 47 12 39 7 M24 7Q32 18 39 7 M39 7 23 32 42 48 M23 32H43 M26 37 24 56 M32 41V56 M38 46V56" />;
      break;
    case "drape":
      drawing = <Path d="M20 10H44L50 54H14Z M20 10 35 22 23 36 40 52 M44 10 35 22 M23 36 16 42 M27 43 25 54" />;
      break;
    case "cape":
      drawing = <Path d="M25 9Q32 17 39 9L55 48Q43 56 32 49 21 56 9 48Z M32 15V49 M25 9 20 46 M39 9 44 46" />;
      break;
    case "camisole":
      drawing = <Path d="M22 8H26V19Q32 25 38 19V8H42V23L46 53H18L22 23Z M23 34H41" />;
      break;
    case "blouse":
      drawing = <><Path d={TOP} transform="translate(0 3) scale(1 .8)" /><Path d="M23 10Q32 29 41 10 M19 41H45" /></>;
      break;
    case "shirt":
      drawing = <><Path d={TOP} /><Path d="M23 9 28 19 32 14 36 19 41 9 M32 14V48 M37 25H42V31H37Z" /></>;
      break;
    case "tshirt":
      drawing = <><Path d={TOP} /><Path d="M23 9Q32 25 41 9" /></>;
      break;
    default:
      drawing = <Path d="M32 14V10Q32 5 37 5 43 5 43 11 M32 14V22L8 41Q5 46 11 46H53Q59 46 56 41L32 22" />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" style={style} accessible={false}>
      <G fill="none" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
        {drawing}
      </G>
    </Svg>
  );
}
