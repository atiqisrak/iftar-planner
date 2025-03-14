document.addEventListener("DOMContentLoaded", () => {
  const customerNameInput = document.getElementById("customerName");
  const receiptNameSpan = document.getElementById("receiptName");
  const subtotalAmountSpan = document.getElementById("subtotalAmount");
  const totalAmountSpan = document.getElementById("totalAmount");
  const downloadBtn = document.getElementById("downloadBtn");
  const receiptItemsDiv = document.querySelector(".receipt-items");
  const items = document.querySelectorAll(".item");
  const MISC_CHARGE = 30; // Miscellaneous charge
  const MIN_ORDER = 100; // Minimum order amount

  // Initially disable download button
  downloadBtn.disabled = true;
  downloadBtn.title = "Please enter your name first";

  // Create and append selected items counter
  const selectedCounter = document.createElement("div");
  selectedCounter.className = "selected-counter";
  selectedCounter.innerHTML = "Selected Items: <span>0</span>";
  document
    .querySelector(".menu-items h2")
    .insertAdjacentElement("afterend", selectedCounter);

  // Add subtle animation to sparkles
  const sparkles = document.querySelector(".sparkles");
  setInterval(() => {
    sparkles.style.opacity = (Math.random() * 0.3 + 0.2).toString();
  }, 2000);

  // Show success message
  function showSuccessMessage(message) {
    const successMsg = document.createElement("div");
    successMsg.className = "success-message";
    successMsg.textContent = message;
    document.body.appendChild(successMsg);

    setTimeout(() => {
      successMsg.classList.add("show");
    }, 100);

    setTimeout(() => {
      successMsg.classList.remove("show");
      setTimeout(() => successMsg.remove(), 300);
    }, 3000);
  }

  // Update customer name in receipt and validate download button
  customerNameInput.addEventListener("input", (e) => {
    const name = e.target.value.trim();
    receiptNameSpan.textContent = name || "Guest";

    validateDownloadButton(name);
  });

  // Validate download button based on name and minimum order
  function validateDownloadButton(name) {
    const subtotal = parseFloat(subtotalAmountSpan.textContent) || 0;
    const hasMinOrder = subtotal >= MIN_ORDER;

    if (name && hasMinOrder) {
      downloadBtn.disabled = false;
      downloadBtn.title = "Download your receipt";
      customerNameInput.classList.remove("error");
    } else {
      downloadBtn.disabled = true;
      downloadBtn.title = !name
        ? "Please enter your name first"
        : `Minimum order amount is ৳${MIN_ORDER}`;
    }
  }

  // Calculate total and update receipt
  function updateReceipt() {
    let subtotal = 0;
    let selectedItems = 0;
    receiptItemsDiv.innerHTML = "";

    items.forEach((item) => {
      const checkbox = item.querySelector('input[type="checkbox"]');

      if (checkbox.checked) {
        selectedItems++;
        const itemName = checkbox.getAttribute("data-item");
        const price = parseFloat(checkbox.getAttribute("data-price"));

        subtotal += price;

        // Add item to receipt with animation
        const receiptItem = document.createElement("div");
        receiptItem.className = "receipt-item";
        receiptItem.style.opacity = "0";
        receiptItem.style.transform = "translateX(-10px)";
        receiptItem.innerHTML = `
          <span>${itemName}</span>
          <span>৳${price}</span>
        `;
        receiptItemsDiv.appendChild(receiptItem);

        // Animate the new item
        setTimeout(() => {
          receiptItem.style.transition = "all 0.3s ease";
          receiptItem.style.opacity = "1";
          receiptItem.style.transform = "translateX(0)";
        }, 50);
      }
    });

    // Update selected items counter
    selectedCounter.querySelector("span").textContent = selectedItems;

    // Update totals
    subtotalAmountSpan.textContent = subtotal;
    totalAmountSpan.textContent = subtotal + MISC_CHARGE;

    // Validate download button with current name
    validateDownloadButton(customerNameInput.value.trim());

    // Show minimum order warning if needed
    const minOrderWarning = document.querySelector(".min-order-warning");
    if (subtotal < MIN_ORDER) {
      if (!minOrderWarning) {
        const warning = document.createElement("div");
        warning.className = "min-order-warning";
        warning.textContent = `Minimum order amount is ৳${MIN_ORDER}`;
        receiptItemsDiv.parentElement.insertBefore(warning, receiptItemsDiv);
      }
    } else if (minOrderWarning) {
      minOrderWarning.remove();
    }
  }

  // Add event listeners to checkboxes with animation
  items.forEach((item) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener("change", (e) => {
      // Add selection animation
      if (e.target.checked) {
        item.classList.add("selected");
      } else {
        item.classList.remove("selected");
      }
      updateReceipt();
    });
  });

  // Function to ensure images are loaded
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Download receipt as image
  downloadBtn.addEventListener("click", async () => {
    const name = customerNameInput.value.trim();

    if (!name) {
      customerNameInput.classList.add("error");
      customerNameInput.focus();
      return;
    }

    // Show loading state
    const originalText = downloadBtn.innerHTML;
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `
      <svg class="spinner" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
      </svg>
      Generating...
    `;

    const receipt = document.getElementById("receipt");
    const originalStyles = {
      position: receipt.style.position,
      width: receipt.style.width,
      background: receipt.style.background,
      visibility: receipt.style.visibility,
      opacity: receipt.style.opacity,
      transform: receipt.style.transform,
    };

    try {
      // Add generating class to ensure proper rendering
      receipt.classList.add("generating");

      // Pre-load logo image
      const logoImg = receipt.querySelector(".logo-img");
      if (logoImg) {
        try {
          await new Promise((resolve) => {
            const checkImage = () => {
              if (logoImg.complete) {
                // Force dimensions even if image loaded
                logoImg.width = logoImg.width || 80;
                logoImg.height = logoImg.height || 80;
                resolve();
              } else {
                logoImg.onload = () => {
                  logoImg.width = logoImg.width || 80;
                  logoImg.height = logoImg.height || 80;
                  resolve();
                };
                logoImg.onerror = () => {
                  console.warn("Logo failed to load, using fallback");
                  // Ensure fallback dimensions
                  logoImg.width = 80;
                  logoImg.height = 80;
                  resolve();
                };
              }
            };
            checkImage();
          });
        } catch (err) {
          console.warn("Logo image handling error:", err);
          // Ensure dimensions even in error case
          logoImg.width = 80;
          logoImg.height = 80;
        }
      }

      // Force receipt to be visible and properly sized
      receipt.style.position = "relative";
      receipt.style.width = "500px";
      receipt.style.maxWidth = "100%";
      receipt.style.background = "#ffffff";
      receipt.style.visibility = "visible";
      receipt.style.opacity = "1";
      receipt.style.transform = "none";

      // Add current date and time to receipt
      const dateElement = document.createElement("p");
      dateElement.style.marginTop = "20px";
      dateElement.style.borderTop = "1px solid var(--border)";
      dateElement.style.paddingTop = "10px";
      dateElement.style.color = "var(--text-light)";
      dateElement.style.fontSize = "0.9rem";
      dateElement.textContent = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      receipt.appendChild(dateElement);

      // Wait for all styles and content to be applied
      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        // Direct canvas drawing approach - much simpler and more reliable
        const canvas = document.createElement("canvas");
        const width = 500;
        const height = receipt.offsetHeight || 600;
        canvas.width = width * 2; // Higher resolution
        canvas.height = height * 2;
        const ctx = canvas.getContext("2d");
        ctx.scale(2, 2); // Scale for higher resolution

        // Fill white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Basic styling
        ctx.font = "18px Poppins, sans-serif";
        ctx.fillStyle = "#333333";

        // Draw header
        ctx.font = "bold 22px Poppins, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Order Summary", width / 2, 40);

        // Draw customer name
        ctx.font = "16px Poppins, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Iftar Package by ${name}`, width / 2, 80);

        // Draw separator line
        ctx.beginPath();
        ctx.moveTo(40, 100);
        ctx.lineTo(width - 40, 100);
        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw items
        ctx.textAlign = "left";
        ctx.font = "14px Poppins, sans-serif";

        let y = 130;
        const items = document.querySelectorAll(".item input:checked");
        let subtotal = 0;

        items.forEach((item) => {
          const itemName = item.getAttribute("data-item");
          const price = parseFloat(item.getAttribute("data-price"));
          subtotal += price;

          ctx.fillText(itemName, 50, y);
          ctx.textAlign = "right";
          ctx.fillText(`৳${price}`, width - 50, y);
          ctx.textAlign = "left";

          y += 30;
        });

        // Draw separator line
        y += 10;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(width - 40, y);
        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw subtotal
        y += 30;
        ctx.fillText("Subtotal:", 50, y);
        ctx.textAlign = "right";
        ctx.fillText(`৳${subtotal}`, width - 50, y);

        // Draw misc charge
        y += 30;
        ctx.textAlign = "left";
        ctx.fillText("Miscellaneous Charge:", 50, y);
        ctx.textAlign = "right";
        ctx.fillText(`৳${MISC_CHARGE}`, width - 50, y);

        // Draw total
        y += 30;
        ctx.font = "bold 16px Poppins, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Total:", 50, y);
        ctx.textAlign = "right";
        ctx.fillText(`৳${subtotal + MISC_CHARGE}`, width - 50, y);

        // Draw date
        y += 50;
        ctx.font = "12px Poppins, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#777777";
        const dateStr = new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        ctx.fillText(dateStr, width / 2, y);

        // Create download link
        const link = document.createElement("a");
        link.download = `iftar-receipt-${name}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();

        showSuccessMessage("Receipt downloaded successfully! ✨");
      } catch (error) {
        console.error("Error generating receipt:", error);
        showSuccessMessage("Error generating receipt. Please try again.");
      } finally {
        // Restore button state
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
        receipt.classList.remove("generating");

        // Remove the date element if it still exists
        if (dateElement.parentNode === receipt) {
          receipt.removeChild(dateElement);
        }

        // Restore original styles
        Object.entries(originalStyles).forEach(([key, value]) => {
          if (value) {
            receipt.style[key] = value;
          } else {
            receipt.style.removeProperty(key);
          }
        });
      }
    } catch (error) {
      console.error("Error generating receipt:", error);
      showSuccessMessage("Error generating receipt. Please try again.");

      // Restore button state
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;
      receipt.classList.remove("generating");

      // Remove the date element if it still exists
      if (dateElement.parentNode === receipt) {
        receipt.removeChild(dateElement);
      }

      // Restore original styles
      Object.entries(originalStyles).forEach(([key, value]) => {
        if (value) {
          receipt.style[key] = value;
        } else {
          receipt.style.removeProperty(key);
        }
      });
    }
  });
});
