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

    // Do contact form submit
    doContactSubmit: function() {
      var that = this;

      // Clear error
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

      // Send request to the app server
      axios.post('https://app.skyclerk.com/support/contact-us', {
          fullName: this.contactFullName,
          email: this.contactEmail,
          phone: this.contactPhone,
          message: this.contactMessage
        })
        .then(function (response) {
          // Success
          if(response.status == 204) {
            that.contactSuccess = "Thank you for submitting your contact request. We will get back to you very shorty.";
            that.contactEmail = "";
            that.contactPhone = "";
            that.contactMessage = "";
            that.contactFullName = "";
          } else {
            alert("Something went wrong. Maybe try to email help@skyclerk.com instead.");
          }
        })
        .catch(function (error) {
          alert("Something went wrong. Maybe try to email help@skyclerk.com instead.");
        });
    }
  },

  // Called when this fires up.
  created: function() {
    // Some day make it so we only load this if we need it.
    this.loadSiteIndex();
  }
});

/* End File */
