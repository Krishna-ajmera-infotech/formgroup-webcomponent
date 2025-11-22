/**
 * FormGroup Web Component
 * A custom element for enhanced form validation with accessible error messaging
 * @version 1.0.0
 * @license MIT
 */

const formGroupStyles = new CSSStyleSheet();

formGroupStyles.replaceSync(`
  :host {
    display: block;
    margin-bottom: var(--form-group-margin, 1rem);
  }

  .error-message {
    display: block;
    color: var(--error-message-color, #dc3545);
    font-size: var(--error-message-font-size, 0.875rem);
    margin-top: var(--error-message-margin-top, 0.25rem);
    transition: opacity 0.2s ease-in-out;
  }

  .error-message:empty {
    display: none;
  }

  :host([show-error]) ::slotted(input),
  :host([show-error]) ::slotted(textarea),
  :host([show-error]) ::slotted(select) {
    border-color: var(--error-border-color, #dc3545);
    outline-color: var(--error-border-color, #dc3545);
  }
`);

class FormGroup extends HTMLElement {
    #input;
    #boundHandlers = {};
    #isInitialized = false;

    static get observedAttributes() {
        return [
            'value-missing-message',
            'too-long-message',
            'too-short-message',
            'range-overflow-message',
            'range-underflow-message',
            'type-mismatch-message',
            'pattern-mismatch-message',
            'step-mismatch-message',
            'bad-input-message'
        ];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [formGroupStyles];
        this.shadowRoot.innerHTML = `
      <slot></slot>
      <span class="error-message"
            role="alert"
            aria-live="polite"
            part="error-message">
      </span>
    `;
    }

    /**
     * Prevents default browser validation popup
     */
    #handleInvalid(e) {
        e.preventDefault();
        this.#showError();
    }

    /**
     * Clears error message while user is typing
     */
    #handleInput() {
        if (this.#input) {
            this.#clearError();
        }
    }

    /**
     * Validates and shows error on blur
     */
    #handleBlur() {
        if (this.#input && !this.#input.validity.valid) {
            this.#showError();
        }
    }

    /**
     * Shows error message based on validation state
     */
    #showError() {
        if (!this.#input) return;

        const validityKey = this.#getFirstInvalid(this.#input.validity);
        if (validityKey) {
            const message = this.#customErrorMessage[validityKey];
            this.#errorMessage.textContent = message;
            this.setAttribute('show-error', '');

            // Dispatch custom event for external handling
            this.dispatchEvent(new CustomEvent('validation-error', {
                detail: {
                    validity: this.#input.validity,
                    validityKey,
                    message
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    /**
     * Clears error message and styling
     */
    #clearError() {
        this.#errorMessage.textContent = '';
        this.removeAttribute('show-error');
    }

    /**
     * Attaches event listeners to input
     */
    #attachListeners() {
        if (!this.#input) return;

        // Store bound handlers for proper cleanup
        this.#boundHandlers = {
            invalid: this.#handleInvalid.bind(this),
            input: this.#handleInput.bind(this),
            blur: this.#handleBlur.bind(this)
        };

        this.#input.addEventListener('invalid', this.#boundHandlers.invalid);
        this.#input.addEventListener('input', this.#boundHandlers.input);
        this.#input.addEventListener('blur', this.#boundHandlers.blur);
    }

    /**
     * Removes event listeners from input
     */
    #detachListeners() {
        if (!this.#input || !this.#boundHandlers) return;

        this.#input.removeEventListener('invalid', this.#boundHandlers.invalid);
        this.#input.removeEventListener('input', this.#boundHandlers.input);
        this.#input.removeEventListener('blur', this.#boundHandlers.blur);

        this.#boundHandlers = {};
    }

    connectedCallback() {
        if (this.#isInitialized) return;

        this.#input = this.querySelector('input, textarea, select');

        if (!this.#input) {
            console.warn('FormGroup: No input, textarea, or select element found');
            return;
        }

        this.#attachListeners();
        this.#isInitialized = true;
    }

    disconnectedCallback() {
        this.#detachListeners();
        this.#isInitialized = false;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Re-validate if error is currently shown and message attributes change
        if (oldValue !== newValue && this.hasAttribute('show-error')) {
            this.#showError();
        }
    }

    /**
     * Gets the error message element
     */
    get #errorMessage() {
        return this.shadowRoot.querySelector('.error-message');
    }

    /**
     * Finds the first invalid validity state
     */
    #getFirstInvalid(validityState) {
        const validityKeys = [
            'valueMissing',
            'typeMismatch',
            'patternMismatch',
            'tooLong',
            'tooShort',
            'rangeUnderflow',
            'rangeOverflow',
            'stepMismatch',
            'badInput'
        ];

        for (const key of validityKeys) {
            if (validityState[key]) {
                return key;
            }
        }
        return null;
    }

    /**
     * Gets custom error messages from attributes or defaults
     */
    get #customErrorMessage() {
        const input = this.#input;
        const inputType = input?.type || 'text';
        const minLength = input?.minLength;
        const maxLength = input?.maxLength;
        const min = input?.min;
        const max = input?.max;
        const step = input?.step;
        const pattern = input?.pattern;

        return {
            valueMissing: this.getAttribute('value-missing-message') ||
                'This field is required. Please provide a value to continue.',

            tooLong: this.getAttribute('too-long-message') ||
                (maxLength ? `This field is too long. Maximum length is ${maxLength} characters.` :
                    'This field is too long. Please shorten your input.'),

            tooShort: this.getAttribute('too-short-message') ||
                (minLength ? `This field is too short. Minimum length is ${minLength} characters.` :
                    'This field is too short. Please provide more characters.'),

            rangeOverflow: this.getAttribute('range-overflow-message') ||
                (max ? `Value is too high. Maximum allowed value is ${max}.` :
                    'Value is too high. Please enter a lower value.'),

            rangeUnderflow: this.getAttribute('range-underflow-message') ||
                (min ? `Value is too low. Minimum allowed value is ${min}.` :
                    'Value is too low. Please enter a higher value.'),

            typeMismatch: this.getAttribute('type-mismatch-message') ||
                this.#getTypeMismatchMessage(inputType),

            patternMismatch: this.getAttribute('pattern-mismatch-message') ||
                (pattern ? `Invalid format. Please match the required pattern: ${pattern}` :
                    'Value does not match the required format. Please check your input.'),

            stepMismatch: this.getAttribute('step-mismatch-message') ||
                (step ? `Invalid value. Please use increments of ${step}.` :
                    'Value does not match the required step. Please adjust your input.'),

            badInput: this.getAttribute('bad-input-message') ||
                'Invalid input detected. Please enter a valid value.'
        };
    }

    /**
     * Gets type-specific error messages for type mismatch errors
     */
    #getTypeMismatchMessage(inputType) {
        const typeMessages = {
            email: 'Please enter a valid email address (e.g., user@example.com).',
            url: 'Please enter a valid URL (e.g., https://www.example.com).',
            tel: 'Please enter a valid telephone number.',
            number: 'Please enter a valid number.',
            date: 'Please enter a valid date.',
            time: 'Please enter a valid time.',
            datetime: 'Please enter a valid date and time.',
            'datetime-local': 'Please enter a valid date and time.',
            month: 'Please enter a valid month.',
            week: 'Please enter a valid week.',
            color: 'Please enter a valid color code.'
        };

        return typeMessages[inputType] || 'Invalid format. Please check your input.';
    }

    /**
     * Public API: Manually trigger validation
     * @returns {boolean} Whether the input is valid
     */
    validate() {
        if (!this.#input) return true;

        const isValid = this.#input.checkValidity();
        if (!isValid) {
            this.#showError();
        } else {
            this.#clearError();
        }
        return isValid;
    }

    /**
     * Public API: Clear validation state
     */
    reset() {
        this.#clearError();
        if (this.#input) {
            this.#input.value = '';
        }
    }

    /**
     * Public API: Get the wrapped input element
     */
    get input() {
        return this.#input;
    }

    /**
     * Public API: Check if input is valid
     */
    get isValid() {
        return this.#input ? this.#input.validity.valid : true;
    }
}

// Register the custom element
customElements.define('form-group', FormGroup);
