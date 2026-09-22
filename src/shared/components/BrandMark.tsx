import React from 'react';
import Svg, { Circle, Defs, Image as SvgImage, Line, Pattern, Rect } from 'react-native-svg';

import { colors } from '@/shared/theme';

const bead = require('../../../assets/images/rudraksha-bead.png');

const RING_DOT_COUNT = 13;
const RING_RADIUS = 8;
const RING_CENTER = { x: 18, y: 11 };

type Props = { size?: number };

/**
 * App logo: a ring of small drawn dots (mala beads) with one real
 * photographed rudraksha bead hanging below as a pendant — used for the
 * in-app header mark and as the source for the app icon / splash image.
 */
export function BrandMark({ size = 36 }: Props) {
  const dots = Array.from({ length: RING_DOT_COUNT }, (_, i) => {
    const angle = (i / RING_DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
    return {
      cx: RING_CENTER.x + RING_RADIUS * Math.cos(angle),
      cy: RING_CENTER.y + RING_RADIUS * Math.sin(angle),
    };
  });

  return (
    <Svg width={size} height={(size * 32) / 36} viewBox="0 0 36 32">
      <Defs>
        <Pattern
          id="pendantTexture"
          patternUnits="userSpaceOnUse"
          width={8.86}
          height={8.86}
          x={13.57}
          y={21.27}
        >
          <Rect width={8.86} height={8.86} fill={colors.maroon} />
          <SvgImage
            href={bead}
            x={-4.43}
            y={-4.43}
            width={17.72}
            height={17.72}
            preserveAspectRatio="xMidYMid slice"
          />
        </Pattern>
      </Defs>

      <Circle
        cx={18}
        cy={11}
        r={8}
        fill="none"
        stroke={colors.maroon}
        strokeWidth={0.6}
        opacity={0.2}
      />
      {dots.map((d, i) => (
        <Circle key={i} cx={d.cx} cy={d.cy} r={1.25} fill={colors.maroon} />
      ))}

      <Line
        x1={18}
        y1={19}
        x2={18}
        y2={21.6}
        stroke={colors.maroon}
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.5}
      />
      <Circle cx={18} cy={26.3} r={4.1} fill="rgba(50,20,10,0.22)" />
      <Circle
        cx={18}
        cy={25.7}
        r={4.1}
        fill="url(#pendantTexture)"
        stroke={colors.ground}
        strokeWidth={0.9}
      />
    </Svg>
  );
}
