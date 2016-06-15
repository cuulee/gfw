/**
 * The ContactUsView view.
 */
define([
  'jquery',
  'backbone',
  'mps',
  'chosen',
  'jquery_validation'
], function($,Backbone,mps,chosen,jquery_validation) {

  'use strict';

  var ContactUsView = Backbone.View.extend({

    el: '#contactUsView',

    events: {
      'change #contact-topic' : 'onTopicChange',
    },

    model: new (Backbone.Model.extend({
    	defaults : {
    		step: 0,
    		topics: {
					'report-a-bug-or-error-on-gfw': {
						name: 'Report a bug or error on GFW',
						placeholder: 'Explain the bug or error and tell us where on the website you encountered it. What browser (e.g., Chrome version 50.0.2661.94 m) and operating system (e.g., Windows 8.1) do you use?',
					},
					'provide-feedback': {
						name: 'Provide feedback',
						placeholder: 'Tell us about your experience with GFW! Examples: How can we improve GFW? Why did you visit GFW? How do you use GFW? If and how is the information provided by GFW useful for your work? Are there any additional features and/or data that would be useful?  Was anything confusing or difficult to use?  Etc...',
					},
					'media-request': {
						name: 'Media request',
						placeholder: 'How can we help you?',
					},
					'data-related-inquiry': {
						name: 'Data related inquiry',
						placeholder: 'How can we help you?',
					},
					'gfw-commodities-inquiry': {
						name: 'GFW Commodities inquiry',
						placeholder: 'How can we help you?',
					},
					'gfw-fires-inquiry': {
						name: 'GFW Fires inquiry',
						placeholder: 'How can we help you?',
					},
					'gfw-climate-inquiry': {
						name: 'GFW Climate inquiry',
						placeholder: 'How can we help you?',
					},
					'general-inquiry': {
						name: 'General inquiry',
						placeholder: 'How can we help you?',
					},    		
    		}
    	}
    })),

    initialize: function() {
      if (!this.$el.length) {
        return
      }
      this.cache();
      this.listeners();
      this.renderChosen();
      this.validateContactForm();
    },

    cache: function() {
    	this.$select = this.$el.find('.chosen-select');
    	// Steps
    	this.$steps = this.$el.find('.step');

    	// Contact
    	this.$contactForm = this.$el.find('#contact-form');
    	this.$contactTopic = this.$el.find('#contact-topic');
    	this.$contactMessage = this.$el.find('#contact-message');

    	// Newsletter
			this.$newsletterForm = this.$el.find('#newsletter-form');    	
    },

    listeners: function() {
    	this.model.on('change:topic', this.topicChanged.bind(this));
    	this.model.on('change:step', this.stepChanged.bind(this));
    },

    // Plugins & helpers    
    renderChosen: function() {
      this.$select.chosen({
        width: '100%',
        disable_search: true,
        allow_single_deselect: true,
        inherit_select_classes: true,
        no_results_text: "Oops, nothing found!"
      });
    },

    validateContactForm: function() {
			this.validator = this.$contactForm.validate({
				ignore: ".ignore",
				errorClass: '-error',
				errorElement: 'p',
				rules: {
					// no quoting necessary
					'contact-email': {
						required: true,
						email: true
					},
					'contact-topic': {
						required: true,
					},
					'contact-message': {
						required: true,
						minlength: 20,
					},
				},

				messages: {
			    'contact-email': {
			      required: "We need your email address to contact you",
			      email: "Your email address must be in the format of name@domain.com"
			    },
					'contact-topic': {
						select: 'You must select a topic'
					},
			    'contact-message': {
			      required: "This field is required",
			      minlength: jQuery.validator.format("At least {0} characters required!")
			    }			    
			  },

			  submitHandler: function(form) {
					var formData = _.object($(form).serializeArray().map(function(v) {
						return [v.name, v.value];
					}));

					$.ajax({
						url: window.gfw.config.GFW_API_HOST + '/emails',
						type: 'POST',
						data: JSON.stringify(formData),
						contentType: 'application/json; charset=utf-8',
						dataType: 'json',

						success: function(data) {
							mps.publish('Notification/open', ['notification-contact-us-success'])
							this.model.set('step', 1)
						}.bind(this),

						error: function() {
							mps.publish('Notification/open', ['notification-contact-us-error'])
						}.bind(this),
					})

					// If you want to test it locally without sending a mail to WRI
					// if (true) {
					// 	mps.publish('Notification/open', ['notification-contact-us-success'])
					// 	this.model.set('step', 1);
					// } else {
					// 	mps.publish('Notification/open', ['notification-contact-us-error'])
					// }
			  	return false;
			  }.bind(this),
			
				errorPlacement: function(error, element) {
					var $field = $(element).parents('.field');
					$field.append(error);
				},

				highlight: function(element,error) {
					var $field = $(element).parents('.field');
					$field.find('label').addClass(error);
				},

				unhighlight: function(element,error) {
					var $field = $(element).parents('.field');
					$field.find('label').removeClass(error);
				}

			});
    },

    /**
     * LISTENERS EVENTS
     */    
    topicChanged: function() {
    	var topic = this.model.get('topic');
    	var placeholder = this.model.get('topics')[topic]['placeholder'];
    	this.$contactMessage.attr('placeholder', placeholder);
    },

    stepChanged: function() {
    	var step = this.model.get('step');
    	var $currentStep = this.$steps.filter(function(){
				return $(this).data("step") == step;
			});

    	this.$steps.toggleClass('-active', false);
    	$currentStep.toggleClass('-active', true);
    },

    onTopicChange: function(e) {
      e && e.preventDefault();
      var topic = $(e.currentTarget).val();
      this.validator.element('#'+$(e.currentTarget).attr('id'));
      this.model.set('topic', topic);
    },

  });

  return ContactUsView;

});

