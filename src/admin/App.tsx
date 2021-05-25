import { AdminUiFish, GlobalRefFish } from '../fish'
import { createTransformData, TransformData } from '../math/translateMap'
import * as React from 'react'
import { Header } from '../ui-common'
import bg from './assets/bg01.png'
import { Agv, MainMenu, Map } from './components'
import { useFishFn } from '@actyx-contrib/react-pond'

import '../ui-common/assets/font/font.css'
export type View = '' | 'map' | 'agv'

export const App = (): JSX.Element => {
  const [mapTransformation, setMapTransformation] = React.useState<TransformData>()
  const globalRef = useFishFn(GlobalRefFish.global, 0)
  const adminPos = useFishFn(AdminUiFish.general, 0)
  const [view, setView] = React.useState<View>('map')

  React.useEffect(() => {
    if (adminPos) {
      setMapTransformation(
        createTransformData([0, 0], [0, 1], adminPos.state.origin, adminPos.state.ref),
      )
    }
  }, [adminPos])

  return (
    <>
      <Header onBack={() => setView('')} title="Admin Tooling for AGV setup" />
      <div style={{ margin: '5px 15px' }}>
        {view === '' && <MainMenu onChangeView={setView} />}
        {view === 'agv' && globalRef && <Agv globalRef={globalRef.state} />}
        {mapTransformation && globalRef && view === 'map' && (
          <Map
            background={bg}
            width={1410}
            height={700}
            globalRef={globalRef.state}
            mapTransformation={mapTransformation}
          />
        )}
      </div>
    </>
  )
}

// tslint:disable-next-line: no-object-mutation
App.displayName = 'App'
