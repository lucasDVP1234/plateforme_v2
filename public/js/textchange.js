document.addEventListener("DOMContentLoaded", () => {
    const dynamicText = document.getElementById("dynamic-text");
    const phrases = [
      "votre e-commerce",
      "votre startup",
      "votre application",
      "générer vos leads",
      "votre entreprise",
    ];
    let currentPhraseIndex = 0;
    const intervalTime = 3000; // 3 seconds
  
    function changePhrase() {
      // Add fade-out class
      dynamicText.classList.add("fade-out");
  
      // After fade-out completes, change the text and fade back in
      setTimeout(() => {
        // Update the text content
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        dynamicText.textContent = phrases[currentPhraseIndex];
  
        // Remove fade-out and add fade-in
        dynamicText.classList.remove("fade-out");
        dynamicText.classList.add("fade-in");
  
        // Remove fade-in class after animation completes
        setTimeout(() => {
          dynamicText.classList.remove("fade-in");
        }, 500); // Duration of fade-in animation
      }, 500); // Duration of fade-out animation
    }
  
    // Initial call
    setInterval(changePhrase, intervalTime);
  });
  