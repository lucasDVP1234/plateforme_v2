const basketOverlay = document.getElementById('basket-overlay');
const basketPanel = document.getElementById('basket-panel');
  
document.getElementById('basket-button').addEventListener('click', function () {
    basketOverlay.classList.remove('hidden');
    setTimeout(function() {
    basketPanel.classList.remove('translate-x-full');
    }, 10);
});


function closeBasket() {
    basketPanel.classList.add('translate-x-full');
    setTimeout(function() {
    basketOverlay.classList.add('hidden');
    }, 300);
}

document.getElementById('close-basket').addEventListener('click', function () {
    closeBasket();
});

// Close overlay when clicking outside the panel
basketOverlay.addEventListener('click', function (e) {
    if (e.target === basketOverlay) {
    closeBasket();
    }
});