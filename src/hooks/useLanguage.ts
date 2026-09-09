import { useAppContext } from '../context/AppProvider';

export function useLanguage() {
  const { language, setLanguage, t } = useAppContext();
  return { language, setLanguage, t };
}
