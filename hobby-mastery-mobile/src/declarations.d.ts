import 'react';

declare module 'react' {
  namespace JSX {
    interface ElementClass {
      props: any;
    }
  }
}

declare global {
  namespace JSX {
    interface ElementClass {
      props: any;
    }
  }
}

export {};
