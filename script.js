/* ==========================================================================
   KOST SALATIGA - INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initRatingStars();
  initToastContainer();
});

// --------------------------------------------------------------------------
// 1. PENCARIAN REAL-TIME & HIGHLIGHT TEXT (BERANDA)
// --------------------------------------------------------------------------
function cariKost() {
  const inputEl = document.getElementById("searchInput");
  if (!inputEl) return;

  const input = inputEl.value.trim().toLowerCase();
  const cards = document.querySelectorAll(".kost-card");
  let matchCount = 0;

  cards.forEach((card) => {
    const titleElement = card.querySelector(".kost-title");
    if (!titleElement) return;

    const originalTitle = titleElement.getAttribute("data-original") || titleElement.innerText;
    
    if (!titleElement.getAttribute("data-original")) {
      titleElement.setAttribute("data-original", originalTitle);
    }

    const cardData = (card.getAttribute("data-title") || "") + " " + originalTitle.toLowerCase();

    if (input === "" || cardData.toLowerCase().includes(input)) {
      card.style.display = "flex";
      card.style.animation = "fadeIn 0.4s ease";
      matchCount++;

      if (input !== "") {
        const regex = new RegExp(`(${escapeRegExp(input)})`, "gi");
        titleElement.innerHTML = originalTitle.replace(regex, `<mark class="highlight">$1</mark>`);
      } else {
        titleElement.innerText = originalTitle;
      }
    } else {
      card.style.display = "none";
      titleElement.innerText = originalTitle;
    }
  });

  let noResultEl = document.getElementById("noResults");
  const listEl = document.getElementById("kostList");
  if (!listEl) return;

  if (matchCount === 0) {
    if (!noResultEl) {
      noResultEl = document.createElement("div");
      noResultEl.id = "noResults";
      noResultEl.className = "no-results-msg";
      noResultEl.innerHTML = `🔍 <strong>Kost tidak ditemukan.</strong><br><small>Coba gunakan kata kunci lain seperti "Blotongan", "Putri", atau "500.000".</small>`;
      listEl.appendChild(noResultEl);
    }
  } else if (noResultEl) {
    noResultEl.remove();
  }
}

// --------------------------------------------------------------------------
// 2. FILTER KATEGORI CEPAT
// --------------------------------------------------------------------------
function filterKategori(kategori) {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  if (typeof event !== "undefined" && event.target) {
    event.target.classList.add("active");
  }

  if (kategori === 'semua') {
    searchInput.value = "";
  } else {
    searchInput.value = kategori;
  }
  cariKost();
}

// --------------------------------------------------------------------------
// 3. PEMESANAN KOST & MODAL IDENTITAS
// --------------------------------------------------------------------------
let kostDipilih = "";

function pesanKost(namaKost) {
  kostDipilih = namaKost;
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.style.display = "flex";
    modal.classList.add("modal-active");
  } else {
    kirimPesanDirectWA(namaKost, "", "");
  }
}

function closeModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("modal-active");
  }
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = document.getElementById("userNama").value.trim();
    const hp = document.getElementById("userHp").value.trim();

    if (nama && hp) {
      closeModal();
      kirimPesanDirectWA(kostDipilih, nama, hp);
      loginForm.reset();
    } else {
      showToast("Mohon isi Nama dan Nomor WhatsApp Anda.", "error");
    }
  });
}

function kirimPesanDirectWA(namaKost, namaPenyewa, nomorHp) {
  const noAdmin = "62895360645877";
  let textWA = `Halo Admin KostSalatiga 👋%0A%0ASaya tertarik untuk memesan unit di:*${namaKost}*`;

  if (namaPenyewa && nomorHp) {
    textWA += `%0A%0A*Identitas Pemesan:*%0A• Nama: ${namaPenyewa}%0A• No. HP: ${nomorHp}`;
  }

  textWA += `%0A%0AApakah masih ada kamar yang tersedia? Terima kasih!`;
  window.open(`https://wa.me/${noAdmin}?text=${textWA}`, "_blank");
}

// --------------------------------------------------------------------------
// 4. ULASAN: RATING BINTANG INTERAKTIF & SUBMIT FORM
// --------------------------------------------------------------------------
let selectedRating = 5;

function initRatingStars() {
  const starContainer = document.getElementById("starPicker");
  if (!starContainer) return;

  starContainer.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.className = "star-item " + (i <= selectedRating ? "active" : "");
    star.innerHTML = "★";
    star.dataset.value = i;
    star.addEventListener("click", () => setRating(i));
    starContainer.appendChild(star);
  }
}

function setRating(val) {
  selectedRating = val;
  const stars = document.querySelectorAll("#starPicker .star-item");
  stars.forEach((star, idx) => {
    if (idx < val) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

function tambahUlasan(event) {
  event.preventDefault();

  const nama = document.getElementById("reviewNama").value.trim();
  const kost = document.getElementById("reviewKost").value;
  const pesan = document.getElementById("reviewPesan").value.trim();

  if (!nama || !kost || !pesan) {
    showToast("Harap isi semua kolom ulasan!", "error");
    return;
  }

  const ratingStars = "⭐".repeat(selectedRating);
  const container = document.getElementById("reviewsContainer");

  const newCard = document.createElement("div");
  newCard.className = "review-card review-new";
  newCard.innerHTML = `
    <div class="review-header">
      <strong>${escapeHtml(nama)}</strong>
      <span class="stars">${ratingStars}</span>
    </div>
    <small>Penyewa di <strong>${escapeHtml(kost)}</strong> · <i>Baru saja</i></small>
    <p>"${escapeHtml(pesan)}"</p>
  `;

  container.prepend(newCard);
  document.getElementById("reviewForm").reset();
  setRating(5);

  showToast("Terima kasih! Ulasan Anda berhasil diterbitkan.", "success");
}

// --------------------------------------------------------------------------
// 5. FORM HUBUNGI KAMI (KONTAK WA)
// --------------------------------------------------------------------------
function kirimPesanWA(event) {
  event.preventDefault();

  const nama = document.getElementById("contactNama").value.trim();
  const hp = document.getElementById("contactHp").value.trim();
  const pesan = document.getElementById("contactPesan").value.trim();

  if (!nama || !hp || !pesan) {
    showToast("Harap lengkapi semua kolom pesan.", "error");
    return;
  }

  const noAdmin = "62895360645877";
  const textWA = `Halo Admin KostSalatiga,%0A%0ASaya *${nama}* (${hp}) ingin menanyakan hal berikut:%0A%0A"${pesan}"`;

  window.open(`https://wa.me/${noAdmin}?text=${textWA}`, "_blank");
  showToast("Mengarahkan Anda ke WhatsApp...", "info");
}

// --------------------------------------------------------------------------
// 6. HELPER FUNCTIONS & TOAST NOTIFICATION
// --------------------------------------------------------------------------
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function initToastContainer() {
  if (!document.getElementById("toastContainer")) {
    const container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  const modal = document.getElementById("loginModal");
  if (modal && e.target === modal) {
    closeModal();
  }
});