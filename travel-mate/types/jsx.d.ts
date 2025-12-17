import * as React from 'react';

declare global {
  namespace JSX {
    // Allow JSX elements to be any React node (covers components that return ReactNode|undefined)
    type Element = React.ReactNode | null;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
