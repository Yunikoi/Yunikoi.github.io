/**
 * Created by Xiaotao.Nie on 09/04/2018.
 * Refactored & Enhanced for Chinese/Japanese TOC Support by Gemini on 03/30/2026.
 * All right reserved.
 */

(function () {
    // === 1. 基础工具函数 ===
    function getDistanceOfLeft(obj) {
        let left = 0, top = 0;
        while (obj) {
            left += obj.offsetLeft;
            top += obj.offsetTop;
            obj = obj.offsetParent;
        }
        return { left, top };
    }

    function reHeightToc() {
        const toc = document.getElementById('toc');
        if (toc) {
            toc.style.maxHeight = (document.documentElement.clientHeight - 350) + 'px';
            toc.style.overflowY = 'auto';
        }
    }

    // === 2. 侧边栏/目录高亮与固定逻辑 ===
    const toc = document.getElementById('toc');
    let tocToTop = toc ? getDistanceOfLeft(toc).top : 0;

    function reLayout() {
        const scrollToTop = document.documentElement.scrollTop || window.pageYOffset;
        if (tocToTop === 0 && toc) tocToTop = getDistanceOfLeft(toc).top;

        if (toc) {
            if (tocToTop <= scrollToTop + 10) toc.classList.add('toc-fixed');
            else toc.classList.remove('toc-fixed');
        }

        // 自动激活当前阅读位置的目录项
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        let currentId = "";
        headings.forEach(heading => {
            const top = getDistanceOfLeft(heading).top;
            if (scrollToTop >= top - 120) {
                currentId = heading.id;
            }
        });

        if (currentId) {
            const allLinks = document.querySelectorAll('#toc a');
            allLinks.forEach(link => {
                const href = link.getAttribute('href').slice(1);
                try {
                    if (decodeURIComponent(href) === decodeURIComponent(currentId)) {
                        link.parentElement.classList.add('active');
                    } else {
                        link.parentElement.classList.remove('active');
                    }
                } catch(e) {
                    if (href === currentId) link.parentElement.classList.add('active');
                }
            });
        }
    }

    // === 3. 核心修复：极致灵敏的锚点跳转补丁 (去弹窗版) ===
    document.addEventListener('click', function (e) {
        // 使用 closest 确保点到 span 也能触发 a 的跳转
        const anchor = e.target.closest('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
            const rawId = href.slice(1);
            let decodedId;
            try {
                decodedId = decodeURIComponent(rawId);
            } catch (err) {
                decodedId = rawId;
            }

            // 多重兼容性查找
            const targetElement = document.getElementById(decodedId) ||
                document.getElementById(rawId) ||
                document.querySelector(`[id="${decodedId}"]`);

            if (targetElement) {
                e.preventDefault();
                e.stopPropagation();

                const targetTop = getDistanceOfLeft(targetElement).top;

                // 执行平滑滚动，并预留 80px 空间防止标题被 Header 遮挡
                window.scrollTo({
                    top: targetTop - 80,
                    behavior: 'smooth'
                });

                // 更新地址栏 Hash 记录历史，方便回退
                if (history.pushState) history.pushState(null, null, '#' + rawId);
            }
        }
    }, true);

    // === 4. 移动端导航切换 ===
    const navToggle = document.getElementById('site-nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const aboutContent = document.getElementById('nav-content');
            if (aboutContent) {
                aboutContent.classList.toggle('show-block');
                aboutContent.classList.toggle('hide-block');
            }
        });
    }

    // === 5. 初始化与全局监听 ===
    window.addEventListener('scroll', reLayout);
    window.addEventListener('resize', () => {
        reHeightToc();
        if (window.innerWidth > 680) {
            const content = document.getElementById('nav-content');
            if (content) content.classList.remove('show-block', 'hide-block');
        }
    });

    // 页面加载完成后立即执行一次
    reHeightToc();
    reLayout();

    // 仅在控制台留痕，不弹窗
    console.log("AirCloud Theme Engine: Chinese/Japanese TOC patch initialized.");
})();