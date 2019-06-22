;(function(window, document, jQuery, app) {

	window.app = app;

	app.init = function() {
		this.contactUs();
		this.newsletterSubscribe();
	};


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
				$this.find("#email").parent().addClass('has-error');
				$this.find("#email").parent().find("p").html("Email address is required.");
			} else {
				$this.find("#email").parent().removeClass('has-error');
				$this.find("#email").parent().find("p").html("");
			}

			if(subject.length <= 0) {
				error = true;
				$this.find("#subject").parent().addClass('has-error');
				$this.find("#subject").parent().find("p").html("Subject is required.");
			} else {
				$this.find("#subject").parent().removeClass('has-error');
				$this.find("#subject").parent().find("p").html("");
			}

			if(body.length <= 0) {
				error = true;
				$this.find("#body").parent().addClass('has-error');
				$this.find("#body").parent().find("p").html("Body is required.");
			} else {
				$this.find("#body").parent().removeClass('has-error');
				$this.find("#body").parent().find("p").html("");
			}

			// If we have error do not continue.
			if(error) {
				return false;
			}

			// Send it to the server
	    $.post({
	        url: '/',
	        dataType: 'json',
	        data: $this.serialize(),
	        success: function(response) {
	          if (response.success) {
							$this.hide();
							$('.help-page .section__title').hide();
							$('.contact-us .success').fadeIn();
	          } else {
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

          // // Log events.
          // if(json.status && (! site.devMode))
          // {
          // 	clicky.goal('5193');
          // 	_paq.push(['trackGoal', 1]);
          // 	_paq.push(['trackEvent', 'Newsletter', 'Subscribe', entry_type]);
          // 	ga('send', 'event', 'Newsletter', 'Subscribe', entry_type);
          // }
        }
      });

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
