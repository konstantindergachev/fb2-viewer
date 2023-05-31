window.addEventListener('DOMContentLoaded', (event) => {
  const fileInput = document.getElementById('file-input');
  const viewer = document.getElementById('viewer');
  const textTitle = document.getElementById('textTitle');

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    textTitle.innerText = file.name.split('.fb2')[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      viewer.innerHTML = content;
    };

    reader.readAsText(file);
  });
});
