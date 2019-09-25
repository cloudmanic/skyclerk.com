;(function(window, document, jQuery, app) {

	window.app = app;

	app.init = function() {
		this.youtubeModal();
		this.contactUs();
		this.supportSearch();
		this.newsletterSubscribe();
	};

	/**
	 * Youtube Modal
	 *
	 */
	app.youtubeModal = function() {
		// Not on the page.
		if($(".youtube").length == 0) {
			return;
		}

		// Setup colorbox
		$(".youtube").colorbox({
			iframe: true,
			innerWidth: 640,
			innerHeight: 390
		});
	},

	/**
	 * Contact us page
	 *
	 */
	app.contactUs = function() {
		$('.contact-us .submit').on('submit', function(event) {
			event.preventDefault();

			var $this = $(this);
			var error = false;
			var email = $this.find("#email").val();
			var subject = $this.find("#subject").val();
			var body = $this.find("#body").val();

			if(email.length <= 0) {
				error = true;
				$this.find("#email").parent().parent().addClass('with-error');
			} else {
				$this.find("#email").parent().parent().removeClass('with-error');
			}

			if(subject.length <= 0) {
				error = true;
				$this.find("#subject").parent().parent().addClass('with-error');
			} else {
				$this.find("#subject").parent().parent().removeClass('with-error');
			}

			if(body.length <= 0) {
				error = true;
				$this.find("#body").parent().parent().addClass('with-error');
			} else {
				$this.find("#body").parent().parent().removeClass('with-error');
			}

			// If we have error do not continue.
			if(error) {
				return false;
			}

			// Change button.
			$('#submit-btn').text("Sending...");

			// Send it to the server
	    $.post({
	        url: '/',
	        dataType: 'json',
	        data: $this.serialize(),
	        success: function(response) {
	          if (response.success) {
							$this.hide();
							$('.form__head').hide();
							$('.contact-us .success').fadeIn();
	          } else {
							$('#submit-btn').text("Submit Request");
							// response.error will be an object containing any validation errors that occurred, indexed by field name
							// e.g. response.error.fromName => ['From Name is required']
							alert('An error occurred. Please try again.');
	          }
	        }
	    });
		});
	};

	/**
	 * Newsletter subscribe
	 *
	 */
	app.newsletterSubscribe = function() {

		$('.newsletter-form').on('submit', function(event) {
  		event.preventDefault();

  		$this = $(this);
  		var btn = $this.find('[name="subscribe"]');
      var btn_val = btn.val();
      var success = $this.find('.subscribe--inline');
			var successMsg = $('.newsletterSuccessMsg');
      var email = $this.find('[name="email"]').val();

      btn.val('Saving...');

      $.ajax({
        type: 'POST',
        url: '/actions/cloudmanic-craft-sendy/subscribe',
        data: JSON.stringify({ email: email }),
        contentType: "application/json",
        dataType: 'json',
        success: function(json) {
          btn.val(btn_val);
					$this.hide();
					success.addClass("subscribe--success");
					successMsg.show();

					// Log events.
					_paq.push(['trackGoal', 1]);
					_paq.push(['trackEvent', 'Newsletter', 'Subscribe']);

					if ("ga" in window) {
            tracker = ga.getAll()[0];
            if (tracker) {
              tracker.send("event", "Newsletter", "Subscribe");
            }
          }
        }
      });

		});

	};

	/**
	 * Setup support search
	 *
	 */
	app.supportSearch = function() {

		// Not on the page.
		if($(".typeahead-support").length == 0) {
			return;
		}

		// Setup the typeahead
		$.typeahead({
				input: ".typeahead-support",
		    order: "desc",
				minLength: 1,
		    maxItem: 20,
				href: "{{url}}",
				emptyTemplate: "No results found for <b>{{query}}</b>",

				source: {
					support: {
						display: "title",
						ajax: {
							url: "/support/json"
						}
	        }
		    }
		});

	};

})(window, document, window.jQuery, window.app || {});

;(function(window, document, jQuery, app) {

	/**
	 * Cache $(document) and $(window);
	 *
	 */
	var $win = $(window);
	var $doc = $(document);


	/**
	 * Expose $win and $doc in app
	 *
	 */
	app.$win = $win;
	app.$doc = $doc;

	/**
	 * Fire up app
	 *
	 */
	$doc.ready(function() {
		app.init();
	});

})(window, document, window.jQuery, window.app);
