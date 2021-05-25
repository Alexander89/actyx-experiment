import * as React from 'react'
import { Observable, Subscription } from 'rxjs'

type Props<T> = Readonly<{
  stream$: Observable<T>
  render: (data: T) => React.ReactNode
}>

type State<T> = Readonly<{
  data?: T
}>

// tslint:disable-next-line:no-class
export class ObserveStream<T> extends React.Component<Props<T>, State<T>> {
  subscription?: Subscription
  state: State<T> = {}

  componentDidMount(): void {
    // tslint:disable-next-line no-expression-statement no-object-mutation no-this
    this.subscription = this.props.stream$.subscribe(data => this.setState({ data }))
  }

  componentWillReceiveProps(props: Props<T>): void {
    // tslint:disable-next-line no-expression-statement no-this
    this.subscription && this.subscription.unsubscribe()
    // tslint:disable-next-line no-expression-statement no-object-mutation no-this
    this.subscription = props.stream$.subscribe(data => this.setState({ data }))
  }

  componentWillUnmount(): void {
    // tslint:disable-next-line no-expression-statement no-this
    this.subscription && this.subscription.unsubscribe()
  }

  render(): React.ReactNode {
    // tslint:disable-next-line:no-this
    const { data } = this.state
    // tslint:disable-next-line:no-this
    const { render } = this.props

    // TODO: render loading component? have it under a prop option?
    return data ? render(data) : null
  }
}
