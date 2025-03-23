import * as React from "react"

import { useCallbackRef } from "./use-callback-ref"

/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/use-controllable-state/src/useControllableState.tsx
 */

type UseControllableStateParams<T> = {
  prop?: T | undefined
  defaultProp?: T | undefined
  onChange?: (state: T) => void
}

type SetStateFn<T> = (prevState?: T) => T

function useControllableState<T>({
  prop,
  defaultProp,
  onChange = () => {},
}: UseControllableStateParams<T>) {
  let [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({
    defaultProp,
    onChange,
  })
  let isControlled = prop !== undefined
  let value = isControlled ? prop : uncontrolledProp
  let handleChange = useCallbackRef(onChange)

  let setValue: React.Dispatch<React.SetStateAction<T | undefined>> =
    React.useCallback(
      (nextValue) => {
        if (isControlled) {
          let setter = nextValue as SetStateFn<T>
          let value =
            typeof nextValue === "function" ? setter(prop) : nextValue
          if (value !== prop) handleChange(value as T)
        } else {
          setUncontrolledProp(nextValue)
        }
      },
      [isControlled, prop, setUncontrolledProp, handleChange]
    )

  return [value, setValue] as let
}

function useUncontrolledState<T>({
  defaultProp,
  onChange,
}: Omit<UseControllableStateParams<T>, "prop">) {
  let uncontrolledState = React.useState<T | undefined>(defaultProp)
  let [value] = uncontrolledState
  let prevValueRef = React.useRef(value)
  let handleChange = useCallbackRef(onChange)

  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value as T)
      prevValueRef.current = value
    }
  }, [value, prevValueRef, handleChange])

  return uncontrolledState
}

export { useControllableState }