/*
 * Progressive enhancement marker.
 *
 * Without JavaScript the mobile navigation remains visible.
 * When JavaScript is available, CSS converts it into the
 * collapsible mobile navigation.
 */
document.documentElement.classList.add("js");


document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  const navToggle = document.querySelector(".nav-toggle");
  const primaryNavigation = document.querySelector("#primary-navigation");

  if (navToggle && primaryNavigation) {
    const toggleLabel = navToggle.querySelector(".sr-only");

    const openNavigation = () => {
      primaryNavigation.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");

      if (toggleLabel) {
        toggleLabel.textContent = "Close navigation";
      }
    };

    const closeNavigation = ({ returnFocus = false } = {}) => {
      primaryNavigation.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");

      if (toggleLabel) {
        toggleLabel.textContent = "Open navigation";
      }

      if (returnFocus) {
        navToggle.focus();
      }
    };

    const navigationIsOpen = () =>
      navToggle.getAttribute("aria-expanded") === "true";


    navToggle.addEventListener("click", () => {
      if (navigationIsOpen()) {
        closeNavigation();
      } else {
        openNavigation();
      }
    });


    /*
     * Close mobile navigation after choosing an internal link.
     */
    primaryNavigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 50rem)").matches) {
          closeNavigation();
        }
      });
    });


    /*
     * Escape closes the menu and returns focus to its button.
     */
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigationIsOpen()) {
        closeNavigation({ returnFocus: true });
      }
    });


    /*
     * Close the menu if the user moves from mobile to desktop.
     */
    const desktopMediaQuery = window.matchMedia("(min-width: 50.001rem)");

    const handleViewportChange = (event) => {
      if (event.matches && navigationIsOpen()) {
        closeNavigation();
      }
    };

    desktopMediaQuery.addEventListener(
      "change",
      handleViewportChange
    );
  }


  /* =========================================================
     CURRENT YEAR
     ========================================================= */

  const currentYear = document.querySelector("#current-year");

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }


  /* =========================================================
     CONTACT FORM
     ========================================================= */

  const form = document.querySelector("#contact-form");

  if (!form) {
    return;
  }

  const submitButton = form.querySelector("#submit-button");
  const formStatus = form.querySelector("#form-status");
  const messageField = form.querySelector("#message");
  const messageCount = form.querySelector("#message-count");
  const honeypot = form.querySelector("#website");

  const fields = Array.from(
    form.querySelectorAll(
      "input:not(#website), select, textarea"
    )
  );


  /* =========================================================
     CHARACTER COUNTER
     ========================================================= */

  const updateMessageCount = () => {
    if (!messageField || !messageCount) {
      return;
    }

    const maximum = Number(
      messageField.getAttribute("maxlength")
    ) || 2000;

    messageCount.textContent =
      `${messageField.value.length} / ${maximum}`;
  };

  if (messageField) {
    updateMessageCount();

    messageField.addEventListener(
      "input",
      updateMessageCount
    );
  }


  /* =========================================================
     VALIDATION HELPERS
     ========================================================= */

  const getErrorElement = (field) =>
    document.querySelector(`#${field.id}-error`);


  const clearFieldError = (field) => {
    const errorElement = getErrorElement(field);

    field.removeAttribute("aria-invalid");

    if (errorElement) {
      errorElement.textContent = "";
    }
  };


  const showFieldError = (field, message) => {
    const errorElement = getErrorElement(field);

    field.setAttribute("aria-invalid", "true");

    if (errorElement) {
      errorElement.textContent = message;
    }
  };


  const getFieldLabel = (field) => {
    const label = document.querySelector(
      `label[for="${field.id}"]`
    );

    if (!label) {
      return "This field";
    }

    return label.childNodes[0].textContent.trim();
  };


  const validateField = (field) => {
    const value =
      typeof field.value === "string"
        ? field.value.trim()
        : field.value;

    const label = getFieldLabel(field);

    clearFieldError(field);


    if (field.required && !value) {
      showFieldError(
        field,
        `${label} is required.`
      );

      return false;
    }


    if (
      field.type === "email" &&
      value &&
      field.validity.typeMismatch
    ) {
      showFieldError(
        field,
        "Enter a valid email address."
      );

      return false;
    }


    if (field.validity.tooShort) {
      const minimum = field.getAttribute("minlength");

      showFieldError(
        field,
        `${label} must be at least ${minimum} characters.`
      );

      return false;
    }


    if (field.validity.tooLong) {
      const maximum = field.getAttribute("maxlength");

      showFieldError(
        field,
        `${label} must be no more than ${maximum} characters.`
      );

      return false;
    }


    return true;
  };


  /* =========================================================
     FIELD EVENTS
     ========================================================= */

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      validateField(field);
    });

    field.addEventListener("input", () => {
      if (field.hasAttribute("aria-invalid")) {
        validateField(field);
      }
    });

    field.addEventListener("change", () => {
      if (field.hasAttribute("aria-invalid")) {
        validateField(field);
      }
    });
  });


  /* =========================================================
     FORM STATUS
     ========================================================= */

  const clearFormStatus = () => {
    if (!formStatus) {
      return;
    }

    formStatus.classList.remove(
      "is-error",
      "is-success"
    );

    formStatus.textContent = "";
  };


  const showFormStatus = (message, type) => {
    if (!formStatus) {
      return;
    }

    clearFormStatus();

    formStatus.classList.add(
      type === "success"
        ? "is-success"
        : "is-error"
    );

    formStatus.textContent = message;
    formStatus.focus();
  };


  /* =========================================================
     FORM SUBMISSION
     ========================================================= */

  let submissionInProgress = false;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    clearFormStatus();


    /*
     * Basic honeypot defence.
     *
     * The production form processor will also require
     * server-side spam protection and rate limiting.
     */
    if (honeypot && honeypot.value.trim() !== "") {
      return;
    }


    let formIsValid = true;
    let firstInvalidField = null;

    fields.forEach((field) => {
      const fieldIsValid = validateField(field);

      if (!fieldIsValid) {
        formIsValid = false;

        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    });


    if (!formIsValid) {
      showFormStatus(
        "There are a few things to check before the form can be sent.",
        "error"
      );

      if (firstInvalidField) {
        firstInvalidField.focus();
      }

      return;
    }


    /*
     * Prevent accidental repeated submissions.
     */
    if (submissionInProgress) {
      return;
    }

    submissionInProgress = true;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Checking enquiry…";
    }


    /*
     * DEVELOPMENT PLACEHOLDER
     *
     * No data is transmitted yet.
     *
     * This block will be replaced with the production
     * form-processing integration before launch.
     */
    showFormStatus(
      "Everything looks good. The form is currently in development mode, so your enquiry has not been sent anywhere yet.",
      "success"
    );


    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Send Enquiry";
    }

    submissionInProgress = false;
  });

});