import * as React from 'react'
import { OrderList } from './components/OrderList'
import { Header } from '../ui-common'
import { NewOrder } from './components/NewOrder'

import '../ui-common/assets/font/font.css'

// required for React Router on tablets
// const basename = window.location.pathname

export const App = (): JSX.Element => {
  const { root, wrapper, card } = styling
  return (
    <>
      <Header title="Production Order System" />
      <div style={root}>
        <div style={wrapper}>
          <div>
            <div style={card}>
              <NewOrder />
            </div>
          </div>
          <div style={card}>
            <OrderList />
          </div>
        </div>
      </div>
    </>
  )
}

type CSS = Record<string, React.CSSProperties>

const styling: CSS = {
  root: {
    margin: 10,
    display: 'flex',
  },
  wrapper: {
    flex: '1',
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
}
