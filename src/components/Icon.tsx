import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

type IconName =
  | 'peak' | 'cards' | 'essay' | 'settings' | 'plus' | 'minus' | 'close'
  | 'chevron-right' | 'chevron-left' | 'chevron-down' | 'chevron-up'
  | 'arrow-up' | 'arrow-down' | 'flame' | 'sparkle' | 'trophy'
  | 'back' | 'search' | 'more' | 'play' | 'check' | 'eye' | 'eye-off'
  | 'drag' | 'swap' | 'edit' | 'trash' | 'stack' | 'rotate'
  | 'filter' | 'wand' | 'clock' | 'shield' | 'key' | 'book'
  | 'lightning' | 'link' | 'compose';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.75 }: IconProps) {
  const p = {
    fill: 'none' as const,
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'peak':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 19 L9 9 L13 14 L17 7 L21 19 Z" {...p} />
          <Path d="M9 9 L11.5 13" {...p} />
        </Svg>
      );
    case 'cards':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3.5" y="5.5" width="13" height="15" rx="2.5" {...p} />
          <Path d="M7.5 5.5 V4 a1.5 1.5 0 0 1 1.5 -1.5 h9 a1.5 1.5 0 0 1 1.5 1.5 v13" {...p} />
        </Svg>
      );
    case 'essay':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 4 h10 l4 4 v12 a1 1 0 0 1 -1 1 H5 a1 1 0 0 1 -1 -1 V5 a1 1 0 0 1 1 -1 z" {...p} />
          <Path d="M14 4 v4 h5" {...p} />
          <Path d="M8 12 h7 M8 16 h5" {...p} />
        </Svg>
      );
    case 'settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="3" {...p} />
          <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" {...p} />
        </Svg>
      );
    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 5 V19 M5 12 H19" {...p} />
        </Svg>
      );
    case 'minus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 12 H19" {...p} />
        </Svg>
      );
    case 'close':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M6 6 L18 18 M18 6 L6 18" {...p} />
        </Svg>
      );
    case 'chevron-right':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M9 5 L16 12 L9 19" {...p} />
        </Svg>
      );
    case 'chevron-left':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M15 5 L8 12 L15 19" {...p} />
        </Svg>
      );
    case 'chevron-down':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 9 L12 16 L19 9" {...p} />
        </Svg>
      );
    case 'chevron-up':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 15 L12 8 L19 15" {...p} />
        </Svg>
      );
    case 'arrow-up':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 19 V5 M5 12 L12 5 L19 12" {...p} />
        </Svg>
      );
    case 'arrow-down':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 5 V19 M5 12 L12 19 L19 12" {...p} />
        </Svg>
      );
    case 'flame':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3 c1 3 4 4 4 8 a4 4 0 0 1 -8 0 c0 -2 1.5 -3 2 -5 c1 2 2 2 2 -3 z" {...p} />
        </Svg>
      );
    case 'sparkle':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3 L13.2 9.8 L20 11 L13.2 12.2 L12 19 L10.8 12.2 L4 11 L10.8 9.8 Z" {...p} strokeLinejoin="round" />
        </Svg>
      );
    case 'trophy':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M8 4 H16 V11 a4 4 0 0 1 -8 0 Z" {...p} />
          <Path d="M8 6 H5 a2 2 0 0 0 0 4 H8" {...p} />
          <Path d="M16 6 H19 a2 2 0 0 1 0 4 H16" {...p} />
          <Path d="M10 15 V18 H14 V15" {...p} />
          <Path d="M7 21 H17" {...p} />
        </Svg>
      );
    case 'back':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M19 12 H5 M11 6 L5 12 L11 18" {...p} />
        </Svg>
      );
    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 12 L10 17 L19 7" {...p} />
        </Svg>
      );
    case 'eye':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M2 12 s3.5 -6.5 10 -6.5 S22 12 22 12 s-3.5 6.5 -10 6.5 S2 12 2 12 z" {...p} />
          <Circle cx="12" cy="12" r="3" {...p} />
        </Svg>
      );
    case 'eye-off':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 4 L20 20" {...p} />
          <Path d="M9.5 5.8 a10 10 0 0 1 2.5 -.3 c6.5 0 10 6.5 10 6.5 a18 18 0 0 1 -3.4 4" {...p} />
          <Path d="M6.5 7.5 C3.5 9.5 2 12 2 12 s3.5 6.5 10 6.5 c1.4 0 2.6 -.3 3.7 -.7" {...p} />
          <Path d="M9.5 9.5 a3.5 3.5 0 0 0 5 5" {...p} />
        </Svg>
      );
    case 'drag':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="9" cy="7" r="1.2" fill={color} />
          <Circle cx="15" cy="7" r="1.2" fill={color} />
          <Circle cx="9" cy="12" r="1.2" fill={color} />
          <Circle cx="15" cy="12" r="1.2" fill={color} />
          <Circle cx="9" cy="17" r="1.2" fill={color} />
          <Circle cx="15" cy="17" r="1.2" fill={color} />
        </Svg>
      );
    case 'edit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 20 L4 16 L16 4 L20 8 L8 20 Z" {...p} />
          <Path d="M13 7 L17 11" {...p} />
        </Svg>
      );
    case 'trash':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 7 H20" {...p} />
          <Path d="M6 7 V20 a1 1 0 0 0 1 1 H17 a1 1 0 0 0 1 -1 V7" {...p} />
          <Path d="M9 7 V5 a1 1 0 0 1 1 -1 H14 a1 1 0 0 1 1 1 V7" {...p} />
        </Svg>
      );
    case 'rotate':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 12 a8 8 0 0 1 14 -5" {...p} />
          <Path d="M18 3 V7 H14" {...p} />
        </Svg>
      );
    case 'clock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="9" {...p} />
          <Path d="M12 7 V12 L15 14" {...p} />
        </Svg>
      );
    case 'shield':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3 L20 6 V12 c0 5 -4 8 -8 9 c-4 -1 -8 -4 -8 -9 V6 Z" {...p} />
        </Svg>
      );
    case 'key':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="8" cy="14" r="4" {...p} />
          <Path d="M11 11 L20 4 M17 4 L20 4 V7 M15 7 L17 9" {...p} />
        </Svg>
      );
    case 'book':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 5 a2 2 0 0 1 2 -2 H18 a2 2 0 0 1 2 2 V19 H6 a2 2 0 0 0 -2 2 Z" {...p} />
          <Path d="M4 19 a2 2 0 0 1 2 -2 H20" {...p} />
        </Svg>
      );
    case 'lightning':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M13 3 L5 13 H11 L10 21 L18 11 H12 Z" {...p} strokeLinejoin="round" />
        </Svg>
      );
    case 'link':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M10 13 a5 5 0 0 0 7.54 .54 l3 -3 a5 5 0 0 0 -7.07 -7.07 l-1.72 1.71" {...p} />
          <Path d="M14 11 a5 5 0 0 0 -7.54 -.54 l-3 3 a5 5 0 0 0 7.07 7.07 l1.71 -1.71" {...p} />
        </Svg>
      );
    case 'wand':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 20 L18 6 L20 8 L6 22 Z" {...p} strokeLinejoin="round" />
          <Path d="M15 3 L16 5 L18 4 L17 6 L19 7 L17 8 L18 10 L16 9 L15 11 L14 9 L12 10 L13 8 L11 7 L13 6 L12 4 L14 5 Z" {...p} strokeLinejoin="round" />
        </Svg>
      );
    case 'stack':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 7 L12 3 L21 7 L12 11 Z" {...p} />
          <Path d="M3 12 L12 16 L21 12" {...p} />
          <Path d="M3 17 L12 21 L21 17" {...p} />
        </Svg>
      );
    case 'more':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="6" cy="12" r="1.4" fill={color} />
          <Circle cx="12" cy="12" r="1.4" fill={color} />
          <Circle cx="18" cy="12" r="1.4" fill={color} />
        </Svg>
      );
    case 'compose':
    case 'search':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="11" cy="11" r="6.5" {...p} />
          <Path d="M16 16 L21 21" {...p} />
        </Svg>
      );
    case 'swap':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M7 8 H19 M16 5 L19 8 L16 11" {...p} />
          <Path d="M17 16 H5 M8 13 L5 16 L8 19" {...p} />
        </Svg>
      );
    case 'filter':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 5 H20 L14 12 V19 L10 21 V12 Z" {...p} />
        </Svg>
      );
    case 'play':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M7 5 L19 12 L7 19 Z" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="6" {...p} />
        </Svg>
      );
  }
}
