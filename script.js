// ===== GLOBAL VARIABLES =====
let currentLayout = 'single'; // 'single', 'vertical', 'horizontal'
let uploadedImages = {
    image1: null,
    image2: null
};
let canvases = {
    canvas1: null,
    canvas2: null
};
let contexts = {
    ctx1: null,
    ctx2: null
};

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const layoutButtons = document.querySelectorAll('.layout-btn');
    const uploadArea1 = document.getElementById('uploadArea1');
    const uploadArea2 = document.getElementById('uploadArea2');
    const fileInput1 = document.getElementById('fileInput1');
    const fileInput2 = document.getElementById('fileInput2');
    const uploadGrid = document.getElementById('uploadGrid');
    const labelsSection = document.getElementById('labelsSection');
    const caption2Group = document.getElementById('caption2Group');
    const presetButtons = document.getElementById('presetButtons');
    const inputSection = document.getElementById('inputSection');
    const previewSection = document.getElementById('previewSection');
    const actionSection = document.getElementById('actionSection');
    const exportBtn = document.getElementById('exportBtn');
    const resetBtn = document.getElementById('resetBtn');
    const userText = document.getElementById('userText');
    const caption1Input = document.getElementById('caption1');
    const caption2Input = document.getElementById('caption2');
    
    // Initialize canvases
    canvases.canvas1 = document.getElementById('imageCanvas1');
    canvases.canvas2 = document.getElementById('imageCanvas2');
    contexts.ctx1 = canvases.canvas1.getContext('2d');
    contexts.ctx2 = canvases.canvas2.getContext('2d');
    
    // ===== LAYOUT SELECTION =====
    layoutButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            layoutButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get selected layout
            currentLayout = btn.dataset.layout;
            
            // Update UI based on layout
            if (currentLayout === 'single') {
                uploadGrid.classList.remove('two-panel');
                uploadArea2.style.display = 'none';
                caption2Group.style.display = 'none';
                presetButtons.style.display = 'none';
            } else {
                uploadGrid.classList.add('two-panel');
                uploadArea2.style.display = 'block';
                caption2Group.style.display = 'block';
                presetButtons.style.display = 'block';
            }
            
            // Clear uploaded images when switching layouts
            resetImages();
        });
    });
    
    // ===== UPLOAD AREA 1 EVENTS =====
    uploadArea1.addEventListener('click', () => fileInput1.click());
    
    uploadArea1.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea1.style.borderColor = 'rgba(255, 255, 255, 0.8)';
        uploadArea1.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    
    uploadArea1.addEventListener('dragleave', () => {
        uploadArea1.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        uploadArea1.style.background = 'rgba(255, 255, 255, 0.1)';
    });
    
    uploadArea1.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea1.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        uploadArea1.style.background = 'rgba(255, 255, 255, 0.1)';
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleImageUpload(files[0], 1);
        }
    });
    
    fileInput1.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0], 1);
        }
    });
    
    // ===== UPLOAD AREA 2 EVENTS =====
    uploadArea2.addEventListener('click', () => fileInput2.click());
    
    uploadArea2.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea2.style.borderColor = 'rgba(255, 255, 255, 0.8)';
        uploadArea2.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    
    uploadArea2.addEventListener('dragleave', () => {
        uploadArea2.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        uploadArea2.style.background = 'rgba(255, 255, 255, 0.1)';
    });
    
    uploadArea2.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea2.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        uploadArea2.style.background = 'rgba(255, 255, 255, 0.1)';
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleImageUpload(files[0], 2);
        }
    });
    
    fileInput2.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0], 2);
        }
    });
    
    // ===== PRESET BUTTONS =====
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            applyPreset(preset);
        });
    });
    
    // ===== CAPTION INPUTS =====
    caption1Input.addEventListener('input', updateCaptions);
    caption2Input.addEventListener('input', updateCaptions);
    
    // ===== EXPORT TO PDF BUTTON =====
    exportBtn.addEventListener('click', exportToPDF);
    
    // ===== RESET BUTTON =====
    resetBtn.addEventListener('click', resetApp);
    
    // ===== AUTO-UPDATE SUMMARY ON TEXT CHANGE =====
    userText.addEventListener('input', updateSummary);
});

// ===== HANDLE IMAGE UPLOAD =====
function handleImageUpload(file, imageNumber) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            if (imageNumber === 1) {
                uploadedImages.image1 = img;
                document.getElementById('uploadArea1').classList.add('uploaded');
                document.getElementById('uploadArea1').querySelector('.upload-text').textContent = '✓ Image 1 Loaded';
            } else {
                uploadedImages.image2 = img;
                document.getElementById('uploadArea2').classList.add('uploaded');
                document.getElementById('uploadArea2').querySelector('.upload-text').textContent = '✓ Image 2 Loaded';
            }
            
            processAndDisplayImage(img, imageNumber);
            checkAndShowPreview();
        };
        
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

// ===== PROCESS AND DISPLAY IMAGE WITH AUTO-ENHANCE =====
function processAndDisplayImage(img, imageNumber) {
    const canvas = imageNumber === 1 ? canvases.canvas1 : canvases.canvas2;
    const ctx = imageNumber === 1 ? contexts.ctx1 : contexts.ctx2;
    
    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Apply auto-enhance filters
    ctx.filter = 'brightness(110%) contrast(105%) saturate(105%)';
    
    // Draw the enhanced image on canvas
    ctx.drawImage(img, 0, 0);
    
    // Reset filter for future operations
    ctx.filter = 'none';
}

// ===== CHECK IF PREVIEW SHOULD BE SHOWN =====
function checkAndShowPreview() {
    // For single layout, only need image 1
    if (currentLayout === 'single' && uploadedImages.image1) {
        showPreview();
    }
    // For two-panel layouts, need both images
    else if ((currentLayout === 'vertical' || currentLayout === 'horizontal') && 
             uploadedImages.image1 && uploadedImages.image2) {
        showPreview();
    }
}

// ===== SHOW PREVIEW SECTION =====
function showPreview() {
    // Show sections
    document.getElementById('labelsSection').style.display = 'block';
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
    
    // Update layout of images grid
    const imagesGrid = document.getElementById('imagesGrid');
    const imagePanel2 = document.getElementById('imagePanel2');
    
    if (currentLayout === 'single') {
        imagesGrid.className = 'images-grid single';
        imagePanel2.style.display = 'none';
    } else if (currentLayout === 'vertical') {
        imagesGrid.className = 'images-grid vertical';
        imagePanel2.style.display = 'block';
    } else if (currentLayout === 'horizontal') {
        imagesGrid.className = 'images-grid horizontal';
        imagePanel2.style.display = 'block';
    }
    
    // Update captions
    updateCaptions();
    
    // Generate initial summary
    updateSummary();
    
    // Smooth scroll to preview
    document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== APPLY CAPTION PRESETS =====
function applyPreset(preset) {
    const presets = {
        'before-after': { caption1: 'BEFORE', caption2: 'AFTER' },
        'expectation-reality': { caption1: 'EXPECTATION', caption2: 'REALITY' },
        'them-us': { caption1: 'THEM', caption2: 'US' },
        'then-now': { caption1: 'THEN', caption2: 'NOW' }
    };
    
    if (presets[preset]) {
        document.getElementById('caption1').value = presets[preset].caption1;
        document.getElementById('caption2').value = presets[preset].caption2;
        updateCaptions();
    }
}

// ===== UPDATE CAPTIONS =====
function updateCaptions() {
    const caption1 = document.getElementById('caption1').value.trim();
    const caption2 = document.getElementById('caption2').value.trim();
    
    document.getElementById('panelCaption1').textContent = caption1;
    document.getElementById('panelCaption2').textContent = caption2;
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
        // Generate summary based on layout
        if (currentLayout === 'single') {
            summaryText = 'This document contains a screenshot processed with the BAINT PDF Maker. ';
            summaryText += 'The image has been automatically enhanced with brightness and contrast adjustments ';
            summaryText += 'to improve visual clarity and professional presentation quality.';
        } else {
            const caption1 = document.getElementById('caption1').value.trim();
            const caption2 = document.getElementById('caption2').value.trim();
            
            if (caption1 && caption2) {
                summaryText = `This comparative analysis presents a ${currentLayout} split view showing "${caption1}" versus "${caption2}". `;
            } else {
                summaryText = `This document features a ${currentLayout} split comparison of two images. `;
            }
            summaryText += 'Both images have been automatically enhanced with brightness and contrast adjustments. ';
            summaryText += 'This format is optimized for side-by-side comparison and visual storytelling.';
        }
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
        const layoutName = currentLayout.charAt(0).toUpperCase() + currentLayout.slice(1);
        const filename = `BAINT_Daily_${layoutName}_${timestamp}.pdf`;
        
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

// ===== RESET IMAGES ONLY =====
function resetImages() {
    // Clear uploaded images
    uploadedImages.image1 = null;
    uploadedImages.image2 = null;
    
    // Clear canvases
    if (contexts.ctx1) {
        contexts.ctx1.clearRect(0, 0, canvases.canvas1.width, canvases.canvas1.height);
    }
    if (contexts.ctx2) {
        contexts.ctx2.clearRect(0, 0, canvases.canvas2.width, canvases.canvas2.height);
    }
    
    // Reset upload areas
    document.getElementById('uploadArea1').classList.remove('uploaded');
    document.getElementById('uploadArea1').querySelector('.upload-text').textContent = 'Upload Image 1';
    document.getElementById('uploadArea2').classList.remove('uploaded');
    document.getElementById('uploadArea2').querySelector('.upload-text').textContent = 'Upload Image 2';
    
    // Clear file inputs
    document.getElementById('fileInput1').value = '';
    document.getElementById('fileInput2').value = '';
    
    // Hide preview sections
    document.getElementById('labelsSection').style.display = 'none';
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('actionSection').style.display = 'none';
}

// ===== RESET APP FUNCTION =====
function resetApp() {
    // Reset images
    resetImages();
    
    // Clear text inputs
    document.getElementById('userText').value = '';
    document.getElementById('caption1').value = '';
    document.getElementById('caption2').value = '';
    
    // Reset to single layout
    currentLayout = 'single';
    document.querySelectorAll('.layout-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.layout === 'single') {
            btn.classList.add('active');
        }
    });
    
    // Hide second upload area
    document.getElementById('uploadGrid').classList.remove('two-panel');
    document.getElementById('uploadArea2').style.display = 'none';
    document.getElementById('caption2Group').style.display = 'none';
    document.getElementById('presetButtons').style.display = 'none';
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
