!function(e,t,n,s){(e.app=s).init=function(){this.youtubeModal(),this.contactUs(),this.supportSearch(),this.newsletterSubscribe()},s.youtubeModal=function(){0!=$(".youtube").length&&$(".youtube").colorbox({iframe:!0,innerWidth:640,innerHeight:390})},s.contactUs=function(){$(".contact-us .submit").on("submit",function(e){e.preventDefault();var t=$(this),n=!1,s=t.find("#email").val(),i=t.find("#subject").val(),a=t.find("#body").val();if(s.length<=0?(n=!0,t.find("#email").parent().parent().addClass("with-error")):t.find("#email").parent().parent().removeClass("with-error"),i.length<=0?(n=!0,t.find("#subject").parent().parent().addClass("with-error")):t.find("#subject").parent().parent().removeClass("with-error"),a.length<=0?(n=!0,t.find("#body").parent().parent().addClass("with-error")):t.find("#body").parent().parent().removeClass("with-error"),n)return!1;$("#submit-btn").text("Sending..."),$.post({url:"/",dataType:"json",data:t.serialize(),success:function(e){e.success?(t.hide(),$(".form__head").hide(),$(".contact-us .success").fadeIn()):($("#submit-btn").text("Submit Request"),alert("An error occurred. Please try again."))}})})},s.newsletterSubscribe=function(){$(".newsletter-form").on("submit",function(e){e.preventDefault(),$this=$(this);var t=$this.find('[name="subscribe"]'),n=t.val(),s=$this.find(".subscribe--inline"),i=$(".newsletterSuccessMsg"),a=$this.find('[name="email"]').val();t.val("Saving..."),$.ajax({type:"POST",url:"/actions/cloudmanic-craft-sendy/subscribe",data:JSON.stringify({email:a}),contentType:"application/json",dataType:"json",success:function(e){t.val(n),$this.hide(),s.addClass("subscribe--success"),i.show(),_paq.push(["trackGoal",1]),_paq.push(["trackEvent","Newsletter","Subscribe"]),ga("send","event","Newsletter","Subscribe")}})})},s.supportSearch=function(){0!=$(".typeahead-support").length&&$.typeahead({input:".typeahead-support",order:"desc",minLength:1,maxItem:20,href:"{{url}}",emptyTemplate:"No results found for <b>{{query}}</b>",source:{support:{display:"title",ajax:{url:"/support/json"}}}})}}(window,document,window.jQuery,window.app||{}),function(e,t,n,s){var i=$(e),a=$(t);s.$win=i,(s.$doc=a).ready(function(){s.init()})}(window,document,window.jQuery,window.app);