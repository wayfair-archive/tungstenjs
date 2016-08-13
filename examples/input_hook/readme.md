## Internet Explorer type attribute hooks for `Input` element.

Internet Explorer doesn't adhere to the standard when setting not supported input types, and not falling back to `type="text"`.<br>
This example will allow setting only supported types for Internet Explorer and falling back to `type="text"`, if type is not supported.

## Run

```
# run `npm install && npm run dist` on the main tungstenjs directory
npm install
npm start
# To run in debug mode: `npm start -- --dev`
```
