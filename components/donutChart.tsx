import React from "react";
import { StyleSheet, View } from "react-native";
import { Circle, Path, Svg } from "react-native-svg";

type Slice = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  data: Slice[];
  size?: number;
  strokeWidth?: number;
};

/**
 *
 * @param cx - x coordinate
 * @param cy - y coordinate
 * @param r - radius
 * @param angleDeg - angle degrees
 * @returns the x,y pixel coordinate of that angle on the circle's edge
 */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

/**
 *
 * @param cx - x coordinate
 * @param cy - y coordinate
 * @param r - radius
 * @param startAngle - angle at which category starts
 * @param endAngle - angle at which category ends
 * @returns an SVG path string that draws the arc between the two angles
 */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function DonutChart({
  data,
  size = 200,
  strokeWidth = 36,
}: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;

  let currentAngle = 0;

  const slices = data.map((slice) => {
    const angle = (slice.value / total) * 360;
    const path = arcPath(cx, cy, r, currentAngle, currentAngle + angle);
    currentAngle += angle;
    return { ...slice, path };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {total === 0 ? (
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="#2c2c2e"
            strokeWidth={strokeWidth}
            fill="none"
          />
        ) : (
          slices.map((slice, i) => (
            <Path
              key={i}
              d={slice.path}
              stroke={slice.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          ))
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
});
