import AsyncStorage from '@react-native-async-storage/async-storage';

import { State, parseState } from './state';

const STORAGE_KEY = 'domino/state/v1';

export async function loadState(): Promise<State | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return parseState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function saveState(state: State): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Scoring keeps working in memory when the device refuses the write.
  }
}
