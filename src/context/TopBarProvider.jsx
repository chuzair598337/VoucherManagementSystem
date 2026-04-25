import { useState } from 'react';
import { TopBarContext } from './TopBarContext';

export default function TopBarProvider({ children }) {
  const [title, setTitle] = useState('');
  const [actions, setActions] = useState(null);

  return (
    <TopBarContext.Provider value={{ title, actions, setTitle, setActions }}>
      {children}
    </TopBarContext.Provider>
  );
}
