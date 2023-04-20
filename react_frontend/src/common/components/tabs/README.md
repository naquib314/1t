# tabs

An accessible tabs component, based heavily on [the `Tabs` component from
Chakra
UI](https://github.com/chakra-ui/chakra-ui/blob/main/packages/tabs/README.md).

The `Tab` and `TabPanel` elements are associated by their order in the tree.
None of the components are empty wrappers, each is associated with a real DOM
element in the document, giving you maximum control over styling and
composition.

## styling

This component does not support the `variant`, `colorScheme` and `size` props
from Chakra UI. If you need custom styling on any of the tabs components
(`Tabs`, `Tab`, `TabList`, `TabPanels`, `TabPanel`), pass your own `className`
as a prop. To ensure your styles will override the default ones, make sure your
selector is more specific by including a parent class (or you could use [this
hack](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity#:~:text=duplicate%20simple%20selectors)
to force a higher specificity).
