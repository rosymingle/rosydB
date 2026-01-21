document.addEventListener("DOMContentLoaded", () => {
	const hasEACSS = document.querySelector(".eacss");
	const hasSlick = document.querySelector(".slick-data, .slick-smart");

	if (!hasEACSS && !hasSlick) return;

	const isIOS = /iP(ad|hone|od)/i.test(navigator.userAgent);

	class SmartFileLoader {
		constructor() {
			this.frontendBase = "/eaCSSv5/";
			this.versionSuffix = "";
			this.loadedFiles = new Set();
			this.observedElements = new WeakSet();
			this.preconnected = false;
		}

		loadFile(file, callback) {
			const isJS = file.endsWith(".js");
			const isCSS = file.endsWith(".css");
			if ((!isJS && !isCSS) || this.loadedFiles.has(file)) return;

			const fileURL = /^https?:\/\//i.test(file)
				? file
				: this.frontendBase + file + this.versionSuffix;

			const isAlreadyLoaded = [...document.querySelectorAll(isJS ? "script" : "link")]
				.some(el => (el.src || el.href || "").split("?")[0] === fileURL.split("?")[0]);

			if (isAlreadyLoaded) {
				this.loadedFiles.add(file);
				return;
			}

			const el = isJS
				? this.createElement("script", { src: fileURL, async: true })
				: this.createElement("link", { rel: "stylesheet", href: fileURL });

			el.onload = () => {
				this.loadedFiles.add(file);
				if (file.includes("slick") && typeof window._onSlickLoaded === "function") {
					window._onSlickLoaded();
				}
				callback?.();
			};

			document.head.appendChild(el);
		}

		createElement(tag, attrs) {
			const el = document.createElement(tag);
			Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
			return el;
		}

		addBlockerClass() {
			document
				.querySelectorAll('#main [class*="-container"]')
				.forEach(el => el.classList.add("blocker"));
		}

		preconnectCloudinary() {
			if (this.preconnected) return;
			this.preconnected = true;
			const urls = [
				"https://res.cloudinary.com",
				"https://player.cloudinary.com"
			];
			urls.forEach(href => {
				if (!document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
					document.head.appendChild(this.createElement("link", { rel: "preconnect", href, crossorigin: "" }));
				}
			});
		}

		loadCoreFiles() {
			const coreEls = document.querySelectorAll(".eacss");
			if (!coreEls.length) return;

			const preloadEls = [];
			const coreFiles = new Set(["ea.css"]);

			coreEls.forEach(el => {
				el.classList.forEach(cls => {
					if (cls === "full-wid") coreFiles.add("full-width.css");
					if (cls === "preload") preloadEls.push(el);
					if (cls === "blocker") this.addBlockerClass();
				});
			});

			if (preloadEls.length) {
				const preloadBg = document.querySelector('.preload-bg');
				if (preloadBg) {
					preloadBg.style.display = 'block';
					document.body.style.overflow = 'hidden';

					window.addEventListener('load', () => {
						setTimeout(() => {
							preloadBg.style.display = 'none';
							document.body.style.overflow = 'auto';
							preloadEls.forEach(el => el.classList.remove('preload'));
						}, 400);
					});
				}
			}

			coreFiles.forEach(file => {
				const isEA = file === "ea.css";
				this.loadFile(
					file,
					isEA
						? () => {
							requestAnimationFrame(() => {
								setTimeout(() => {
									if (typeof window._onSlickLoaded === "function") {
										window._onSlickLoaded();
									}
								}, 50);
							});
						}
						: null
				);
			});

			coreEls.forEach(el => {
				["js", "css"].forEach(type =>
					el.dataset[type]
						?.split(",")
						.map(f => f.trim())
						.forEach(f => this.loadFile(f))
				);
			});
		}

		loadEagerMedia() {
			const eagerEls = Array.from(document.querySelectorAll('.eacss .video.eager, .eacss [data-loader].eager'));

			// Optional: add top-of-page auto detection
			document.querySelectorAll('.eacss .video.autoplay:not(.eager)').forEach(el => {
				if (this.isAboveFold(el, 160)) eagerEls.push(el);
			});

			if (!eagerEls.length) return;

			this.preconnectCloudinary();

			eagerEls.forEach(el => {
				const files = el.dataset.loader
					? el.dataset.loader.split(',').map(f => f.trim())
					: ['js/video.min.js'];
				files.forEach(f => this.loadFile(f));
			});
		}

		isAboveFold(el, thresholdPx = 200) {
			const rect = el.getBoundingClientRect();
			return rect.top <= thresholdPx;
		}

		loadLazyFiles() {
			const lazyItems = [
				{ sel: '.eacss .accordion-section', files: ['js/accordion.min.js', 'accordion.min.css'] },
				{ sel: '.eacss .countdown', files: ['js/countdown.min.js'] },
				{ sel: '.eacss .video', files: ['js/video.min.js'] }
			];

			const skipIfEager = el => el.classList?.contains('eager');

			lazyItems.forEach(({ sel, files, callback }) => {
				document.querySelectorAll(sel).forEach(el => {
					if (skipIfEager(el)) return;
					this.observeElement(el, files, callback);
				});
			});

			document.querySelectorAll('.eacss [data-loader]').forEach(el => {
				if (skipIfEager(el)) return;
				const files = el.dataset.loader.split(',').map(f => f.trim());
				this.observeElement(el, files);
			});

			new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					mutation.addedNodes.forEach(node => {
						if (node.nodeType !== 1) return;

						const handle = el => {
							if (el.classList?.contains('eager')) {
								const files = el.dataset.loader
									? el.dataset.loader.split(',').map(f => f.trim())
									: ['js/video.min.js'];
								if (files.length) {
									this.preconnectCloudinary();
									files.forEach(f => this.loadFile(f));
								}
							} else {
								const files = el.dataset.loader?.split(',').map(f => f.trim());
								if (files?.length) this.observeElement(el, files);
							}
						};

						if (node.matches?.('.eacss [data-loader], .eacss .video')) handle(node);
						if (node.querySelectorAll) {
							node.querySelectorAll('.eacss [data-loader], .eacss .video').forEach(handle);
						}
					});
				});
			}).observe(document.body, { childList: true, subtree: true });

			$('.showthething').click(function () {
				$(this).parent().find('.thething').slideToggle('fast');
				$(this).find('.icon').toggleClass('flipthething');
				return false;
			});
		}

		observeElement(selectorOrElement, files = [], callback = null) {
			const elements = typeof selectorOrElement === 'string'
				? document.querySelectorAll(selectorOrElement)
				: [selectorOrElement];

			elements.forEach(el => {
				if (this.observedElements.has(el)) return;
				this.observedElements.add(el);

				const observer = new IntersectionObserver((entries, observer) => {
					if (entries.some(e => e.isIntersecting)) {
						files.forEach(f => this.loadFile(f));
						if (callback) callback(el);
						observer.unobserve(el);
					}
				}, { rootMargin: '100px 0px' });

				observer.observe(el);
			});
		}

		init() {
			this.loadCoreFiles();
			this.loadEagerMedia(); // must run before lazy
			this.loadLazyFiles();
		}
	}

	const loader = new SmartFileLoader();
	if (hasEACSS) loader.init();

	function runSlick() {
		$(".slick-smart").each(function () {
			const $el = $(this);

			if (isIOS && $el.attr("data-slick-ready") === "true") return;

			const containerWidth = $el.width();
			const lastKnownWidth = $el.data("last-container-width") || 0;
			if (Math.abs(containerWidth - lastKnownWidth) < 5) return;
			$el.data("last-container-width", containerWidth);

			let currentSlide = 0;
			if ($el.hasClass("slick-initialized")) {
				try {
					currentSlide = $el.slick("slickCurrentSlide") || 0;
				} catch {}
				$el.slick("unslick");
			}

			let userConfig = {};
			const configAttr = $el.attr("data-slick");
			try {
				if (configAttr) {
					userConfig = Function('"use strict";return (' + configAttr + ")")();
				}
			} catch (e) {
				console.warn("Invalid slick config:", configAttr);
			}

			const $slides = $el.children(".item");
			if (!$slides.length) return;

			const inner = $slides[0].querySelector(".swid");
			if (!inner) return;

			const cs = window.getComputedStyle(inner);
			const maxW = cs.getPropertyValue("max-width").trim();
			const realWidth = (maxW.endsWith("px") ? parseFloat(maxW) : 0) +
				(parseFloat(cs.marginLeft) || 0) +
				(parseFloat(cs.marginRight) || 0);

			const totalWidth = realWidth * $slides.length;
			const needsCarousel = totalWidth > containerWidth + 1;

			if (needsCarousel) {
				$el.removeClass("unslicked");

				const slidesToShow = containerWidth / realWidth;

				$el.slick({
					mobileFirst: true,
					variableWidth: true,
					swipeToSlide: true,
					infinite: false,
					arrows: false,
					dots: true,
					slidesToShow,
					...userConfig,
					responsive: [
						{
							breakpoint: containerWidth + 100,
							settings: "unslick",
						},
					],
				});

				$el.slick("slickGoTo", currentSlide, true);

				if (isIOS) {
					$el.attr("data-slick-ready", "true");
				}
			} else {
				$el.addClass("unslicked");
			}
		});

		$(".slick-data").each(function () {
			const $el = $(this);
			let userConfig = {};
			const configAttr = $el.attr("data-slick");

			try {
				if (configAttr) {
					userConfig = Function('"use strict";return (' + configAttr + ")")();
				}
			} catch (e) {
				console.warn("Invalid slick config:", configAttr);
			}

			const hasUnslick = userConfig?.responsive?.some(r => r.settings === "unslick");

			if ($el.hasClass("slick-initialized")) {
				if (!hasUnslick) return;
				try {
					$el.slick("unslick");
				} catch {}
			}

			$el.slick(userConfig);
		});
	}

	window._onSlickLoaded = () => {
		requestAnimationFrame(() => {
			setTimeout(() => {
				runSlick();
				let resizeTimer;
				window.addEventListener("resize", () => {
					clearTimeout(resizeTimer);
					resizeTimer = setTimeout(runSlick, 200);
				});
			}, 50);
		});
	};
});
