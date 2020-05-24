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
})

/* End File */
