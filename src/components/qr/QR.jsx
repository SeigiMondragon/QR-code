import { QRCode } from '@kroszborg/rune-react'

function QR({
  value = 'https://example.com',
  dotsStyle = 'rounded',
  dotsColor = '#090d16',
  backgroundColor = '#ffffff',
  useGradient = false,
  gradientType = 'linear',
  gradientRotation = 45,
  gradientColor1 = '#6366f1',
  gradientColor2 = '#06b6d4',
  squareStyle = 'extra-rounded',
  cornerDotStyle = 'rounded',
  logoValue = '',
  logoSize = 0.2,
  logoShape = 'square',
  ecl = 'M',
  margin = 2,
  className = '',
}) {
  const dots = {
    style: dotsStyle,
    ...(useGradient
      ? {
          gradient: {
            type: gradientType,
            rotation: gradientRotation,
            stops: [
              { offset: 0, color: gradientColor1 },
              { offset: 1, color: gradientColor2 },
            ],
          },
        }
      : { color: dotsColor }),
  }

  const logo = logoValue
    ? {
        src: logoValue,
        size: logoSize,
        shape: logoShape,
      }
    : undefined

  // If a logo is present and ecl is lower than Q, bump default to H for reliability
  const effectiveEcl = logoValue && (ecl === 'L' || ecl === 'M') ? 'H' : ecl

  return (
    <QRCode
      value={value || ' '}
      dots={dots}
      background={backgroundColor}
      corners={{
        square: {
          style: squareStyle,
          ...(useGradient ? {} : { color: dotsColor }),
        },
        dot: {
          style: cornerDotStyle,
          ...(useGradient ? {} : { color: dotsColor }),
        },
      }}
      logo={logo}
      ecl={effectiveEcl}
      margin={margin}
      className={className}
    />
  )
}

export default QR
