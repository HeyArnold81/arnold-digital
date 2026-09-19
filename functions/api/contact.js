const MAX_LENGTHS = {
  name: 80,
  business: 120,
  email: 254,
  telephone: 30,
  message: 2000,
};

const HELP_TYPES = new Set([
  "new-website",
  "website-redesign",
  "website-support",
  "online-presence",
  "digital-solution",
  "other",
]);

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
    },
  });


const clean = (value) =>
  typeof value === "string"
    ? value.trim()
    : "";


const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);


const validateTurnstile = async ({
  token,
  secret,
  remoteIp,
  expectedHostname,
  expectedAction,
}) => {
  const body = new FormData();

  body.append("secret", secret);
  body.append("response", token);

  if (remoteIp) {
    body.append("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body,
    }
  );

  if (!response.ok) {
    return {
      success: false,
      reason: "verification-service-error",
    };
  }

  const result = await response.json();

  if (!result.success) {
    return {
      success: false,
      reason: "verification-failed",
    };
  }

  if (
    expectedAction &&
    result.action &&
    result.action !== expectedAction
  ) {
    return {
      success: false,
      reason: "invalid-action",
    };
  }

  if (
    expectedHostname &&
    result.hostname &&
    result.hostname !== expectedHostname
  ) {
    return {
      success: false,
      reason: "invalid-hostname",
    };
  }

  return {
    success: true,
  };
};


export async function onRequestPost(context) {
  const {
    request,
    env,
  } = context;

  /*
   * Same-origin protection.
   */
  const origin = request.headers.get("Origin");

  if (
    env.ALLOWED_ORIGIN &&
    origin !== env.ALLOWED_ORIGIN
  ) {
    return jsonResponse(
      {
        success: false,
        message: "This request could not be accepted.",
      },
      403
    );
  }


  let formData;

  try {
    formData = await request.formData();
  } catch {
    return jsonResponse(
      {
        success: false,
        message: "The form data could not be read.",
      },
      400
    );
  }


  /*
   * Honeypot.
   * Genuine visitors should never populate this field.
   */
  const honeypot = clean(formData.get("website"));

  if (honeypot) {
    /*
     * Return a generic success response rather than revealing
     * that bot detection was triggered.
     */
    return jsonResponse({
      success: true,
      delivered: false,
    });
  }


  const name = clean(formData.get("name"));
  const business = clean(formData.get("business"));
  const email = clean(formData.get("email"));
  const telephone = clean(formData.get("telephone"));
  const helpType = clean(formData.get("helpType"));
  const message = clean(formData.get("message"));

  const turnstileToken = clean(
    formData.get("cf-turnstile-response")
  );


  /*
   * Server-side validation.
   */
  const errors = {};


  if (
    name.length < 2 ||
    name.length > MAX_LENGTHS.name
  ) {
    errors.name = "Enter your name.";
  }


  if (business.length > MAX_LENGTHS.business) {
    errors.business = "Business name is too long.";
  }


  if (
    !email ||
    email.length > MAX_LENGTHS.email ||
    !validEmail(email)
  ) {
    errors.email = "Enter a valid email address.";
  }


  if (telephone.length > MAX_LENGTHS.telephone) {
    errors.telephone = "Telephone number is too long.";
  }


  if (!HELP_TYPES.has(helpType)) {
    errors.helpType = "Select what you need help with.";
  }


  if (
    message.length < 10 ||
    message.length > MAX_LENGTHS.message
  ) {
    errors.message =
      "Your message must be between 10 and 2000 characters.";
  }


  if (Object.keys(errors).length > 0) {
    return jsonResponse(
      {
        success: false,
        message: "Please check the information provided.",
        errors,
      },
      400
    );
  }


  /*
   * Turnstile is mandatory.
   */
  if (!turnstileToken || !env.TURNSTILE_SECRET_KEY) {
    return jsonResponse(
      {
        success: false,
        message:
          "Human verification could not be completed. Please try again.",
      },
      400
    );
  }


  const remoteIp =
    request.headers.get("CF-Connecting-IP") || "";


  let turnstileResult;

  try {
    turnstileResult = await validateTurnstile({
    token: turnstileToken,
    secret: env.TURNSTILE_SECRET_KEY,
    remoteIp,
    expectedHostname: env.ALLOWED_HOSTNAME || "",
    expectedAction:
      env.FORM_MODE === "live"
        ? "contact"
        : "test",
  });
  } catch {
    return jsonResponse(
      {
        success: false,
        message:
          "Human verification is temporarily unavailable. Please try again.",
      },
      503
    );
  }


  if (!turnstileResult.success) {
    return jsonResponse(
      {
        success: false,
        message:
          "Human verification failed or expired. Please try again.",
      },
      400
    );
  }


  /*
   * Test mode validates everything but sends no email.
   */
  if (env.FORM_MODE !== "live") {
    return jsonResponse({
      success: true,
      delivered: false,
      message:
        "Form validated successfully in development mode. No email was sent.",
    });
  }


  /*
   * Production email configuration.
   */
  if (
    !env.EMAIL ||
    !env.CONTACT_TO_EMAIL ||
    !env.CONTACT_FROM_EMAIL
  ) {
    console.error(
      "Contact email delivery is not configured."
    );

    return jsonResponse(
      {
        success: false,
        message:
          "The enquiry service is temporarily unavailable. Please try again later.",
      },
      503
    );
  }


  const enquiryText = [
    "New Arnold Digital website enquiry",
    "",
    `Name: ${name}`,
    `Business: ${business || "Not provided"}`,
    `Email: ${email}`,
    `Telephone: ${telephone || "Not provided"}`,
    `Help required: ${helpType}`,
    "",
    "Message:",
    message,
  ].join("\n");


  try {
    await env.EMAIL.send({
      to: env.CONTACT_TO_EMAIL,
      from: env.CONTACT_FROM_EMAIL,
      replyTo: email,
      subject: "New Arnold Digital website enquiry",
      text: enquiryText,
    });
  } catch (error) {
    console.error(
      "Contact email failed:",
      error?.code || "unknown",
      error?.message || "unknown error"
    );

    return jsonResponse(
      {
        success: false,
        message:
          "Your enquiry could not be sent. Please try again later.",
      },
      502
    );
  }


  return jsonResponse({
    success: true,
    delivered: true,
    message: "Thanks. Your enquiry has been sent.",
  });
}


export function onRequestGet() {
  return jsonResponse(
    {
      success: false,
      message: "Method not allowed.",
    },
    405
  );
}
