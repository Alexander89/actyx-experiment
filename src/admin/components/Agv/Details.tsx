import * as React from 'react'
import { Typography } from '@actyx/industrial-ui'
import { Button } from '../../../ui-common'

type Props = {
  title: string
  content: string
  onClose: () => void
  children?: JSX.Element
}

export const Details = ({ title, children, content, onClose }: Props): JSX.Element => {
  const { root, wrapper, panel, code } = styling
  return (
    <div style={root} onClick={() => onClose()}>
      <div
        style={wrapper}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div style={panel}>
          <div style={{ flex: '1' }}>
            <Typography variant="standard" textTransform="uppercase" bold>
              {title}
            </Typography>
          </div>
          <div style={{ display: 'flex', flex: '0' }}>
            {children}
            <Button color="orange" icon="close" onClick={onClose}>
              X
            </Button>
          </div>
        </div>
        <pre style={code}>{content}</pre>
      </div>
    </div>
  )
}

const styling: Record<string, React.CSSProperties> = {
  root: {
    zIndex: 100,
    backgroundColor: '#000000a0',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  wrapper: {
    backgroundColor: '#ffffffa0',
    border: 'solid 2px white',
    padding: 15,
    borderRadius: 10,
    margin: '60px auto',
    width: '60%',
  },
  panel: {
    display: 'flex',
    flexDirection: 'row',
  },
  code: {
    backgroundColor: '#ffffff',
    padding: 15,
  },
}
