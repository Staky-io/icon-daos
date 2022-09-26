const presets = [
  'ipad-2',
  'ipad-mini',
  'iphone-3',
  'iphone-4',
  'iphone-5',
  'iphone-6',
  'iphone-6+',
  'iphone-7',
  'iphone-8',
  'iphone-x',
  'iphone-xr',
  'iphone-se2',
  'macbook-11',
  'macbook-13',
  'macbook-15',
  'macbook-16',
  'samsung-note9',
  'samsung-s10',
]

const orientations = [
  'portrait',
  'landscape',
]

const sizes = [
  [720, 480],
  [1280, 720],
  [1920, 1080],
  [3840, 2160],
  [7680, 4320],
]

export const viewports = [
  ...presets.map((preset) => orientations.map((orientation) => [preset, orientation])).flat(),
  ...sizes.map(([width, height]) => [[width, height], [height, width]]).flat(),
]
