import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { size?: number; color: string };

const strokeProps = {
  fill: 'none',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function SettingsIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={3} stroke={color} {...strokeProps} />
      <Path
        stroke={color}
        {...strokeProps}
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      />
    </Svg>
  );
}

export function BackIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path stroke={color} {...strokeProps} d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

export function HapticIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={8} y={4} width={8} height={16} rx={1.5} stroke={color} {...strokeProps} />
      <Path stroke={color} {...strokeProps} d="M4 8v8M20 8v8M2 10.5v3M22 10.5v3" />
    </Svg>
  );
}

export function RisingIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path stroke={color} {...strokeProps} d="M12 21V9" />
      <Path stroke={color} {...strokeProps} d="M6.5 14.5L12 9l5.5 5.5" />
      <Path stroke={color} {...strokeProps} d="M8 4.5h8" />
    </Svg>
  );
}

export function SoundIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path stroke={color} {...strokeProps} d="M4 9v6h4l5 4V5L8 9H4z" />
      <Path stroke={color} {...strokeProps} d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
    </Svg>
  );
}

export function LanguageIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} stroke={color} {...strokeProps} />
      <Path stroke={color} {...strokeProps} d="M3 12h18" />
      <Path
        stroke={color}
        {...strokeProps}
        d="M12 3c2.4 2.4 3.8 5.6 3.8 9s-1.4 6.6-3.8 9c-2.4-2.4-3.8-5.6-3.8-9s1.4-6.6 3.8-9z"
      />
    </Svg>
  );
}

export function SearchIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={7} stroke={color} {...strokeProps} />
      <Path stroke={color} {...strokeProps} d="M20 20l-4-4" />
    </Svg>
  );
}

export function CloseIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path stroke={color} {...strokeProps} d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

type HeartIconProps = IconProps & { filled?: boolean };

export function HeartIcon({ size = 22, color, filled }: HeartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        stroke={color}
        {...strokeProps}
        fill={filled ? color : 'none'}
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"
      />
    </Svg>
  );
}

export function PlayIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} stroke={color} {...strokeProps} />
      <Path d="M10 8.5l5 3.5-5 3.5z" fill={color} />
    </Svg>
  );
}

export function ReminderIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path stroke={color} {...strokeProps} d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16z" />
      <Path stroke={color} {...strokeProps} d="M10 21h4" />
    </Svg>
  );
}

export function CounterTabIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} stroke={color} {...strokeProps} />
      <Circle cx={12} cy={12} r={2.6} fill={color} />
    </Svg>
  );
}

export function MantrasTabIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        stroke={color}
        {...strokeProps}
        d="M2 5.5c3-1 6-.5 10 1.5 4-2 7-2.5 10-1.5V18c-3-1-6-.5-10 1.5C8 17.5 5 17 2 18V5.5z"
      />
      <Path stroke={color} {...strokeProps} d="M12 7v12" />
    </Svg>
  );
}

export function ProgressTabIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path stroke={color} {...strokeProps} d="M3 17l6-6 4 4 8-8" />
      <Path stroke={color} {...strokeProps} d="M15 7h6v6" />
    </Svg>
  );
}
