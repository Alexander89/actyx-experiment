/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Typography, Input as IuiInput } from '@actyx/industrial-ui'
import * as React from 'react'
type Props =
  | {
      type?: 'text'
      style?: React.CSSProperties
      lable: string
      placeholder?: string
      width?: number | string
      value: string
      disabled?: boolean
      onChanged?: (v: string) => void
      onBlur?: (v: string) => void
    }
  | {
      type: 'number'
      style?: React.CSSProperties
      lable: string
      placeholder?: string
      width?: number | string
      value: number
      disabled?: boolean
      onChanged?: (v: number) => void
      onBlur?: (v: number) => void
    }

export const Input = ({
  style,
  type,
  lable,
  placeholder,
  width,
  value,
  disabled,
  onChanged,
  onBlur,
}: Props): JSX.Element => {
  return (
    <div style={style}>
      <div style={{ marginBottom: 12 }}>
        <Typography variant="subtext" color="#77777D" textTransform="uppercase">
          {lable}
        </Typography>
      </div>
      <div style={{ width, marginBottom: 24 }}>
        <IuiInput
          type={type || 'text'}
          placeholder={placeholder}
          value={value}
          fullWidth
          disabled={disabled}
          onBlur={() => {
            if (type === 'number' && onBlur) {
              // @ts-ignore
              onBlur(value)
            } else if ((type === 'text' || type == undefined) && onBlur) {
              // @ts-ignore
              onBlur(value)
            }
          }}
          onChange={({ target }) => {
            if (type === 'number' && onChanged) {
              // @ts-ignore
              onChanged(target.value)
            } else if ((type === 'text' || type == undefined) && onChanged) {
              // @ts-ignore
              onChanged(target.value)
            }
          }}
        />
      </div>
    </div>
  )
}
