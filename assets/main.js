

(function() {

	var	on = addEventListener,
		$ = function(q) { return document.querySelector(q) },
		$$ = function(q) { return document.querySelectorAll(q) },
		$body = document.body,
		$inner = $('.inner'),
		client = (function() {
	
			var o = {
					browser: 'other',
					browserVersion: 0,
					os: 'other',
					osVersion: 0,
					mobile: false,
					canUse: null,
					flags: {
						lsdUnits: false,
					},
				},
				ua = navigator.userAgent,
				a, i;
	
			// browser, browserVersion.
				a = [
					['firefox',		/Firefox\/([0-9\.]+)/],
					['edge',		/Edge\/([0-9\.]+)/],
					['safari',		/Version\/([0-9\.]+).+Safari/],
					['chrome',		/Chrome\/([0-9\.]+)/],
					['chrome',		/CriOS\/([0-9\.]+)/],
					['ie',			/Trident\/.+rv:([0-9]+)/]
				];
	
				for (i=0; i < a.length; i++) {
	
					if (ua.match(a[i][1])) {
	
						o.browser = a[i][0];
						o.browserVersion = parseFloat(RegExp.$1);
	
						break;
	
					}
	
				}
	
			// os, osVersion.
				a = [
					['ios',			/([0-9_]+) like Mac OS X/,			function(v) { return v.replace('_', '.').replace('_', ''); }],
					['ios',			/CPU like Mac OS X/,				function(v) { return 0 }],
					['ios',			/iPad; CPU/,						function(v) { return 0 }],
					['android',		/Android ([0-9\.]+)/,				null],
					['mac',			/Macintosh.+Mac OS X ([0-9_]+)/,	function(v) { return v.replace('_', '.').replace('_', ''); }],
					['windows',		/Windows NT ([0-9\.]+)/,			null],
					['undefined',	/Undefined/,						null],
				];
	
				for (i=0; i < a.length; i++) {
	
					if (ua.match(a[i][1])) {
	
						o.os = a[i][0];
						o.osVersion = parseFloat( a[i][2] ? (a[i][2])(RegExp.$1) : RegExp.$1 );
	
						break;
	
					}
	
				}
	
				// Hack: Detect iPads running iPadOS.
					if (o.os == 'mac'
					&&	('ontouchstart' in window)
					&&	(
	
						// 12.9"
							(screen.width == 1024 && screen.height == 1366)
						// 10.2"
							||	(screen.width == 834 && screen.height == 1112)
						// 9.7"
							||	(screen.width == 810 && screen.height == 1080)
						// Legacy
							||	(screen.width == 768 && screen.height == 1024)
	
					))
						o.os = 'ios';
	
			// mobile.
				o.mobile = (o.os == 'android' || o.os == 'ios');
	
			// canUse.
				var _canUse = document.createElement('div');
	
				o.canUse = function(property, value) {
	
					var style;
	
					// Get style.
						style = _canUse.style;
	
					// Property doesn't exist? Can't use it.
						if (!(property in style))
							return false;
	
					// Value provided?
						if (typeof value !== 'undefined') {
	
							// Assign value.
								style[property] = value;
	
							// Value is empty? Can't use it.
								if (style[property] == '')
									return false;
	
						}
	
					return true;
	
				};
	
			// flags.
				o.flags.lsdUnits = o.canUse('width', '100dvw');
	
			return o;
	
		}()),
		trigger = function(t) {
			dispatchEvent(new Event(t));
		},
		cssRules = function(selectorText) {
	
			var ss = document.styleSheets,
				a = [],
				f = function(s) {
	
					var r = s.cssRules,
						i;
	
					for (i=0; i < r.length; i++) {
	
						if (r[i] instanceof CSSMediaRule && matchMedia(r[i].conditionText).matches)
							(f)(r[i]);
						else if (r[i] instanceof CSSStyleRule && r[i].selectorText == selectorText)
							a.push(r[i]);
	
					}
	
				},
				x, i;
	
			for (i=0; i < ss.length; i++)
				f(ss[i]);
	
			return a;
	
		},
		thisHash = function() {
	
			var h = location.hash ? location.hash.substring(1) : null,
				a;
	
			// Null? Bail.
				if (!h)
					return null;
	
			// Query string? Move before hash.
				if (h.match(/\?/)) {
	
					// Split from hash.
						a = h.split('?');
						h = a[0];
	
					// Update hash.
						history.replaceState(undefined, undefined, '#' + h);
	
					// Update search.
						window.location.search = a[1];
	
				}
	
			// Prefix with "x" if not a letter.
				if (h.length > 0
				&&	!h.match(/^[a-zA-Z]/))
					h = 'x' + h;
	
			// Convert to lowercase.
				if (typeof h == 'string')
					h = h.toLowerCase();
	
			return h;
	
		},
		scrollToElement = function(e, style, duration) {
	
			var y, cy, dy,
				start, easing, offset, f;
	
			// Element.
	
				// No element? Assume top of page.
					if (!e)
						y = 0;
	
				// Otherwise ...
					else {
	
						offset = (e.dataset.scrollOffset ? parseInt(e.dataset.scrollOffset) : 0) * parseFloat(getComputedStyle(document.documentElement).fontSize);
	
						switch (e.dataset.scrollBehavior ? e.dataset.scrollBehavior : 'default') {
	
							case 'default':
							default:
	
								y = e.offsetTop + offset;
	
								break;
	
							case 'center':
	
								if (e.offsetHeight < window.innerHeight)
									y = e.offsetTop - ((window.innerHeight - e.offsetHeight) / 2) + offset;
								else
									y = e.offsetTop - offset;
	
								break;
	
							case 'previous':
	
								if (e.previousElementSibling)
									y = e.previousElementSibling.offsetTop + e.previousElementSibling.offsetHeight + offset;
								else
									y = e.offsetTop + offset;
	
								break;
	
						}
	
					}
	
			// Style.
				if (!style)
					style = 'smooth';
	
			// Duration.
				if (!duration)
					duration = 750;
	
			// Instant? Just scroll.
				if (style == 'instant') {
	
					window.scrollTo(0, y);
					return;
	
				}
	
			// Get start, current Y.
				start = Date.now();
				cy = window.scrollY;
				dy = y - cy;
	
			// Set easing.
				switch (style) {
	
					case 'linear':
						easing = function (t) { return t };
						break;
	
					case 'smooth':
						easing = function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 };
						break;
	
				}
	
			// Scroll.
				f = function() {
	
					var t = Date.now() - start;
	
					// Hit duration? Scroll to y and finish.
						if (t >= duration)
							window.scroll(0, y);
	
					// Otherwise ...
						else {
	
							// Scroll.
								window.scroll(0, cy + (dy * easing(t / duration)));
	
							// Repeat.
								requestAnimationFrame(f);
	
						}
	
				};
	
				f();
	
		},
		scrollToTop = function() {
	
			// Scroll to top.
				scrollToElement(null);
	
		},
		loadElements = function(parent) {
	
			var a, e, x, i;
	
			// IFRAMEs.
	
				// Get list of unloaded IFRAMEs.
					a = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
	
				// Step through list.
					for (i=0; i < a.length; i++) {
	
						// Load.
							a[i].src = a[i].dataset.src;
	
						// Mark as loaded.
							a[i].dataset.src = "";
	
					}
	
			// Video.
	
				// Get list of videos (autoplay).
					a = parent.querySelectorAll('video[autoplay]');
	
				// Step through list.
					for (i=0; i < a.length; i++) {
	
						// Play if paused.
							if (a[i].paused)
								a[i].play();
	
					}
	
			// Autofocus.
	
				// Get first element with data-autofocus attribute.
					e = parent.querySelector('[data-autofocus="1"]');
	
				// Determine type.
					x = e ? e.tagName : null;
	
					switch (x) {
	
						case 'FORM':
	
							// Get first input.
								e = e.querySelector('.field input, .field select, .field textarea');
	
							// Found? Focus.
								if (e)
									e.focus();
	
							break;
	
						default:
							break;
	
					}
	
		},
		unloadElements = function(parent) {
	
			var a, e, x, i;
	
			// IFRAMEs.
	
				// Get list of loaded IFRAMEs.
					a = parent.querySelectorAll('iframe[data-src=""]');
	
				// Step through list.
					for (i=0; i < a.length; i++) {
	
						// Don't unload? Skip.
							if (a[i].dataset.srcUnload === '0')
								continue;
	
						// Mark as unloaded.
							a[i].dataset.src = a[i].src;
	
						// Unload.
							a[i].src = '';
	
					}
	
			// Video.
	
				// Get list of videos.
					a = parent.querySelectorAll('video');
	
				// Step through list.
					for (i=0; i < a.length; i++) {
	
						// Pause if playing.
							if (!a[i].paused)
								a[i].pause();
	
					}
	
			// Autofocus.
	
				// Get focused element.
					e = $(':focus');
	
				// Found? Blur.
					if (e)
						e.blur();
	
	
		};
	
		// Expose scrollToElement.
			window._scrollToTop = scrollToTop;
	
	// Sections.
		(function() {
	
			var initialSection, initialScrollPoint, initialId,
				header, footer, name, hideHeader, hideFooter, disableAutoScroll,
				h, e, ee, k,
				locked = false,
				doNextSection = function() {
	
					var section;
	
					section = $('#main > .inner > section.active').nextElementSibling;
	
					if (!section || section.tagName != 'SECTION')
						return;
	
					location.href = '#' + section.id.replace(/-section$/, '');
	
				},
				doPreviousSection = function() {
	
					var section;
	
					section = $('#main > .inner > section.active').previousElementSibling;
	
					if (!section || section.tagName != 'SECTION')
						return;
	
					location.href = '#' + (section.matches(':first-child') ? '' : section.id.replace(/-section$/, ''));
	
				},
				doFirstSection = function() {
	
					var section;
	
					section = $('#main > .inner > section:first-of-type');
	
					if (!section || section.tagName != 'SECTION')
						return;
	
					location.href = '#' + section.id.replace(/-section$/, '');
	
				},
				doLastSection = function() {
	
					var section;
	
					section = $('#main > .inner > section:last-of-type');
	
					if (!section || section.tagName != 'SECTION')
						return;
	
					location.href = '#' + section.id.replace(/-section$/, '');
	
				},
				doEvent = function(id, type) {
	
					var name = id.split(/-[a-z]+$/)[0], i;
	
					if (name in sections
					&&	'events' in sections[name]
					&&	type in sections[name].events)
						for (i in sections[name].events[type])
							(sections[name].events[type][i])();
	
				},
				sections = {
					'publications': {
						hideFooter: true,
						events: {
							onopen: [
								function() { 
									gtag('config', 'UA-44210164-19', { 'page_path': '/#publications' });
								},
							],
						},
					},
					'affiliations': {
						hideFooter: true,
						events: {
							onopen: [
								function() { 
									gtag('config', 'UA-44210164-19', { 'page_path': '/#affiliations' });
								},
							],
						},
					},
					'vq': {
						hideFooter: true,
						events: {
							onopen: [
								function() { 
									gtag('config', 'UA-44210164-19', { 'page_path': '/#vq' });
								},
							],
						},
					},
					'rffznaux00': {
						hideFooter: true,
						events: {
							onopen: [
								function() { 
									gtag('config', 'UA-44210164-19', { 'page_path': '/#rffznaux00' });
								},
							],
						},
					},
					'i8veybyofd': {
						hideFooter: true,
						events: {
							onopen: [
								function() { 
									gtag('config', 'UA-44210164-19', { 'page_path': '/#i8veybyofd' });
								},
							],
						},
					},
					'nia63gfu8a': {
						hideFooter: true,
						events: {
							onopen: [
								function() { 
									gtag('config', 'UA-44210164-19', { 'page_path': '/#nia63gfu8a' });
								},
							],
						},
					},
					'nfgpbvfabj': {
						hideHeader: true,
						hideFooter: true,
						events: {
							onopen: [
								function() { 
									gtag('config', 'UA-44210164-19', { 'page_path': '/#nfgpbvfabj' });
								},
							],
						},
					},
					'sv80f7y6m2': {
						hideHeader: true,
						hideFooter: true,
						events: {
							onopen: [
								function() { 
									gtag('config', 'UA-44210164-19', { 'page_path': '/#sv80f7y6m2' });
								},
							],
						},
					},
					'home': {
						events: {
							onopen: [
								function() { 
									gtag('config', 'UA-44210164-19', { 'page_path': '/' });
								},
							],
						},
					},
				};
	
			// Expose doNextSection, doPreviousSection, doFirstSection, doLastSection.
				window._next = doNextSection;
				window._previous = doPreviousSection;
				window._first = doFirstSection;
				window._last = doLastSection;
	
			// Override exposed scrollToTop.
				window._scrollToTop = function() {
	
					var section, id;
	
					// Scroll to top.
						scrollToElement(null);
	
					// Section active?
						if (!!(section = $('section.active'))) {
	
							// Get name.
								id = section.id.replace(/-section$/, '');
	
								// Index section? Clear.
									if (id == 'home')
										id = '';
	
							// Reset hash to section name (via new state).
								history.pushState(null, null, '#' + id);
	
						}
	
				};
	
			// Initialize.
	
				// Set scroll restoration to manual.
					if ('scrollRestoration' in history)
						history.scrollRestoration = 'manual';
	
				// Header, footer.
					header = $('#header');
					footer = $('#footer');
	
				// Show initial section.
	
					// Determine target.
						h = thisHash();
	
						// Contains invalid characters? Might be a third-party hashbang, so ignore it.
							if (h
							&&	!h.match(/^[a-zA-Z0-9\-]+$/))
								h = null;
	
						// Scroll point.
							if (e = $('[data-scroll-id="' + h + '"]')) {
	
								initialScrollPoint = e;
								initialSection = initialScrollPoint.parentElement;
								initialId = initialSection.id;
	
							}
	
						// Section.
							else if (e = $('#' + (h ? h : 'home') + '-section')) {
	
								initialScrollPoint = null;
								initialSection = e;
								initialId = initialSection.id;
	
							}
	
						// Missing initial section?
							if (!initialSection) {
	
								// Default to index.
									initialScrollPoint = null;
									initialSection = $('#' + 'home' + '-section');
									initialId = initialSection.id;
	
								// Clear index URL hash.
									history.replaceState(undefined, undefined, '#');
	
							}
	
					// Get options.
						name = (h ? h : 'home');
						hideHeader = name ? ((name in sections) && ('hideHeader' in sections[name]) && sections[name].hideHeader) : false;
						hideFooter = name ? ((name in sections) && ('hideFooter' in sections[name]) && sections[name].hideFooter) : false;
						disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll) : false;
	
					// Deactivate all sections (except initial).
	
						// Initially hide header and/or footer (if necessary).
	
							// Header.
								if (header && hideHeader) {
	
									header.classList.add('hidden');
									header.style.display = 'none';
	
								}
	
							// Footer.
								if (footer && hideFooter) {
	
									footer.classList.add('hidden');
									footer.style.display = 'none';
	
								}
	
						// Deactivate.
							ee = $$('#main > .inner > section:not([id="' + initialId + '"])');
	
							for (k = 0; k < ee.length; k++) {
	
								ee[k].className = 'inactive';
								ee[k].style.display = 'none';
	
							}
	
					// Activate initial section.
						initialSection.classList.add('active');
	
						// Event: On Open.
							doEvent(initialId, 'onopen');
	
					// Load elements.
						loadElements(initialSection);
	
						if (header)
							loadElements(header);
	
						if (footer)
							loadElements(footer);
	
					// Scroll to top (if not disabled for this section).
						if (!disableAutoScroll)
							scrollToElement(null, 'instant');
	
				// Load event.
					on('load', function() {
	
						// Scroll to initial scroll point (if applicable).
					 		if (initialScrollPoint)
								scrollToElement(initialScrollPoint, 'instant');
	
					});
	
			// Hashchange event.
				on('hashchange', function(event) {
	
					var section, scrollPoint, id, sectionHeight, currentSection, currentSectionHeight,
						name, hideHeader, hideFooter, disableAutoScroll,
						h, e, ee, k;
	
					// Lock.
						if (locked)
							return false;
	
					// Determine target.
						h = thisHash();
	
						// Contains invalid characters? Might be a third-party hashbang, so ignore it.
							if (h
							&&	!h.match(/^[a-zA-Z0-9\-]+$/))
								return false;
	
						// Scroll point.
							if (e = $('[data-scroll-id="' + h + '"]')) {
	
								scrollPoint = e;
								section = scrollPoint.parentElement;
								id = section.id;
	
							}
	
						// Section.
							else if (e = $('#' + (h ? h : 'home') + '-section')) {
	
								scrollPoint = null;
								section = e;
								id = section.id;
	
							}
	
						// Anything else.
							else {
	
								// Default to index.
									scrollPoint = null;
									section = $('#' + 'home' + '-section');
									id = section.id;
	
								// Clear index URL hash.
									history.replaceState(undefined, undefined, '#');
	
							}
	
					// No section? Bail.
						if (!section)
							return false;
	
					// Section already active?
						if (!section.classList.contains('inactive')) {
	
							// Get options.
								name = (section ? section.id.replace(/-section$/, '') : null);
								disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll) : false;
	
						 	// Scroll to scroll point (if applicable).
						 		if (scrollPoint)
									scrollToElement(scrollPoint);
	
							// Otherwise, just scroll to top (if not disabled for this section).
								else if (!disableAutoScroll)
									scrollToElement(null);
	
							// Bail.
								return false;
	
						}
	
					// Otherwise, activate it.
						else {
	
							// Lock.
								locked = true;
	
							// Clear index URL hash.
								if (location.hash == '#home')
									history.replaceState(null, null, '#');
	
							// Get options.
								name = (section ? section.id.replace(/-section$/, '') : null);
								hideHeader = name ? ((name in sections) && ('hideHeader' in sections[name]) && sections[name].hideHeader) : false;
								hideFooter = name ? ((name in sections) && ('hideFooter' in sections[name]) && sections[name].hideFooter) : false;
								disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll) : false;
	
							// Deactivate current section.
	
								// Hide header and/or footer (if necessary).
	
									// Header.
										if (header && hideHeader) {
	
											header.classList.add('hidden');
											header.style.display = 'none';
	
										}
	
									// Footer.
										if (footer && hideFooter) {
	
											footer.classList.add('hidden');
											footer.style.display = 'none';
	
										}
	
								// Deactivate.
									currentSection = $('#main > .inner > section:not(.inactive)');
									currentSection.classList.add('inactive');
									currentSection.classList.remove('active');
									currentSection.style.display = 'none';
	
								// Unload elements.
									unloadElements(currentSection);
	
								// Event: On Close.
									doEvent(currentSection.id, 'onclose');
	
							// Activate target section.
	
								// Show header and/or footer (if necessary).
	
									// Header.
										if (header && !hideHeader) {
	
											header.style.display = '';
											header.classList.remove('hidden');
	
										}
	
									// Footer.
										if (footer && !hideFooter) {
	
											footer.style.display = '';
											footer.classList.remove('hidden');
	
										}
	
								// Activate.
									section.classList.remove('inactive');
									section.classList.add('active');
									section.style.display = '';
	
								// Event: On Open.
									doEvent(section.id, 'onopen');
	
							// Trigger 'resize' event.
								trigger('resize');
	
							// Load elements.
								loadElements(section);
	
							// Scroll to scroll point (if applicable).
								if (scrollPoint)
									scrollToElement(scrollPoint, 'instant');
	
							// Otherwise, just scroll to top (if not disabled for this section).
								else if (!disableAutoScroll)
									scrollToElement(null, 'instant');
	
							// Unlock.
								locked = false;
	
						}
	
					return false;
	
				});
	
				// Hack: Allow hashchange to trigger on click even if the target's href matches the current hash.
					on('click', function(event) {
	
						var t = event.target,
							tagName = t.tagName.toUpperCase(),
							scrollPoint;
	
						// Find real target.
							switch (tagName) {
	
								case 'IMG':
								case 'SVG':
								case 'USE':
								case 'U':
								case 'STRONG':
								case 'EM':
								case 'CODE':
								case 'S':
								case 'MARK':
								case 'SPAN':
	
									// Find ancestor anchor tag.
										while ( !!(t = t.parentElement) )
											if (t.tagName == 'A')
												break;
	
									// Not found? Bail.
										if (!t)
											return;
	
									break;
	
								default:
									break;
	
							}
	
						// Target is an anchor *and* its href is a hash?
							if (t.tagName == 'A'
							&&	t.getAttribute('href').substr(0, 1) == '#') {
	
								// Hash matches an invisible scroll point?
									if (!!(scrollPoint = $('[data-scroll-id="' + t.hash.substr(1) + '"][data-scroll-invisible="1"]'))) {
	
										// Prevent default.
											event.preventDefault();
	
										// Scroll to element.
											scrollToElement(scrollPoint);
	
									}
	
								// Hash matches the current hash?
									else if (t.hash == window.location.hash) {
	
										// Prevent default.
											event.preventDefault();
	
										// Replace state with '#'.
											history.replaceState(undefined, undefined, '#');
	
										// Replace location with target hash.
											location.replace(t.hash);
	
									}
	
							}
	
					});
	
		})();
	
	// Browser hacks.
	
		// Init.
			var style, sheet, rule;
	
			// Create <style> element.
				style = document.createElement('style');
				style.appendChild(document.createTextNode(''));
				document.head.appendChild(style);
	
			// Get sheet.
				sheet = style.sheet;
	
		// Mobile.
			if (client.mobile) {
	
				// Prevent overscrolling on Safari/other mobile browsers.
				// 'vh' units don't factor in the heights of various browser UI elements so our page ends up being
				// a lot taller than it needs to be (resulting in overscroll and issues with vertical centering).
					(function() {
	
						// Lsd units available?
							if (client.flags.lsdUnits) {
	
								document.documentElement.style.setProperty('--viewport-height', '100dvh');
								document.documentElement.style.setProperty('--background-height', '100lvh');
	
							}
	
						// Otherwise, use innerHeight hack.
							else {
	
								var f = function() {
									document.documentElement.style.setProperty('--viewport-height', window.innerHeight + 'px');
									document.documentElement.style.setProperty('--background-height', (window.innerHeight + 250) + 'px');
								};
	
								on('load', f);
								on('resize', f);
								on('orientationchange', function() {
	
									// Update after brief delay.
										setTimeout(function() {
											(f)();
										}, 100);
	
								});
	
							}
	
					})();
	
			}
	
		// Android.
			if (client.os == 'android') {
	
				// Prevent background "jump" when address bar shrinks.
				// Specifically, this fix forces the background pseudoelement to a fixed height based on the physical
				// screen size instead of relying on "vh" (which is subject to change when the scrollbar shrinks/grows).
					(function() {
	
						// Insert and get rule.
							sheet.insertRule('body::after { }', 0);
							rule = sheet.cssRules[0];
	
						// Event.
							var f = function() {
								rule.style.cssText = 'height: ' + (Math.max(screen.width, screen.height)) + 'px';
							};
	
							on('load', f);
							on('orientationchange', f);
							on('touchmove', f);
	
					})();
	
				// Apply "is-touch" class to body.
					$body.classList.add('is-touch');
	
			}
	
		// iOS.
			else if (client.os == 'ios') {
	
				// <=11: Prevent white bar below background when address bar shrinks.
				// For some reason, simply forcing GPU acceleration on the background pseudoelement fixes this.
					if (client.osVersion <= 11)
						(function() {
	
							// Insert and get rule.
								sheet.insertRule('body::after { }', 0);
								rule = sheet.cssRules[0];
	
							// Set rule.
								rule.style.cssText = '-webkit-transform: scale(1.0)';
	
						})();
	
				// <=11: Prevent white bar below background when form inputs are focused.
				// Fixed-position elements seem to lose their fixed-ness when this happens, which is a problem
				// because our backgrounds fall into this category.
					if (client.osVersion <= 11)
						(function() {
	
							// Insert and get rule.
								sheet.insertRule('body.ios-focus-fix::before { }', 0);
								rule = sheet.cssRules[0];
	
							// Set rule.
								rule.style.cssText = 'height: calc(100% + 60px)';
	
							// Add event listeners.
								on('focus', function(event) {
									$body.classList.add('ios-focus-fix');
								}, true);
	
								on('blur', function(event) {
									$body.classList.remove('ios-focus-fix');
								}, true);
	
						})();
	
				// Apply "is-touch" class to body.
					$body.classList.add('is-touch');
	
			}
	
	// Scroll events.
		var scrollEvents = {
	
			/**
			 * Items.
			 * @var {array}
			 */
			items: [],
	
			/**
			 * Adds an event.
			 * @param {object} o Options.
			 */
			add: function(o) {
	
				this.items.push({
					element: o.element,
					triggerElement: (('triggerElement' in o && o.triggerElement) ? o.triggerElement : o.element),
					enter: ('enter' in o ? o.enter : null),
					leave: ('leave' in o ? o.leave : null),
					mode: ('mode' in o ? o.mode : 1),
					offset: ('offset' in o ? o.offset : 0),
					initialState: ('initialState' in o ? o.initialState : null),
					state: false,
				});
	
			},
	
			/**
			 * Handler.
			 */
			handler: function() {
	
				var	height, top, bottom, scrollPad;
	
				// Determine values.
					if (client.os == 'ios') {
	
						height = document.documentElement.clientHeight;
						top = document.body.scrollTop + window.scrollY;
						bottom = top + height;
						scrollPad = 125;
	
					}
					else {
	
						height = document.documentElement.clientHeight;
						top = document.documentElement.scrollTop;
						bottom = top + height;
						scrollPad = 0;
	
					}
	
				// Step through items.
					scrollEvents.items.forEach(function(item) {
	
						var bcr, elementTop, elementBottom, state, a, b;
	
						// No enter/leave handlers? Bail.
							if (!item.enter
							&&	!item.leave)
								return true;
	
						// No trigger element, or not visible? Bail.
							if (!item.triggerElement
							||	item.triggerElement.offsetParent === null)
								return true;
	
						// Get element position.
							bcr = item.triggerElement.getBoundingClientRect();
							elementTop = top + Math.floor(bcr.top);
							elementBottom = elementTop + bcr.height;
	
						// Determine state.
	
							// Initial state exists?
								if (item.initialState !== null) {
	
									// Use it for this check.
										state = item.initialState;
	
									// Clear it.
										item.initialState = null;
	
								}
	
							// Otherwise, determine state from mode/position.
								else {
	
									switch (item.mode) {
	
										// Element falls within viewport.
											case 1:
											default:
	
												// State.
													state = (bottom > (elementTop - item.offset) && top < (elementBottom + item.offset));
	
												break;
	
										// Viewport midpoint falls within element.
											case 2:
	
												// Midpoint.
													a = (top + (height * 0.5));
	
												// State.
													state = (a > (elementTop - item.offset) && a < (elementBottom + item.offset));
	
												break;
	
										// Viewport midsection falls within element.
											case 3:
	
												// Upper limit (25%-).
													a = top + (height * 0.25);
	
													if (a - (height * 0.375) <= 0)
														a = 0;
	
												// Lower limit (-75%).
													b = top + (height * 0.75);
	
													if (b + (height * 0.375) >= document.body.scrollHeight - scrollPad)
														b = document.body.scrollHeight + scrollPad;
	
												// State.
													state = (b > (elementTop - item.offset) && a < (elementBottom + item.offset));
	
												break;
	
									}
	
								}
	
						// State changed?
							if (state != item.state) {
	
								// Update state.
									item.state = state;
	
								// Call handler.
									if (item.state) {
	
										// Enter handler exists?
											if (item.enter) {
	
												// Call it.
													(item.enter).apply(item.element);
	
												// No leave handler? Unbind enter handler (so we don't check this element again).
													if (!item.leave)
														item.enter = null;
	
											}
	
									}
									else {
	
										// Leave handler exists?
											if (item.leave) {
	
												// Call it.
													(item.leave).apply(item.element);
	
												// No enter handler? Unbind leave handler (so we don't check this element again).
													if (!item.enter)
														item.leave = null;
	
											}
	
									}
	
							}
	
					});
	
			},
	
			/**
			 * Initializes scroll events.
			 */
			init: function() {
	
				// Bind handler to events.
					on('load', this.handler);
					on('resize', this.handler);
					on('scroll', this.handler);
	
				// Do initial handler call.
					(this.handler)();
	
			}
		};
	
		// Initialize.
			scrollEvents.init();
	
	// Deferred.
		(function() {
	
			var items = $$('.deferred'),
				loadHandler, enterHandler;
	
			// Handlers.
	
				/**
				 * "On Load" handler.
				 */
				loadHandler = function() {
	
					var i = this,
						p = this.parentElement;
	
					// Not "done" yet? Bail.
						if (i.dataset.src !== 'done')
							return;
	
					// Show image.
						if (Date.now() - i._startLoad < 375) {
	
							p.classList.remove('loading');
							p.style.backgroundImage = 'none';
							i.style.transition = '';
							i.style.opacity = 1;
	
						}
						else {
	
							p.classList.remove('loading');
							i.style.opacity = 1;
	
							setTimeout(function() {
								i.style.backgroundImage = 'none';
								i.style.transition = '';
							}, 375);
	
						}
	
				};
	
				/**
				 * "On Enter" handler.
				 */
				enterHandler = function() {
	
					var	i = this,
						p = this.parentElement,
						src;
	
					// Get src, mark as "done".
						src = i.dataset.src;
						i.dataset.src = 'done';
	
					// Mark parent as loading.
						p.classList.add('loading');
	
					// Swap placeholder for real image src.
						i._startLoad = Date.now();
						i.src = src;
	
				};
	
			// Initialize items.
				items.forEach(function(p) {
	
					var i = p.firstElementChild;
	
					// Set parent to placeholder.
						if (!p.classList.contains('enclosed')) {
	
							p.style.backgroundImage = 'url(' + i.src + ')';
							p.style.backgroundSize = '100% 100%';
							p.style.backgroundPosition = 'top left';
							p.style.backgroundRepeat = 'no-repeat';
	
						}
	
					// Hide image.
						i.style.opacity = 0;
						i.style.transition = 'opacity 0.375s ease-in-out';
	
					// Load event.
						i.addEventListener('load', loadHandler);
	
					// Add to scroll events.
						scrollEvents.add({
							element: i,
							enter: enterHandler,
							offset: 250
						});
	
				});
	
		})();
	
	// "On Visible" animation.
		var onvisible = {
	
			/**
			 * Effects.
			 * @var {object}
			 */
			effects: {
				'blur-in': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'filter ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.opacity = 0;
						this.style.filter = 'blur(' + (0.25 * intensity) + 'rem)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.filter = 'none';
					},
				},
				'zoom-in': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transform = 'scale(' + (1 - ((alt ? 0.25 : 0.05) * intensity)) + ')';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'zoom-out': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transform = 'scale(' + (1 + ((alt ? 0.25 : 0.05) * intensity)) + ')';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'slide-left': {
					transition: function (speed, delay) {
						return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function() {
						this.style.transform = 'translateX(100vw)';
					},
					play: function() {
						this.style.transform = 'none';
					},
				},
				'slide-right': {
					transition: function (speed, delay) {
						return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function() {
						this.style.transform = 'translateX(-100vw)';
					},
					play: function() {
						this.style.transform = 'none';
					},
				},
				'flip-forward': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transformOrigin = '50% 50%';
						this.style.transform = 'perspective(1000px) rotateX(' + ((alt ? 45 : 15) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'flip-backward': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transformOrigin = '50% 50%';
						this.style.transform = 'perspective(1000px) rotateX(' + ((alt ? -45 : -15) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'flip-left': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transformOrigin = '50% 50%';
						this.style.transform = 'perspective(1000px) rotateY(' + ((alt ? 45 : 15) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'flip-right': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transformOrigin = '50% 50%';
						this.style.transform = 'perspective(1000px) rotateY(' + ((alt ? -45 : -15) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'tilt-left': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transform = 'rotate(' + ((alt ? 45 : 5) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'tilt-right': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity, alt) {
						this.style.opacity = 0;
						this.style.transform = 'rotate(' + ((alt ? -45 : -5) * intensity) + 'deg)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'fade-right': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.opacity = 0;
						this.style.transform = 'translateX(' + (-1.5 * intensity) + 'rem)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'fade-left': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.opacity = 0;
						this.style.transform = 'translateX(' + (1.5 * intensity) + 'rem)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'fade-down': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.opacity = 0;
						this.style.transform = 'translateY(' + (-1.5 * intensity) + 'rem)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'fade-up': {
					transition: function (speed, delay) {
						return	'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.opacity = 0;
						this.style.transform = 'translateY(' + (1.5 * intensity) + 'rem)';
					},
					play: function() {
						this.style.opacity = 1;
						this.style.transform = 'none';
					},
				},
				'fade-in': {
					transition: function (speed, delay) {
						return 'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function() {
						this.style.opacity = 0;
					},
					play: function() {
						this.style.opacity = 1;
					},
				},
				'fade-in-background': {
					custom: true,
					transition: function (speed, delay) {
	
						this.style.setProperty('--onvisible-speed', speed + 's');
	
						if (delay)
							this.style.setProperty('--onvisible-delay', delay + 's');
	
					},
					rewind: function() {
						this.style.removeProperty('--onvisible-background-color');
					},
					play: function() {
						this.style.setProperty('--onvisible-background-color', 'rgba(0,0,0,0.001)');
					},
				},
				'zoom-in-image': {
					target: 'img',
					transition: function (speed, delay) {
						return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function() {
						this.style.transform = 'scale(1)';
					},
					play: function(intensity) {
						this.style.transform = 'scale(' + (1 + (0.1 * intensity)) + ')';
					},
				},
				'zoom-out-image': {
					target: 'img',
					transition: function (speed, delay) {
						return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.transform = 'scale(' + (1 + (0.1 * intensity)) + ')';
					},
					play: function() {
						this.style.transform = 'none';
					},
				},
				'focus-image': {
					target: 'img',
					transition: function (speed, delay) {
						return	'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' +
								'filter ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
					},
					rewind: function(intensity) {
						this.style.transform = 'scale(' + (1 + (0.05 * intensity)) + ')';
						this.style.filter = 'blur(' + (0.25 * intensity) + 'rem)';
					},
					play: function(intensity) {
						this.style.transform = 'none';
						this.style.filter = 'none';
					},
				},
			},
	
			/**
			 * Adds one or more animatable elements.
			 * @param {string} selector Selector.
			 * @param {object} settings Settings.
			 */
			add: function(selector, settings) {
	
				var style = settings.style in this.effects ? settings.style : 'fade',
					speed = parseInt('speed' in settings ? settings.speed : 1000) / 1000,
					intensity = ((parseInt('intensity' in settings ? settings.intensity : 5) / 10) * 1.75) + 0.25,
					delay = parseInt('delay' in settings ? settings.delay : 0) / 1000,
					offset = parseInt('offset' in settings ? settings.offset : 0),
					mode = parseInt('mode' in settings ? settings.mode : 3),
					replay = 'replay' in settings ? settings.replay : false,
					stagger = 'stagger' in settings ? (parseInt(settings.stagger) / 1000) : false,
					state = 'state' in settings ? settings.state : null,
					effect = this.effects[style];
	
				// Step through selected elements.
					$$(selector).forEach(function(e) {
	
						var	children = (stagger !== false) ? e.querySelectorAll(':scope > li, :scope ul > li') : null,
							enter = function(staggerDelay=0) {
	
								var	_this = this,
									transitionOrig;
	
								// Target provided? Use it instead of element.
									if (effect.target)
										_this = this.querySelector(effect.target);
	
								// Not a custom effect?
									if (!effect.custom) {
	
										// Save original transition.
											transitionOrig = _this.style.transition;
	
										// Apply temporary styles.
											_this.style.setProperty('backface-visibility', 'hidden');
	
										// Apply transition.
											_this.style.transition = effect.transition(speed, delay + staggerDelay);
	
									}
	
								// Otherwise, call custom transition handler.
									else
										effect.transition.apply(_this, [speed, delay + staggerDelay]);
	
								// Play.
									effect.play.apply(_this, [intensity, !!children]);
	
								// Not a custom effect?
									if (!effect.custom)
										setTimeout(function() {
	
											// Remove temporary styles.
												_this.style.removeProperty('backface-visibility');
	
											// Restore original transition.
												_this.style.transition = transitionOrig;
	
										}, (speed + delay + staggerDelay) * 1000 * 2);
	
							},
							leave = function() {
	
								var	_this = this,
									transitionOrig;
	
								// Target provided? Use it instead of element.
									if (effect.target)
										_this = this.querySelector(effect.target);
	
								// Not a custom effect?
									if (!effect.custom) {
	
										// Save original transition.
											transitionOrig = _this.style.transition;
	
										// Apply temporary styles.
											_this.style.setProperty('backface-visibility', 'hidden');
	
										// Apply transition.
											_this.style.transition = effect.transition(speed);
	
									}
	
								// Otherwise, call custom transition handler.
									else
										effect.transition.apply(_this, [speed]);
	
								// Rewind.
									effect.rewind.apply(_this, [intensity, !!children]);
	
								// Not a custom effect?
									if (!effect.custom)
										setTimeout(function() {
	
											// Remove temporary styles.
												_this.style.removeProperty('backface-visibility');
	
											// Restore original transition.
												_this.style.transition = transitionOrig;
	
										}, speed * 1000 * 2);
	
							},
							targetElement, triggerElement;
	
						// Initial rewind.
	
							// Determine target element.
								if (effect.target)
									targetElement = e.querySelector(effect.target);
								else
									targetElement = e;
	
							// Children? Rewind each individually.
								if (children)
									children.forEach(function(targetElement) {
										effect.rewind.apply(targetElement, [intensity, true]);
									});
	
							// Otherwise. just rewind element.
								else
									effect.rewind.apply(targetElement, [intensity]);
	
						// Determine trigger element.
							triggerElement = e;
	
							// Has a parent?
								if (e.parentNode) {
	
									// Parent is an onvisible trigger? Use it.
										if (e.parentNode.dataset.onvisibleTrigger)
											triggerElement = e.parentNode;
	
									// Otherwise, has a grandparent?
										else if (e.parentNode.parentNode) {
	
											// Grandparent is an onvisible trigger? Use it.
												if (e.parentNode.parentNode.dataset.onvisibleTrigger)
													triggerElement = e.parentNode.parentNode;
	
										}
	
								}
	
						// Add scroll event.
							scrollEvents.add({
								element: e,
								triggerElement: triggerElement,
								offset: offset,
								mode: mode,
								initialState: state,
								enter: children ? function() {
	
									var staggerDelay = 0;
	
									// Step through children.
										children.forEach(function(e) {
	
											// Apply enter handler.
												enter.apply(e, [staggerDelay]);
	
											// Increment stagger delay.
												staggerDelay += stagger;
	
										});
	
								} : enter,
								leave: (replay ? (children ? function() {
	
									// Step through children.
										children.forEach(function(e) {
	
											// Apply leave handler.
												leave.apply(e);
	
										});
	
								} : leave) : null),
							});
	
					});
	
				},
	
		};
	
	// Gallery.
		/**
		* Lightbox gallery.
		*/
		function lightboxGallery() {
		
		var _this = this;
		
		/**
		 * ID.
		 * @var {string}
		 */
		this.id = 'gallery';
		
		/**
		 * Wrapper.
		 * @var {DOMElement}
		 */
		this.$wrapper = $('#' + this.id);
		
		/**
		 * Modal.
		 * @var {DOMElement}
		 */
		this.$modal = null;
		
		/**
		 * Modal image.
		 * @var {DOMElement}
		 */
		this.$modalImage = null;
		
		/**
		 * Modal next.
		 * @var {DOMElement}
		 */
		this.$modalNext = null;
		
		/**
		 * Modal previous.
		 * @var {DOMElement}
		 */
		this.$modalPrevious = null;
		
		/**
		 * Links.
		 * @var {nodeList}
		 */
		this.$links = null;
		
		/**
		 * Lock state.
		 * @var {bool}
		 */
		this.locked = false;
		
		/**
		 * Current index.
		 * @var {integer}
		 */
		this.current = null;
		
		/**
		 * Transition delay (must match CSS).
		 * @var {integer}
		 */
		this.delay = 375;
		
		/**
		 * Navigation state.
		 * @var {bool}
		 */
		this.navigation = null;
		
		/**
		 * Mobile state.
		 * @var {bool}
		 */
		this.mobile = null;
		
		/**
		 * Zoom interval ID.
		 * @var {integer}
		 */
		this.zoomIntervalId = null;
		
		// Init modal.
			this.initModal();
		
		};
		
		/**
		 * Initialize.
		 * @param {object} config Config.
		 */
		lightboxGallery.prototype.init = function(config) {
		
			var _this = this,
				$links = $$('#' + config.id + ' .thumbnail'),
				navigation = config.navigation,
				mobile = config.mobile,
				i, j;
		
			// Determine if navigation needs to be disabled (despite what our config says).
				j = 0;
		
				// Step through items.
					for (i = 0; i < $links.length; i++) {
		
						// Not ignored? Increment count.
							if ($links[i].dataset.lightboxIgnore != '1')
								j++;
		
					}
		
				// Less than two allowed items? Disable navigation.
					if (j < 2)
						navigation = false;
		
			// Bind click events.
				for (i=0; i < $links.length; i++) {
		
					// Ignored? Skip.
						if ($links[i].dataset.lightboxIgnore == '1')
							continue;
		
					// Bind click event.
						(function(index) {
							$links[index].addEventListener('click', function(event) {
		
								// Prevent default.
									event.stopPropagation();
									event.preventDefault();
		
								// Show.
									_this.show(index, {
										$links: $links,
										navigation: navigation,
										mobile: mobile
									});
		
							});
						})(i);
		
				}
		
		};
		
		/**
		 * Init modal.
		 */
		lightboxGallery.prototype.initModal = function() {
		
			var	_this = this,
				$modal,
				$modalImage,
				$modalNext,
				$modalPrevious;
		
			// Build element.
				$modal = document.createElement('div');
					$modal.id = this.id + '-modal';
					$modal.tabIndex = -1;
					$modal.className = 'gallery-modal';
					$modal.innerHTML = '<div class="inner"><img src="" /></div><div class="nav previous"></div><div class="nav next"></div><div class="close"></div>';
					$body.appendChild($modal);
		
				// Image.
					$modalImage = $('#' + this.id + '-modal img');
						$modalImage.addEventListener('load', function() {
		
							// Delay (wait for visible transition, if not switching).
								setTimeout(function() {
		
									// No longer visible? Bail.
										if (!$modal.classList.contains('visible'))
											return;
		
									// Set loaded.
										$modal.classList.add('loaded');
		
									// Clear switching after delay.
										setTimeout(function() {
											$modal.classList.remove('switching');
										}, _this.delay);
		
								}, ($modal.classList.contains('switching') ? 0 : _this.delay));
		
						});
		
				// Navigation.
					$modalNext = $('#' + this.id + '-modal .next');
					$modalPrevious = $('#' + this.id + '-modal .previous');
		
			// Methods.
				$modal.show = function(index, offset) {
		
					var item,
						i, j, found;
		
					// Locked? Bail.
						if (_this.locked)
							return;
		
					// No index provided? Use current.
						if (typeof index != 'number')
							index = _this.current;
		
					// Offset provided? Find first allowed offset item.
						if (typeof offset == 'number') {
		
							found = false;
							j = 0;
		
							// Step through items using offset (up to item count).
								for (j = 0; j < _this.$links.length; j++) {
		
									// Increment index by offset.
										index += offset;
		
									// Less than zero? Jump to end.
										if (index < 0)
											index = _this.$links.length - 1;
		
									// Greater than length? Jump to beginning.
										else if (index >= _this.$links.length)
											index = 0;
		
									// Already there? Bail.
										if (index == _this.current)
											break;
		
									// Get item.
										item = _this.$links.item(index);
		
										if (!item)
											break;
		
									// Not ignored? Found!
										if (item.dataset.lightboxIgnore != '1') {
		
											found = true;
											break;
		
										}
		
								}
		
							// Couldn't find an allowed item? Bail.
								if (!found)
									return;
		
						}
		
					// Otherwise, see if requested item is allowed.
						else {
		
							// Check index.
		
								// Less than zero? Jump to end.
									if (index < 0)
										index = _this.$links.length - 1;
		
								// Greater than length? Jump to beginning.
									else if (index >= _this.$links.length)
										index = 0;
		
								// Already there? Bail.
									if (index == _this.current)
										return;
		
							// Get item.
								item = _this.$links.item(index);
		
								if (!item)
									return;
		
							// Ignored? Bail.
								if (item.dataset.lightboxIgnore == '1')
									return;
		
						}
		
					// Mobile? Set zoom handler interval.
						if (client.mobile)
							_this.zoomIntervalId = setInterval(function() {
								_this.zoomHandler();
							}, 250);
		
					// Lock.
						_this.locked = true;
		
					// Current?
						if (_this.current !== null) {
		
							// Clear loaded.
								$modal.classList.remove('loaded');
		
							// Set switching.
								$modal.classList.add('switching');
		
							// Delay (wait for switching transition).
								setTimeout(function() {
		
									// Set current, src.
										_this.current = index;
										$modalImage.src = item.href;
		
									// Delay.
										setTimeout(function() {
		
											// Focus.
												$modal.focus();
		
											// Unlock.
												_this.locked = false;
		
										}, _this.delay);
		
								}, _this.delay);
		
						}
		
					// Otherwise ...
						else {
		
							// Set current, src.
								_this.current = index;
								$modalImage.src = item.href;
		
							// Set visible.
								$modal.classList.add('visible');
		
							// Delay.
								setTimeout(function() {
		
									// Focus.
										$modal.focus();
		
									// Unlock.
										_this.locked = false;
		
								}, _this.delay);
		
						}
		
				};
		
				$modal.hide = function() {
		
					// Locked? Bail.
						if (_this.locked)
							return;
		
					// Already hidden? Bail.
						if (!$modal.classList.contains('visible'))
							return;
		
					// Lock.
						_this.locked = true;
		
					// Clear visible, loaded, switching.
						$modal.classList.remove('visible');
						$modal.classList.remove('loaded');
						$modal.classList.remove('switching');
		
					// Clear zoom handler interval.
						clearInterval(_this.zoomIntervalId);
		
					// Delay (wait for visible transition).
						setTimeout(function() {
		
							// Clear src.
								$modalImage.src = '';
		
							// Unlock.
								_this.locked = false;
		
							// Focus.
								$body.focus();
		
							// Clear current.
								_this.current = null;
		
						}, _this.delay);
		
				};
		
				$modal.next = function() {
					$modal.show(null, 1);
				};
		
				$modal.previous = function() {
					$modal.show(null, -1);
				};
		
				$modal.first = function() {
					$modal.show(0);
				};
		
				$modal.last = function() {
					$modal.show(_this.$links.length - 1);
				};
		
			// Events.
				$modal.addEventListener('click', function(event) {
					$modal.hide();
				});
		
				$modal.addEventListener('keydown', function(event) {
		
					// Not visible? Bail.
						if (!$modal.classList.contains('visible'))
							return;
		
					switch (event.keyCode) {
		
						// Right arrow, Space.
							case 39:
							case 32:
		
								if (!_this.navigation)
									break;
		
								event.preventDefault();
								event.stopPropagation();
		
								$modal.next();
		
								break;
		
						// Left arrow.
							case 37:
		
								if (!_this.navigation)
									break;
		
								event.preventDefault();
								event.stopPropagation();
		
								$modal.previous();
		
								break;
		
						// Home.
							case 36:
		
								if (!_this.navigation)
									break;
		
								event.preventDefault();
								event.stopPropagation();
		
								$modal.first();
		
								break;
		
						// End.
							case 35:
		
								if (!_this.navigation)
									break;
		
								event.preventDefault();
								event.stopPropagation();
		
								$modal.last();
		
								break;
		
						// Escape.
							case 27:
		
								event.preventDefault();
								event.stopPropagation();
		
								$modal.hide();
		
								break;
		
					}
		
				});
		
				$modalNext.addEventListener('click', function(event) {
					$modal.next();
				});
		
				$modalPrevious.addEventListener('click', function(event) {
					$modal.previous();
				});
		
			// Set.
				this.$modal = $modal;
				this.$modalImage = $modalImage;
				this.$modalNext = $modalNext;
				this.$modalPrevious = $modalPrevious;
		
		};
		
		/**
		 * Show.
		 * @param {string} href Image href.
		 */
		lightboxGallery.prototype.show = function(href, config) {
		
			// Update config.
				this.$links = config.$links;
				this.navigation = config.navigation;
				this.mobile = config.mobile;
		
				if (this.navigation) {
		
					this.$modalNext.style.display = '';
					this.$modalPrevious.style.display = '';
		
				}
				else {
		
					this.$modalNext.style.display = 'none';
					this.$modalPrevious.style.display = 'none';
		
				}
		
			// Mobile and not permitted? Bail.
				if (client.mobile && !this.mobile)
					return;
		
			// Show modal.
				this.$modal.show(href);
		
		};
		
		/**
		 * Zoom handler.
		 */
		lightboxGallery.prototype.zoomHandler = function() {
		
			var threshold = window.matchMedia('(orientation: portrait)').matches ? 50 : 100;
		
			// Zoomed in? Set zooming.
				if (window.outerWidth > window.innerWidth + threshold)
					this.$modal.classList.add('zooming');
		
			// Otherwise, clear zooming.
				else
					this.$modal.classList.remove('zooming');
		
		};
		
		var _lightboxGallery = new lightboxGallery;
	
	// Gallery: gallery01.
		_lightboxGallery.init({
			id: 'gallery01',
			navigation: true,
			mobile: true
		});
	
	// "On Visible" animations.
		onvisible.add('#divider32', { style: 'tilt-left', speed: 250, intensity: 5, delay: 0, replay: false });
		onvisible.add('#divider17', { style: 'tilt-left', speed: 250, intensity: 5, delay: 0, replay: false });
		onvisible.add('#divider22', { style: 'tilt-left', speed: 250, intensity: 5, delay: 0, replay: false });

})();