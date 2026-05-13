import * as Linking from 'expo-linking';

export const linking = {
  prefixes: [
    Linking.createURL('/'),
    'fittracker://',
    'http://localhost:8081',
  ],
};