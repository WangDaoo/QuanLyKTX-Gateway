/**
 * Admin Common Scripts
 * Xử lý các logic chung cho tất cả trang admin
 */

// Đảm bảo sidebar luôn scroll về đầu khi load trang
function fixSidebarScroll() {
    // Đợi DOM load xong rồi mới scroll
    setTimeout(() => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            // Scroll sidebar về đầu
            sidebar.scrollTop = 0;
            // Ngăn auto-scroll behavior
            sidebar.style.scrollBehavior = 'auto';
        }
        
        // Scroll main content về đầu
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 100);
}

// Đảm bảo thẻ "Đổi mật khẩu" luôn hiển thị trong viewport
function ensureChangePasswordVisible() {
    setTimeout(() => {
        const changePasswordLink = document.querySelector('a[href="change-password.html"]');
        if (changePasswordLink) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                // Kiểm tra xem thẻ có trong viewport không
                const linkRect = changePasswordLink.getBoundingClientRect();
                const sidebarRect = sidebar.getBoundingClientRect();
                
                // Nếu thẻ nằm ngoài viewport, scroll để hiển thị
                if (linkRect.top < sidebarRect.top || linkRect.bottom > sidebarRect.bottom) {
                    changePasswordLink.scrollIntoView({ behavior: 'instant', block: 'nearest' });
                }
            }
        }
    }, 150);
}

// Khởi tạo khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    fixSidebarScroll();
    ensureChangePasswordVisible();
});

// Cũng chạy khi trang load hoàn toàn
window.addEventListener('load', () => {
    fixSidebarScroll();
    ensureChangePasswordVisible();
});

