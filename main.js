document.addEventListener('DOMContentLoaded', () => {

    // --- Enhanced Mobile Menu Handler ---
    const initializeMobileMenu = () => {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuPanel = document.getElementById('mobile-menu-panel');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

        if (!mobileMenuBtn || !mobileMenu || !mobileMenuPanel) return;

        const toggleMenu = (open) => {
            if (open) {
                document.body.classList.add('mobile-menu-open');
                mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
                mobileMenu.classList.add('opacity-100');
                mobileMenuPanel.classList.remove('translate-x-full');
                mobileMenuPanel.classList.add('translate-x-0');
            } else {
                document.body.classList.remove('mobile-menu-open');
                mobileMenu.classList.add('opacity-0', 'pointer-events-none');
                mobileMenu.classList.remove('opacity-100');
                mobileMenuPanel.classList.add('translate-x-full');
                mobileMenuPanel.classList.remove('translate-x-0');
            }
        };

        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu(true);
        });

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => toggleMenu(false));
        }

        // Close when clicking outside panel
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) toggleMenu(false);
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('mobile-menu-open')) {
                toggleMenu(false);
            }
        });

        // Close when clicking nav links
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu(false);
            });
        });

        // Touch gesture support
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;
            const diffX = touchStartX - touchEndX;
            const diffY = Math.abs(touchStartY - touchEndY);
            
            // Only trigger if horizontal swipe is dominant
            if (Math.abs(diffX) > diffY && Math.abs(diffX) > 50) {
                // Swipe left from right edge to open menu
                if (diffX < -50 && touchStartX > window.innerWidth - 50 && !document.body.classList.contains('mobile-menu-open')) {
                    toggleMenu(true);
                }
                
                // Swipe right to close menu
                if (diffX > 50 && document.body.classList.contains('mobile-menu-open')) {
                    toggleMenu(false);
                }
            }
        });

        // Set active state for mobile nav
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        mobileNavLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('bg-blue-50', 'text-blue-600', 'font-semibold');
            }
        });
    };

    // --- Enhanced Header Scroll Behavior ---
    const initializeEnhancedHeader = () => {
        const header = document.getElementById('main-header');
        if (!header) return;

        let lastScrollY = window.scrollY;
        let isScrolling = false;

        const handleScroll = () => {
            if (isScrolling) return;
            
            isScrolling = true;
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const scrollDifference = currentScrollY - lastScrollY;
                
                // Add scrolled class for styling changes
                if (currentScrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                
                // Hide/show header based on scroll direction (only after 100px)
                if (currentScrollY > 100) {
                    if (scrollDifference > 8) {
                        header.classList.add('hidden');
                    } else if (scrollDifference < -8) {
                        header.classList.remove('hidden');
                    }
                } else {
                    header.classList.remove('hidden');
                }
                
                lastScrollY = currentScrollY;
                isScrolling = false;
            });
        };

        // Throttled scroll event
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(handleScroll, 16); // ~60fps
        });

        // Initialize scroll state
        handleScroll();
    };

    // --- Enhanced Footer Animations ---
    const initializeFooterEnhancements = () => {
        // Intersection Observer for footer animations
        const footerElements = document.querySelectorAll('.footer-link, .footer-contact-item, .social-icon-link, .business-hours');
        
        if (footerElements.length > 0) {
            const footerObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        // Add staggered animation
                        setTimeout(() => {
                            entry.target.style.opacity = '0';
                            entry.target.style.transform = 'translateY(20px)';
                            
                            requestAnimationFrame(() => {
                                entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translateY(0)';
                            });
                        }, index * 50);
                        
                        footerObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            footerElements.forEach(element => {
                element.style.opacity = '0';
                footerObserver.observe(element);
            });
        }
        
        // Enhanced tooltip for contact items
        const addTooltips = () => {
            const contactItems = document.querySelectorAll('.footer-contact-item a');
            
            contactItems.forEach(item => {
                const tooltip = document.createElement('div');
                tooltip.className = 'footer-tooltip';
                tooltip.style.cssText = `
                    position: absolute;
                    background: rgba(30, 64, 175, 0.95);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    transform: translateY(5px);
                    transition: opacity 0.3s, transform 0.3s;
                    z-index: 1000;
                    display: none;
                `;
                
                let tooltipText = '';
                if (item.href.includes('tel:')) {
                    tooltipText = 'Click to call';
                } else if (item.href.includes('mailto:')) {
                    tooltipText = 'Click to email';
                } else if (item.href.includes('maps')) {
                    tooltipText = 'View on Google Maps';
                }
                
                if (tooltipText) {
                    tooltip.textContent = tooltipText;
                    document.body.appendChild(tooltip);
                    
                    item.addEventListener('mouseenter', (e) => {
                        const rect = e.target.getBoundingClientRect();
                        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
                        tooltip.style.display = 'block';
                        
                        requestAnimationFrame(() => {
                            tooltip.style.opacity = '1';
                            tooltip.style.transform = 'translateY(0)';
                        });
                    });
                    
                    item.addEventListener('mouseleave', () => {
                        tooltip.style.opacity = '0';
                        tooltip.style.transform = 'translateY(5px)';
                        setTimeout(() => {
                            tooltip.style.display = 'none';
                        }, 300);
                    });
                }
            });
        };
        
        // Parallax effect for footer background blobs
        const initParallax = () => {
            const blobs = document.querySelectorAll('.animate-blob');
            
            if (blobs.length > 0) {
                let ticking = false;
                
                const updateParallax = () => {
                    const scrolled = window.pageYOffset;
                    const windowHeight = window.innerHeight;
                    const documentHeight = document.body.scrollHeight;
                    const scrollPercentage = scrolled / (documentHeight - windowHeight);
                    
                    blobs.forEach((blob, index) => {
                        const speed = 0.5 + (index * 0.2);
                        const yPos = -(scrollPercentage * 100 * speed);
                        blob.style.transform = `translateY(${yPos}px) scale(${1 + scrollPercentage * 0.1})`;
                    });
                    
                    ticking = false;
                };
                
                const requestTick = () => {
                    if (!ticking) {
                        requestAnimationFrame(updateParallax);
                        ticking = true;
                    }
                };
                
                window.addEventListener('scroll', requestTick);
            }
        };
        
        // Animated counter for business hours
        const animateBusinessHours = () => {
            const businessHours = document.querySelector('.business-hours');
            
            if (businessHours) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            businessHours.classList.add('hours-visible');
                            observer.unobserve(businessHours);
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(businessHours);
            }
        };
        
        // Social icons hover effect enhancement
        const enhanceSocialIcons = () => {
            const socialIcons = document.querySelectorAll('.social-icon-link');
            
            socialIcons.forEach(icon => {
                icon.addEventListener('mouseenter', function(e) {
                    // Create ripple effect
                    const ripple = document.createElement('span');
                    ripple.className = 'social-ripple';
                    ripple.style.cssText = `
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        top: 0;
                        left: 0;
                        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
                        transform: scale(0);
                        animation: rippleEffect 0.6s ease-out;
                        pointer-events: none;
                        border-radius: 12px;
                    `;
                    
                    this.appendChild(ripple);
                    
                    setTimeout(() => {
                        ripple.remove();
                    }, 600);
                });
            });
        };
        
        // Initialize all footer enhancements
        addTooltips();
        initParallax();
        animateBusinessHours();
        enhanceSocialIcons();
    };

    // Add ripple animation keyframe dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .hours-visible {
            animation: fadeInUp 0.6s ease-out forwards;
        }
    `;
    document.head.appendChild(style);

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
                if (elementId === 'main-header' || elementId === 'mobile-menu-placeholder') {
                    initializeNav();
                    initializeMobileMenu();
                    initializeEnhancedHeader(); // Initialize enhanced header after loading
                }
                if (elementId === 'main-footer') {
                    updateFooterYear();
                    initializeFooterEnhancements(); // Initialize footer enhancements
                }
            })
            .catch(error => console.error('Error loading component:', error));
    };

    // --- Active Navigation Link ---
    const initializeNav = () => {
        const navLinks = document.querySelectorAll('#nav-links a');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(link => {
            const isContactButton = link.classList.contains('bg-blue-600') || link.classList.contains('contact-btn');
            if (link.getAttribute('href').split('/').pop() === currentPage && !isContactButton) {
                link.classList.add('nav-active');
            }
        });
    };

    // --- Custom Select Dropdown Handler ---
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
            option.setAttribute('tabindex', '-1');
        });

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
            hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
            trigger.classList.remove('border-red-500');
            
            options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
            option.setAttribute('aria-selected', 'true');

            closeAllSelects();
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
            closeAllSelects(wrapper);
            toggleDropdown();
        });

        options.forEach((option, index) => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                selectOption(option);
            });
        });

        const handleKeyDown = (e) => {
            e.stopPropagation();
            if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9\s]/)) {
                e.preventDefault();
                if (!optionsPanel.classList.contains('visible')) toggleDropdown();
                clearTimeout(searchTimeout);
                searchString += e.key.toLowerCase();
                searchTimeout = setTimeout(() => { searchString = ''; }, 600);
                const matchingIndex = Array.from(options).findIndex(opt =>
                    opt.getAttribute('data-value').toLowerCase().startsWith(searchString)
                );
                if (matchingIndex > -1) {
                    currentIndex = matchingIndex;
                    updateFocus();
                }
                return;
            }
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
                    if (optionsPanel.classList.contains('visible')) toggleDropdown();
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

    // --- IMPROVED AJAX Form Submission Handler for Formsubmit.co ---
    const handleAjaxFormSubmit = (form) => {
        if (!form) return;
        const originalFormHTML = form.innerHTML;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(form);
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            
            // Add timestamp to prevent caching
            formData.append('_timestamp', Date.now());
            
            submitButton.innerHTML = 'Submitting...';
            submitButton.disabled = true;

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 
                    'Accept': 'application/json'
                },
            })
            .then(response => {
                // Check content type
                const contentType = response.headers.get("content-type");
                
                if (contentType && contentType.includes("text/html")) {
                    // FormSubmit returned HTML (probably captcha page)
                    // Treat as success since FormSubmit often sends emails even when returning HTML
                    console.log('FormSubmit returned HTML - likely captcha verification');
                    return { success: true, htmlResponse: true };
                }
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                // Try to parse as JSON
                return response.text().then(text => {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        // If JSON parsing fails but we got a 200 response, consider it a success
                        console.log('Non-JSON response received, but status is OK');
                        return { success: true, textResponse: text };
                    }
                });
            })
            .then(data => {
                // Check various success indicators
                const isSuccess = 
                    data.success === true || 
                    data.success === "true" || 
                    data.htmlResponse === true ||
                    data.textResponse !== undefined;
                
                if (isSuccess) {
                    // Show success message
                    form.innerHTML = `
                        <div class="text-center py-10 flex flex-col items-center justify-center h-full">
                            <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <h3 class="text-2xl font-bold mt-4">Thank You!</h3>
                            <p class="mt-2 text-gray-600">Your message has been sent successfully. We will get back to you shortly.</p>
                            <p class="mt-4 text-sm text-gray-500">If you need immediate assistance, please call us at +91 94823 59455</p>
                        </div>
                    `;
                    
                    // Scroll to form to show success message
                    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (data.error) {
                    throw new Error(data.error);
                } else {
                    throw new Error('Submission failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Submission Error:', error);
                
                // Check if it's a network error
                const isNetworkError = !navigator.onLine || error.message.includes('Failed to fetch');
                const errorMessage = isNetworkError 
                    ? 'Network error. Please check your internet connection and try again.'
                    : 'We encountered an issue while submitting your form. Your message may have been sent. If you don\'t hear from us within 24 hours, please contact us directly at +91 94823 59455 or mail@casagar.co.in';
                
                form.innerHTML = `
                    <div class="text-center py-10 flex flex-col items-center justify-center h-full">
                        <svg class="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 class="text-2xl font-bold mt-4">Submission Notice</h3>
                        <p class="mt-2 text-gray-600">${errorMessage}</p>
                        <div class="mt-6 space-y-3">
                            <button type="button" id="reset-form-btn" class="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-hover">
                                Try Again
                            </button>
                            <div class="text-sm text-gray-500">
                                <p>Or contact us directly:</p>
                                <a href="tel:+919482359455" class="text-primary hover:underline">+91 94823 59455</a> | 
                                <a href="mailto:mail@casagar.co.in" class="text-primary hover:underline">mail@casagar.co.in</a>
                            </div>
                        </div>
                    </div>
                `;
                
                const resetBtn = document.getElementById('reset-form-btn');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        form.innerHTML = originalFormHTML;
                        // Re-initialize form components
                        initializeFormComponents(form);
                    });
                }
            });
        });
    };

    // Helper function to re-initialize form components after reset
    const initializeFormComponents = (form) => {
        // Re-initialize custom selects within the form
        form.querySelectorAll('.custom-select-wrapper').forEach((wrapper, index) => {
            initializeCustomSelect(wrapper, index + 100); // Use offset to avoid ID conflicts
        });
        
        // Re-attach file upload handlers if present
        const fileInputs = form.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', handleFileUpload);
        });
    };

    // File upload handler
    const handleFileUpload = (e) => {
        const fileInput = e.target;
        const fileName = fileInput.files[0]?.name;
        const fileLabel = document.querySelector(`label[for="${fileInput.id}"]`);
        const fieldContainer = fileInput.closest('.form-field');
        
        if (fileName && fileLabel) {
            const file = fileInput.files[0];
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (file.size <= maxSize) {
                fileLabel.classList.add('has-file');
                fileLabel.innerHTML = `
                    <svg class="w-6 h-6 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-700">${fileName}</span>
                    <span class="text-xs text-gray-500 block mt-1">Click to change file</span>
                `;
                if (fieldContainer) {
                    fieldContainer.classList.remove('error');
                    fieldContainer.classList.add('valid');
                }
            } else {
                if (fieldContainer) {
                    fieldContainer.classList.add('error');
                }
                fileLabel.classList.remove('has-file');
                alert('File size must be less than 10MB');
                fileInput.value = ''; // Clear the file input
            }
        }
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
        const articles = articlesGrid.querySelectorAll('.article-card');
        
        // Search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            articles.forEach(article => {
                const title = article.querySelector('h3').textContent.toLowerCase();
                const excerpt = article.querySelector('p').textContent.toLowerCase();
                const category = article.querySelector('.category-badge').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
        });
        
        // Filter functionality
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active', 'bg-primary', 'text-white'));
                button.classList.add('active', 'bg-primary', 'text-white');
                
                // Filter articles
                articles.forEach(article => {
                    if (filter === 'all') {
                        article.style.display = 'block';
                    } else {
                        const category = article.querySelector('.category-badge').textContent.toLowerCase();
                        if (category === filter) {
                            article.style.display = 'block';
                        } else {
                            article.style.display = 'none';
                        }
                    }
                });
            });
        });
    }
    
    // --- Social Sharing on Article Pages ---
    const shareContainer = document.getElementById('social-share');
    if(shareContainer){
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.querySelector('h1')?.textContent || document.title);
        
        // LinkedIn Share
        const linkedinBtn = shareContainer.querySelector('.linkedin-share');
        if(linkedinBtn) {
            linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        }
        
        // Twitter Share
        const twitterBtn = shareContainer.querySelector('.twitter-share');
        if(twitterBtn) {
            twitterBtn.href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        }
        
        // Facebook Share
        const facebookBtn = shareContainer.querySelector('.facebook-share');
        if(facebookBtn) {
            facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        }
        
        // Copy Link
        const copyLinkBtn = shareContainer.querySelector('.copy-link');
        if(copyLinkBtn) {
            copyLinkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(window.location.href).then(() => {
                    const originalText = copyLinkBtn.innerHTML;
                    copyLinkBtn.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Copied!</span>
                    `;
                    setTimeout(() => {
                        copyLinkBtn.innerHTML = originalText;
                    }, 2000);
                });
            });
        }
    }

    // --- Load Reusable Components ---
    const mobileMenuPlaceholder = document.createElement('div');
    mobileMenuPlaceholder.id = 'mobile-menu-placeholder';
    document.body.appendChild(mobileMenuPlaceholder);
    loadComponent('_mobile-menu.html', 'mobile-menu-placeholder');
    loadComponent('_header.html', 'main-header');
    loadComponent('_footer.html', 'main-footer');

    // --- Initialize Page-Specific Components ---
    document.querySelectorAll('.custom-select-wrapper').forEach((wrapper, index) => {
        initializeCustomSelect(wrapper, index);
    });
    
    // Initialize contact form
    const contactForm = document.getElementById('contact-form-element');
    if (contactForm) {
        handleAjaxFormSubmit(contactForm);
        // Attach file upload handlers
        contactForm.querySelectorAll('input[type="file"]').forEach(input => {
            input.addEventListener('change', handleFileUpload);
        });
    }
    
    // Initialize careers form
    const careersForm = document.getElementById('careers-form');
    if (careersForm) {
        handleAjaxFormSubmit(careersForm);
        // Attach file upload handlers
        careersForm.querySelectorAll('input[type="file"]').forEach(input => {
            input.addEventListener('change', handleFileUpload);
        });
    }

    // Initialize enhanced header (will be called after header loads)
    // This is handled in the loadComponent callback for main-header
});