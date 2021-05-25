import { usePond } from '@actyx-contrib/react-pond'
import * as React from 'react'
import { SimpleStationFish } from '../fish/simpleStationFish'
import '../ui-common/assets/font/font.css'
import { AdminPage } from './pages/AdminPage'
import { MainPage } from './pages/MainPage'

type Props = {
  stationId: string
  goalId: string
}

export const App = ({ stationId, goalId }: Props): JSX.Element => {
  const [page, setPage] = React.useState<AppMode>('main')

  const pond = usePond()
  React.useEffect(() => {
    SimpleStationFish.emitStationAvailable(pond, stationId, goalId)
  }, [])

  switch (page) {
    case 'admin':
      return <AdminPage stationId={stationId} onSetPage={setPage} />
    case 'main':
      return <MainPage stationId={stationId} onSetPage={setPage} />
  }
}

type CSS = Record<string, React.CSSProperties>

export type AppMode = 'main' | 'admin'
export const mainStyling: CSS = {
  root: {
    margin: 10,
    display: 'flex',
    height: 'calc(100vh - 180px)',
  },
  wrapper: {
    flex: '1',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#F7FAFC',
    padding: '24px 36px',
    margin: '12px 24px',
    borderRadius: 12,
  },
  innerCard: {
    backgroundColor: '#e5e8ea',
    padding: '12px 24px',
    margin: '12px 24px',
    borderRadius: 12,
  },
  closeButton: {
    cursor: 'pointer',
    borderRadius: '50%',
    width: 60,
    height: 60,
    position: 'absolute',
    right: -18,
    top: -20,
    backgroundColor: '#b93b3b',
    border: 'solid 5px white',
    color: 'white',
    fontSize: 'xx-large',
    fontWeight: 900,
    textAlign: 'center',
  },
}
