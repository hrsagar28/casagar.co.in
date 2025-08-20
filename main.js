document.addEventListener('DOMContentLoaded', () => {

    // --- Component Loader (Loads Header & Footer) ---
    const loadComponent = (componentPath, elementId) => {
        const pathPrefix = document.body.hasAttribute('data-path-prefix') ? document.body.getAttribute('data-path-prefix') : '';
        fetch(`${pathPrefix}${componentPath}`)
            .then(response => { if (!response.ok) { throw new Error(`Failed to load ${componentPath}`); } return response.text(); })
            .then(data => {
                const element = document.getElementById(elementId);
                if (!element) return;
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                doc.querySelectorAll('img[src^="assets/"]').forEach(img => { img.src = `${pathPrefix}${img.getAttribute('src')}`; });
                doc.querySelectorAll('a').forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                        link.href = `${pathPrefix}${href}`;
                    }
                });
                element.innerHTML = doc.body.innerHTML;
                if (elementId === 'main-header') initializeNav();
                if (elementId === 'main-footer') updateFooterYear();
            })
            .catch(error => console.error('Error loading component:', error));
    };

    // --- Active Navigation Link ---
    const initializeNav = () => {
        const navLinks = document.querySelectorAll('#nav-links a');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(link => {
            if (link.getAttribute('href').split('/').pop() === currentPage && !link.classList.contains('bg-primary')) {
                link.classList.add('nav-active');
            }
        });
    };

    // --- REVISED Custom Select Dropdown Handler with Keyboard Accessibility ---
    const initializeCustomSelect = (wrapper, selectIndex) => {
        if (!wrapper) return;
        const trigger = wrapper.querySelector('button');
        const optionsPanel = wrapper.querySelector('.options-panel');
        const selectedOptionText = wrapper.querySelector('.selected-option-text');
        const hiddenInput = wrapper.querySelector('input[type="hidden"]');
        const arrowIcon = wrapper.querySelector('svg');
        const options = optionsPanel.querySelectorAll('li');
        let currentIndex = -1;
        let searchString = '';
        let searchTimeout;

        // --- Accessibility Enhancements ---
        trigger.setAttribute('role', 'combobox');
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        optionsPanel.setAttribute('id', `custom-options-${selectIndex}`);
        trigger.setAttribute('aria-controls', `custom-options-${selectIndex}`);
        optionsPanel.setAttribute('role', 'listbox');
        options.forEach((option, optionIndex) => {
            option.setAttribute('role', 'option');
            option.setAttribute('id', `custom-option-${selectIndex}-${optionIndex}`);
            option.setAttribute('aria-selected', 'false');
            option.setAttribute('tabindex', '-1'); // Make focusable by script, not by Tab
        });
        // --- End Accessibility Enhancements ---

        const closeAllSelects = (exceptWrapper) => {
            document.querySelectorAll('.custom-select-wrapper').forEach(w => {
                if (w !== exceptWrapper) {
                    w.querySelector('.options-panel').classList.remove('visible');
                    w.querySelector('button').setAttribute('aria-expanded', 'false');
                    if(w.querySelector('svg')) w.querySelector('svg').classList.remove('rotate-180');
                }
            });
        };

        const toggleDropdown = () => {
            const isVisible = optionsPanel.classList.toggle('visible');
            trigger.setAttribute('aria-expanded', isVisible);
            if(arrowIcon) arrowIcon.classList.toggle('rotate-180');
            if (!isVisible) {
                trigger.removeAttribute('aria-activedescendant');
                currentIndex = -1;
            }
        };

        const selectOption = (option) => {
            selectedOptionText.textContent = option.getAttribute('data-value');
            selectedOptionText.classList.remove('text-gray-500');
            hiddenInput.value = option.getAttribute('data-value');
            trigger.classList.remove('border-red-500');
            
            options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
            option.setAttribute('aria-selected', 'true');

            closeAllSelects(); // Close all dropdowns
            trigger.focus();
        };

        const updateFocus = () => {
            options.forEach(opt => opt.classList.remove('bg-gray-100'));
            if (currentIndex > -1) {
                options[currentIndex].classList.add('bg-gray-100');
                options[currentIndex].focus();
                trigger.setAttribute('aria-activedescendant', options[currentIndex].id);
            }
        };

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllSelects(wrapper); // Close others before toggling this one
            toggleDropdown();
        });

        options.forEach((option, index) => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                selectOption(option);
            });
        });

        // Combined handler for all keyboard events on the dropdown
        const handleKeyDown = (e) => {
            e.stopPropagation();

            // Handle alphanumeric keys for type-to-select functionality
            if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9\s]/)) {
                e.preventDefault();
                if (!optionsPanel.classList.contains('visible')) {
                    toggleDropdown();
                }

                clearTimeout(searchTimeout);
                searchString += e.key.toLowerCase();
                searchTimeout = setTimeout(() => { searchString = ''; }, 600); // Reset search string after 600ms of inactivity

                const matchingIndex = Array.from(options).findIndex(opt =>
                    opt.getAttribute('data-value').toLowerCase().startsWith(searchString)
                );

                if (matchingIndex > -1) {
                    currentIndex = matchingIndex;
                    updateFocus();
                }
                return;
            }

            // Handle navigation and action keys
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (optionsPanel.classList.contains('visible')) {
                        if (currentIndex > -1) selectOption(options[currentIndex]);
                    } else {
                        toggleDropdown();
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (!optionsPanel.classList.contains('visible')) toggleDropdown();
                    currentIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                    updateFocus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (!optionsPanel.classList.contains('visible')) toggleDropdown();
                    currentIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                    updateFocus();
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (optionsPanel.classList.contains('visible')) {
                        toggleDropdown();
                        trigger.focus();
                    }
                    break;
                case 'Tab':
                    // New: Close dropdown on Tab key press
                    if (optionsPanel.classList.contains('visible')) {
                        toggleDropdown();
                    }
                    break;
            }
        };

        trigger.addEventListener('keydown', handleKeyDown);
        optionsPanel.addEventListener('keydown', handleKeyDown);

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target) && optionsPanel.classList.contains('visible')) {
                toggleDropdown();
            }
        });
    };

    // --- FINAL AJAX Form Submission Handler for Formsubmit.co ---
    const handleAjaxFormSubmit = (form) => {
        if (!form) return;

        const originalFormHTML = form.innerHTML;

        const attachSubmitListener = (formElement) => {
            formElement.addEventListener('submit', function (e) {
                e.preventDefault();

                const formData = new FormData(formElement);
                const submitButton = formElement.querySelector('button[type="submit"]');
                
                submitButton.innerHTML = 'Submitting...';
                submitButton.disabled = true;

                fetch(formElement.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' },
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    return response.json().then(errorData => {
                        throw new Error(errorData.error || 'Something went wrong. Please try again.');
                    });
                })
                .then(data => {
                    if (String(data.success).toLowerCase() === "true") {
                        formElement.innerHTML = `<div class="text-center py-10 flex flex-col items-center justify-center h-full"><svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><h3 class="text-2xl font-bold mt-4">Thank You!</h3><p class="mt-2 text-gray-600">Your message has been sent successfully. We will get back to you shortly.</p></div>`;
                    } else {
                        throw new Error(data.error || 'An unexpected error occurred.');
                    }
                })
                .catch(error => {
                    console.error('Submission Error:', error);
                    formElement.innerHTML = `<div class="text-center py-10 flex flex-col items-center justify-center h-full"><svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><h3 class="text-2xl font-bold mt-4">Submission Failed</h3><p class="mt-2 text-gray-600">${error.message}</p><button type="button" id="reset-form-btn" class="mt-6 bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-hover">Try Again</button></div>`;
                    
                    document.getElementById('reset-form-btn').addEventListener('click', () => {
                        formElement.innerHTML = originalFormHTML;
                        attachSubmitListener(formElement);
                    });
                });
            });
        };
        
        attachSubmitListener(form);
    };

    // --- Copy to Clipboard for Contact Page ---
    const copyAllBtn = document.getElementById('copy-all-btn');
    if (copyAllBtn) {
        const copyIcon = document.getElementById('copy-icon');
        const checkIcon = document.getElementById('check-icon');
        copyAllBtn.addEventListener('click', () => {
            const textToCopy = copyAllBtn.getAttribute('data-copy');
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyIcon.classList.add('hidden');
                checkIcon.classList.remove('hidden');
                setTimeout(() => {
                    checkIcon.classList.add('hidden');
                    copyIcon.classList.remove('hidden');
                }, 2000);
            });
        });
    }
    
    // --- Back to Top Button ---
    const backToTopButton = document.getElementById('back-to-top-btn');
    if (backToTopButton) {
        window.onscroll = () => {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                backToTopButton.style.display = 'block';
                backToTopButton.style.opacity = '1';
            } else {
                backToTopButton.style.opacity = '0';
                setTimeout(() => { if (window.scrollY < 100) backToTopButton.style.display = 'none'; }, 300);
            }
        };
        backToTopButton.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Dynamic Year in Footer ---
    const updateFooterYear = () => {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    };
    
    // --- FAQ Accordion ---
    document.querySelectorAll('.faq-item .faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling;
            const icon = button.querySelector('svg');
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !isExpanded);
            answer.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        });
    });

    // --- Insights Page: Search and Filter Logic ---
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articlesGrid = document.getElementById('articles-grid');
    if (searchInput && articlesGrid) {
        const articles = Array.from(articlesGrid.children).filter(el => el.classList.contains('article-card'));
        const noResultsMessage = document.getElementById('no-results-message');

        const filterArticles = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            let visibleCount = 0;

            articles.forEach(article => {
                const title = article.querySelector('h3 a').textContent.toLowerCase();
                const description = article.querySelector('p.article-card-description').textContent.toLowerCase();
                const category = article.dataset.category;

                const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
                const matchesFilter = activeFilter === 'all' || category === activeFilter;

                if (matchesSearch && matchesFilter) {
                    article.style.display = 'flex';
                    visibleCount++;
                } else {
                    article.style.display = 'none';
                }
            });
            noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        };

        searchInput.addEventListener('input', filterArticles);
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterArticles();
            });
        });
    }
    
    // --- Social Sharing on Article Pages ---
    const shareContainer = document.getElementById('social-share');
    if(shareContainer){
        const pageUrl = window.location.href;
        const pageTitle = encodeURIComponent(document.title);

        const emailLink = `mailto:?subject=${pageTitle}&body=Check out this article: ${pageUrl}`;
        const linkedInLink = `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${pageTitle}`;
        
        document.getElementById('share-email').href = emailLink;
        document.getElementById('share-linkedin').href = linkedInLink;
    }

    // --- INITIALIZE ALL DYNAMIC COMPONENTS ---
    loadComponent('_header.html', 'main-header');
    loadComponent('_footer.html', 'main-footer');
    document.querySelectorAll('.custom-select-wrapper').forEach(initializeCustomSelect);
    
    // Initialize AJAX form handlers
    handleAjaxFormSubmit(document.getElementById('contact-form'));
    handleAjaxFormSubmit(document.getElementById('careers-form'));
});
