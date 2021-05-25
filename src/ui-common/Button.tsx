import * as React from 'react'

type Props = {
  children: JSX.Element | string
  color: string
  icon?: string
  style?: React.CSSProperties
  wrapSpace?: boolean
  disabled?: boolean
  onClick: () => void
}

export const Button = ({
  children,
  style,
  color,
  wrapSpace,
  disabled,
  onClick,
}: Props): JSX.Element => {
  const [mouseOver, setMouseOver] = React.useState(false)
  const [mouseDown, setMouseDown] = React.useState(false)
  const transColor = (cin: string) => {
    switch (cin.toLowerCase()) {
      case 'red':
        return '#b93b3b'
      case 'green':
        return '#328e32'
      case 'primary':
        return '#0375b3'
      case 'yellow':
        return '#d2d209'
      case 'neutral':
        return '#909099'
      default:
        return cin
    }
  }

  const styling: React.CSSProperties = {
    flex: '1',
    borderRadius: 4,
    boxShadow: '1px 1px 3px #00001080',
    padding: '12px 24px',
    textTransform: 'uppercase',
    color: 'white',
    textAlign: 'center',
    fontWeight: 900,
    backgroundColor: transColor(color),
    cursor: disabled ? 'default' : 'pointer',
    whiteSpace: wrapSpace ? 'normal' : 'nowrap',
    transition: 'opacity linear 0.3s',
    opacity: mouseDown || disabled ? 0.4 : mouseOver ? 1 : 0.85,
    ...style,
  }
  return (
    <div
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
      onClick={() => !disabled && onClick()}
      style={styling}
    >
      {children}
    </div>
  )
}
