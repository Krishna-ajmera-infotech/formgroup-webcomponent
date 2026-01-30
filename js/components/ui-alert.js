const UI_ALERT_COLORS = {
    SUCCESS: '#10b981',
    SUCCESS_BG: '#d1fae5',
    SUCCESS_BORDER: '#10b981',
    ERROR: '#ef4444',
    ERROR_BG: '#fee2e2',
    ERROR_BORDER: '#ef4444',
    WARNING: '#f59e0b',
    WARNING_BG: '#fef3c7',
    WARNING_BORDER: '#f59e0b',
    INFO: '#3b82f6',
    INFO_BG: '#dbeafe',
    INFO_BORDER: '#3b82f6'
};

const uiAlertStyles = new CSSStyleSheet();
uiAlertStyles.replaceSync(`
    :host {
        display: block;
    }

    /* Full Page Loader Styles */
    .full-page-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .loader-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
    }

    .loader-content {
        position: relative;
        z-index: 1;
        text-align: center;
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .loader-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #e5e7eb;
        border-top-color: ${UI_ALERT_COLORS.INFO};
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }

    .loader-text {
        color: #374151;
        font-size: 1rem;
        font-weight: 500;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Validation Notification Styles */
    .validation-notification {
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 1001;
        color: ${UI_ALERT_COLORS.ERROR};
        background-color: ${UI_ALERT_COLORS.ERROR_BG};
        border: 1px solid ${UI_ALERT_COLORS.ERROR_BORDER};
        padding: 16px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 400;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        max-width: 416px;
        animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    /* Toast Message Styles */
    .toast-container {
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 1001;
        padding: 16px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 400;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        max-width: 416px;
        animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .toast-success {
        color: #059669;
        background-color: ${UI_ALERT_COLORS.SUCCESS_BG};
        border: 1px solid ${UI_ALERT_COLORS.SUCCESS_BORDER};
    }

    .toast-error {
        color: #dc2626;
        background-color: ${UI_ALERT_COLORS.ERROR_BG};
        border: 1px solid ${UI_ALERT_COLORS.ERROR_BORDER};
    }

    .toast-warning {
        color: #d97706;
        background-color: ${UI_ALERT_COLORS.WARNING_BG};
        border: 1px solid ${UI_ALERT_COLORS.WARNING_BORDER};
    }

    .toast-info {
        color: #2563eb;
        background-color: ${UI_ALERT_COLORS.INFO_BG};
        border: 1px solid ${UI_ALERT_COLORS.INFO_BORDER};
    }

    /* Inline Message Styles */
    .dynamic-message {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        border-radius: 0.5rem;
        border: 1px solid;
        transition: opacity 0.2s ease-in-out;
    }

    .success-message {
        color: #059669;
        background-color: ${UI_ALERT_COLORS.SUCCESS_BG};
        border-color: ${UI_ALERT_COLORS.SUCCESS_BORDER};
    }

    .error-message {
        color: #dc2626;
        background-color: ${UI_ALERT_COLORS.ERROR_BG};
        border-color: ${UI_ALERT_COLORS.ERROR_BORDER};
    }

    .warning-message {
        color: #d97706;
        background-color: ${UI_ALERT_COLORS.WARNING_BG};
        border-color: ${UI_ALERT_COLORS.WARNING_BORDER};
    }

    .info-message {
        color: #2563eb;
        background-color: ${UI_ALERT_COLORS.INFO_BG};
        border-color: ${UI_ALERT_COLORS.INFO_BORDER};
    }

    .message-content { flex-grow: 1; }

    .message-close-button {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        opacity: 0.7;
        transition: opacity 0.2s;
    }

    .message-close-button:hover { opacity: 1; }

    .message-content ul {
        margin-top: 0.5rem;
        list-style-type: disc;
        list-style-position: outside;
        padding-left: 1rem;
    }

    .message-content ul li { margin-bottom: 0.25rem; }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
`);

/**
 * UIAlert - A custom web component for loaders, toasts, and notifications.
 * @extends HTMLElement
 *
 * @example
 * // Full Page Loader
 * <ui-alert type="loader" message="Loading..." visible></ui-alert>
 *
 * // Toast Notification
 * <ui-alert type="toast" variant="success" message="Success!" visible auto-remove></ui-alert>
 *
 * // Inline Message
 * <ui-alert type="message" variant="error" title="Error" message="Something went wrong" visible></ui-alert>
 */
class UIAlert extends HTMLElement {
    #container = null;
    #autoRemoveTimeout = null;

    static get observedAttributes() {
        return ['type', 'variant', 'message', 'title', 'visible', 'auto-remove', 'auto-remove-delay'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [uiAlertStyles];
        this.#container = document.createElement('div');
        this.shadowRoot.appendChild(this.#container);
    }

    connectedCallback() {
        this.#render();
    }

    disconnectedCallback() {
        if (this.#autoRemoveTimeout) {
            clearTimeout(this.#autoRemoveTimeout);
        }
        // Remove loader-active class if this was a loader
        if (this.type === 'loader') {
            document.body.classList.remove('loader-active');
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.#render();
        }
    }

    // Getters for attributes
    get type() { return this.getAttribute('type') || 'message'; }
    get variant() { return this.getAttribute('variant') || 'info'; }
    get message() { return this.getAttribute('message') || ''; }
    get title() { return this.getAttribute('title') || ''; }
    get visible() { return this.hasAttribute('visible'); }
    get autoRemove() { return this.hasAttribute('auto-remove'); }
    get autoRemoveDelay() { return parseInt(this.getAttribute('auto-remove-delay')) || 5000; }

    // Setters for attributes
    set type(value) { this.setAttribute('type', value); }
    set variant(value) { this.setAttribute('variant', value); }
    set message(value) { this.setAttribute('message', value); }
    set title(value) { if (value) this.setAttribute('title', value); else this.removeAttribute('title'); }
    set visible(value) { value ? this.setAttribute('visible', '') : this.removeAttribute('visible'); }

    /**
     * Show the feedback element
     * @param {Object} options - Optional configuration
     */
    show(options = {}) {
        if (options.type) this.type = options.type;
        if (options.variant) this.variant = options.variant;
        if (options.message) this.message = options.message;
        if (options.title !== undefined) this.title = options.title;
        this.visible = true;
    }

    /**
     * Hide the feedback element
     */
    hide() {
        if (this.type === 'loader') {
            document.body.classList.remove('loader-active');
        }
        this.visible = false;
        if (this.#autoRemoveTimeout) {
            clearTimeout(this.#autoRemoveTimeout);
        }
    }

    #setupAutoRemove() {
        if (this.#autoRemoveTimeout) {
            clearTimeout(this.#autoRemoveTimeout);
        }
        if (this.autoRemove && this.autoRemoveDelay > 0) {
            this.#autoRemoveTimeout = setTimeout(() => {
                this.#container.style.animation = 'slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => this.hide(), 400);
            }, this.autoRemoveDelay);
        }
    }

    #render() {
        if (!this.visible) {
            this.#container.innerHTML = '';
            this.style.display = 'none';
            return;
        }

        this.style.display = 'block';

        switch (this.type) {
            case 'loader':
                this.#renderLoader();
                break;
            case 'toast':
                this.#renderToast();
                break;
            case 'notification':
                this.#renderNotification();
                break;
            case 'message':
            default:
                this.#renderMessage();
                break;
        }
    }

    #renderLoader() {
        this.#container.className = 'full-page-loader';
        this.#container.innerHTML = `<div class="loader-backdrop"></div><div class="loader-content"><div class="loader-spinner"></div><div class="loader-text">${this.message || 'Processing your information...'}</div></div>`;
        document.body.classList.add('loader-active');
    }

    #renderToast() {
        this.#container.className = 'toast-container toast-' + this.variant;
        let html = '';
        if (this.title) html += '<div style="font-weight:bold;margin-bottom:0.25rem">' + this.title + '</div>';
        html += '<div>' + this.message + '</div>';
        this.#container.innerHTML = html;
        this.#setupAutoRemove();
    }

    #renderNotification() {
        this.#container.className = 'validation-notification';
        this.#container.innerHTML = '<span>' + this.message + '</span>';
        this.#setupAutoRemove();
    }

    #renderMessage() {
        this.#container.className = 'dynamic-message ' + this.variant + '-message';
        this.#container.setAttribute('role', 'alert');
        let html = '<div class="message-content">';
        if (this.title) html += '<span style="font-weight:bold">' + this.title + '</span>';
        html += '<div' + (this.title ? ' style="margin-top:0.25rem"' : '') + '>' + this.message + '</div></div>';
        this.#container.innerHTML = html;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'message-close-button';
        closeBtn.innerHTML = '<span class="sr-only">Close</span><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>';
        closeBtn.addEventListener('click', () => this.hide());
        this.#container.appendChild(closeBtn);
    }
}

// Register the web component
customElements.define('ui-alert', UIAlert);

// ============================================================================
// GLOBAL HELPER FUNCTIONS
// ============================================================================

/**
 * Show or hide the full page loader
 * @param {boolean} show - Whether to show or hide the loader
 * @param {string} message - Optional message to display
 */
function showFullPageLoader(show, message = null) {
    let loader = document.querySelector('ui-alert[type="loader"]');
    if (show) {
        if (!loader) {
            loader = document.createElement('ui-alert');
            loader.type = 'loader';
            document.body.appendChild(loader);
        }
        loader.message = message || 'Processing your information...';
        loader.show();
    } else if (loader) {
        loader.hide();
    }
}

/**
 * Show a validation notification message
 * @param {string} message - The validation message to display
 */
function showValidationNotification(message) {
    const existing = document.querySelectorAll('ui-alert[type="notification"]');
    existing.forEach(n => n.hide());

    const notification = document.createElement('ui-alert');
    notification.type = 'notification';
    notification.setAttribute('auto-remove', '');
    notification.setAttribute('auto-remove-delay', '5000');
    notification.message = message;
    document.body.appendChild(notification);
    notification.show();
}

/**
 * Show a toast message
 * @param {Object} options - Configuration object
 * @param {string} options.type - Message type: 'success', 'error', 'warning', 'info'
 * @param {string} options.message - Message content
 * @param {string} [options.title] - Optional title
 * @param {number} [options.autoRemoveDelay=5000] - Delay before auto-removal
 */
function showToastMessage(options) {
    const { type = 'info', message, title = null, autoRemoveDelay = 5000 } = options;

    // Remove existing toasts of same type
    const existing = document.querySelectorAll('ui-alert[type="toast"]');
    existing.forEach(t => t.hide());

    const toast = document.createElement('ui-alert');
    toast.type = 'toast';
    toast.variant = type;
    toast.message = message;
    if (title) toast.title = title;
    toast.setAttribute('auto-remove', '');
    toast.setAttribute('auto-remove-delay', autoRemoveDelay.toString());
    document.body.appendChild(toast);
    toast.show();

    return toast;
}

/**
 * Show an inline message in a target container
 * @param {Object} options - Configuration object
 * @param {string} options.type - Message type: 'success', 'error', 'warning', 'info'
 * @param {string} options.message - Message content
 * @param {string|HTMLElement} options.target - CSS selector or DOM element
 * @param {string} [options.title] - Optional title
 * @param {boolean} [options.autoRemove=false] - Whether to auto-remove
 * @param {number} [options.autoRemoveDelay=8000] - Delay before auto-removal
 */
function showMessage(options) {
    const {
        type = 'info',
        message,
        target,
        title = null,
        autoRemove = false,
        autoRemoveDelay = 8000
    } = options;

    let targetElement;
    if (typeof target === 'string') {
        targetElement = document.querySelector(target);
    } else if (target instanceof HTMLElement) {
        targetElement = target;
    } else {
        throw new Error('Invalid target specified for showMessage');
    }

    // Remove existing messages in target
    const existing = targetElement.querySelectorAll('ui-alert[type="message"]');
    existing.forEach(m => m.remove());

    const msg = document.createElement('ui-alert');
    msg.type = 'message';
    msg.variant = type;
    msg.message = message;
    if (title) msg.title = title;
    if (autoRemove) {
        msg.setAttribute('auto-remove', '');
        msg.setAttribute('auto-remove-delay', autoRemoveDelay.toString());
    }
    targetElement.appendChild(msg);
    msg.show();

    return msg;
}

/**
 * MessageHelper - Convenience methods for common message types
 */
const MessageHelper = {
    success: (message, target, options = {}) =>
        showMessage({ ...options, type: 'success', message, target }),
    error: (message, target, options = {}) =>
        showMessage({ ...options, type: 'error', message, target }),
    warning: (message, target, options = {}) =>
        showMessage({ ...options, type: 'warning', message, target }),
    info: (message, target, options = {}) =>
        showMessage({ ...options, type: 'info', message, target })
};

/**
 * Scroll to top of page
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'auto' });
}

/**
 * Scroll element into view
 * @param {HTMLElement} element - Element to scroll into view
 */
function scrollIntoView(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UIAlert,
        showFullPageLoader,
        showValidationNotification,
        showToastMessage,
        showMessage,
        MessageHelper,
        scrollToTop,
        scrollIntoView
    };
}
