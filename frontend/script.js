const fileInput = document.getElementById("videoFile");
const statusText = document.getElementById("status");
const convertBtn = document.querySelector(".convert-btn");

function selectFile() {
  fileInput.click();
}

// FILE SELECTION
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const maxSizeMB = 50;
  const fileSizeMB = file.size / 1024 / 1024;

  if (fileSizeMB > maxSizeMB) {
    statusText.innerHTML = "❌ File too large. Max allowed size is 50 MB.";
    fileInput.value = "";
    convertBtn.disabled = true;
    convertBtn.classList.remove("ready", "loading", "done");
    return;
  }

  statusText.innerHTML = `📁 <b>${file.name}</b> (${fileSizeMB.toFixed(2)} MB)`;
  convertBtn.disabled = false;
  convertBtn.classList.remove("loading", "done");
  convertBtn.classList.add("ready");
});

// UPLOAD & CONVERT
async function upload() {
  const file = fileInput.files[0];
  if (!file) return;

  convertBtn.disabled = true;
  convertBtn.classList.remove("ready", "done");
  convertBtn.classList.add("loading");

  statusText.innerHTML = "⏳ Converting video to audio...";

  const formData = new FormData();
  formData.append("video", file);

  try {
    const res = await fetch("http://localhost:5000/convert", {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Conversion failed");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const downloadBtn = document.createElement("a");
    downloadBtn.href = url;
    downloadBtn.download = "audio.mp3";
    downloadBtn.textContent = "⬇️ Download Audio";
    downloadBtn.style.display = "inline-block";
    downloadBtn.style.marginTop = "12px";
    downloadBtn.style.padding = "10px 16px";
    downloadBtn.style.background = "#16a34a";
    downloadBtn.style.color = "#fff";
    downloadBtn.style.borderRadius = "6px";
    downloadBtn.style.textDecoration = "none";

    statusText.innerHTML = "✅ Conversion completed<br>";
    statusText.appendChild(downloadBtn);

    convertBtn.disabled = false;
    convertBtn.classList.remove("loading");
    convertBtn.classList.add("done");

  } catch (err) {
    statusText.innerHTML = "❌ Conversion failed";
    convertBtn.disabled = false;
    convertBtn.classList.remove("loading");
    convertBtn.classList.add("ready");
  }
}

/* MODALS */
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

window.addEventListener("click", (e) => {
  document.querySelectorAll(".modal").forEach(m => {
    if (e.target === m) m.style.display = "none";
  });
});
