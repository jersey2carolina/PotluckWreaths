document.addEventListener('DOMContentLoaded', function() {
    var dropdown = document.getElementById('categoriesDropdown');
    if (dropdown) {
        dropdown.addEventListener('change', function() {
            if (dropdown.value === 'wreaths') {
                window.location.href = 'wreaths.html';
            } else if (dropdown.value === 'custom') {
                window.location.href = 'customorder.html';
            }
        });
    }
});
