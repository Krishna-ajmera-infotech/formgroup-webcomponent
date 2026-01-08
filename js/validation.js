// Form validation utilities
class FormValidation {
    // Form validation function to check if all required fields are valid
    static isFormValid(form) {
        const formGroups = form.querySelectorAll('form-group');

        for (const formGroup of formGroups) {
            const input = formGroup.querySelector('input, select, textarea');
            if (input && input.hasAttribute('required') && !formGroup.isValid) {
                return false;
            }
        }

        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        for (const input of inputs) {
            if (!input.validity.valid || input.value.trim() === '') {
                return false;
            }
        }

        // Additional check: make sure there's at least one required field that has a value
        const hasRequiredFields = form.querySelectorAll('input[required], select[required], textarea[required]').length > 0;
        if (hasRequiredFields) {
            const hasFilledRequiredField = Array.from(form.querySelectorAll('input[required], select[required], textarea[required]'))
                .some(input => input.value.trim() !== '' && input.validity.valid);
            return hasFilledRequiredField;
        }

        return true;
    }

    // Function to update submit button state based on form validity
    static updateSubmitButton(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = !FormValidation.isFormValid(form);
        }
    }

    // Function to add validation listeners to a form
    static addFormValidationListeners(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        // Ensure submit button is initially disabled
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
        }

        // Listen for input events on all form fields
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            ['input', 'change', 'blur', 'keyup'].forEach(eventType => {
                input.addEventListener(eventType, () => {
                    // Delay the check slightly to allow form-group validation to complete
                    setTimeout(() => FormValidation.updateSubmitButton(form), 10);
                });
            });
        });

        // Listen for custom validation events from form-group components
        const formGroups = form.querySelectorAll('form-group');
        formGroups.forEach(formGroup => {
            ['validation-error', 'validation-success'].forEach(eventType => {
                formGroup.addEventListener(eventType, () => {
                    setTimeout(() => FormValidation.updateSubmitButton(form), 10);
                });
            });
        });

        // Also listen for form reset events to re-disable the button
        form.addEventListener('reset', () => {
            setTimeout(() => {
                if (submitButton) {
                    submitButton.disabled = true;
                }
            }, 10);
        });

        // Initial button state check (should be disabled)
        FormValidation.updateSubmitButton(form);
    }

    // Common form submission handler
    static handleFormSubmission(formId, successElementId, successMessage = '✓ Form submitted successfully!') {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Double check form validity before submission
            if (!FormValidation.isFormValid(form)) {
                alert('Please fill out all required fields correctly before submitting.');
                return;
            }

            const successBox = document.getElementById(successElementId);
            if (successBox) {
                successBox.textContent = successMessage;
                successBox.style.display = 'block';
                setTimeout(() => {
                    successBox.style.display = 'none';
                }, 3000);
            } else {
                alert(successMessage);
            }
        });
    }

    // Initialize validation for a form when page loads
    static initializeForm(formId, successElementId, successMessage) {
        document.addEventListener('DOMContentLoaded', () => {
            FormValidation.addFormValidationListeners(formId);
            FormValidation.handleFormSubmission(formId, successElementId, successMessage);
        });
    }

    // Utility function to disable all submit buttons on page load
    static disableAllSubmitButtons() {
        document.addEventListener('DOMContentLoaded', () => {
            const submitButtons = document.querySelectorAll('button[type="submit"]');
            submitButtons.forEach(button => {
                button.disabled = true;
            });
        });
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidation;
}