import MCE from './chess-engine.js';

const PIECE_SVG = {
  P: '<path d="M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z" style="fill:#fff;stroke:#000;stroke-width:1.5;stroke-linecap:round"/>',
  p: '<path d="M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z" style="fill:#000;stroke:#000;stroke-width:1.5;stroke-linecap:round"/>',
  R: '<g style="fill:#fff;stroke:#000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z"/><path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z"/><path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"/><path d="M 34,14 L 31,17 L 14,17 L 11,14"/><path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17"/><path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5"/><path d="M 11,14 L 34,14" style="fill:none"/></g>',
  r: '<g style="fill:#000;stroke:#000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z"/><path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z"/><path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"/><path d="M 34,14 L 31,17 L 14,17 L 11,14"/><path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17"/><path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5"/><path d="M 11,14 L 34,14" style="fill:none;stroke:#fff;stroke-linejoin:miter"/><path d="M 12,35.5 L 33,35.5" style="fill:none;stroke:#fff;stroke-width:1"/><path d="M 13,31.5 L 32,31.5" style="fill:none;stroke:#fff;stroke-width:1"/><path d="M 14,29.5 L 31,29.5" style="fill:none;stroke:#fff;stroke-width:1"/></g>',
  N: '<g style="fill:none;stroke:#000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" style="fill:#fff"/><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" style="fill:#fff"/><path d="M 9.5,25.5 A 0.5,0.5 0 1 1 8.5,25.5 A 0.5,0.5 0 1 1 9.5,25.5 z" style="fill:#000"/><path d="M 15,15.5 A 0.5,1.5 0 1 1 14,15.5 A 0.5,1.5 0 1 1 15,15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" style="fill:#000"/></g>',
  n: '<g style="fill:none;stroke:#000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" style="fill:#000"/><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" style="fill:#000"/><path d="M 9.5,25.5 A 0.5,0.5 0 1 1 8.5,25.5 A 0.5,0.5 0 1 1 9.5,25.5 z" style="fill:#fff"/><path d="M 15,15.5 A 0.5,1.5 0 1 1 14,15.5 A 0.5,1.5 0 1 1 15,15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" style="fill:#fff"/><path d="M 24.55,10.4 L 24.1,11.85 L 24.6,12 C 27.75,13 30.25,14.49 32.5,18.75 C 34.75,23.01 35.75,29.06 35.25,39 L 35.2,39.5 L 37.45,39.5 L 37.5,39 C 38,28.94 36.62,22.15 34.25,17.66 C 31.88,13.17 28.46,11.02 25.06,10.5 L 24.55,10.4 z" style="fill:#fff;stroke:none"/></g>',
  B: '<g style="fill:none;stroke:#000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><g style="fill:#fff;stroke-linecap:butt"><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.2,38.91 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.8,38.91 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z"/><path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z"/><path d="M 25,8 A 2.5,2.5 0 1 1 20,8 A 2.5,2.5 0 1 1 25,8 z"/></g><path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" style="fill:none;stroke:#000;stroke-linejoin:miter"/></g>',
  b: '<g style="fill:none;stroke:#000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><g style="fill:#000;stroke-linecap:butt"><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.2,38.91 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.8,38.91 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z"/><path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z"/><path d="M 25,8 A 2.5,2.5 0 1 1 20,8 A 2.5,2.5 0 1 1 25,8 z"/></g><path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" style="fill:none;stroke:#fff;stroke-linejoin:miter"/></g>',
  Q: '<g style="fill:#fff;stroke:#000;stroke-width:1.5;stroke-linejoin:round"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z"/><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11.5,38.5 11.5,38.5 C 17.5,39.5 27.5,39.5 33.5,38.5 C 33.5,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z"/><path d="M 11.5,30 C 15,29 30,29 33.5,30" style="fill:none"/><path d="M 12,33.5 C 15,32.5 30,32.5 33,33.5" style="fill:none"/><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="8" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/></g>',
  q: '<g style="fill:#000;stroke:#000;stroke-width:1.5;stroke-linejoin:round"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z"/><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11.5,38.5 11.5,38.5 C 17.5,39.5 27.5,39.5 33.5,38.5 C 33.5,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z"/><path d="M 11.5,30 C 15,29 30,29 33.5,30" style="fill:none;stroke:#fff"/><path d="M 12,33.5 C 15,32.5 30,32.5 33,33.5" style="fill:none;stroke:#fff"/><circle cx="6" cy="12" r="2" style="fill:#fff"/><circle cx="14" cy="9" r="2" style="fill:#fff"/><circle cx="22.5" cy="8" r="2" style="fill:#fff"/><circle cx="31" cy="9" r="2" style="fill:#fff"/><circle cx="39" cy="12" r="2" style="fill:#fff"/></g>',
  K: '<g style="fill:#fff;stroke:#000;stroke-width:1.5;stroke-linejoin:round"><path d="M 22.5,11.63 L 22.5,6" style="fill:none;stroke-linejoin:miter"/><path d="M 20,8 L 25,8" style="fill:none;stroke-linejoin:miter"/><path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25"/><path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37"/><path d="M 12.5,30 C 18,27 27,27 32.5,30"/><path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5"/><path d="M 12.5,37 C 18,34 27,34 32.5,37"/></g>',
  k: '<g style="fill:#000;stroke:#000;stroke-width:1.5;stroke-linejoin:round"><path d="M 22.5,11.63 L 22.5,6" style="fill:none;stroke:#fff;stroke-linejoin:miter"/><path d="M 20,8 L 25,8" style="fill:none;stroke:#fff;stroke-linejoin:miter"/><path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25"/><path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37"/><path d="M 12.5,30 C 18,27 27,27 32.5,30" style="fill:none;stroke:#fff"/><path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" style="fill:none;stroke:#fff"/><path d="M 12.5,37 C 18,34 27,34 32.5,37" style="fill:none;stroke:#fff"/></g>',
  A: '<g style="fill:#fff;stroke:#000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.2,38.91 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.8,38.91 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z"/><path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z"/><circle cx="22.5" cy="8" r="3"/></g><text x="22.5" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#000" font-family="serif">A</text>',
  a: '<g style="fill:#000;stroke:#000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.2,38.91 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.8,38.91 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z"/><path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z"/><circle cx="22.5" cy="8" r="3"/></g><text x="22.5" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#fff" font-family="serif">A</text>',
  C: '<g style="fill:#fff;stroke:#000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z"/><path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z"/><path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"/><path d="M 34,14 L 31,17 L 14,17 L 11,14"/><path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17"/><path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5"/></g><text x="22.5" y="26" text-anchor="middle" font-size="12" font-weight="bold" fill="#000" font-family="serif">C</text>',
  c: '<g style="fill:#000;stroke:#000;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z"/><path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z"/><path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"/><path d="M 34,14 L 31,17 L 14,17 L 11,14"/><path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17"/><path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5"/></g><text x="22.5" y="26" text-anchor="middle" font-size="12" font-weight="bold" fill="#fff" font-family="serif">C</text>',
  S: '<g style="fill:#fff;stroke:#000;stroke-width:1.5"><circle cx="22.5" cy="22.5" r="12"/></g><text x="22.5" y="27" text-anchor="middle" font-size="12" font-weight="bold" fill="#000" font-family="serif">S</text>',
  s: '<g style="fill:#000;stroke:#000;stroke-width:1.5"><circle cx="22.5" cy="22.5" r="12"/></g><text x="22.5" y="27" text-anchor="middle" font-size="12" font-weight="bold" fill="#fff" font-family="serif">S</text>',
  M: '<g style="fill:#fff;stroke:#000;stroke-width:1.5;stroke-linejoin:round"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z"/><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11.5,38.5 11.5,38.5 C 17.5,39.5 27.5,39.5 33.5,38.5 C 33.5,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z"/><path d="M 11.5,30 C 15,29 30,29 33.5,30" style="fill:none"/><path d="M 12,33.5 C 15,32.5 30,32.5 33,33.5" style="fill:none"/><circle cx="6" cy="12" r="2.5" style="fill:gold;stroke:#000"/><circle cx="14" cy="9" r="2.5" style="fill:gold;stroke:#000"/><circle cx="22.5" cy="8" r="2.5" style="fill:gold;stroke:#000"/><circle cx="31" cy="9" r="2.5" style="fill:gold;stroke:#000"/><circle cx="39" cy="12" r="2.5" style="fill:gold;stroke:#000"/></g>',
  m: '<g style="fill:#000;stroke:#000;stroke-width:1.5;stroke-linejoin:round"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z"/><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11.5,38.5 11.5,38.5 C 17.5,39.5 27.5,39.5 33.5,38.5 C 33.5,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z"/><path d="M 11.5,30 C 15,29 30,29 33.5,30" style="fill:none;stroke:#fff"/><path d="M 12,33.5 C 15,32.5 30,32.5 33,33.5" style="fill:none;stroke:#fff"/><circle cx="6" cy="12" r="2.5" style="fill:gold;stroke:#000"/><circle cx="14" cy="9" r="2.5" style="fill:gold;stroke:#000"/><circle cx="22.5" cy="8" r="2.5" style="fill:gold;stroke:#000"/><circle cx="31" cy="9" r="2.5" style="fill:gold;stroke:#000"/><circle cx="39" cy="12" r="2.5" style="fill:gold;stroke:#000"/></g>',
};

const THEMES = {
  classic: { light: '#f0d9b5', dark: '#b58863', border: '#8b6914' },
  cosmic: { light: '#2d3760', dark: '#141c37', border: '#0c4f8d' },
  wood: { light: '#deb887', dark: '#8b5e3c', border: '#5c3317' },
  marble: { light: '#f2f0ec', dark: '#b8b5af', border: '#9e9b95' },
  neon: { light: '#1a1a2e', dark: '#0f0f1a', border: '#00ff88' },
  minimal: { light: '#fafafa', dark: '#e8e8e8', border: '#ddd' },
};

export function renderSvg(options) {
  const variant = options.variant || 'standard';
  const fen = options.fen || null;
  const themeName = options.theme || 'classic';
  const highlights = options.highlights || [];
  const size = options.size || 480;

  const vc = MCE.getVariantConfig(variant);
  if (!vc && variant !== 'standard') return null;

  const game = MCE.createGame(variant);
  if (fen) MCE.loadFEN(game, fen);

  const rows = game.rows;
  const cols = game.cols;
  const tileSize = size / cols;
  const height = tileSize * rows;
  const theme = THEMES[themeName] || THEMES.classic;

  const usedPieces = collectUsedPieces(game, rows, cols);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${height}" width="${size}" height="${height}">\n`;
  svg += renderDefs(usedPieces, tileSize, cols);
  svg += renderSquares(game, rows, cols, tileSize, theme, highlights);
  svg += renderPieces(game, rows, cols, tileSize, usedPieces);
  svg += renderLabels(rows, cols, tileSize, height, theme);
  svg += '</svg>';
  return svg;
}

function collectUsedPieces(game, rows, cols) {
  const used = new Set();
  const total = rows * cols;
  for (let i = 0; i < total; i++) {
    const p = game.board[i];
    if (p) used.add(p);
  }
  return used;
}

function renderDefs(usedPieces, tileSize, cols) {
  let defs = '<defs>\n';
  const scale = tileSize / 45;
  for (const piece of usedPieces) {
    const svgContent = PIECE_SVG[piece];
    if (svgContent) {
      defs += `<symbol id="p-${piece}" viewBox="0 0 45 45">${svgContent}</symbol>\n`;
    }
  }
  defs += '</defs>\n';
  return defs;
}

function renderSquares(game, rows, cols, tileSize, theme, highlights) {
  let out = '';
  const hlSet = new Set(highlights.map(h => {
    if (typeof h === 'number') return h;
    const col = h.charCodeAt(0) - 97;
    const row = rows - parseInt(h.slice(1));
    return row * cols + col;
  }));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tileSize;
      const y = r * tileSize;
      const isDark = (r + c) % 2 === 1;
      const fill = isDark ? theme.dark : theme.light;
      out += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="${fill}"/>\n`;

      const sq = r * cols + c;
      if (hlSet.has(sq)) {
        out += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="rgba(255,255,0,0.4)"/>\n`;
      }
    }
  }
  return out;
}

function renderPieces(game, rows, cols, tileSize) {
  let out = '';
  const pieceSize = tileSize * 0.9;
  const offset = tileSize * 0.05;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sq = r * cols + c;
      const piece = game.board[sq];
      if (!piece) continue;

      const x = c * tileSize + offset;
      const y = r * tileSize + offset;

      if (PIECE_SVG[piece]) {
        out += `<use href="#p-${piece}" x="${x}" y="${y}" width="${pieceSize}" height="${pieceSize}"/>\n`;
      } else {
        const isWhite = piece === piece.toUpperCase();
        const fill = isWhite ? '#fff' : '#000';
        const stroke = isWhite ? '#000' : '#fff';
        const cx = c * tileSize + tileSize / 2;
        const cy = r * tileSize + tileSize * 0.65;
        const fs = tileSize * 0.55;
        out += `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="${fs}" font-weight="bold" fill="${fill}" stroke="#000" stroke-width="0.5" font-family="serif">${piece.toUpperCase()}</text>\n`;
      }
    }
  }
  return out;
}

function renderLabels(rows, cols, tileSize, height, theme) {
  let out = '';
  const fontSize = tileSize * 0.22;
  const labelColor = theme.border;

  for (let c = 0; c < cols; c++) {
    const x = c * tileSize + tileSize - fontSize * 0.4;
    const y = height - fontSize * 0.3;
    const label = String.fromCharCode(97 + c);
    out += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${labelColor}" font-family="sans-serif">${label}</text>\n`;
  }

  for (let r = 0; r < rows; r++) {
    const x = fontSize * 0.3;
    const y = r * tileSize + fontSize * 1.1;
    const label = String(rows - r);
    out += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${labelColor}" font-family="sans-serif">${label}</text>\n`;
  }
  return out;
}
