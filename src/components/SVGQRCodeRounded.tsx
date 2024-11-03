import React from 'react';

import { type ForwardedRef, forwardRef, useEffect, useMemo, useState } from 'react';
import {
  ClipPath,
  Defs,
  G,
  Image as SVGImage,
  type ImageProps as SVGImageProps, Rect,
  Svg,
  type SvgProps,
} from 'react-native-svg';

import type {
  AllEyesOptions,
  BitMatrix,
  EyeOptions,
  EyePosition,
  GradientOrigin,
  LogoArea,
  LogoOptions,
  PieceOptions,
  RenderCustomPieceItem,
} from '../types';
import type { QRCodeMessage, QRCodeOptions } from '../adapters/qrcode';
import { transformEyeOptionsToCommonPattern } from '../helpers';
import { INNER_EYE_SIZE_IN_BITS, OUTER_EYE_SIZE_IN_BITS } from '../constants';
import useQRCodeData from '../hooks/useQRCodeData';
import SVGPieces, { DEFAULT_PIECE_SIZE } from './SVGPieces';
import SVGQRLogo from './SVGQRLogo';
import SVGGradient from './SVGGradient';

export interface SVGQRCodeStyledProps
  extends QRCodeOptions,
    PieceOptions,
    Omit<SvgProps, 'children'> {
  data?: QRCodeMessage;
  onChangeSize?: (size: number) => void;
  pieceLiquidRadius?: number;
  outerEyesOptions?: EyeOptions | AllEyesOptions;
  innerEyesOptions?: EyeOptions | AllEyesOptions;
  renderCustomPieceItem?: RenderCustomPieceItem;
  isPiecesGlued?: boolean;
  padding?: number;
  backgroundImage?: SVGImageProps;
  logo?: LogoOptions;
  children?: (pieceSize: number, bitMatrix: BitMatrix) => SvgProps['children'];
  renderBackground?: (pieceSize: number, bitMatrix: BitMatrix) => SvgProps['children'];
}

function SVGQRCodeRounded(
  {
    data = 'I\'m QR Code!',
    onChangeSize,
    pieceSize = DEFAULT_PIECE_SIZE,
    pieceScale,
    pieceRotation,
    pieceCornerType = 'rounded',
    pieceBorderRadius = 0,
    pieceStroke,
    pieceStrokeWidth,
    pieceLiquidRadius,
    isPiecesGlued = false,
    outerEyesOptions,
    innerEyesOptions,
    renderCustomPieceItem,
    padding,
    color = 'black',
    gradient,
    logo,
    backgroundImage,
    version,
    maskPattern,
    toSJISFunc,
    errorCorrectionLevel = 'M',
    children,
    renderBackground,
    ...props
  }: SVGQRCodeStyledProps,
  ref?: ForwardedRef<Svg> | null,
): React.JSX.Element {
  const { hidePieces = true, onChange: onChangeLogo, ...logoProps } = logo || {};
  const [logoArea, setLogoArea] = useState<LogoArea | undefined>();
  const qrCodeOptions = useMemo(
    () => ({
      version,
      errorCorrectionLevel,
      maskPattern,
      toSJISFunc,
    }),
    [errorCorrectionLevel, maskPattern, toSJISFunc, version],
  );
  const { qrCodeSize, bitMatrix } = useQRCodeData(data, qrCodeOptions);
  const svgSize = pieceSize * qrCodeSize;

  useEffect(() => {
    onChangeSize?.(qrCodeSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCodeSize]);

  const transformedOuterEyesOptions = transformEyeOptionsToCommonPattern(outerEyesOptions);
  const transformedInnerEyesOptions = transformEyeOptionsToCommonPattern(innerEyesOptions);

  const _props = { ...props };
  if (padding) {
    const _size = svgSize + 2 * padding;
    _props.width = _size;
    _props.height = _size;
    _props.viewBox = `-${padding} -${padding} ${_size} ${_size}`;
  }

  const startGradientOuterEyeCoords: { [K in EyePosition]: GradientOrigin } = {
    topLeft: [0, 0],
    topRight: [svgSize - pieceSize * OUTER_EYE_SIZE_IN_BITS, 0],
    bottomLeft: [0, svgSize - pieceSize * OUTER_EYE_SIZE_IN_BITS],
  };

  const startGradientInnerEyeCoords: { [K in EyePosition]: GradientOrigin } = {
    topLeft: [2 * pieceSize, 2 * pieceSize],
    topRight: [svgSize - pieceSize * INNER_EYE_SIZE_IN_BITS + 2 * pieceSize, 2 * pieceSize],
    bottomLeft: [2 * pieceSize, svgSize - pieceSize * OUTER_EYE_SIZE_IN_BITS + 2 * pieceSize],
  };

  const renderPieces = () => (
    <SVGPieces
      bitMatrix={bitMatrix}
      isPiecesGlued={isPiecesGlued}
      pieceLiquidRadius={pieceLiquidRadius}
      pieceBorderRadius={pieceBorderRadius}
      pieceCornerType={pieceCornerType}
      pieceRotation={pieceRotation}
      pieceScale={pieceScale}
      pieceSize={pieceSize}
      pieceStroke={pieceStroke}
      pieceStrokeWidth={pieceStrokeWidth}
      outerEyesOptions={transformedOuterEyesOptions}
      innerEyesOptions={transformedInnerEyesOptions}
      renderCustomPieceItem={renderCustomPieceItem}
      logoArea={hidePieces ? logoArea : undefined}
    />
  );

  const handleChangeLogo = (area: LogoArea | undefined) => {
    setLogoArea(area);
    onChangeLogo?.(area);
  };

  const renderLogo = () =>
    logo ? (
      <SVGQRLogo
        {...logoProps}
        pieceSize={pieceSize}
        qrCodeSize={qrCodeSize}
        onChange={handleChangeLogo}
        errorCorrectionLevel={errorCorrectionLevel}
        clipPath={logoProps.isRounded ? 'url(#rounded-logo)' : undefined}
      />
    ) : null;

  if (backgroundImage) {
    return (
      <Svg ref={ref} width={svgSize} height={svgSize} {..._props}>
        <Defs>
          <ClipPath id={'image'}>
            <G>{renderPieces()}</G>
          </ClipPath>

          <ClipPath id="rounded-logo">
            <Rect
              rx={"100%"}
              ry={"100%"}
              width={logoArea?.width || 0}
              height={logoArea?.width || 0}
              x={logoArea?.x ? logoArea?.x - pieceSize / 2 : 0}
              y={logoArea?.y ? logoArea?.y - pieceSize / 2 : 0}
            />
          </ClipPath>
        </Defs>

        {renderBackground?.(pieceSize, bitMatrix)}

        <SVGImage
          x="0"
          y="0"
          width="100%"
          height="100%"
          preserveAspectRatio="xMaxYMax slice"
          {...backgroundImage}
          clipPath="url(#image)"
        />

        {renderLogo()}

        {children?.(pieceSize, bitMatrix)}
      </Svg>
    );
  }

  return (
    <Svg ref={ref} width={svgSize} height={svgSize} {..._props}>
      <Defs>
        <ClipPath id="rounded-logo">
          <Rect
            rx={"100%"}
            ry={"100%"}
            width={logoArea?.width || 0}
            height={logoArea?.width || 0}
            x={logoArea?.x ? logoArea?.x - pieceSize / 2 : 0}
            y={logoArea?.y ? logoArea?.y - pieceSize / 2 : 0}
          />
        </ClipPath>

        {(!!gradient || !!transformedOuterEyesOptions || !!transformedInnerEyesOptions) && (
          <>
            {!!gradient && <SVGGradient id="gradient" size={svgSize} {...gradient} />}

            {!!transformedOuterEyesOptions &&
              Object.keys(transformedOuterEyesOptions).map((key) => {
                return (
                  <SVGGradient
                    id={`${key}CornerSquareGradient`}
                    key={`${key}CornerSquareGradient`}
                    size={pieceSize * OUTER_EYE_SIZE_IN_BITS}
                    origin={startGradientOuterEyeCoords[key as EyePosition]}
                    {...transformedOuterEyesOptions?.[key as EyePosition]?.gradient}
                  />
                );
              })}

            {!!transformedInnerEyesOptions &&
              Object.keys(transformedInnerEyesOptions).map((key) => {
                return (
                  <SVGGradient
                    id={`${key}CornerDotGradient`}
                    key={`${key}CornerDotGradient`}
                    size={pieceSize * INNER_EYE_SIZE_IN_BITS}
                    origin={startGradientInnerEyeCoords[key as EyePosition]}
                    {...transformedInnerEyesOptions?.[key as EyePosition]?.gradient}
                  />
                );
              })}
          </>
        )}
      </Defs>

      {renderBackground?.(pieceSize, bitMatrix)}

      <G fill={gradient ? 'url(#gradient)' : color}>{renderPieces()}</G>

      {renderLogo()}

      {children?.(pieceSize, bitMatrix)}
    </Svg>
  );
}

const forwardedSVGQRCodeStyled = forwardRef(SVGQRCodeRounded);
forwardedSVGQRCodeStyled.displayName = 'SVGQRCodeRounded';

export default forwardedSVGQRCodeStyled;
