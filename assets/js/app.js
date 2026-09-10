// Main Vue app
// In Hugo we do this {{"{{"}} message {{"}}"}}
var app = new Vue({
  el: '#app',

  // Filters
  filters: {
    // Highlight searched term
    highlight: function(value, searchTerm) {
      let index = value.toLowerCase().indexOf(searchTerm.toLowerCase());

      if(index < 0)
      {
        return value;
      }

      return value.substring(0,index) + "<span class='highlight'>" + value.substring(index,index+searchTerm.length) + "</span>" + value.substring(index + searchTerm.length);
    }
  },

    // Data useed in this componentpack
	data: {
    // Search term
    searchTerm: "",

    // Stores full site index.
    siteIndex: [],

    // Stores search results.
    searchResults: [],

    // Show mobile menu or not
		showMobileMenu: false,

    // Contact Form fields.
    contactSubmitting: false,
    contactTurnstileToken: "",
    contactTurnstileWidget: null,
    contactSecurityError: "",
    contactSubmitError: "",
    contactSuccess: "",
    contactEmail: "",
    contactPhone: "",
    contactMessage: "",
    contactFullName: "",
    contactEmailError: "",
    contactMessageError: "",
    contactFullNameError: ""
	},

	methods: {
    // Load site index.
    loadSiteIndex: function () {
      let that = this;

      // Only need to load this once.
      if(that.searchResults.length > 0) {
        return;
      }

      // Make AJAX call to get data.
      axios.get('index.json')
        .then(function (response) {
          that.siteIndex = response.data;
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
    },

    // Search
    doSearch: function (e) {
      let that = this;

      // Search options.
      var options = {
        shouldSort: true,
        includeMatches: true,
        threshold: 0.4,
        tokenize: true,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          {name:"title", weight:0.8},
          {name:"contents", weight:0.5},
          {name:"tags", weight:0.3},
          {name:"categories", weight:0.3}
        ]
      }

      // Do Search.
      var fuse = new Fuse(that.siteIndex, options);
      var results = fuse.search(this.searchTerm);
      that.searchResults = results;

      e.preventDefault();
    },

		// Mobile menu open
    mobileMenuToggle: function () {
			this.showMobileMenu = !this.showMobileMenu;
    },

    // Load Cloudflare only on the support form, after Vue owns the widget container.
    loadContactTurnstile: function() {
      var that = this;
      var container = this.$refs.contactTurnstile;
      if (!container) {
        return;
      }

      // Read only the public site key from the Hugo-rendered support template.
      var siteKey = container.getAttribute("data-sitekey");
      if (!siteKey) {
        this.contactSecurityError = "The security check is unavailable. Please email help@skyclerk.com.";
        return;
      }

      // Define the loader callback before requesting Cloudflare's asynchronous script.
      window.skyclerkSupportTurnstileReady = function() {
        // Render explicitly so Vue cannot replace an already initialized widget.
        that.contactTurnstileWidget = window.turnstile.render(container, {
          sitekey: siteKey,
          action: "support_contact",
          size: "flexible",
          theme: "light",
          "response-field": false,
          // Hold the verified token until expiry or the next submission attempt.
          callback: function(token) {
            that.contactTurnstileToken = token;
            that.contactSecurityError = "";
          },
          // Refresh an expired token while preserving the visitor's message.
          "expired-callback": function() {
            // Obtain a new challenge because tokens expire after five minutes.
            that.resetContactTurnstile();
          },
          // Discard timed-out challenges and allow Cloudflare to refresh the widget.
          "timeout-callback": function() {
            that.contactTurnstileToken = "";
            that.contactSecurityError = "The security check timed out. Please complete it again.";
          },
          // Keep submission blocked while Cloudflare automatically retries errors.
          "error-callback": function() {
            that.contactTurnstileToken = "";
            that.contactSecurityError = "The security check could not load. Please refresh the page or email help@skyclerk.com.";
          }
        });
      };

      // Load the official script directly, without bundling or proxying it.
      var script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=skyclerkSupportTurnstileReady&render=explicit";
      script.async = true;
      // Explain blocked scripts and network failures without allowing unverified requests.
      script.onerror = function() {
        that.contactSecurityError = "The security check could not load. Please refresh the page or email help@skyclerk.com.";
      };
      // Start the download only after the callback and container are ready.
      document.head.appendChild(script);
    },

    // Clear consumed tokens and refresh this widget after every submission attempt.
    resetContactTurnstile: function() {
      this.contactTurnstileToken = "";
      if (window.turnstile && this.contactTurnstileWidget !== null) {
        // A token can only be verified once, even if sending the support email fails.
        window.turnstile.reset(this.contactTurnstileWidget);
      }
    },

    // Validate the support form and submit a single request with its challenge token.
    doContactSubmit: function() {
      var that = this;

      // Ignore repeated clicks or Enter presses while the current request is pending.
      if (this.contactSubmitting) {
        return;
      }

      // Clear error
      this.contactSuccess = "";
      this.contactSubmitError = "";
      this.contactEmailError = "";
      this.contactMessageError = "";
      this.contactFullNameError = "";

      // valdiate email.
      if(this.contactEmail.length <= 2) {
        this.contactEmailError = "Valid email address is required.";
      }

      // valdiate name.
      if(this.contactFullName.length < 2) {
        this.contactFullNameError = "Valid full name is required.";
      }

      // valdiate message.
      if(this.contactMessage.length < 2) {
        this.contactMessageError = "Valid message is required.";
      }

      // Do we have any errors?
      if(this.contactEmailError || this.contactFullNameError || this.contactMessageError) {
        return;
      }

      // Guard programmatic submits as well as the disabled submit button.
      if (!this.contactTurnstileToken) {
        this.contactSecurityError = "Please complete the security check before submitting your request.";
        return;
      }

      this.contactSubmitting = true;
      this.contactSecurityError = "";

      // Send the token to the server, which verifies it before contacting support.
      return axios.post('https://app.skyclerk.com/support/contact-us', {
          fullName: this.contactFullName,
          email: this.contactEmail,
          phone: this.contactPhone,
          message: this.contactMessage,
          turnstile_token: this.contactTurnstileToken
        }, { timeout: 30000 })
        // Clear the message only when the backend confirms successful delivery.
        .then(function (response) {
          // Success
          if(response.status == 204) {
            that.contactSuccess = "Thank you for submitting your contact request. We will get back to you shortly.";
            that.contactEmail = "";
            that.contactPhone = "";
            that.contactMessage = "";
            that.contactFullName = "";
          } else {
            that.contactSubmitError = "Something went wrong. Please try again or email help@skyclerk.com.";
          }
        })
        // Preserve all fields on failure and distinguish rejected security checks.
        .catch(function (error) {
          if (error.response && error.response.data && error.response.data.code === "turnstile_failed") {
            that.contactSecurityError = "Please complete the security check again and resubmit your request.";
          } else {
            that.contactSubmitError = "Your request could not be confirmed. Please try again or email help@skyclerk.com.";
          }
        })
        // Unlock the form and replace the single-use token after success or failure.
        .finally(function() {
          that.contactSubmitting = false;
          // Request a fresh token for retries or a second support message.
          that.resetContactTurnstile();
        });
    }
  },

  // Initialize the support challenge only after its template has mounted.
  mounted: function() {
    // Other pages have no support container and do not load Cloudflare's script.
    this.loadContactTurnstile();
  },

  // Called when this fires up.
  created: function() {
    // Some day make it so we only load this if we need it.
    this.loadSiteIndex();
  }
});

/* End File */
