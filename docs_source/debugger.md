# Debugger

Tungsten.js can be optionally packaged, via webpack, with the Tungsten.js Debugger.  To build with the debugger, run the webpack build with `--dev`.  Once included in the build, the debugger can be activated by running `window.launchDebugger()` in the console and clicking on the "Open Tungsten.js Debugger" button that appears in the document.  Currently the debugger only works with the Backbone adaptor for Tungsten.js.

The debugger was inspired by (and uses styles from) Jason Laster's [marionette.inspector](https://github.com/marionettejs/marionette.inspector).

The debugger is composed of two main panels: view and data.

## View Debugger Panel

**View**: This section lists the `cid`, `debugName`, `tagName`, `className`, and the element of the selected view.

**Methods**: All methods on the selected view are listed here (inherited methods can be shown by clicking the checkbox).  Clicking "untracked" next to a method name will toggle tracking: when tracking is on, a stack trace will be printed to the main console when the method is called.

**Events**: Inputting an event name in the text field in this section will add an ad hoc event listener for that event on the selected view which, when triggered, will print a stack trace of the event in the main console.

**View Events**: Inputting an event name in the text field in this section will add an ad hoc event listener for that event on the selected view which, when triggered, will print a stack trace of the event in the main console.

**Time Travel**: This section has controls for rewinding and replaying the state of the selected view's model over time.

**Model**: This section lists the `debugName` of the selected view's model which links to the model in the data panel.  If present, it will also list the `collectionCid` and `parentProp` of the view's model.

**VDOM Template, and Difference from Current DOM**: These sections will show the selected view's VDOM in memory and how, if at all, it differs from the actual DOM.  This is helpful for debugging differences between the rendered DOM and the virtual DOM in memory.

## Data Debugger Panel

The data debugger panel displays information about all models and collections in your Tungsten.js applications.  Most sections apply for each individual model or collection, except for attributes and initial attributes which apply only to models.

**Model**: This section lists the `debugName` and `parentProp` of the selected model or collection.

**Model Events**: Inputting an event name in the text field in this section will add an ad hoc event listener for that event on the selected model or collection which, when triggered, will print a stack trace of the event in the main console.

**Attributes**: This section lists the current attributes on the model, which can be live updated by clicking on the attribute value and updating the input field.

**Initial Attributes**: This section lists the attributes present on the model when it was initialized.  The "Reset Data" button resets the current attributes to the initial state of the model.

**Methods**: All methods on the selected model or collection are listed here (inherited methods can be shown by clicking the checkbox).  Clicking "untracked" next to a method name will toggle tracking: when tracking is on, a stack trace will be printed to the main console when the method is called.

**Import/Export Snapshots**: Clicking "Get Current Snapshot" will output a JSON string of the selected model or collection state in the input field in this section.  Conversely, the selected model or collection state in the input field can be updated by inputting a JSON string and clicking "Set App to Snapshot".