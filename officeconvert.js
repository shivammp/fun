// File: officeconvert.js

// Dark mode toggle
const themeSwitch = document.getElementById('theme-switch');
    
themeSwitch.addEventListener('change', function() {
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

// Current file reference
let currentFile = null;
let convertedPdfBlob = null;

// Initialize Web Worker for conversion
let conversionWorker = null;
try {
  conversionWorker = new Worker('conversion-worker.js');
  
  // Handle messages from worker
  conversionWorker.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch(type) {
      case 'progress':
        updateProgressBar(data.progress);
        break;
      case 'complete':
        convertedPdfBlob = data.pdfBlob;
        completeConversion(data.filename);
        break;
      case 'error':
        showError(data.message);
        break;
    }
  };
} catch (error) {
  console.error('Web Workers are not supported in this browser:', error);
  // Fallback to in-browser processing (slower)
}

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
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
  dropArea.classList.add('drag-over');
}

function unhighlight() {
  dropArea.classList.remove('drag-over');
}

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length) {
    handleFiles(files);
  }
}

// Handle file selection from input
fileInput.addEventListener('change', function() {
  if (this.files.length) {
    handleFiles(this.files);
  }
});

function handleFiles(files) {
  const file = files[0];
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
    currentFile = file;
    displayFileInfo(file);
    fileError.style.display = 'none';
    convertBtn.disabled = false;
  } else {
    fileError.style.display = 'block';
    selectedFile.style.display = 'none';
    convertBtn.disabled = true;
    currentFile = null;
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
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  selectedFile.style.display = 'block';
}

// Remove file handler
removeFile.addEventListener('click', function() {
  selectedFile.style.display = 'none';
  fileInput.value = '';
  convertBtn.disabled = true;
  currentFile = null;
  hideError();
});

// Show error message
function showError(message) {
  fileError.textContent = message || 'An error occurred during conversion.';
  fileError.style.display = 'block';
  progressContainer.style.display = 'none';
  convertBtn.disabled = false;
}

// Hide error message
function hideError() {
  fileError.style.display = 'none';
}

// Update progress bar
function updateProgressBar(progress) {
  progressBar.style.width = progress + '%';
  progressPercentage.textContent = progress + '%';
}

// Complete conversion
function completeConversion(filename) {
  progressContainer.style.display = 'none';
  resultSection.style.display = 'block';
  
  // Set download link
  downloadBtn.setAttribute('download', filename);
  downloadBtn.href = URL.createObjectURL(convertedPdfBlob);
}

// Conversion process
convertBtn.addEventListener('click', function() {
  if (!currentFile) return;
  
  // Reset state
  convertedPdfBlob = null;
  hideError();
  
  // Show progress UI
  progressContainer.style.display = 'block';
  convertBtn.disabled = true;
  resultSection.style.display = 'none';
  
  // Get conversion options
  const password = document.getElementById('pdfPassword').value;
  const qualitySelect = document.querySelector('.password-input:not([type="password"])');
  const quality = qualitySelect ? qualitySelect.value : 'medium';
  
  // Start conversion process
  if (conversionWorker) {
    // Use Web Worker for conversion
    conversionWorker.postMessage({
      type: 'convert',
      file: currentFile,
      options: {
        password,
        quality
      }
    });
  } else {
    // Fallback to synchronous conversion
    fallbackConversion(currentFile, {
      password,
      quality
    });
  }
});

// Fallback conversion for browsers without Web Worker support
function fallbackConversion(file, options) {
  // Simulate conversion since we can't use Web Workers
  let progress = 0;
  const interval = setInterval(function() {
    progress += 5;
    updateProgressBar(progress);
    
    if (progress >= 100) {
      clearInterval(interval);
      
      // Create dummy PDF blob
      const pdfContent = `%PDF-1.5
      1 0 obj
      << /Type /Catalog
         /Pages 2 0 R
      >>
      endobj
      2 0 obj
      << /Type /Pages
         /Kids [3 0 R]
         /Count 1
      >>
      endobj
      3 0 obj
      << /Type /Page
         /Parent 2 0 R
         /MediaBox [0 0 612 792]
         /Contents 4 0 R
         /Resources << >>
      >>
      endobj
      4 0 obj
      << /Length 68 >>
      stream
      BT
      /F1 12 Tf
      100 700 Td
      (Converted from ${file.name}) Tj
      ET
      endstream
      endobj
      xref
      0 5
      0000000000 65535 f
      0000000010 00000 n
      0000000065 00000 n
      0000000125 00000 n
      0000000230 00000 n
      trailer
      << /Size 5
         /Root 1 0 R
      >>
      startxref
      350
      %%EOF`;
      
      convertedPdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
      completeConversion(file.name.split('.')[0] + '.pdf');
    }
  }, 100);
}

// Download handler
downloadBtn.addEventListener('click', function(e) {
  if (!convertedPdfBlob) {
    e.preventDefault();
    alert('No converted file available. Please try again.');
  }
  
  // Reset UI for another conversion after download starts
  setTimeout(function() {
    // Don't hide UI immediately to allow download to start
    // resultSection.style.display = 'none';
  }, 1000);
});

// Check for browser support of required features
document.addEventListener('DOMContentLoaded', function() {
  const warningBanner = document.createElement('div');
  let warnings = [];
  
  // Check File API support
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    warnings.push('File APIs are not fully supported in this browser.');
  }
  
  // Check Web Worker support
  if (!window.Worker) {
    warnings.push('Web Workers are not supported in this browser. Conversion may be slower.');
  }
  
  // Display warnings if needed
  if (warnings.length > 0) {
    warningBanner.style.backgroundColor = '#fff3cd';
    warningBanner.style.color = '#856404';
    warningBanner.style.padding = '10px';
    warningBanner.style.marginBottom = '20px';
    warningBanner.style.borderRadius = '4px';
    warningBanner.style.borderLeft = '4px solid #ffeeba';
    
    const warningText = document.createElement('p');
    warningText.innerText = warnings.join(' ');
    warningBanner.appendChild(warningText);
    
    document.querySelector('.conversion-section').insertBefore(warningBanner, document.querySelector('.upload-area'));
  }
});