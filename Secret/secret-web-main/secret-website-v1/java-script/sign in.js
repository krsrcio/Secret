document.addEventListener('DOMContentLoaded', function () {
    const passwordInputs = document.querySelectorAll('.input[type="password"]');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    togglePasswordButtons.forEach(function(toggleButton, index) {
        toggleButton.addEventListener('click', function () {
            const type = passwordInputs[index].getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInputs[index].setAttribute('type', type);
            this.textContent = type === 'password' ? 'Show' : 'Hide';
        });
    });

    const form = document.querySelector('form');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); 
        
        if (form.checkValidity()) {
            window.location.href = "secret.html"; 
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === "Enter") {
            const focusedElement = document.activeElement;
            if (focusedElement.tagName === 'INPUT' && focusedElement.type !== 'submit') {
                form.submit();
            }
        }
    });
});
