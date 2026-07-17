const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate QR code for student ID card
 */
const generateQRCode = async (data) => {
  try {
    const qrData = JSON.stringify({
      student_id: data.student_id,
      school_id: data.school_id,
      name: `${data.first_name} ${data.last_name}`,
      grade: data.grade_name
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Convert data URL to buffer
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate PDF ID card for student
 */
const generateIDCardPDF = async (studentData, schoolData, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: [3.375, 2.125], // Credit card size in inches (85.6mm x 53.98mm)
        margin: 0
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Background
      doc.rect(0, 0, 3.375 * 72, 2.125 * 72)
         .fill(schoolData.primary_color || '#ADD8E6');

      // School name header
      doc.fontSize(10)
         .fill(schoolData.secondary_color || '#800080')
         .font('Helvetica-Bold')
         .text(schoolData.name.toUpperCase(), 10, 10, { width: 200 });

      // Student photo placeholder (rectangle)
      doc.rect(10, 30, 60, 75)
         .fill('#FFFFFF')
         .stroke('#000000');

      // Add student photo if available
      if (studentData.photo_url) {
        try {
          const photoPath = path.join(process.cwd(), 'uploads', studentData.photo_url);
          if (fs.existsSync(photoPath)) {
            doc.image(photoPath, 10, 30, { fit: [60, 75] });
          }
        } catch (error) {
          console.log('Photo not available, using placeholder');
        }
      }

      // Student information
      doc.fontSize(8)
         .fill('#000000')
         .font('Helvetica-Bold')
         .text('NAME:', 80, 35);
      
      doc.fontSize(7)
         .font('Helvetica')
         .text(`${studentData.first_name} ${studentData.last_name}`, 80, 45, { width: 200 });

      doc.fontSize(8)
         .font('Helvetica-Bold')
         .text('STUDENT ID:', 80, 60);
      
      doc.fontSize(7)
         .font('Helvetica')
         .text(studentData.student_id, 80, 70, { width: 200 });

      doc.fontSize(8)
         .font('Helvetica-Bold')
         .text('GRADE:', 80, 85);
      
      doc.fontSize(7)
         .font('Helvetica')
         .text(studentData.grade_name || 'N/A', 80, 95, { width: 200 });

      doc.fontSize(8)
         .font('Helvetica-Bold')
         .text('DIVISION:', 80, 110);
      
      doc.fontSize(7)
         .font('Helvetica')
         .text(studentData.division_name || 'N/A', 80, 120, { width: 200 });

      // Issue and expiry dates
      doc.fontSize(6)
         .font('Helvetica')
         .text(`Issued: ${new Date().toLocaleDateString()}`, 80, 140, { width: 200 });
      doc.text(`Valid: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 80, 150, { width: 200 });

      // Generate QR code
      generateQRCode({
        student_id: studentData.student_id,
        school_id: studentData.school_id,
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        grade_name: studentData.grade_name
      }).then(qrBuffer => {
        // Add QR code to card
        doc.image(qrBuffer, 200, 30, { fit: [50, 50] });
        
        // School logo placeholder
        doc.rect(200, 85, 50, 30)
           .fill('#FFFFFF')
           .stroke('#000000');

        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      }).catch(error => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate unique card number
 */
const generateCardNumber = (studentId, schoolCode) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${schoolCode}-${studentId}-${timestamp}-${random}`;
};

module.exports = {
  generateQRCode,
  generateIDCardPDF,
  generateCardNumber
};
