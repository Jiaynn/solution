/**
 * @file react relative types
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

export type ReactProps<P extends object = object, T = any>
  = P & React.ClassAttributes<T> & { children?: React.ReactNode }

export type ReactRenderResult = JSX.Element | null | false

export type ReactFunctionalComponent<P extends ReactProps = ReactProps> = (props: P) => ReactRenderResult

// TODO: check React.ComponentClass | React.Component | React.PureComponent | React.StatelessComponent | Function
export type ReactComponent<P extends ReactProps = ReactProps> = React.Component<P> | ReactFunctionalComponent<P>
