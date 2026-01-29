document.addEventListener("DOMContentLoaded", () => {
	const shouldRunSmartLoader = Array.from(document.querySelectorAll('.eacss')).some(el => {
		const style = getComputedStyle(el);
		return el.classList.contains('preload') || (
			style.display !== 'none' && style.visibility !== 'hidden'
		);
	});

	if (!shouldRunSmartLoader) return;

	class SmartFileLoader {
		constructor() {
			this.frontendBase = '/eaCSSv5/';
			this.versionSuffix = '';
			this.loadedFiles = new Set();
			this.observedElements = new WeakSet();
		}

		async loadFile(file, callback) {
			const isJS = file.endsWith('.js'), isCSS = file.endsWith('.css');
			if (!isJS && !isCSS || this.loadedFiles.has(file)) return;

			const isExternal = /^https?:\/\//i.test(file);
			const fileURL = isExternal ? file : this.frontendBase + file + this.versionSuffix;

			const cleanURL = fileURL.split('?')[0];
			if ([...document.querySelectorAll(isJS ? 'script' : 'link')].some(el => (el.src || el.href || '').split('?')[0] === cleanURL)) return;

			const el = isJS
				? this.createElement('script', { src: fileURL, async: true })
				: this.createElement('link', { rel: 'stylesheet', href: fileURL });

			el.onload = () => callback?.();
			document.head.appendChild(el);
			this.loadedFiles.add(file);
		}

		createElement(tag, attrs) {
			const el = document.createElement(tag);
			Object.keys(attrs).forEach(attr => el.setAttribute(attr, attrs[attr]));
			return el;
		}

		loadCoreFiles() {
			const coreEls = document.querySelectorAll('.eacss');
			if (!coreEls.length) return;

			const allClasses = new Set();
			coreEls.forEach(el => el.classList.forEach(cls => allClasses.add(cls)));

			const coreFiles = [
				'ea.css',
				allClasses.has('full-wid') && 'full-width.css'
			].filter(Boolean);

			coreFiles.forEach(file => this.loadFile(file));

			if (allClasses.has('blocker')) {
				this.addBlockerClass();
			}

			if (allClasses.has('preload')) {
				this.showPreloader();
				setTimeout(() => coreEls.forEach(el => el.classList.remove('preload')), 1);
			}

			coreEls.forEach(el => ['js', 'css'].forEach(type =>
				el.dataset[type]?.split(',').map(f => f.trim()).forEach(f => this.loadFile(f))
			));
		}

		loadLazyFiles() {
			const lazyItems = [
				{ sel: '.eacss .accordion-section', files: ['js/accordion.js', 'accordion.css'] },
				{ sel: '.eacss .countdown', files: ['js/countdown.js'] },
				{ sel: '.eacss .video[data-pid]', files: ['js/video.js'] }
			];

			lazyItems.forEach(({ sel, files, callback }) => {
				this.observeElement(sel, files, callback);
			});

			document.querySelectorAll('.eacss [data-loader]').forEach(el =>
				this.observeElement(el, el.dataset.loader.split(',').map(f => f.trim()))
			);

			new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					mutation.addedNodes.forEach(node => {
						if (node.nodeType === 1) {
							if (node.matches?.('.eacss [data-loader]')) {
								const files = node.dataset.loader.split(',').map(f => f.trim());
								this.observeElement(node, files);
							}
							if (node.querySelectorAll) {
								node.querySelectorAll('.eacss [data-loader]').forEach(el => {
									const files = el.dataset.loader.split(',').map(f => f.trim());
									this.observeElement(el, files);
								});
							}
						}
					});
				});
			}).observe(document.body, { childList: true, subtree: true });
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

		addBlockerClass() {
			document.querySelectorAll('#main [class*="-container"]').forEach(el =>
				el.classList.add('blocker')
			);
		}

		showPreloader() {
			const preloaderImage = document.createElement("img");
			preloaderImage.id = 'pre-load-gif';
			preloaderImage.src = '/eaCSSv5/img/loading.gif';
			preloaderImage.style = `
				display: block;
				position: absolute;
				left: 50%;
				top: 50%;
				margin: 0;
				width: 50px;
				height: 50px;
				transform: translate(-50%, -50%);
			`;

			const preloaderContainer = document.createElement("div");
			preloaderContainer.id = 'pre-load-bg';
			preloaderContainer.style = `
				position: fixed;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background-color: #ffffff;
				z-index: 98;
				-webkit-transition: opacity 300ms, visibility 300ms;
				transition: opacity 300ms, visibility 300ms;
			`;

			preloaderContainer.appendChild(preloaderImage);
			document.body.insertBefore(preloaderContainer, document.body.firstChild);
			document.body.style.overflow = 'hidden';

			window.addEventListener('load', () => {
				setTimeout(() => {
					const gif = document.getElementById('pre-load-gif');
					if (gif) gif.style.display = 'none';

					const bg = document.getElementById('pre-load-bg');
					if (bg) bg.style.display = 'none';

					document.body.style.overflow = 'auto';
				}, 1000);
			});
		}

		init() {
			this.loadCoreFiles();
			this.loadLazyFiles();
		}
	}

	new SmartFileLoader().init();
	
	document.querySelectorAll('.showthething').forEach(button => {
	    button.addEventListener('click', (e) => {
	        e.preventDefault();
	
	        // 1. Find the target "thing" within the same parent
	        const target = button.parentElement.querySelector('.thething');
	        
	        // 2. Find the icon inside the button
	        const icon = button.querySelector('.icon');
	
	        // 3. Toggle the classes
	        // Use a CSS class for the 'slide' effect (see below)
	        target.classList.toggle('is-visible');
	        icon.classList.toggle('flipthething');
	    });
	});

});
