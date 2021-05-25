import { TouchRipple, Typography } from '@actyx/industrial-ui'
import * as React from 'react'
import { View } from '../../App'

type Props = {
  onChangeView: (view: View) => void
}

export const MainMenu = ({ onChangeView }: Props): JSX.Element => {
  const { button } = styles
  return (
    <div style={{ display: 'flex' }}>
      <TouchRipple onClick={() => onChangeView('agv')} style={button}>
        <div style={{ margin: 'auto' }}>
          <Typography variant="heading">Agv control</Typography>
        </div>
      </TouchRipple>

      <TouchRipple onClick={() => onChangeView('map')} style={button}>
        <div style={{ margin: 'auto' }}>
          <Typography variant="heading">Map control</Typography>
        </div>
      </TouchRipple>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    flex: '1',
    height: '75vh',
    maxHeight: 800,
    border: 'solid 3px gray',
    borderRadius: 15,
    margin: 10,
    padding: 10,
    display: 'flex',
    backgroundImage: 'linear-gradient(#f0f0f0, #e0e0e0)',
  },
}
