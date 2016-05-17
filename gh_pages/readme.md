# Tungsten.js Site Source

## Build and Publish

```
# run `npm install && npm run dist` on the main tungstenjs directory
npm install
npm run build
# built site will be at `../output`
# replace `gh-pages` branch content with the built site directory
```

## Adding Content

_@todo: automate more of this process_

### Add a tutorial

1. Add tutorial's JS file to `js/tutorials`
2. List JS file in `bundles[/js/tutorials.js]` array in `config.json`
3. Add tutorial name, and URIEncoded name, in `pageData[tutorials]` array in `config.json`

### Add a `sampleFeature` docs page

1. Create an empty `contents/_sampleFeature` directory with a `.gitkeep` file
2. Add a `cp` command in the `move-docs` npm script in `package.json` to copy the markdown file: e.g., `&& cp ../sampleFeature.md contents/_sampleFeature/content.markdown`
3. Add a menu link in `templates/_common.mustache` for the tutorial page.
