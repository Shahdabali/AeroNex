import { useAppContext } from '../context/AppProvider';

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useAppContext();
  return { theme, setTheme, toggleTheme };
}
