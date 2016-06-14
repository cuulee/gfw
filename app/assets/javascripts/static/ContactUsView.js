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
						emailTo: 'gfw@wri.org'
					},
					'provide-feedback': {
						name: 'Provide feedback',
						placeholder: 'Tell us about your experience with GFW! Examples: How can we improve GFW? Why did you visit GFW? How do you use GFW? If and how is the information provided by GFW useful for your work? Are there any additional features and/or data that would be useful?  Was anything confusing or difficult to use?  Etc...',
						emailTo: 'gfw@wri.org'					
					},
					'media-request': {
						name: 'Media request',
						placeholder: 'How can we help you?',
						emailTo: 'gfwmedia@wri.org'						
					},
					'data-related-inquiry': {
						name: 'Data related inquiry',
						placeholder: 'How can we help you?',
						emailTo: 'gfwdata@wri.org'						
					},
					'gfw-commodities-inquiry': {
						name: 'GFW Commodities inquiry',
						placeholder: 'How can we help you?',
						emailTo: 'gfwcommodities@wri.org'						
					},
					'gfw-fires-inquiry': {
						name: 'GFW Fires inquiry',
						placeholder: 'How can we help you?',
						emailTo: 'gfwfires@wri.org'						
					},
					'gfw-climate-inquiry': {
						name: 'GFW Climate inquiry',
						placeholder: 'How can we help you?',
						emailTo: 'gfwclimate@wri.org'						
					},
					'general-inquiry': {
						name: 'General inquiry',
						placeholder: 'How can we help you?',
						emailTo: 'gfw@wri.org'						
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
      this.validateNewsletterForm();
    },

    cache: function() {
    	this.$select = this.$el.find('.chosen-select');
    	// Steps
    	this.$steps = this.$el.find('.step');

    	// Contact
    	this.$contactForm = this.$el.find('#contact-form');
    	this.$contactTopic = this.$el.find('#contact-topic');
    	this.$contactMessage = this.$el.find('#contact-message');
    	this.$contactEmailTo = this.$el.find('#contact-emailto');

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
			this.$contactForm.validate({
				ignore: ".ignore",
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
					console.log(formData);

					// Send via ajax the data needed...where?
					if (true) {
						this.model.set('step', 1)
					} else {

					}
			  	return false;
			  }.bind(this)
			});
    },

    validateNewsletterForm: function() {
			this.$newsletterForm.validate({
				ignore: ".ignore",
				rules: {
					// no quoting necessary
					'newsletter-email': {
						required: true,
						email: true
					},
					'newsletter-name': {
						required: true,
					},
					'newsletter-city': {
						required: true,
						minlength: 20,
					},
					'newsletter-country': {
						required: true,
						minlength: 20,
					},

				},

				messages: {
			    'newsletter-email': {
			      required: "This field is required",
			      email: "Your email address must be in the format of name@domain.com"
			    },
					'newsletter-name': {
			      required: "This field is required",
					},
			    'newsletter-city': {
			      required: "This field is required",
			    },		    
			    'newsletter-country': {
			      required: "This field is required",
			    }			    
			  },

			  submitHandler: function(form) {
					var formData = _.object($(form).serializeArray().map(function(v) {
						return [v.name, v.value];
					}));
					console.log(formData);

					// Send via ajax the data needed...where?
					if (true) {
						this.model.set('step', 2);
					} else {

					}
			  	return false;
			  }.bind(this)
			});
    },

    /**
     * LISTENERS EVENTS
     */    
    topicChanged: function() {
    	var topic = this.model.get('topic');
    	var placeholder = this.model.get('topics')[topic]['placeholder'];
    	var emailTo = this.model.get('topics')[topic]['emailTo'];

    	this.$contactMessage.attr('placeholder', placeholder);
    	this.$contactEmailTo.val(emailTo);
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
      this.model.set('topic', topic);
    },

  });

  return ContactUsView;

});

