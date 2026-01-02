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

  // Disable interactions
  convertBtn.disabled = true;
  fileInput.disabled = true;

  convertBtn.classList.remove("ready", "done");
  convertBtn.classList.add("loading");

  statusText.innerHTML = "⏳ Uploading & processing video…";

  // Progress bar setup
  const progressWrapper = document.getElementById("progressWrapper");
  const progressBar = document.getElementById("progressBar");

  progressWrapper.style.display = "block";
  progressBar.style.width = "10%";

  const formData = new FormData();
  formData.append("video", file);

  // Fake progress (UX improvement)
  let fakeProgress = 10;
  const progressInterval = setInterval(() => {
    if (fakeProgress < 90) {
      fakeProgress += Math.random() * 8;
      progressBar.style.width = `${fakeProgress}%`;
    }
  }, 800);

  try {
    const res = await fetch(
      "https://video-audiocoverter.onrender.com/convert",
      {
        method: "POST",
        body: formData
      }
    );

    if (!res.ok) throw new Error("Conversion failed");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    clearInterval(progressInterval);
    progressBar.style.width = "100%";

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
    downloadBtn.style.fontWeight = "600";

    statusText.innerHTML = "✅ Conversion completed successfully<br>";
    statusText.appendChild(downloadBtn);

    convertBtn.classList.remove("loading");
    convertBtn.classList.add("done");

  } catch (err) {
    clearInterval(progressInterval);

    statusText.innerHTML = "❌ Conversion failed. Please try again.";

    convertBtn.classList.remove("loading");
    convertBtn.classList.add("ready");
  } finally {
    // Re-enable interactions
    convertBtn.disabled = false;
    fileInput.disabled = false;

    setTimeout(() => {
      document.getElementById("progressWrapper").style.display = "none";
      document.getElementById("progressBar").style.width = "0%";
    }, 1500);
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
