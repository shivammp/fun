// Dark mode toggle
const themeSwitch = document.getElementById('theme-switch');
console.log('Theme switch element:', themeSwitch);

themeSwitch.addEventListener('change', function() {
  console.log('Theme switched:', this.checked ? 'dark' : 'light');
  if (this.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
});

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
console.log('Saved theme:', savedTheme);

if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeSwitch.checked = true;
}

// File upload handling
const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('dropArea');
const selectedFile = document.getElementById('selectedFile');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFile = document.getElementById('removeFile');
const convertBtn = document.getElementById('convertBtn');
const fileError = document.getElementById('fileError');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressPercentage = document.getElementById('progressPercentage');
const resultSection = document.getElementById('resultSection');
const downloadBtn = document.getElementById('downloadBtn');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  console.log('Adding event listener for event:', eventName);
  dropArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight drop zone when file is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
  console.log('File is being dragged over the drop area');
  dropArea.classList.add('drag-over');
}

function unhighlight() {
  console.log('File is leaving the drop area');
  dropArea.classList.remove('drag-over');
}

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  console.log('File dropped:', e);
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length) {
    handleFiles(files);
  }
}

// Handle file selection from input
fileInput.addEventListener('change', function() {
  console.log('File input changed:', this.files);
  if (this.files.length) {
    handleFiles(this.files);
  }
});

function handleFiles(files) {
  const file = files[0];
  console.log('Handling file:', file);

  const validTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  // Check file extension as backup
  const fileExt = file.name.split('.').pop().toLowerCase();
  const validExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  
  if (validTypes.includes(file.type) || validExtensions.includes(fileExt)) {
    console.log('File is valid:', file);
    displayFileInfo(file);
    fileError.style.display = 'none';
    convertBtn.disabled = false;
  } else {
    console.log('Invalid file type:', file.type);
    fileError.style.display = 'block';
    selectedFile.style.display = 'none';
    convertBtn.disabled = true;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function displayFileInfo(file) {
  console.log('Displaying file info:', file);
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  selectedFile.style.display = 'block';
}

// Remove file handler
removeFile.addEventListener('click', function() {
  console.log('Removing file');
  selectedFile.style.display = 'none';
  fileInput.value = '';
  convertBtn.disabled = true;
});

// Conversion process
convertBtn.addEventListener('click', function() {
  console.log('Conversion started');
  // Show progress UI
  progressContainer.style.display = 'block';
  convertBtn.disabled = true;
  
  // Simulate conversion process
  let progress = 0;
  const interval = setInterval(function() {
    progress += 5;
    progressBar.style.width = progress + '%';
    progressPercentage.textContent = progress + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
      // Show result section after conversion
      setTimeout(function() {
        progressContainer.style.display = 'none';
        resultSection.style.display = 'block';
      }, 500);
    }
  }, 200);
});

// Download handler
downloadBtn.addEventListener('click', function(e) {
  e.preventDefault();
  console.log('Download initiated');
  // In a real application, this would download the converted file
  alert('Your PDF has been successfully downloaded!');
  
  // Reset UI for another conversion
  setTimeout(function() {
    resultSection.style.display = 'none';
    selectedFile.style.display = 'none';
    fileInput.value = '';
    convertBtn.disabled = true;
  }, 1000);
});

// Add some basic file conversion simulation
function simulateFileConversion(file, password) {
  return new Promise((resolve) => {
    console.log('Simulating file conversion for:', file.name);
    const conversionTime = Math.random() * 2000 + 1000; // Random time between 1-3 seconds
    setTimeout(() => {
      resolve({
        success: true,
        filename: file.name.split('.')[0] + '.pdf',
        size: Math.floor(file.size * 0.8) // PDFs are often smaller than the original
      });
    }, conversionTime);
  });
}

// Implementation for actual file handling in a complete application
// This would be expanded with actual file conversion logic
function handleActualConversion(file, options) {
  console.log('Handling actual conversion for file:', file.name);
  // Get password if set
  const password = document.getElementById('pdfPassword').value;
  const quality = document.querySelector('.password-input[type="select"]')?.value || 'medium';
  
  // In a real application, you would use a library like pdf-lib, jspdf, etc.
  // or a Web Worker to handle the conversion without blocking the UI
  
  // For demonstration, we'll just use our simulation function
  return simulateFileConversion(file, password);
}
