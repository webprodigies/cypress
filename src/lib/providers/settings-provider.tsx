'use client';

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

export type SettingsContextType = {
  showSettings: boolean;
  defaultSelected: string;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  setDefaultSelected: Dispatch<SetStateAction<string>>;
};

const SettingsContext = createContext<SettingsContextType>({
  showSettings: false,
  defaultSelected: 'workspace',
  setShowSettings: () => {},
  setDefaultSelected: () => {},
});

export const useSettings = () => {
  return useContext(SettingsContext);
};

interface SettingsProfider {
  children: React.ReactNode;
}
export const SettingsProvider: React.FC<SettingsProfider> = ({ children }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [defaultSelected, setDefaultSelected] = useState('');

  return (
    <SettingsContext.Provider
      value={{
        showSettings,
        defaultSelected,
        setShowSettings,
        setDefaultSelected,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
