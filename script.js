// ===== GLOBAL VARIABLES =====
let uploadedImage = null;
let canvas = null;
let ctx = null;

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const inputSection = document.getElementById('inputSection');
    const previewSection = document.getElementById('previewSection');
    const actionSection = document.getElementById('actionSection');
    const exportBtn = document.getElementById('exportBtn');
    const resetBtn = document.getElementById('resetBtn');
    const userText = document.getElementById('userText');
    
    canvas = document.getElementById('imageCanvas');
    ctx = canvas.getContext('2d');
    
    // ===== UPLOAD AREA CLICK EVENT =====
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // ===== DRAG AND DROP FUNCTIONALITY =====
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.8)';
        uploadArea.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        uploadArea.style.background = 'rgba(255, 255, 255, 0.1)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        uploadArea.style.background = 'rgba(255, 255, 255, 0.1)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleImageUpload(files[0]);
        }
    });
    
    // ===== FILE INPUT CHANGE EVENT =====
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    });
    
    // ===== EXPORT TO PDF BUTTON =====
    exportBtn.addEventListener('click', exportToPDF);
    
    // ===== RESET BUTTON =====
    resetBtn.addEventListener('click', resetApp);
    
    // ===== AUTO-UPDATE SUMMARY ON TEXT CHANGE =====
    userText.addEventListener('input', updateSummary);
});

// ===== HANDLE IMAGE UPLOAD =====
function handleImageUpload(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            uploadedImage = img;
            processAndDisplayImage();
            showPreview();
        };
        
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

// ===== PROCESS AND DISPLAY IMAGE WITH AUTO-ENHANCE =====
function processAndDisplayImage() {
    // Set canvas dimensions to match image
    canvas.width = uploadedImage.width;
    canvas.height = uploadedImage.height;
    
    // Apply auto-enhance filters using CSS filters
    // brightness(110%) - slightly brighten
    // contrast(105%) - slightly increase contrast
    ctx.filter = 'brightness(110%) contrast(105%) saturate(105%)';
    
    // Draw the enhanced image on canvas
    ctx.drawImage(uploadedImage, 0, 0);
    
    // Reset filter for future operations
    ctx.filter = 'none';
}

// ===== SHOW PREVIEW SECTION =====
function showPreview() {
    // Show input and preview sections
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'block';
    
    // Set current date and time
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('newspaperDate').textContent = now.toLocaleDateString('en-US', options);
    
    // Generate initial summary
    updateSummary();
}

// ===== UPDATE AUTO SUMMARY =====
function updateSummary() {
    const userTextValue = document.getElementById('userText').value.trim();
    const summaryElement = document.getElementById('summaryText');
    
    let summaryText = '';
    
    if (userTextValue.length > 0) {
        // Use first 150 characters of user input
        summaryText = userTextValue.substring(0, 150);
        if (userTextValue.length > 150) {
            summaryText += '...';
        }
    } else {
        // Default summary
        summaryText = 'This document contains a screenshot processed with the BAINT PDF Maker. ';
        summaryText += 'The image has been automatically enhanced with brightness and contrast adjustments ';
        summaryText += 'to improve visual clarity and professional presentation quality.';
    }
    
    summaryElement.textContent = summaryText;
}

// ===== EXPORT TO PDF FUNCTION =====
async function exportToPDF() {
    // Show loading overlay
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    try {
        // Get the newspaper container
        const newspaperContainer = document.getElementById('newspaperContainer');
        
        // Use html2canvas to capture the newspaper layout
        const canvas = await html2canvas(newspaperContainer, {
            scale: 2, // Higher quality
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        
        // Get canvas dimensions
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Add the canvas image to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `BAINT_Daily_${timestamp}.pdf`;
        
        // Download the PDF
        pdf.save(filename);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    } finally {
        // Hide loading overlay
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}

// ===== RESET APP FUNCTION =====
function resetApp() {
    // Clear uploaded image
    uploadedImage = null;
    
    // Clear canvas
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Clear text input
    document.getElementById('userText').value = '';
    
    // Clear file input
    document.getElementById('fileInput').value = '';
    
    // Hide sections
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('actionSection').style.display = 'none';
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
