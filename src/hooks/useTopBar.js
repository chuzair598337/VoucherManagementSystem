import { useContext, useEffect } from 'react';
import { TopBarContext } from '../context/TopBarContext';

export function useTopBarState() {
  const ctx = useContext(TopBarContext);
  if (!ctx) throw new Error('useTopBarState must be used within TopBarProvider');
  return ctx;
}

/**
 * Pages call this to declare what TopBar should show while they are mounted.
 * `title` is a string, `actions` is a JSX node (or null).
 * The effect re-runs only when `deps` change, so sub-views can swap title/actions.
 */
export function useTopBar(title, actions, deps = []) {
  const { setTitle, setActions } = useContext(TopBarContext);
  useEffect(() => {
    setTitle(title);
    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
