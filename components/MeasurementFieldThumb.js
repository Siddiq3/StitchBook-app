import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, Line, Path, Rect } from "react-native-svg";
import { colors123 } from "../utils/theme";

const THUMB_TYPES = [
  { keys: ["shoulder", "tera"], type: "shoulder" },
  { keys: ["sleeve", "baazu", "half sleeves"], type: "sleeve" },
  { keys: ["bicep", "arm round"], type: "bicep" },
  { keys: ["elbow"], type: "elbow" },
  { keys: ["wrist", "cuff"], type: "wrist" },
  { keys: ["arm hole", "armhole"], type: "armhole" },
  { keys: ["neck", "collar"], type: "neck" },
  { keys: ["chest", "bust", "seena"], type: "chest" },
  { keys: ["waist", "kamar", "stomach"], type: "waist" },
  { keys: ["hip"], type: "hip" },
  { keys: ["thigh"], type: "thigh" },
  { keys: ["knee"], type: "knee" },
  { keys: ["ankle"], type: "ankle" },
  { keys: ["crotch"], type: "crotch" },
  { keys: ["fly"], type: "fly" },
  { keys: ["width", "cross"], type: "width" },
  { keys: ["length", "lambai"], type: "length" },
];

const lowerTypes = new Set(["hip", "thigh", "knee", "ankle", "crotch", "fly"]);

function getThumbType(label) {
  const normalized = String(label || "").toLowerCase();
  const match = THUMB_TYPES.find((item) =>
    item.keys.some((key) => normalized.includes(key)),
  );
  return match?.type || "generic";
}

function TapeLine({ type, color }) {
  const lineProps = {
    stroke: color,
    strokeWidth: 4,
    strokeLinecap: "round",
  };
  const dashedProps = {
    stroke: color,
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeDasharray: "3,3",
  };

  switch (type) {
    case "shoulder":
      return <Line x1="18" y1="22" x2="46" y2="22" {...lineProps} />;
    case "sleeve":
      return <Line x1="19" y1="23" x2="12" y2="48" {...lineProps} />;
    case "bicep":
      return <Line x1="13" y1="32" x2="24" y2="34" {...lineProps} />;
    case "elbow":
      return <Line x1="11" y1="41" x2="22" y2="43" {...lineProps} />;
    case "wrist":
      return <Line x1="10" y1="50" x2="20" y2="52" {...lineProps} />;
    case "armhole":
      return <Circle cx="19" cy="27" r="8" fill="none" {...lineProps} />;
    case "neck":
      return <Line x1="24" y1="15" x2="40" y2="15" {...lineProps} />;
    case "chest":
      return <Line x1="18" y1="30" x2="46" y2="30" {...lineProps} />;
    case "waist":
      return <Line x1="19" y1="41" x2="45" y2="41" {...lineProps} />;
    case "hip":
      return <Line x1="19" y1="25" x2="45" y2="25" {...lineProps} />;
    case "thigh":
      return <Line x1="23" y1="35" x2="33" y2="36" {...lineProps} />;
    case "knee":
      return <Line x1="22" y1="44" x2="34" y2="45" {...lineProps} />;
    case "ankle":
      return <Line x1="21" y1="54" x2="34" y2="54" {...lineProps} />;
    case "crotch":
      return <Path d="M 32 27 Q 32 38 25 45" fill="none" {...lineProps} />;
    case "fly":
      return <Line x1="32" y1="27" x2="32" y2="43" {...lineProps} />;
    case "width":
      return <Line x1="16" y1="32" x2="48" y2="32" {...dashedProps} />;
    case "length":
    default:
      return <Line x1="39" y1="18" x2="39" y2="52" {...lineProps} />;
  }
}

function UpperFigure({ type, active }) {
  const cloth = active ? colors123.primary : "#315C55";
  const skin = "#D8A47B";
  const tape = colors123.accent;

  return (
    <>
      <Circle cx="32" cy="10" r="6" fill={skin} />
      <Path d="M 24 17 L 40 17 L 47 56 L 17 56 Z" fill={cloth} />
      <Path d="M 24 18 Q 16 23 13 48" fill="none" stroke={skin} strokeWidth="8" strokeLinecap="round" />
      <Path d="M 40 18 Q 48 23 51 48" fill="none" stroke={skin} strokeWidth="8" strokeLinecap="round" />
      <Path d="M 24 17 L 40 17 L 47 56 L 17 56 Z" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <TapeLine type={type} color={tape} />
    </>
  );
}

function LowerFigure({ type, active }) {
  const cloth = active ? colors123.primary : "#315C55";
  const skin = "#D8A47B";
  const tape = colors123.accent;

  return (
    <>
      <Path d="M 20 10 L 44 10 L 41 27 L 36 58 L 30 58 L 32 30 L 28 30 L 26 58 L 20 58 L 23 27 Z" fill={cloth} />
      <Path d="M 20 10 L 44 10 L 41 27 L 36 58 L 30 58 L 32 30 L 28 30 L 26 58 L 20 58 L 23 27 Z" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <Ellipse cx="32" cy="13" rx="13" ry="4" fill={skin} opacity="0.2" />
      <TapeLine type={type} color={tape} />
    </>
  );
}

export default function MeasurementFieldThumb({
  active = false,
  bodyType = "upper",
  label,
  size = 54,
}) {
  const type = getThumbType(label);
  const isLower = bodyType === "lower" || lowerTypes.has(type);
  const wrapSize = size + 4;

  return (
    <View
      style={[
        styles.wrap,
        { width: wrapSize, height: wrapSize },
        active && styles.wrapActive,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Rect
          x="1"
          y="1"
          width="62"
          height="62"
          rx="17"
          fill={active ? colors123.primarySoft : colors123.surface}
          stroke={active ? colors123.primary : colors123.border}
          strokeWidth="1.5"
        />
        {isLower ? (
          <LowerFigure type={type} active={active} />
        ) : (
          <UpperFigure type={type} active={active} />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  wrapActive: {
    transform: [{ scale: 1.02 }],
  },
});
