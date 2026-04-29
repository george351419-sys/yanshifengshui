document.addEventListener('DOMContentLoaded', function() {
    headerScrollEffect();
    mobileMenuToggle();
    smoothScrollToSection();
    animateOnScroll();
    initBookingForm();
});

function headerScrollEffect() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function mobileMenuToggle() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', function() {
        menuBtn.classList.toggle('active');
        nav.classList.toggle('active');
    });

    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', function() {
            menuBtn.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

function smoothScrollToSection() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function animateOnScroll() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

function initBookingForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    const preferredDateInput = document.getElementById('preferredDate');
    if (preferredDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        preferredDateInput.value = tomorrowStr;
        preferredDateInput.min = tomorrowStr;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!validateBookingForm()) {
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '提交中...';
        submitBtn.disabled = true;

        setTimeout(() => {
            const formData = new FormData(form);
            const name = formData.get('name') || '';
            sendBookingEmail(formData);
            showSuccessMessage('预约成功！我们将尽快与您联系确认预约详情。');
            form.reset();
            
            const preferredDateInput = document.getElementById('preferredDate');
            if (preferredDateInput) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                preferredDateInput.value = tomorrow.toISOString().split('T')[0];
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.parentElement.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateBookingForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return false;

    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    const phone = form.querySelector('input[name="phone"]');
    if (phone && phone.value) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone.value)) {
            setFieldError(phone, '请输入正确的手机号码');
            isValid = false;
        }
    }

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;

    if (field.hasAttribute('required') && !value) {
        setFieldError(field, '此项为必填项');
        return false;
    }

    if (fieldName === 'phone' && value) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(value)) {
            setFieldError(field, '请输入正确的手机号码');
            return false;
        }
    }

    clearFieldError(field);
    return true;
}

function setFieldError(field, message) {
    const formGroup = field.parentElement;
    formGroup.classList.add('error');

    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function clearFieldError(field) {
    const formGroup = field.parentElement;
    formGroup.classList.remove('error');

    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 40px; border-radius: 8px; text-align: center; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <div style="font-size: 48px; color: #D4AF37; margin-bottom: 20px;">✓</div>
                <h3 style="color: #8B0000; margin-bottom: 15px; font-size: 20px;">提交成功</h3>
                <p style="color: #666; line-height: 1.6;">${message}</p>
            </div>
        </div>
    `;
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function sendBookingEmail(formData) {
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch('/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data).toString()
    })
    .then(response => response.json())
    .then(result => {
        console.log('邮件发送结果:', result);
    })
    .catch(error => {
        console.error('邮件发送失败:', error);
    });
}

window.addEventListener('scroll', function() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll:not(.visible)');
    animatedElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            element.classList.add('visible');
        }
    });
});
