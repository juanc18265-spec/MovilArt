try {
  const { jsPDF } = require('jspdf');
  const doc = new jsPDF();
  doc.text('Hello world!', 10, 10);
  doc.save('test.pdf');
  console.log('PDF generated successfully!');
} catch (e) {
  console.error('Error generating PDF:', e.message);
}
