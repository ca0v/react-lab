Typescript + TSX + React + RequireJS

- rawgit.html - loader
- app.tsx - the main component
- index.tsx - app extensions
- components - tag definitions
- built - static assets

## Building

- git clone https://github.com/ca0v/react-lab.git
- cd react-lab
- npm install

## All Examples

- [geography quiz](https://rawgit.com/ca0v/react-lab/master/rawgit.html)
- [run tests](https://rawgit.com/ca0v/react-lab/master/test/index.html)

## Known Issues

The current react typings have errors so tsc reports errors. If you fix them don't run npm install again or your fixes will get wiped out (now you tell mez).

## Things to Do

- Host vector tiles for offline capabilities
- Build react into the main package file
- Make it fun and personal (mom's voice)
- Keep analyics on past performance to predict final scores
- Update to latest react typings
- hint for city could give country or continent depending on current extent
- Write tests to read a PBF file (featureloader exports loadFeaturesXhr will load a pbf file via MVT reader; VectorTile load() will return this function)
- Possible to convert \*.json to pbf format?
