import { Button, Typography } from '@actyx/industrial-ui'
import * as React from 'react'
import logo from './assets/images/logo.png'

type Props = {
  onBack?: () => void
  title: string
  content?: React.ReactNode | React.ReactNodeArray
}

export const Header = ({ onBack, title, content }: Props): JSX.Element => {
  return (
    <div style={{ display: 'flex', backgroundColor: '#0375b3', padding: '5px 15px' }}>
      {onBack && (
        <div style={{ paddingTop: 10, display: 'flex', color: 'white' }}>
          <Button variant="flat" color="transparent" icon="arrow_back" onClick={() => onBack()} />
        </div>
      )}
      <div style={{ alignSelf: 'center' }}>
        <Typography variant="distance" color="#FFFFFF">
          {title}
        </Typography>
      </div>
      <div style={{ flex: '1' }} />
      {content && <div style={{ alignSelf: 'center' }}>{content}</div>}
      <div style={{ backgroundColor: 'white', padding: 10, margin: 14 }}>
        <img src={logo} />
      </div>
    </div>
  )
}
