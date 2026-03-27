import { useColorScheme as _useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

export function useThemeColors() {
  const scheme = _useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}
