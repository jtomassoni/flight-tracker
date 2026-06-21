import type { ComponentType } from 'react';
import type { DisplayLayoutProps } from '@/types/display';
import type { LayoutId } from '@/lib/themes';
import DepartureTableLayout from './DepartureTableLayout';
import SplitFlapBoardLayout from './SplitFlapBoardLayout';
import RadarScopeLayout from './RadarScopeLayout';
import SkyMapLayout from './SkyMapLayout';
import FlightWallMiniLayout from './FlightWallMiniLayout';

const LAYOUTS: Record<LayoutId, ComponentType<DisplayLayoutProps>> = {
  'departure-table': DepartureTableLayout,
  'split-flap-board': SplitFlapBoardLayout,
  'radar-scope': RadarScopeLayout,
  'google-map': SkyMapLayout,
  'led-matrix': FlightWallMiniLayout,
};

export default function ThemeLayout(props: DisplayLayoutProps) {
  const Layout = LAYOUTS[props.theme.layout] ?? DepartureTableLayout;
  return <Layout {...props} />;
}
