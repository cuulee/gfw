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
      'submit form' : 'onFormSubmit',
      'change #contact-topic' : 'onTopicChange',
    },

    model: new (Backbone.Model.extend({
    	defaults : {
    		topics: {
					'report-a-bug-or-error-on-gfw': {
						name: 'Report a bug or error on GFW',
						placeholder: 'Explain the bug or error and tell us where on the website you encountered it. What browser (e.g., Chrome version 50.0.2661.94 m) and operating system (e.g., Windows 8.1) do you use?'
					},
					'provide-feedback': {
						name: 'Provide feedback',
						placeholder: 'Tell us about your experience with GFW! Examples: How can we improve GFW? Why did you visit GFW? How do you use GFW? If and how is the information provided by GFW useful for your work? Are there any additional features and/or data that would be useful?  Was anything confusing or difficult to use?  Etc...'
					},
					'media-request': {
						name: 'Media request',
						placeholder: 'How can we help you?'
					},
					'data-related-inquiry': {
						name: 'Data related inquiry',
						placeholder: 'How can we help you?'
					},
					'gfw-commodities-inquiry': {
						name: 'GFW Commodities inquiry',
						placeholder: 'How can we help you?'
					},
					'gfw-fires-inquiry': {
						name: 'GFW Fires inquiry',
						placeholder: 'How can we help you?'
					},
					'gfw-climate-inquiry': {
						name: 'GFW Climate inquiry',
						placeholder: 'How can we help you?'
					},
					'general-inquiry': {
						name: 'General inquiry',
						placeholder: 'How can we help you?'
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
      this.validateForm();
    },

    cache: function() {
    	this.$contactForm = this.$el.find('#contact-form');
    	this.$contactMessage = this.$el.find('#contact-message');
    	this.$contactTopic = this.$el.find('#contact-topic');
    	this.$select = this.$el.find('.chosen-select');
    },

    listeners: function() {
    	this.model.on('change:topic', this.topicChanged.bind(this));
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

    validateForm: function() {
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
			  	return false;
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

    /**
     * UI EVENTS
     */
    onFormSubmit: function(e){
      e && e.preventDefault();
      console.log('form submit');
    },

    onTopicChange: function(e) {
      e && e.preventDefault();
      var topic = $(e.currentTarget).val();
      this.model.set('topic', topic)
    },

  });

  return ContactUsView;

});

