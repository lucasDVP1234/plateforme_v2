document.addEventListener('DOMContentLoaded', () => {
    const portfolioImages = document.querySelectorAll('.portfolio-image');
    const imageOverlay = document.getElementById('image-overlay');
    const enlargedImage = document.getElementById('enlarged-image');
    const overlayCloseButton = document.getElementById('overlay-close');

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    portfolioImages.forEach((img) => {
        if (isTouchDevice) {
            // Use click events on touch devices
            img.addEventListener('click', () => {
                const imageUrl = img.getAttribute('data-image-url');
                enlargedImage.src = imageUrl;
                imageOverlay.classList.remove('hidden');
            });
        } else {
            // Use hover events on non-touch devices
            img.addEventListener('mouseenter', () => {
                const imageUrl = img.getAttribute('data-image-url');
                enlargedImage.src = imageUrl;
                imageOverlay.classList.remove('hidden');
            });

            img.addEventListener('mouseleave', () => {
                // Delay hiding the overlay to allow for moving between images
                setTimeout(() => {
                    if (!imageOverlay.matches(':hover')) {
                        imageOverlay.classList.add('hidden');
                    }
                }, 100);
            });
        }
    });

    // Hide the overlay when the mouse leaves the overlay area
    if (!isTouchDevice) {
        imageOverlay.addEventListener('mouseleave', () => {
            imageOverlay.classList.add('hidden');
        });
    }

    // Close button event listener
    overlayCloseButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the click from bubbling up to the overlay
        imageOverlay.classList.add('hidden');
    });

    // Hide the overlay when clicked (for touch devices)
    imageOverlay.addEventListener('click', () => {
        imageOverlay.classList.add('hidden');
    });
});
