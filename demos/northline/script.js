"use strict";

const callbackForm = document.querySelector(".callback-panel");

callbackForm.addEventListener("submit", (event) => {
  event.preventDefault();
  callbackForm.querySelector(".callback-feedback").hidden = false;
});
