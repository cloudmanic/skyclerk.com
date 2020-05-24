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
    }
  },

  // Called when this fires up.
  created: function() {
    // Some day make it so we only load this if we need it.
    this.loadSiteIndex();
  }
});

/* End File */
