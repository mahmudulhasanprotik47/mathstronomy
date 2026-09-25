import 'react';

// Lets style props carry CSS custom properties (--p1, --cols, …) without a cast.
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
