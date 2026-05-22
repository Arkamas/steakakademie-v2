'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

export default function ClarityScript() {
  useEffect(() => {
    Clarity.init('wv3l573awi');
  }, []);

  return null;
}
