import { useEffect, useRef } from "react";

export default function usePrevious<T>(value) {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current as T
}
