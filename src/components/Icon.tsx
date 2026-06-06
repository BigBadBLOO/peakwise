import React from 'react';
import { Feather } from '@expo/vector-icons';

type IconName =
  | 'peak' | 'cards' | 'essay' | 'settings' | 'plus' | 'minus' | 'close'
  | 'chevron-right' | 'chevron-left' | 'chevron-down' | 'chevron-up'
  | 'arrow-up' | 'arrow-down' | 'flame' | 'sparkle' | 'trophy'
  | 'back' | 'search' | 'more' | 'play' | 'check' | 'eye' | 'eye-off'
  | 'drag' | 'swap' | 'edit' | 'trash' | 'stack' | 'rotate'
  | 'filter' | 'wand' | 'clock' | 'shield' | 'key' | 'book'
  | 'lightning' | 'link' | 'compose'
  | 'dumbbell' | 'stopwatch' | 'pause' | 'lap' | 'chart-bar' | 'calendar'
  | 'habits' | 'archive'
  | 'upload' | 'download';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const MAP: Record<IconName, string> = {
  peak:           'trending-up',
  cards:          'layers',
  essay:          'file-text',
  settings:       'settings',
  plus:           'plus',
  minus:          'minus',
  close:          'x',
  'chevron-right':'chevron-right',
  'chevron-left': 'chevron-left',
  'chevron-down': 'chevron-down',
  'chevron-up':   'chevron-up',
  'arrow-up':     'arrow-up',
  'arrow-down':   'arrow-down',
  flame:          'zap',
  sparkle:        'star',
  trophy:         'award',
  back:           'arrow-left',
  search:         'search',
  more:           'more-horizontal',
  play:           'play',
  check:          'check',
  eye:            'eye',
  'eye-off':      'eye-off',
  drag:           'move',
  swap:           'repeat',
  edit:           'edit-2',
  trash:          'trash-2',
  stack:          'layers',
  rotate:         'rotate-cw',
  filter:         'filter',
  wand:           'zap',
  clock:          'clock',
  shield:         'shield',
  key:            'key',
  book:           'book',
  lightning:      'zap',
  link:           'link',
  compose:        'edit',
  dumbbell:       'activity',
  stopwatch:      'watch',
  pause:          'pause',
  lap:            'refresh-cw',
  'chart-bar':    'bar-chart-2',
  calendar:       'calendar',
  habits:         'repeat',
  archive:        'archive',
  upload:         'upload',
  download:       'download',
};

export function Icon({ name, size = 22, color = '#ffffff', strokeWidth: _sw }: IconProps) {
  return <Feather name={MAP[name] as any} size={size} color={color} />;
}
