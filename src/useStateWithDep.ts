import {useEffect, useState} from 'react';

// Inspired by: https://stackoverflow.com/a/67893529/6099842
export function useStateWithDep<T>(defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return [value, setValue] as const;
}