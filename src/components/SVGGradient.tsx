import React from 'react';

import type { GradientProps, GradientOrigin } from '../types';
import SVGLinearGradient from './SVGLinearGradient';
import SVGRadialGradient from './SVGRadialGradient';

export interface SVGGradientProps extends GradientProps {
  id: string;
  size: number;
  origin?: GradientOrigin;
}

export default function SVGGradient({ type, options, ...props }: SVGGradientProps): React.JSX.Element {
  if (type === 'radial') {
    return <SVGRadialGradient {...options} {...props} />;
  }

  return <SVGLinearGradient {...options} {...props} />;
}
