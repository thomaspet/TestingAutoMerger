declare module 'jwt-decode' {
  function decode(token: string): any;
  namespace decode {}  // notice how we have to create a namespace that is equal to the function we're assigning the export to
  export = decode;
}

// declare module 'file-saver' {
//   function saveAs(): any;
//   namespace saveAs {}
//   export = saveAs
// }

// declare module 'lodash';
// declare module 'chart.js';
// declare module 'immutable';
declare module 'jquery';
declare module 'stimulsoft';