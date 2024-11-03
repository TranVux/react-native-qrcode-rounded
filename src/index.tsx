import QRCodeRounded from './components/SVGQRCodeRounded';
import SVGGradient from './components/SVGGradient';
import type { SVGQRCodeStyledProps } from './components/SVGQRCodeRounded';
import type { SVGGradientProps } from './components/SVGGradient';

global.TextEncoder = require('text-encoding').TextEncoder;

export type { QRCodeMessage, QRCodeOptions } from './adapters/qrcode';

export * from './types';
export * from './constants';

export { default as useQRCodeData } from './hooks/useQRCodeData';

export {
  isCoordsOfOuterEyes,
  isCoordsOfInnerEyes,
  isCoordsOfTopRightOuterEye,
  isCoordsOfTopRightInnerEye,
  isCoordsOfTopLeftOuterEye,
  isCoordsOfTopLeftInnerEye,
  isCoordsOfBottomLeftOuterEye,
  isCoordsOfBottomLeftInnerEye,
} from './helpers';

export { SVGGradient };
export type { SVGQRCodeStyledProps, SVGGradientProps };

export default QRCodeRounded;
