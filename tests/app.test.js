//
// Date: 2026-09-09
// Author: Spicer Matthews (spicer@skyclerk.com)
// Copyright: 2026 Cloudmanic Labs, LLC. All rights reserved.
//

// Use Node's built-in runner and isolated browser globals without contacting external services.
const test = require("node:test");
// Assert observable form behavior rather than relying on a real Cloudflare challenge.
const assert = require("node:assert/strict");
// Read the same source Hugo includes in the public site's JavaScript bundle.
const fs = require("node:fs");
// Execute each scenario in an independent browser-like context.
const vm = require("node:vm");
// Locate the application independently of the command's working directory.
const path = require("node:path");
// Load the production source once; each test receives a fresh Vue instance.
const source = fs.readFileSync(path.join(__dirname, "../assets/js/app.js"), "utf8");

// createForm provides controlled Vue, Cloudflare, DOM, and HTTP boundaries while
// retaining the real support methods and mounted hook from the production bundle.
function createForm({ hasForm = true, siteKey = "public-key" } = {}) {
  const state = { scripts: [], posts: [], resets: [], options: null };
  // Default to a successful backend response; individual tests can replace this promise.
  state.response = Promise.resolve({ status: 204 });
  const container = {
    // Expose only the public key normally rendered by the Hugo template.
    getAttribute: function() { return siteKey; }
  };
  const context = {
    window: {
      turnstile: {
        // Capture lifecycle callbacks without loading Cloudflare or generating real tokens.
        render: function(element, options) {
          // Ensure the mounted support container is the one receiving the challenge.
          assert.equal(element, container);
          state.options = options;
          return "support-widget";
        },
        // Record resets so consumed, expired, and rejected tokens cannot be reused.
        reset: function(widget) {
          // Keep a history of which widget the app refreshes.
          state.resets.push(widget);
        }
      }
    },
    document: {
      // Return a script element whose asynchronous error handler tests can trigger.
      createElement: function() { return {}; },
      head: {
        // Record script loads so unrelated pages can be checked for unwanted downloads.
        appendChild: function(script) {
          // Retain the actual URL and error callback configured by the application.
          state.scripts.push(script);
        }
      }
    },
    axios: {
      // Capture the request contract and return only an in-process response.
      post: function(url, body, options) {
        // Preserve each request for duplicate-submit and token assertions.
        state.posts.push({ url, body, options });
        return state.response;
      }
    },
    // Construct a minimal Vue instance with the real data, bound methods, and mounted hook.
    Vue: function(options) {
      const app = options.data;
      app.$refs = hasForm ? { contactTurnstile: container } : {};
      // Bind methods as Vue does, without evaluating unrelated search initialization.
      for (const [name, method] of Object.entries(options.methods)) {
        // Preserve the application's use of this across lifecycle and HTTP callbacks.
        app[name] = method.bind(app);
      }
      // Run the real mounted hook after refs become available.
      options.mounted.call(app);
      return app;
    }
  };
  // Evaluate the production bundle in isolated globals for this scenario.
  vm.runInNewContext(source, context);
  state.app = context.app;
  state.window = context.window;
  state.app.contactFullName = "Test Visitor";
  state.app.contactEmail = "visitor@example.com";
  state.app.contactPhone = "555-0100";
  state.app.contactMessage = "Please help with my account.";
  return state;
}

// Check conditional loading and the public key/action contract sent to Cloudflare.
test("loads the explicit support widget only on the support form", function() {
  // Pages without the support template must not fetch a challenge script.
  assert.equal(createForm({ hasForm: false }).scripts.length, 0);
  // Mount a normal support page and let the script's onload callback run.
  const state = createForm();
  // Cloudflare's official script must load directly with explicit rendering.
  assert.equal(state.scripts[0].src, "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=skyclerkSupportTurnstileReady&render=explicit");
  // Simulate the ready callback that Cloudflare invokes after its script loads.
  state.window.skyclerkSupportTurnstileReady();
  // Match the support action expected by the backend verifier.
  assert.equal(state.options.action, "support_contact");
  // Ensure only the public key is provided to the widget.
  assert.equal(state.options.sitekey, "public-key");
});

// Verify both missing configuration and script failures keep the form blocked.
test("missing keys and blocked scripts show an actionable security error", function() {
  // Mount the form without a configured public key.
  const missing = createForm({ siteKey: "" });
  // Never request a widget with an empty key.
  assert.equal(missing.scripts.length, 0);
  // Tell the visitor how to contact support when verification is unavailable.
  assert.match(missing.app.contactSecurityError, /help@skyclerk.com/);
  // Exercise a browser that blocks the Cloudflare script.
  const blocked = createForm();
  // Trigger the actual network-error handler attached to the script element.
  blocked.scripts[0].onerror();
  // A blocked script must not produce a usable token.
  assert.equal(blocked.app.contactTurnstileToken, "");
  // Provide recovery instructions instead of silently leaving the button disabled.
  assert.match(blocked.app.contactSecurityError, /refresh/);
});

// Prevent bypasses through direct form submits and avoid spending tokens on invalid fields.
test("missing tokens and invalid fields never send a support request", function() {
  // A populated form still requires the security check.
  const state = createForm();
  // Invoke the real submit method directly, bypassing the disabled button.
  state.app.doContactSubmit();
  // No request can be sent without a token.
  assert.equal(state.posts.length, 0);
  state.app.contactTurnstileToken = "valid-token";
  state.app.contactMessage = "";
  // Client validation should prevent an empty message from consuming the challenge.
  state.app.doContactSubmit();
  // The token remains available after correcting ordinary field validation.
  assert.equal(state.posts.length, 0);
  // A form validation failure must preserve its unconsumed token.
  assert.equal(state.app.contactTurnstileToken, "valid-token");
});

// Ensure successful submission sends the token, blocks duplicates, and clears consumed state.
test("a verified request submits once and refreshes the challenge after success", async function() {
  // Initialize the widget and provide a successful challenge callback.
  const state = createForm();
  // Render the widget using the production onload callback.
  state.window.skyclerkSupportTurnstileReady();
  // Simulate successful completion of the Cloudflare challenge.
  state.options.callback("valid-token");
  // Submit once and leave the promise pending until duplicate-submit assertions finish.
  const pending = state.app.doContactSubmit();
  // A repeated click during the request must be ignored.
  state.app.doContactSubmit();
  // Only a single email-producing HTTP request may be sent.
  assert.equal(state.posts.length, 1);
  // Send the security token using the backend's JSON field name.
  assert.equal(state.posts[0].body.turnstile_token, "valid-token");
  // Keep using the existing support delivery endpoint.
  assert.equal(state.posts[0].url, "https://app.skyclerk.com/support/contact-us");
  await pending;
  // Clear the form only after successful delivery.
  assert.equal(state.app.contactMessage, "");
  // Never reuse a consumed challenge.
  assert.equal(state.app.contactTurnstileToken, "");
  // Return the button to its ordinary state after completion.
  assert.equal(state.app.contactSubmitting, false);
  // Confirm that the specific support widget was refreshed.
  assert.deepEqual(state.resets, ["support-widget"]);
  // Display the existing success confirmation.
  assert.match(state.app.contactSuccess, /Thank you/);
});

// Exercise rejected tokens, network failures, and unexpected responses without losing draft messages.
test("failed submissions preserve fields and require a new token for retry", async function() {
  for (const failure of ["security", "network", "unexpected"]) {
    // Give each failure case its own widget and form state.
    const state = createForm();
    // Render and complete the initial security check.
    state.window.skyclerkSupportTurnstileReady();
    // Supply the token consumed by the unsuccessful attempt.
    state.options.callback("first-token");
    // Model the responses the actual handler can return, plus lost network responses.
    state.response = failure === "unexpected" ? Promise.resolve({ status: 200 }) : Promise.reject(
      failure === "security" ? { response: { data: { code: "turnstile_failed" } } } : new Error("offline")
    );
    // Await the production catch/finally flow.
    await state.app.doContactSubmit();
    // Preserve the visitor's full message on every unsuccessful attempt.
    assert.equal(state.app.contactMessage, "Please help with my account.");
    // Do not erase the reply address after a failure.
    assert.equal(state.app.contactEmail, "visitor@example.com");
    // A potentially consumed token must be discarded after every attempt.
    assert.equal(state.app.contactTurnstileToken, "");
    // A failed request must unlock the form for retry.
    assert.equal(state.app.contactSubmitting, false);
    // Keep success hidden when the backend has not confirmed delivery.
    assert.equal(state.app.contactSuccess, "");
    // Every failure must explain how the visitor can recover.
    assert.ok(state.app.contactSecurityError || state.app.contactSubmitError);
    // Complete a fresh challenge and retry successfully with the retained message.
    state.options.callback("second-token");
    // Restore the successful backend response.
    state.response = Promise.resolve({ status: 204 });
    // Retry through the same submission method.
    await state.app.doContactSubmit();
    // The retry must carry the new token, never the consumed one.
    assert.equal(state.posts[1].body.turnstile_token, "second-token");
  }
});

// Tokens must be removed as soon as any Cloudflare callback marks them unusable.
test("expiry, timeout, and widget errors invalidate tokens", function() {
  // Load one isolated form for all lifecycle transitions.
  const state = createForm();
  // Make the production callbacks available.
  state.window.skyclerkSupportTurnstileReady();
  for (const callback of ["expired-callback", "timeout-callback", "error-callback"]) {
    // Begin each transition with a valid token.
    state.options.callback("valid-token");
    // Trigger Cloudflare's lifecycle event.
    state.options[callback]();
    // The form must immediately stop accepting the previous token.
    assert.equal(state.app.contactTurnstileToken, "");
    // Losing a challenge must never erase the visitor's draft.
    assert.equal(state.app.contactMessage, "Please help with my account.");
  }
  // Expiry should automatically request a fresh challenge.
  assert.deepEqual(state.resets, ["support-widget"]);
});
