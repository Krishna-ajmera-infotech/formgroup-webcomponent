/**
 * FormGroup Web Component
 * A custom form validation component that provides enhanced validation,
 * custom error messages, and password strength validation.
 *
 * @module FormGroup
 * @version 1.0.0
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Centralized validation messages for consistent error reporting.
 * All messages support template placeholders (e.g., {max}, {min}, {pattern}).
 * @constant {Object}
 */
const VALIDATION_MESSAGES = {
    // Password validation messages
    PASSWORD_MISMATCH: 'Passwords do not match',
    PASSWORD_MATCH: 'Passwords match',
    PASSWORD_FIELD_NOT_FOUND: 'Password field with ID "{id}" not found.',

    // General validation messages
    VALUE_MISSING: 'This field is required. Please provide a value to continue.',
    CUSTOM_ERROR: 'Invalid input.',
    BAD_INPUT: 'Invalid input detected. Please enter a valid value.',

    // Length validation messages
    TOO_LONG: 'This field is too long. Please shorten your input.',
    TOO_LONG_WITH_MAX: 'This field is too long. Maximum length is {max} characters.',
    TOO_SHORT: 'This field is too short. Please provide more characters.',
    TOO_SHORT_WITH_MIN: 'This field is too short. Minimum length is {min} characters.',

    // Range validation messages
    RANGE_OVERFLOW: 'Value is too high. Please enter a lower value.',
    RANGE_OVERFLOW_WITH_MAX: 'Value is too high. Maximum allowed value is {max}.',
    RANGE_UNDERFLOW: 'Value is too low. Please enter a higher value.',
    RANGE_UNDERFLOW_WITH_MIN: 'Value is too low. Minimum allowed value is {min}.',

    // Pattern validation messages
    PATTERN_MISMATCH: 'Value does not match the required format. Please check your input.',
    PATTERN_MISMATCH_WITH_PATTERN: 'Invalid format. Please match the required pattern: {pattern}',

    // Step validation messages
    STEP_MISMATCH: 'Value does not match the required step. Please adjust your input.',
    STEP_MISMATCH_WITH_STEP: 'Invalid value. Please use increments of {step}.',

    // Type mismatch messages
    TYPE_MISMATCH_EMAIL: 'Please enter a valid email address (e.g., user@example.com).',
    TYPE_MISMATCH_URL: 'Please enter a valid URL starting with http:// or https://.',
    TYPE_MISMATCH_TEL: 'Please enter a valid telephone number.',
    TYPE_MISMATCH_NUMBER: 'Please enter a valid number.',
    TYPE_MISMATCH_DATE: 'Please enter a valid date.',
    TYPE_MISMATCH_TIME: 'Please enter a valid time.',
    TYPE_MISMATCH_DATETIME: 'Please enter a valid date and time.',
    TYPE_MISMATCH_DATETIME_LOCAL: 'Please enter a valid date and time.',
    TYPE_MISMATCH_MONTH: 'Please enter a valid month.',
    TYPE_MISMATCH_WEEK: 'Please enter a valid week.',
    TYPE_MISMATCH_COLOR: 'Please enter a valid color code.',
    TYPE_MISMATCH_DEFAULT: 'Invalid format. Please check your input.'
};

/**
 * SVG icons used for validation status indicators.
 * @constant {Object}
 */
const ICONS = {
    /** Green checkmark circle for valid/success states */
    CHECK_CIRCLE: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 19 18" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 18C13.9706 18 18 13.9706 18 9C18 7.2993 17.5283 5.70877 16.7085 4.35213L18.5303 2.53033C18.8232 2.23744 18.8232 1.76256 18.5303 1.46967C18.2374 1.17678 17.7626 1.17678 17.4697 1.46967L15.8164 3.12296C14.166 1.21049 11.7244 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18ZM15.8164 3.12296L9 9.93934L6.53033 7.46967C6.23744 7.17678 5.76256 7.17678 5.46967 7.46967C5.17678 7.76256 5.17678 8.23744 5.46967 8.53033L8.46967 11.5303C8.61032 11.671 8.80109 11.75 9 11.75C9.19891 11.75 9.38968 11.671 9.53033 11.5303L16.7085 4.35213C16.4456 3.91698 16.1468 3.5059 15.8164 3.12296Z" fill="#398D1C"/></svg>`,
    /** Red X circle for invalid/error states */
    X_CIRCLE: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" style="display: inline; margin-right: 6px; vertical-align: middle;"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM9.53033 8.46967C9.23744 8.17678 8.76256 8.17678 8.46967 8.46967C8.17678 8.76256 8.17678 9.23744 8.46967 9.53033L10.9393 12L8.46967 14.4697C8.17678 14.7626 8.17678 15.2374 8.46967 15.5303C8.76256 15.8232 9.23744 15.8232 9.53033 15.5303L12 13.0607L14.4697 15.5303C14.7626 15.8232 15.2374 15.8232 15.5303 15.5303C15.8232 15.2374 15.8232 14.7626 15.5303 14.4697L13.0607 12L15.5303 9.53033C15.8232 9.23744 15.8232 8.76256 15.5303 8.46967C15.2374 8.17678 14.7626 8.17678 14.4697 8.46967L12 10.9393L9.53033 8.46967Z" fill="#D22721"/></svg>`,
    /** Gray X mark for neutral/incomplete states */
    X_MARK: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M13.2431 4.75732L9.00045 8.99996M9.00045 8.99996L4.75781 13.2426M9.00045 8.99996L13.2431 13.2426M9.00045 8.99996L4.75781 4.75732" stroke="#9A9A9A" stroke-width="0.9"/></svg>`
};

/**
 * Color constants for consistent theming.
 * @constant {Object}
 */
const COLORS = {
    /** Color for success/valid states */
    SUCCESS: '#398D1C',
    /** Color for error/invalid states */
    ERROR: '#D22721'
};

// ============================================================================
// STYLES
// ============================================================================

/**
 * Shadow DOM styles for the FormGroup component.
 * Uses CSS custom properties for theming.
 */
const formGroupStyles = new CSSStyleSheet();
formGroupStyles.replaceSync(`
    .error-message, .success-message {
        transition: opacity .2s ease-in-out;
    }
    :host {
        display: block;
    }
    .error-message {
        display: block;
        color: var(--error-message-color, #dc3545);
        font-size: var(--error-message-font-size, .875rem);
        margin-top: var(--error-message-margin-top, .25rem);
    }
    .error-message:empty, .success-message:empty {
        display: none;
    }
    .success-message {
        display: none;
        color: var(--success-message-color, #398d1c);
        font-size: var(--success-message-font-size, .875rem);
        margin-top: var(--success-message-margin-top, .25rem);
    }
    :host([show-success]) .success-message {
        display: block;
    }
    :host([show-error]) ::slotted(input),
    :host([show-error]) ::slotted(select),
    :host([show-error]) ::slotted(textarea) {
        border-color: var(--error-border-color, #dc3545);
        outline-color: var(--error-border-color, #dc3545);
    }
    :host([show-success]) ::slotted(input),
    :host([show-success]) ::slotted(select),
    :host([show-success]) ::slotted(textarea) {
        border-color: var(--success-border-color, #398d1c);
        outline-color: var(--success-border-color, #398d1c);
    }
    .requirement-item.valid .requirement-text {
        color: var(--requirement-valid-text, #398d1c);
    }
`);

// ============================================================================
// FORMGROUP WEB COMPONENT
// ============================================================================

/**
 * FormGroup - A custom web component for enhanced form validation.
 *
 * @class FormGroup
 * @extends HTMLElement
 *
 * @example
 * <form-group>
 *   <label for="email">Email</label>
 *   <input type="email" id="email" required />
 * </form-group>
 *
 * @fires validation-error - When validation fails
 * @fires password-validation - When password requirements are checked
 */
class FormGroup extends HTMLElement {
    // ========================================
    // PRIVATE FIELDS
    // ========================================

    /** @type {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null} */
    #input = null;

    /** @type {Object} Bound event handlers for proper cleanup */
    #boundHandlers = {};

    /** @type {Function|null} Handler for main password field changes */
    #passwordFieldHandler = null;

    /** @type {HTMLInputElement|null} Reference to main password field */
    #passwordFieldReference = null;

    /** @type {boolean} Flag to prevent multiple initializations */
    #isInitialized = false;

    /** @type {boolean} Flag to track if user has interacted with the field */
    #hasUserInteracted = false;

    /** @type {'group'|'simple'|null} Password validation mode */
    #passwordValidationMode = null;

    /** @type {string|null} ID of password field to match against */
    #confirmPasswordFor = null;

    // ========================================
    // STATIC PASSWORD VALIDATORS
    // ========================================

    /**
     * Static password validation functions.
     * @private
     */
    static #passwordValidators = {
        /**
         * Checks if password meets minimum length requirement.
         * @param {string} value - Password to validate
         * @param {number} [minLength=8] - Minimum required length
         * @returns {boolean}
         */
        minLength: (value, minLength = 8) => value.length >= minLength,

        /**
         * Checks if password contains at least one number.
         * @param {string} value - Password to validate
         * @returns {boolean}
         */
        hasNumber: (value) => /[0-9]/.test(value),

        /**
         * Checks if password contains at least one special character.
         * @param {string} value - Password to validate
         * @returns {boolean}
         */
        hasSpecialChar: (value) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),

        /**
         * Checks if password contains at least one uppercase letter.
         * @param {string} value - Password to validate
         * @returns {boolean}
         */
        hasUppercase: (value) => /[A-Z]/.test(value),

        /**
         * Checks if password contains at least one lowercase letter.
         * @param {string} value - Password to validate
         * @returns {boolean}
         */
        hasLowercase: (value) => /[a-z]/.test(value),

        /**
         * Validates password against all requirements.
         * @param {string} value - Password to validate
         * @param {Object} [requirements={}] - Custom requirements configuration
         * @returns {Object} Validation results for each requirement
         */
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

    /**
     * List of attributes to observe for changes.
     * @returns {string[]} Array of attribute names
     */
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

    // ========================================
    // LIFECYCLE METHODS
    // ========================================

    /**
     * Creates and initializes the FormGroup component.
     */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [formGroupStyles];
        this.shadowRoot.innerHTML = `
            <slot></slot>
            <span class="error-message" role="alert" aria-live="polite" part="error-message"></span>
        `;
    }

    // ========================================
    // EVENT HANDLERS
    // ========================================

    /**
     * Prevents default browser validation popup and shows custom error.
     * @param {Event} e - The invalid event
     * @private
     */
    #handleInvalid(e) {
        e.preventDefault();
        this.#showError();
    }

    /**
     * Handles input events - clears errors and updates validation state.
     * @private
     */
    #handleInput() {
        if (!this.#input) return;

        this.#clearError();
        this.#validateEmail();

        // Update password requirements in real-time for group mode
        if (this.#passwordValidationMode === 'group') {
            this.#updatePasswordRequirements();
        }
    }

    /**
     * Handles blur events - validates and shows errors if invalid.
     * @private
     */
    #handleBlur() {
        this.#hasUserInteracted = true;

        // For group mode, use requirements instead of standard errors
        if (this.#passwordValidationMode === 'group') {
            this.#updatePasswordRequirements();
            return;
        }

        // For confirm password fields, password match validation handles it
        if (this.#confirmPasswordFor) {
            return;
        }

        this.#validateEmail();

        if (this.#input && !this.#input.validity.valid) {
            this.#showError();
        }
    }

    /**
     * Enhanced email validation with stricter rules than native HTML5.
     * Requires proper domain format (e.g., user@example.com).
     * @private
     */
    #validateEmail() {
        if (!this.#input || this.#input.type !== 'email') return;

        const email = this.#input.value.trim();
        this.#input.setCustomValidity('');

        if (email) {
            // Pattern requires: local@domain.tld (TLD must be 2+ chars)
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailPattern.test(email)) {
                this.#input.setCustomValidity(
                    'Please enter a valid email address with a proper domain (e.g., user@example.com)'
                );
            }
        }
    }

    /**
     * Shows error message based on current validation state.
     * Dispatches 'validation-error' event for external handling.
     * @private
     */
    #showError() {
        if (!this.#input || !this.#hasUserInteracted) return;

        // Skip for special modes that handle their own errors
        if (this.#passwordValidationMode === 'group' || this.#confirmPasswordFor) {
            return;
        }

        const validityKey = this.#getFirstInvalid(this.#input.validity);

        if (validityKey) {
            const message = this.#customErrorMessage[validityKey];
            this.#errorMessage.textContent = message;
            this.setAttribute('show-error', '');

            this.dispatchEvent(new CustomEvent('validation-error', {
                detail: { validity: this.#input.validity, validityKey, message },
                bubbles: true,
                composed: true
            }));
        }
    }

    /**
     * Clears error message and removes error styling.
     * @private
     */
    #clearError() {
        this.#errorMessage.textContent = '';
        this.removeAttribute('show-error');
    }

    // ========================================
    // EVENT LISTENER MANAGEMENT
    // ========================================

    /**
     * Attaches event listeners to the input element.
     * @private
     */
    #attachListeners() {
        if (!this.#input) return;

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
     * Removes event listeners from the input element.
     * Also cleans up password field listeners if present.
     * @private
     */
    #detachListeners() {
        if (!this.#input || !this.#boundHandlers) return;

        this.#input.removeEventListener('invalid', this.#boundHandlers.invalid);
        this.#input.removeEventListener('input', this.#boundHandlers.input);
        this.#input.removeEventListener('blur', this.#boundHandlers.blur);

        this.#boundHandlers = {};

        // Clean up password field listener
        if (this.#passwordFieldHandler && this.#passwordFieldReference) {
            this.#passwordFieldReference.removeEventListener('input', this.#passwordFieldHandler);
            this.#passwordFieldHandler = null;
            this.#passwordFieldReference = null;
        }
    }

    // ========================================
    // INPUT FORMATTING
    // ========================================

    /**
     * Sets up automatic input formatting for special field types.
     * Supports Tax ID (XX-XXXXXXX) and SSN (4 digits) formats.
     * @private
     */
    #setupInputFormatting() {
        if (!this.#input) return;

        const inputIdentifier = (this.#input.name || this.#input.id || '').toLowerCase();

        if (inputIdentifier.includes('tax_id')) {
            this.#setupTaxIdFormatting();
        } else if (inputIdentifier.includes('ssn')) {
            this.#setupSsnFormatting();
        }
    }

    /**
     * Sets up Tax ID formatting (XX-XXXXXXX format).
     * @private
     */
    #setupTaxIdFormatting() {
        this.#input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 9) value = value.substring(0, 9);
            if (value.length > 2) value = value.substring(0, 2) + '-' + value.substring(2);
            e.target.value = value;
        });
    }

    /**
     * Sets up SSN formatting (last 4 digits only).
     * @private
     */
    #setupSsnFormatting() {
        this.#input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.substring(0, 4);
            e.target.value = value;
        });
    }

    // ========================================
    // PASSWORD VALIDATION
    // ========================================

    /**
     * Initializes password validation based on attributes.
     * Supports 'group' mode (with requirements display) and 'simple' mode.
     * @private
     */
    #setupPasswordValidation() {
        const validationMode = this.getAttribute('password-validation-mode');
        const confirmPasswordFor = this.getAttribute('confirm-password-for');

        if (validationMode === 'group' || validationMode === 'simple') {
            this.#passwordValidationMode = validationMode;

            if (validationMode === 'group') {
                this.#setupGroupPasswordValidation();
            }
        }

        if (confirmPasswordFor) {
            this.#confirmPasswordFor = confirmPasswordFor;
            this.#setupConfirmPasswordValidation();
        }
    }

    /**
     * Sets up group mode password validation with requirements display.
     * Falls back to simple mode if requirements container not found.
     * @private
     */
    #setupGroupPasswordValidation() {
        const requirementsContainer =
            this.querySelector('#password-requirements') ||
            document.getElementById('password-requirements');

        if (!requirementsContainer) {
            this.#passwordValidationMode = 'simple';
        }
    }

    /**
     * Sets up confirm password validation with real-time matching.
     * @private
     */
    #setupConfirmPasswordValidation() {
        if (!this.#confirmPasswordFor) return;

        this.#detachListeners();

        this.#boundHandlers = {
            invalid: this.#handleInvalid.bind(this),
            input: () => {
                this.#clearError();
                this.#validatePasswordMatch();
            },
            blur: () => {
                this.#hasUserInteracted = true;
                this.#validatePasswordMatch();
            }
        };

        this.#input.addEventListener('invalid', this.#boundHandlers.invalid);
        this.#input.addEventListener('input', this.#boundHandlers.input);
        this.#input.addEventListener('blur', this.#boundHandlers.blur);

        this.#setupPasswordFieldListener();
    }

    /**
     * Sets up listener on the main password field for real-time validation.
     * @private
     */
    #setupPasswordFieldListener() {
        if (!this.#confirmPasswordFor) return;

        const passwordField = document.getElementById(this.#confirmPasswordFor);
        if (!passwordField) return;

        this.#passwordFieldHandler = () => {
            if (this.#input?.value) {
                this.#validatePasswordMatch();
            }
        };

        passwordField.addEventListener('input', this.#passwordFieldHandler);
        this.#passwordFieldReference = passwordField;
    }

    /**
     * Validates that confirm password matches the main password.
     * Sets custom validity and shows match status.
     * @private
     */
    #validatePasswordMatch() {
        if (!this.#confirmPasswordFor || !this.#input) return;

        const passwordField = this.#getPasswordField();
        if (!passwordField) return;

        const passwordValue = passwordField.value;
        const confirmValue = this.#input.value;

        this.#input.setCustomValidity('');

        if (!confirmValue) {
            this.#showPasswordMatchStatus(null);
        } else if (passwordValue !== confirmValue) {
            this.#input.setCustomValidity(VALIDATION_MESSAGES.PASSWORD_MISMATCH);
            this.#showPasswordMatchStatus(false);
        } else {
            this.#showPasswordMatchStatus(true);
        }
    }

    /**
     * Gets the password field element by ID with error handling.
     * @returns {HTMLInputElement|null} The password field or null
     * @private
     */
    #getPasswordField() {
        const passwordField = document.getElementById(this.#confirmPasswordFor);
        if (!passwordField) {
            console.warn(
                VALIDATION_MESSAGES.PASSWORD_FIELD_NOT_FOUND.replace('{id}', this.#confirmPasswordFor)
            );
        }
        return passwordField;
    }

    /**
     * Shows password match/mismatch status with appropriate icon.
     * @param {boolean|null} isMatched - true for match, false for mismatch, null to hide
     * @private
     */
    #showPasswordMatchStatus(isMatched) {
        this.#removePasswordMatchStatus();

        if (isMatched === null) return;

        const statusElement = this.#createPasswordMatchStatusElement(isMatched);
        this.#insertPasswordMatchStatus(statusElement);
    }

    /**
     * Removes existing password match status element from DOM.
     * @private
     */
    #removePasswordMatchStatus() {
        this.querySelector('.password-match-status')?.remove();
    }

    /**
     * Creates the password match status element with icon and message.
     * @param {boolean} isMatched - Whether passwords match
     * @returns {HTMLDivElement} The status element
     * @private
     */
    #createPasswordMatchStatusElement(isMatched) {
        const element = document.createElement('div');
        element.className = 'password-match-status';
        element.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 0.875rem;';

        const icon = isMatched ? ICONS.CHECK_CIRCLE : ICONS.X_CIRCLE;
        const color = isMatched ? COLORS.SUCCESS : COLORS.ERROR;
        const message = isMatched ? VALIDATION_MESSAGES.PASSWORD_MATCH : VALIDATION_MESSAGES.PASSWORD_MISMATCH;

        element.innerHTML = `${icon}<span style="color: ${color};">${message}</span>`;

        return element;
    }

    /**
     * Inserts password match status element after the input field.
     * @param {HTMLElement} statusElement - The status element to insert
     * @private
     */
    #insertPasswordMatchStatus(statusElement) {
        this.#input?.parentNode?.insertBefore(statusElement, this.#input.nextSibling);
    }

    // ========================================
    // PASSWORD REQUIREMENTS (GROUP MODE)
    // ========================================

    /**
     * Updates password requirements validation state (group mode only).
     * Dispatches 'password-validation' event with results.
     * @private
     */
    #updatePasswordRequirements() {
        if (this.#passwordValidationMode !== 'group' || !this.#input) return;

        const requirementsContainer =
            this.querySelector('#password-requirements') ||
            document.getElementById('password-requirements');

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

    /**
     * Extracts password requirements configuration from the container element.
     * @param {HTMLElement} container - The requirements container element
     * @returns {Object} Requirements configuration object
     * @private
     */
    #extractRequirementsFromContainer(container) {
        const requirements = {
            minLength: 8,
            needsNumber: false,
            needsSpecialChar: false,
            needsUppercase: false,
            needsLowercase: false
        };

        // Extract min length from text content
        const minLengthElement = container.querySelector('[data-requirement="minLength"]');
        if (minLengthElement) {
            const minLengthText = minLengthElement.querySelector('.requirement-text')?.textContent;
            const minLengthMatch = minLengthText?.match(/(\d+)/);
            if (minLengthMatch) {
                requirements.minLength = parseInt(minLengthMatch[1], 10);
            }
        }

        // Check for individual requirements
        requirements.needsNumber = !!container.querySelector('[data-requirement="hasNumber"]');
        requirements.needsSpecialChar = !!container.querySelector('[data-requirement="hasSpecialChar"]');
        requirements.needsUppercase = !!container.querySelector('[data-requirement="hasUppercase"]');
        requirements.needsLowercase = !!container.querySelector('[data-requirement="hasLowercase"]');

        // Handle combined case requirement
        if (container.querySelector('[data-requirement="caseCombined"]')) {
            requirements.needsUppercase = true;
            requirements.needsLowercase = true;
        }

        return requirements;
    }

    /**
     * Updates the visual status of a password requirement.
     * @param {string} requirement - The requirement identifier
     * @param {boolean} isValid - Whether the requirement is met
     * @private
     */
    #updateRequirementStatus(requirement, isValid) {
        const element = this.querySelector(`[data-requirement="${requirement}"]`);
        if (!element) return;

        element.classList.toggle('valid', isValid);

        const icon = element.querySelector('.requirement-icon');
        if (icon) {
            icon.innerHTML = isValid ? ICONS.CHECK_CIRCLE : ICONS.X_MARK;
        }
    }

    // ========================================
    // WEB COMPONENT LIFECYCLE
    // ========================================

    /**
     * Called when the element is added to the DOM.
     * Initializes the component and attaches event listeners.
     */
    connectedCallback() {
        if (this.#isInitialized) return;

        this.#input = this.querySelector('input, textarea, select');

        if (!this.#input) {
            console.warn('FormGroup: No input, textarea, or select element found');
            return;
        }

        this.#attachListeners();
        this.#setupInputFormatting();
        this.#setupPasswordValidation();
        this.#isInitialized = true;
    }

    /**
     * Called when the element is removed from the DOM.
     * Cleans up event listeners.
     */
    disconnectedCallback() {
        this.#detachListeners();
        this.#isInitialized = false;
    }

    /**
     * Called when an observed attribute changes.
     * Re-validates if an error is currently shown.
     * @param {string} _name - Attribute name (unused)
     * @param {string} oldValue - Previous value
     * @param {string} newValue - New value
     */
    attributeChangedCallback(_name, oldValue, newValue) {
        if (oldValue !== newValue && this.hasAttribute('show-error')) {
            this.#showError();
        }
    }

    // ========================================
    // HELPER METHODS & GETTERS
    // ========================================

    /**
     * Gets the error message element from shadow DOM.
     * @returns {HTMLElement} The error message span element
     * @private
     */
    get #errorMessage() {
        return this.shadowRoot.querySelector('.error-message');
    }

    /**
     * Finds the first invalid validity state key.
     * @param {ValidityState} validityState - The validity state object
     * @returns {string|null} The first invalid key or null if valid
     * @private
     */
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

        return validityKeys.find(key => validityState[key]) || null;
    }

    /**
     * Gets the custom error messages object based on attributes and defaults.
     * @returns {Object} Object mapping validity keys to error messages
     * @private
     */
    get #customErrorMessage() {
        // Special handling for confirm password validation
        if (this.#confirmPasswordFor && this.#input?.validationMessage) {
            return { customError: this.#input.validationMessage };
        }

        return {
            valueMissing: this.#getValueMissingMessage(),
            tooLong: this.#getTooLongMessage(),
            tooShort: this.#getTooShortMessage(),
            rangeOverflow: this.#getRangeOverflowMessage(),
            rangeUnderflow: this.#getRangeUnderflowMessage(),
            typeMismatch: this.#getTypeMismatchMessageCustom(),
            patternMismatch: this.#getPatternMismatchMessage(),
            stepMismatch: this.#getStepMismatchMessage(),
            badInput: this.#getBadInputMessage(),
            customError: this.#input?.validationMessage || VALIDATION_MESSAGES.CUSTOM_ERROR
        };
    }

    // ========================================
    // ERROR MESSAGE GETTERS
    // ========================================

    /** @private */
    #getValueMissingMessage() {
        return this.getAttribute('value-missing-message') || VALIDATION_MESSAGES.VALUE_MISSING;
    }

    /** @private */
    #getTooLongMessage() {
        const maxLength = this.#input?.maxLength;
        return this.getAttribute('too-long-message') ||
            (maxLength > 0
                ? VALIDATION_MESSAGES.TOO_LONG_WITH_MAX.replace('{max}', maxLength)
                : VALIDATION_MESSAGES.TOO_LONG);
    }

    /** @private */
    #getTooShortMessage() {
        const minLength = this.#input?.minLength;
        return this.getAttribute('too-short-message') ||
            (minLength > 0
                ? VALIDATION_MESSAGES.TOO_SHORT_WITH_MIN.replace('{min}', minLength)
                : VALIDATION_MESSAGES.TOO_SHORT);
    }

    /** @private */
    #getRangeOverflowMessage() {
        const max = this.#input?.max;
        return this.getAttribute('range-overflow-message') ||
            (max ? VALIDATION_MESSAGES.RANGE_OVERFLOW_WITH_MAX.replace('{max}', max) : VALIDATION_MESSAGES.RANGE_OVERFLOW);
    }

    /** @private */
    #getRangeUnderflowMessage() {
        const min = this.#input?.min;
        return this.getAttribute('range-underflow-message') ||
            (min ? VALIDATION_MESSAGES.RANGE_UNDERFLOW_WITH_MIN.replace('{min}', min) : VALIDATION_MESSAGES.RANGE_UNDERFLOW);
    }

    /** @private */
    #getTypeMismatchMessageCustom() {
        const inputType = this.#input?.type || 'text';
        return this.getAttribute('type-mismatch-message') || this.#getTypeMismatchMessage(inputType);
    }

    /** @private */
    #getPatternMismatchMessage() {
        const pattern = this.#input?.pattern;
        return this.getAttribute('pattern-mismatch-message') ||
            (pattern
                ? VALIDATION_MESSAGES.PATTERN_MISMATCH_WITH_PATTERN.replace('{pattern}', pattern)
                : VALIDATION_MESSAGES.PATTERN_MISMATCH);
    }

    /** @private */
    #getStepMismatchMessage() {
        const step = this.#input?.step;
        return this.getAttribute('step-mismatch-message') ||
            (step ? VALIDATION_MESSAGES.STEP_MISMATCH_WITH_STEP.replace('{step}', step) : VALIDATION_MESSAGES.STEP_MISMATCH);
    }

    /** @private */
    #getBadInputMessage() {
        return this.getAttribute('bad-input-message') || VALIDATION_MESSAGES.BAD_INPUT;
    }

    /**
     * Gets type-specific error message for type mismatch errors.
     * @param {string} inputType - The input type (email, url, tel, etc.)
     * @returns {string} The appropriate error message
     * @private
     */
    #getTypeMismatchMessage(inputType) {
        const typeMessages = {
            email: VALIDATION_MESSAGES.TYPE_MISMATCH_EMAIL,
            url: VALIDATION_MESSAGES.TYPE_MISMATCH_URL,
            tel: VALIDATION_MESSAGES.TYPE_MISMATCH_TEL,
            number: VALIDATION_MESSAGES.TYPE_MISMATCH_NUMBER,
            date: VALIDATION_MESSAGES.TYPE_MISMATCH_DATE,
            time: VALIDATION_MESSAGES.TYPE_MISMATCH_TIME,
            datetime: VALIDATION_MESSAGES.TYPE_MISMATCH_DATETIME,
            'datetime-local': VALIDATION_MESSAGES.TYPE_MISMATCH_DATETIME_LOCAL,
            month: VALIDATION_MESSAGES.TYPE_MISMATCH_MONTH,
            week: VALIDATION_MESSAGES.TYPE_MISMATCH_WEEK,
            color: VALIDATION_MESSAGES.TYPE_MISMATCH_COLOR
        };

        return typeMessages[inputType] || VALIDATION_MESSAGES.TYPE_MISMATCH_DEFAULT;
    }

    // ========================================
    // PUBLIC API
    // ========================================

    /**
     * Manually triggers validation on the input.
     * @returns {boolean} Whether the input is valid
     * @public
     */
    validate() {
        if (!this.#input) return true;

        this.#hasUserInteracted = true;
        this.#validateEmail();

        const isValid = this.#input.checkValidity();

        if (isValid) {
            this.#clearError();
        } else {
            this.#showError();
        }

        return isValid;
    }

    /**
     * Resets the form group to its initial state.
     * Clears errors, value, and resets password requirements.
     * @public
     */
    reset() {
        this.#clearError();
        this.#hasUserInteracted = false;

        if (this.#input) {
            this.#input.value = '';
            this.#input.setCustomValidity('');
        }

        if (this.#passwordValidationMode === 'group') {
            this.#updatePasswordRequirements();
        }

        // Also remove password match status if present
        this.#removePasswordMatchStatus();
    }

    /**
     * Gets the wrapped input element.
     * @returns {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null}
     * @public
     */
    get input() {
        return this.#input;
    }

    /**
     * Checks if the input is currently valid.
     * @returns {boolean} Whether the input is valid
     * @public
     */
    get isValid() {
        return this.#input?.validity.valid ?? true;
    }
}

// ============================================================================
// COMPONENT REGISTRATION
// ============================================================================

// Register the custom element
customElements.define('form-group', FormGroup);
