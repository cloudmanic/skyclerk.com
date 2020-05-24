// Main Vue app
// In Hugo we do this {{"{{"}} message {{"}}"}}
var app = new Vue({
  el: '#app',

	data: {
		showMobileMenu: false
	},

	methods: {
		// Mobile menu open
    mobileMenuToggle: function () {
			this.showMobileMenu = !this.showMobileMenu;
    }
  }
});

// Setup search stuff.
if(document.querySelector('#searchbox'))
{
  const search = instantsearch({
    indexName: 'skyclerk.com',
    searchClient: algoliasearch('YWD5XDVOQH', 'a08ccd56c1471e87e02a181681236597'),

    // Called when a search happens
    searchFunction(helper) {
      // Don't search on empty
      if(helper.state.query === '')
      {
          document.querySelector('#hits').innerHTML = '';
          return;
        }

        // Send the search.
        helper.search();
      }
    });

    // Build search widget.
    search.addWidgets([
      instantsearch.widgets.searchBox({
        container: '#searchbox',
        autofocus: true,
        showSubmit: false,
        showReset: false,
        placeholder: "Enter a question, keyword, or topic",
        cssClasses: {
          input: [ 'form-input', 'h-15', 'block', 'w-full', 'pl-10', 'sm:text-lg', 'sm:leading-5' ]
        }
      }),


      instantsearch.widgets.hits({
        container: '#hits',
        templates: {
          item: `
          <a href="{{ relpermalink }}">
          {{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}
          </a>
          `,
        },
      })
  ]);

  // Start search
  search.start();
}

/* End File */
