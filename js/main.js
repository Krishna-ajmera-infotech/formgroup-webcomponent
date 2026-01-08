const formGroupStyles = new CSSStyleSheet();
formGroupStyles.replaceSync(`.error-message,.success-message{transition:opacity .2s ease-in-out}:host{display:block}.error-message{display:block;color:var(--error-message-color,#dc3545);font-size:var(--error-message-font-size, .875rem);margin-top:var(--error-message-margin-top,.25rem)}.error-message:empty,.success-message:empty{display:none}.success-message{display:none;color:var(--success-message-color,#398d1c);font-size:var(--success-message-font-size, .875rem);margin-top:var(--success-message-margin-top,.25rem)}:host([show-success]) .success-message{display:block}:host([show-error]) ::slotted(input),:host([show-error]) ::slotted(select),:host([show-error]) ::slotted(textarea){border-color:var(--error-border-color,#dc3545);outline-color:var(--error-border-color,#dc3545)}:host([show-success]) ::slotted(input),:host([show-success]) ::slotted(select),:host([show-success]) ::slotted(textarea){border-color:var(--success-border-color,#398d1c);outline-color:var(--success-border-color,#398d1c)}.requirement-item.valid .requirement-text{color:var(--requirement-valid-text,#398d1c)}`);

class FormGroup extends HTMLElement {
    #input; // Reference to the input element
    #boundHandlers = {}; // Bound event handlers for proper cleanup
    #passwordFieldHandler = null; // Handler for main password field changes
    #passwordFieldReference = null; // Reference to main password field
    #isInitialized = false; // Flag to prevent multiple initializations
    #hasUserInteracted = false; // Flag to track if user has interacted with the field
    #passwordValidationMode = null; // Password validation mode: 'group' | 'simple'
    #confirmPasswordFor = null; // ID of password field to match against

    // Password validation utilities
    static #passwordValidators = {
        minLength: (value, minLength = 8) => value.length >= minLength,
        hasNumber: (value) => /[0-9]/.test(value),
        hasSpecialChar: (value) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
        hasUppercase: (value) => /[A-Z]/.test(value),
        hasLowercase: (value) => /[a-z]/.test(value),

        validateAll: (value, requirements = {}) => {
            const defaultRequirements = {
                minLength: 8,
                needsNumber: true,
                needsSpecialChar: true,
                needsUppercase: true,
                needsLowercase: true
            };

            const config = { ...defaultRequirements, ...requirements };

            return {
                minLength: FormGroup.#passwordValidators.minLength(value, config.minLength),
                hasNumber: config.needsNumber ? FormGroup.#passwordValidators.hasNumber(value) : true,
                hasSpecialChar: config.needsSpecialChar ? FormGroup.#passwordValidators.hasSpecialChar(value) : true,
                hasUppercase: config.needsUppercase ? FormGroup.#passwordValidators.hasUppercase(value) : true,
                hasLowercase: config.needsLowercase ? FormGroup.#passwordValidators.hasLowercase(value) : true
            };
        }
    };

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
            'bad-input-message',
            'password-validation-mode',
            'confirm-password-for'
        ];
    }

    constructor() {
        super(); // Call the parent constructor
        this.attachShadow({ mode: 'open' }); // Create the shadow root
        this.shadowRoot.adoptedStyleSheets = [formGroupStyles];
        this.shadowRoot.innerHTML = `<slot></slot><span class="error-message" role="alert"  aria-live="polite" part="error-message"></span>`;
    }

    // Prevents default browser validation popup
    #handleInvalid(e) {
        e.preventDefault();
        this.#showError();
    }

    // Clears error message while user is typing
    #handleInput() {
        if (this.#input) {
            this.#clearError();

            // Update password requirements in real-time for group mode
            if (this.#passwordValidationMode === 'group') {
                this.#updatePasswordRequirements();
            }
        }
    }

    // Validates and shows error on blur
    #handleBlur() {
        this.#hasUserInteracted = true; // Mark that user has interacted

        // For group mode, don't show standard validation errors - use requirements instead
        if (this.#passwordValidationMode === 'group') {
            this.#updatePasswordRequirements();
            return;
        }

        if (this.#input && !this.#input.validity.valid) this.#showError();
    }

    // Shows error message based on validation state
    #showError() {
        if (!this.#input) return;
        if (!this.#hasUserInteracted) return;

        // Don't show initial validation messages for group mode - let the requirements handle it
        if (this.#passwordValidationMode === 'group' && !this.#hasUserInteracted) {
            return;
        }

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

    // Clears error message and styling
    #clearError() {
        this.#errorMessage.textContent = '';
        this.removeAttribute('show-error');
    }

    // Attaches event listeners to input
    #attachListeners() {
        if (!this.#input) return;

        // Store bound handlers for proper cleanup
        this.#boundHandlers = {
            invalid: this.#handleInvalid.bind(this), // Prevents default browser validation popup
            input: this.#handleInput.bind(this), // Clears error message while user is typing
            blur: this.#handleBlur.bind(this) // Validates and shows error on blur
        };

        this.#input.addEventListener('invalid', this.#boundHandlers.invalid);
        this.#input.addEventListener('input', this.#boundHandlers.input);
        this.#input.addEventListener('blur', this.#boundHandlers.blur);
    }

    // Removes event listeners from input
    #detachListeners() {
        if (!this.#input || !this.#boundHandlers) return;

        this.#input.removeEventListener('invalid', this.#boundHandlers.invalid);
        this.#input.removeEventListener('input', this.#boundHandlers.input);
        this.#input.removeEventListener('blur', this.#boundHandlers.blur);

        this.#boundHandlers = {};

        // Clean up password field listener if it exists
        if (this.#passwordFieldHandler && this.#passwordFieldReference) {
            this.#passwordFieldReference.removeEventListener('input', this.#passwordFieldHandler);
            this.#passwordFieldHandler = null;
            this.#passwordFieldReference = null;
        }
    }

    // Setup input formatting for special fields (Tax ID, SSN)
    #setupInputFormatting() {
        if (!this.#input) return;

        const inputName = this.#input.name || this.#input.id || '';
        const inputId = this.#input.id || '';

        // Tax ID formatting (XX-XXXXXXX - exactly 9 digits)
        if (inputName.includes('tax_id') || inputId.includes('tax_id')) {
            this.#input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits

                if (value.length > 9) value = value.substring(0, 9);
                if (value.length > 2) value = value.substring(0, 2) + '-' + value.substring(2);

                e.target.value = value;
            });
        }

        // SSN formatting (exactly 4 digits)
        if (inputName.includes('ssn') || inputId.includes('ssn')) {
            this.#input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
                // Limit to 4 digits
                if (value.length > 4) value = value.substring(0, 4);

                e.target.value = value;
            });
        }
    }

    // Setup password validation
    #setupPasswordValidation() {
        const validationMode = this.getAttribute('password-validation-mode');
        const confirmPasswordFor = this.getAttribute('confirm-password-for');

        // Handle password validation modes
        if (validationMode === 'group' || validationMode === 'simple') {
            this.#passwordValidationMode = validationMode;

            if (validationMode === 'group') {
                this.#setupGroupPasswordValidation();
            }
        }

        // Handle confirm password setup
        if (confirmPasswordFor) {
            this.#confirmPasswordFor = confirmPasswordFor;
            this.#setupConfirmPasswordValidation();
        }
    }

    // Setup group mode password validation
    #setupGroupPasswordValidation() {
        let requirementsContainer = this.querySelector('#password-requirements');
        if (!requirementsContainer) {
            requirementsContainer = document.getElementById('password-requirements');
        }

        if (!requirementsContainer) {
            this.#passwordValidationMode = 'simple';
            return;
        }
    }

    // Setup confirm password validation
    #setupConfirmPasswordValidation() {
        if (!this.#confirmPasswordFor) return;

        // Remove existing listeners and re-attach with password validation
        this.#detachListeners();

        // Store bound handlers for proper cleanup
        this.#boundHandlers = {
            invalid: this.#handleInvalid.bind(this),
            input: () => {
                this.#handleInput();
                this.#validatePasswordMatch();
            },
            blur: () => {
                this.#handleBlur();
                this.#validatePasswordMatch();
            }
        };

        // Reattach listeners with new handlers
        this.#input.addEventListener('invalid', this.#boundHandlers.invalid);
        this.#input.addEventListener('input', this.#boundHandlers.input);
        this.#input.addEventListener('blur', this.#boundHandlers.blur);

        // Set up listener on the main password field to re-validate this confirm field
        this.#setupPasswordFieldListener();
    }

    // Set up listener on the main password field to trigger re-validation of this confirm password field
    #setupPasswordFieldListener() {
        if (!this.#confirmPasswordFor) return;

        const passwordField = document.getElementById(this.#confirmPasswordFor);
        if (!passwordField) return;

        // Create a bound handler for cleanup
        this.#passwordFieldHandler = () => {
            if (this.#input && this.#input.value) {
                this.#validatePasswordMatch();
            }
        };

        // Listen to input changes on the main password field
        passwordField.addEventListener('input', this.#passwordFieldHandler);

        // Store reference for cleanup
        this.#passwordFieldReference = passwordField;
    }

    // Validate password match for confirm password fields
    #validatePasswordMatch() {
        if (!this.#confirmPasswordFor || !this.#input) return;

        const passwordField = document.getElementById(this.#confirmPasswordFor);
        if (!passwordField) {
            console.warn(`Password field with ID "${this.#confirmPasswordFor}" not found.`);
            return;
        }

        const passwordValue = passwordField.value;
        const confirmValue = this.#input.value;

        if (confirmValue && passwordValue !== confirmValue) {
            this.#input.setCustomValidity(''); // Use empty string to show custom message via validate()
            this.#showPasswordMatchStatus(false);
        } else if (confirmValue && passwordValue === confirmValue && confirmValue.length > 0) {
            this.#input.setCustomValidity('');
            this.#showPasswordMatchStatus(true);
        } else {
            this.#input.setCustomValidity('');
            this.#showPasswordMatchStatus(null); // Clear status when empty
        }
    }

    // Show password match status with icon
    #showPasswordMatchStatus(isMatched) {
        // Remove any existing match status
        let matchStatusElement = this.querySelector('.password-match-status');
        if (matchStatusElement) {
            matchStatusElement.remove();
        }

        if (isMatched === null) return; // Don't show anything when empty

        // Create match status element
        matchStatusElement = document.createElement('div');
        matchStatusElement.className = 'password-match-status';
        matchStatusElement.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 0.875rem;';

        const matchedIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 19 18" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 18C13.9706 18 18 13.9706 18 9C18 7.2993 17.5283 5.70877 16.7085 4.35213L18.5303 2.53033C18.8232 2.23744 18.8232 1.76256 18.5303 1.46967C18.2374 1.17678 17.7626 1.17678 17.4697 1.46967L15.8164 3.12296C14.166 1.21049 11.7244 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18ZM15.8164 3.12296L9 9.93934L6.53033 7.46967C6.23744 7.17678 5.76256 7.17678 5.46967 7.46967C5.17678 7.76256 5.17678 8.23744 5.46967 8.53033L8.46967 11.5303C8.61032 11.671 8.80109 11.75 9 11.75C9.19891 11.75 9.38968 11.671 9.53033 11.5303L16.7085 4.35213C16.4456 3.91698 16.1468 3.5059 15.8164 3.12296Z" fill="#398D1C"/></svg>`;
        const mismatchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" style="display: inline; margin-right: 6px; vertical-align: middle;"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM9.53033 8.46967C9.23744 8.17678 8.76256 8.17678 8.46967 8.46967C8.17678 8.76256 8.17678 9.23744 8.46967 9.53033L10.9393 12L8.46967 14.4697C8.17678 14.7626 8.17678 15.2374 8.46967 15.5303C8.76256 15.8232 9.23744 15.8232 9.53033 15.5303L12 13.0607L14.4697 15.5303C14.7626 15.8232 15.2374 15.8232 15.5303 15.5303C15.8232 15.2374 15.8232 14.7626 15.5303 14.4697L13.0607 12L15.5303 9.53033C15.8232 9.23744 15.8232 8.76256 15.5303 8.46967C15.2374 8.17678 14.7626 8.17678 14.4697 8.46967L12 10.9393L9.53033 8.46967Z" fill="#D22721"/></svg>`;

        if (isMatched) {
            matchStatusElement.innerHTML = `${matchedIcon}<span style="color: #398D1C;">Passwords match</span>`;
        } else {
            matchStatusElement.innerHTML = `${mismatchIcon}<span style="color: #D22721;">Passwords do not match</span>`;
        }

        // Insert after the input field
        const input = this.#input;
        if (input && input.parentNode) {
            input.parentNode.insertBefore(matchStatusElement, input.nextSibling);
        }
    }

    // Update password requirements validation state (for group mode only)
    #updatePasswordRequirements() {
        if (this.#passwordValidationMode !== 'group' || !this.#input) return;

        // First check within this form-group, then fallback to document
        let requirementsContainer = this.querySelector('#password-requirements');
        if (!requirementsContainer) {
            requirementsContainer = document.getElementById('password-requirements');
        }
        if (!requirementsContainer) return;

        const value = this.#input.value;

        // Get requirements from the container's requirement items
        const requirements = this.#extractRequirementsFromContainer(requirementsContainer);
        const validation = FormGroup.#passwordValidators.validateAll(value, requirements);

        // Update each requirement status
        this.#updateRequirementStatus('minLength', validation.minLength);

        if (requirements.needsNumber) {
            this.#updateRequirementStatus('hasNumber', validation.hasNumber);
        }

        if (requirements.needsSpecialChar) {
            this.#updateRequirementStatus('hasSpecialChar', validation.hasSpecialChar);
        }

        if (requirements.needsUppercase && requirements.needsLowercase) {
            this.#updateRequirementStatus('caseCombined', validation.hasUppercase && validation.hasLowercase);
        } else {
            if (requirements.needsUppercase) {
                this.#updateRequirementStatus('hasUppercase', validation.hasUppercase);
            }
            if (requirements.needsLowercase) {
                this.#updateRequirementStatus('hasLowercase', validation.hasLowercase);
            }
        }

        // Dispatch event for external listening
        this.dispatchEvent(new CustomEvent('password-validation', {
            detail: { validation, isValid: Object.values(validation).every(Boolean) },
            bubbles: true,
            composed: true
        }));
    }

    // Extract requirements configuration from the container
    #extractRequirementsFromContainer(container) {
        const requirements = {
            minLength: 8,
            needsNumber: false,
            needsSpecialChar: false,
            needsUppercase: false,
            needsLowercase: false
        };

        // Check which requirement items exist in the container
        if (container.querySelector('[data-requirement="minLength"]')) {
            const minLengthText = container.querySelector('[data-requirement="minLength"] .requirement-text')?.textContent;
            const minLengthMatch = minLengthText?.match(/(\d+)/);
            if (minLengthMatch) {
                requirements.minLength = parseInt(minLengthMatch[1]);
            }
        }

        requirements.needsNumber = !!container.querySelector('[data-requirement="hasNumber"]');
        requirements.needsSpecialChar = !!container.querySelector('[data-requirement="hasSpecialChar"]');
        requirements.needsUppercase = !!container.querySelector('[data-requirement="hasUppercase"]');
        requirements.needsLowercase = !!container.querySelector('[data-requirement="hasLowercase"]');

        // Check for combined case requirement
        const hasCaseCombined = !!container.querySelector('[data-requirement="caseCombined"]');
        if (hasCaseCombined) {
            requirements.needsUppercase = true;
            requirements.needsLowercase = true;
        }

        return requirements;
    }

    // Update individual requirement status
    #updateRequirementStatus(requirement, isValid) {
        // Look for requirement element in the main document (not shadow DOM)
        const element = this.querySelector(`[data-requirement="${requirement}"]`);
        if (element) {
            element.classList.toggle('valid', isValid);

            const icon = element.querySelector('.requirement-icon');
            if (icon) {
                icon.innerHTML = isValid ?
                    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 19 18" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 18C13.9706 18 18 13.9706 18 9C18 7.2993 17.5283 5.70877 16.7085 4.35213L18.5303 2.53033C18.8232 2.23744 18.8232 1.76256 18.5303 1.46967C18.2374 1.17678 17.7626 1.17678 17.4697 1.46967L15.8164 3.12296C14.166 1.21049 11.7244 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18ZM15.8164 3.12296L9 9.93934L6.53033 7.46967C6.23744 7.17678 5.76256 7.17678 5.46967 7.46967C5.17678 7.76256 5.17678 8.23744 5.46967 8.53033L8.46967 11.5303C8.61032 11.671 8.80109 11.75 9 11.75C9.19891 11.75 9.38968 11.671 9.53033 11.5303L16.7085 4.35213C16.4456 3.91698 16.1468 3.5059 15.8164 3.12296Z" fill="#398D1C"/></svg>` :
                    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M13.2431 4.75732L9.00045 8.99996M9.00045 8.99996L4.75781 13.2426M9.00045 8.99996L13.2431 13.2426M9.00045 8.99996L4.75781 4.75732" stroke="#9A9A9A" stroke-width="0.9"/></svg>`;
            }
        }
    }

    // Lifecycle methods
    connectedCallback() {
        if (this.#isInitialized) return;

        this.#input = this.querySelector('input, textarea, select');

        if (!this.#input) {
            console.warn('FormGroup: No input, textarea, or select element found');
            return;
        }

        this.#attachListeners(); // Attach event listeners
        this.#setupInputFormatting(); // Setup input formatting for special fields
        this.#setupPasswordValidation(); // Setup password validation if needed
        this.#isInitialized = true;
    }

    // Cleanup event listeners
    disconnectedCallback() {
        this.#detachListeners();
        this.#isInitialized = false;
    }

    // Re-validate if error is currently shown and message attributes change
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.hasAttribute('show-error')) {
            this.#showError();
        }
    }

    // Gets the error message element
    get #errorMessage() {
        return this.shadowRoot.querySelector('.error-message');
    }

    // Finds the first invalid validity state
    #getFirstInvalid(validityState) {
        const validityKeys = [
            'customError',
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

    // Gets custom error messages from attributes or defaults
    get #customErrorMessage() {
        const input = this.#input;
        const inputType = input?.type || 'text';
        const minLength = input?.minLength;
        const maxLength = input?.maxLength;
        const min = input?.min;
        const max = input?.max;
        const step = input?.step;
        const pattern = input?.pattern;

        // Special handling for confirm password custom validation
        if (this.#confirmPasswordFor && input?.validationMessage) {
            return {
                customError: input.validationMessage
            };
        }

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
                'Invalid input detected. Please enter a valid value.',

            customError: input?.validationMessage || 'Invalid input.'
        };
    }

    // Gets type-specific error messages for type mismatch errors
    #getTypeMismatchMessage(inputType) {
        const typeMessages = {
            email: 'Please enter a valid email address (e.g., user@example.com).',
            url: 'Please enter a valid URL starting with http:// or https://.',
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

        // Mark as interacted when validate is called programmatically
        this.#hasUserInteracted = true;

        const isValid = this.#input.checkValidity();
        if (!isValid) {
            this.#showError();
        } else {
            this.#clearError();
        }

        return isValid;
    }


    // Public API: Clear validation state
    reset() {
        this.#clearError();
        this.#hasUserInteracted = false; // Reset interaction flag
        if (this.#input) {
            this.#input.value = '';
            this.#input.setCustomValidity(''); // Clear any custom validity
        }

        // Reset password requirements to initial state if this is a group mode password field
        if (this.#passwordValidationMode === 'group') {
            this.#updatePasswordRequirements();
        }
    }

    // Public API: Get the wrapped input element
    get input() {
        return this.#input;
    }

    // Public API: Check if input is valid
    get isValid() {
        return this.#input ? this.#input.validity.valid : true;
    }
}

// Register the custom element
customElements.define('form-group', FormGroup);
