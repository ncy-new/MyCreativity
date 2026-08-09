document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 滚动监听高亮导航 (Scroll Spy)
    const sections = document.querySelectorAll('section, footer');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // 调整高亮触发区域
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 移除所有 active 类
                navLinks.forEach(link => link.classList.remove('active'));
                // 找到对应的导航项并添加 active 类
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // 2. 画廊横向滚动控制
    const galleries = document.querySelectorAll('.project-gallery');
    
    galleries.forEach(gallery => {
        const container = gallery.querySelector('.slider-container');
        const prevBtn = gallery.querySelector('.slider-btn.prev');
        const nextBtn = gallery.querySelector('.slider-btn.next');

        // 将鼠标滚轮的垂直滚动转化为横向滚动
        container.addEventListener('wheel', (e) => {
            // 如果是在左右滑动手势（触控板），则不干预
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            
            // 阻止默认的垂直滚动
            e.preventDefault();
            // 横向滚动
            container.scrollLeft += e.deltaY;
        }, { passive: false });

        // 点击按钮滚动
        const scrollAmount = 600; // 每次滚动的像素值
        
        if(prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
            
            nextBtn.addEventListener('click', () => {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
    });

    // 3. 全屏放大镜 (Lightbox) 逻辑
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxMeta = lightbox.querySelector('.lightbox-meta');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-btn.prev');
    const lightboxNext = lightbox.querySelector('.lightbox-btn.next');
    
    // 收集所有需要放大的图片
    const allImages = Array.from(document.querySelectorAll('.slider-container img'));
    let currentImageIndex = 0;

    // 打开 Lightbox
    function openLightbox(index) {
        if (index < 0 || index >= allImages.length) return;
        currentImageIndex = index;
        const img = allImages[currentImageIndex];
        
        lightboxImg.src = img.src;
        lightboxMeta.textContent = img.getAttribute('data-meta') || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // 禁止背景滚动
    }

    // 关闭 Lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxImg.src = '';
            lightboxMeta.textContent = '';
        }, 300);
    }

    // 切换图片
    function showPrevImage() {
        if (currentImageIndex > 0) {
            openLightbox(currentImageIndex - 1);
        } else {
            // 循环到最后一张
            openLightbox(allImages.length - 1);
        }
    }

    function showNextImage() {
        if (currentImageIndex < allImages.length - 1) {
            openLightbox(currentImageIndex + 1);
        } else {
            // 循环到第一张
            openLightbox(0);
        }
    }

    // 绑定图片点击事件
    allImages.forEach((img, index) => {
        img.addEventListener('click', () => openLightbox(index));
    });

    // 绑定 Lightbox 按钮事件
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止冒泡到 lightbox 触发关闭
        showPrevImage();
    });
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });

    // 点击背景关闭
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxImg) {
            closeLightbox();
        }
    });

    // 键盘事件支持
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
    });
});