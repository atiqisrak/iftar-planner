document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const form = document.getElementById("invitationForm");
  const nameInput = document.getElementById("nameInput");
  const invitationCard = document.getElementById("invitationCard");
  const guestNameSpan = document.getElementById("guestName");
  const downloadBtn = document.getElementById("downloadBtn");
  const pasteBtn = document.getElementById("pasteBtn");

  // Check if all required elements exist
  if (
    !form ||
    !nameInput ||
    !invitationCard ||
    !guestNameSpan ||
    !downloadBtn ||
    !pasteBtn
  ) {
    console.error("Required elements not found");
    return;
  }

  // Initially hide the invitation card
  invitationCard.style.display = "none";
  downloadBtn.style.display = "none";

  // Handle paste button click
  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      nameInput.value = text.trim();
      nameInput.focus();
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = nameInput.value.trim();

    if (name) {
      // Update guest name in the card
      guestNameSpan.textContent = name;

      // Show the invitation card and download button
      invitationCard.style.display = "block";
      downloadBtn.style.display = "block";

      // Scroll to the card
      invitationCard.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Remove error class when user starts typing
  nameInput.addEventListener("input", () => {
    nameInput.classList.remove("error");
  });

  // Handle download button click
  downloadBtn.addEventListener("click", function () {
    // Hide download button temporarily for the screenshot
    downloadBtn.style.display = "none";

    html2canvas(invitationCard, {
      scale: 2,
      backgroundColor: "#0A4D3C",
      logging: false,
    })
      .then((canvas) => {
        // Show download button again
        downloadBtn.style.display = "block";

        // Create download link
        const link = document.createElement("a");
        link.download = `Ramadan_Iftar_Invitation_${nameInput.value.trim()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch((error) => {
        console.error("Error generating invitation:", error);
        downloadBtn.style.display = "block";
      });
  });
});
