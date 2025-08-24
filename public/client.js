const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const dropBox = document.getElementById("dropBox");

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.classList.remove("hidden");
    // Hide the drag-and-drop box after selecting an image
    dropBox.style.display = "none";
  };
  reader.readAsDataURL(file);
}

// Show preview when file is selected
imageInput.addEventListener("change", () => {
  if (imageInput.files && imageInput.files[0]) {
    handleFile(imageInput.files[0]);
  }
});

// Drag & drop events
dropBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropBox.classList.add("border-blue-500");
});
dropBox.addEventListener("dragleave", () => {
  dropBox.classList.remove("border-blue-500");
});
dropBox.addEventListener("drop", (e) => {
  e.preventDefault();
  dropBox.classList.remove("border-blue-500");
  if (e.dataTransfer.files.length) {
    imageInput.files = e.dataTransfer.files;
    handleFile(e.dataTransfer.files[0]);
  }
});
