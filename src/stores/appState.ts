import { persistentAtom } from '@nanostores/persistent';

// 'true' if the user has clicked "Get Started" or installed the app
export const onboardedStore = persistentAtom<boolean>('oap_onboarded', false, {
  encode: String,
  decode: (str) => str === 'true',
});
