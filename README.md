# FormGroup Web Component

A lightweight, accessible, production-ready web component for enhanced HTML5 form validation with custom error messaging.

## Features

✨ **Zero Dependencies** - Pure vanilla JavaScript web component
🎯 **HTML5 Validation** - Leverages native browser validation APIs
♿ **Accessible** - ARIA live regions for screen reader support
🎨 **Customizable** - CSS custom properties for easy styling
📦 **Lightweight** - ~3KB minified
🔧 **Framework Agnostic** - Works with any framework or vanilla JS
⚡ **Progressive Enhancement** - Gracefully degrades without JavaScript

## Quick Start

### Installation

#### Option 1: Direct Download
Download `index.js` and include it in your HTML:

```html
<script src="path/to/index.js"></script>
```

#### Option 2: ES Module
```javascript
import './index.js';
```

### Basic Usage

Wrap any `input`, `textarea`, or `select` element with `<form-group>`:

```html
<form-group value-missing-message="Please enter your email">
  <label for="email">Email</label>
  <input type="email" id="email" required />
</form-group>
```

## API Reference

### Attributes

All attributes are optional and provide custom error messages for different validation states:

| Attribute                  | Validation State  | Default Message                             |
| -------------------------- | ----------------- | ------------------------------------------- |
| `value-missing-message`    | `valueMissing`    | "This field is required"                    |
| `type-mismatch-message`    | `typeMismatch`    | "Invalid format"                            |
| `pattern-mismatch-message` | `patternMismatch` | "Value does not match the required pattern" |
| `too-short-message`        | `tooShort`        | "This field is too short"                   |
| `too-long-message`         | `tooLong`         | "This field is too long"                    |
| `range-underflow-message`  | `rangeUnderflow`  | "Value is too low"                          |
| `range-overflow-message`   | `rangeOverflow`   | "Value is too high"                         |
| `step-mismatch-message`    | `stepMismatch`    | "Value does not match the required step"    |
| `bad-input-message`        | `badInput`        | "Invalid input"                             |

### Methods

#### `validate()`
Manually trigger validation on the input.

```javascript
const formGroup = document.querySelector('form-group');
const isValid = formGroup.validate(); // Returns boolean
```

#### `reset()`
Clear the input value and reset validation state.

```javascript
formGroup.reset();
```

### Properties

#### `input` (read-only)
Get the wrapped input element.

```javascript
const inputElement = formGroup.input;
console.log(inputElement.value);
```

#### `isValid` (read-only)
Check if the input is currently valid.

```javascript
if (formGroup.isValid) {
  console.log('Input is valid!');
}
```

### Events

#### `validation-error`
Dispatched when validation fails. Bubbles and is composed.

```javascript
formGroup.addEventListener('validation-error', (event) => {
  console.log(event.detail.message);      // Error message
  console.log(event.detail.validityKey);  // e.g., 'valueMissing'
  console.log(event.detail.validity);     // ValidityState object
});
```

## Examples

### Required Field
```html
<form-group value-missing-message="Name is required">
  <label for="name">Name</label>
  <input type="text" id="name" required />
</form-group>
```

### Email Validation
```html
<form-group
  value-missing-message="Email is required"
  type-mismatch-message="Please enter a valid email address">
  <label for="email">Email</label>
  <input type="email" id="email" required />
</form-group>
```

### Pattern Matching
```html
<form-group
  pattern-mismatch-message="Phone must be in format: XXX-XXX-XXXX">
  <label for="phone">Phone</label>
  <input type="tel" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" />
</form-group>
```

### Length Constraints
```html
<form-group
  too-short-message="Username must be at least 3 characters"
  too-long-message="Username cannot exceed 20 characters">
  <label for="username">Username</label>
  <input type="text" minlength="3" maxlength="20" />
</form-group>
```

### Number Range
```html
<form-group
  range-underflow-message="Age must be at least 18"
  range-overflow-message="Age cannot exceed 120">
  <label for="age">Age</label>
  <input type="number" min="18" max="120" />
</form-group>
```

## Styling

### CSS Parts

Style the error message using the `::part()` selector:

```css
form-group::part(error-message) {
  font-weight: bold;
  text-transform: uppercase;
}
```

### Styling Invalid Inputs

When validation fails, the `show-error` attribute is added to the `<form-group>` element:

```css
form-group[show-error] input {
  border-color: red;
  background-color: #fff5f5;
}
```

## Advanced Usage

### Programmatic Validation

```javascript
const form = document.querySelector('form');
const formGroups = form.querySelectorAll('form-group');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  let isFormValid = true;
  formGroups.forEach(group => {
    if (!group.validate()) {
      isFormValid = false;
    }
  });

  if (isFormValid) {
    // Submit form
    console.log('Form is valid!');
  }
});
```

### Custom Event Handling

```javascript
document.addEventListener('validation-error', (e) => {
  // Log all validation errors
  console.error(`Validation error: ${e.detail.message}`);

  // Send to analytics
  analytics.track('form_validation_error', {
    field: e.target.input.name,
    error: e.detail.validityKey
  });
});
```

### Dynamic Form Fields

```javascript
function addFormField() {
  const container = document.getElementById('fields-container');
  const formGroup = document.createElement('form-group');
  formGroup.setAttribute('value-missing-message', 'This field is required');

  formGroup.innerHTML = `
    <label>Dynamic Field</label>
    <input type="text" required />
  `;

  container.appendChild(formGroup);
}
```

## Browser Support

- ✅ Chrome/Edge 53+
- ✅ Firefox 63+
- ✅ Safari 10.1+
- ✅ Opera 40+

Requires support for:
- Custom Elements v1
- Shadow DOM v1
- Constructable Stylesheets (or polyfill)

## Accessibility

The component follows WCAG 2.1 guidelines:

- ✅ Error messages use `role="alert"` and `aria-live="polite"`
- ✅ Errors are announced to screen readers
- ✅ Visual error indicators (color + border)
- ✅ Keyboard accessible
- ✅ Works with native form validation

## Performance

- **Lazy initialization** - Only initializes when connected to DOM
- **Event delegation** - Efficient event handling
- **Memory management** - Proper cleanup on disconnect
- **No dependencies** - No external libraries to load

## Best Practices

### 1. Always provide labels
```html
<!-- Good -->
<form-group>
  <label for="email">Email</label>
  <input type="email" id="email" />
</form-group>

<!-- Bad -->
<form-group>
  <input type="email" placeholder="Email" />
</form-group>
```

### 2. Use meaningful error messages
```html
<!-- Good -->
<form-group value-missing-message="Please enter your email address to continue">

<!-- Bad -->
<form-group value-missing-message="Required">
```

### 3. Combine with native HTML5 validation
```html
<form-group
  value-missing-message="Email is required"
  type-mismatch-message="Please enter a valid email (e.g., user@example.com)">
  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    required
    autocomplete="email"
    inputmode="email" />
</form-group>
```

### 4. Test with keyboard navigation
Ensure all form fields are accessible via Tab key and can be submitted with Enter.

## Troubleshooting

### Error messages not showing

**Problem:** Error messages don't appear when validation fails.

**Solutions:**
1. Ensure the input has validation attributes (`required`, `pattern`, `min`, etc.)
2. Check that the input is inside the `<form-group>` element
3. Verify JavaScript is enabled and the component is loaded

### Styling not applied

**Problem:** Custom CSS variables don't work.

**Solutions:**
1. Apply CSS variables to the `form-group` element, not the input
2. Check browser support for CSS custom properties
3. Ensure styles are loaded after the component

### Multiple error messages

**Problem:** Multiple `<form-group>` elements show the same error.

**Solution:** Each `<form-group>` should wrap only one input element.

## Migration Guide

### From plain HTML5 validation

**Before:**
```html
<label for="email">Email</label>
<input type="email" id="email" required />
<span class="error"></span>
```

**After:**
```html
<form-group value-missing-message="Email is required">
  <label for="email">Email</label>
  <input type="email" id="email" required />
</form-group>
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (see `index.html` for test cases)
5. Submit a pull request

## License

MIT License - feel free to use in personal and commercial projects.

## Support

- 📖 [View Demo](index.html) - Interactive examples
- 🐛 [Report Issues](https://github.com/yourusername/formgroup/issues)
- 💬 [Discussions](https://github.com/yourusername/formgroup/discussions)

## Changelog

### Version 1.0.0 (2025-11-22)
- Initial release
- Support for all HTML5 validation states
- Custom error messages
- Programmatic API
- Custom events
- CSS customization
- Accessibility features

---

**Made with ❤️ for better form validation**

