import { jsPDF } from 'jspdf';

export const openWhatsApp = (phone: string, name: string) => {
  const message = "Arain brothers mini mazda goods you ask any question or query about the vehicle";
  let formattedPhone = phone.replace(/\s/g, '');
  if (!formattedPhone.startsWith('92') && !formattedPhone.startsWith('+92')) {
      formattedPhone = '92' + formattedPhone;
  }
  if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
  }
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};

export const calculateDistance = (pickup: string, drop: string) => {
  if (!pickup || !drop) return null;
  // Mock distance calculation based on string length for demo
  // In a real app, this would use Google Maps Distance Matrix API or OpenStreetMap
  const dist = Math.floor((pickup.length + drop.length) * 1.5) + 5;
  return {
    km: dist,
    time: `${Math.floor(dist / 40)}h ${Math.floor((dist % 40) * 1.5)}m`,
    fuelCost: Math.round((dist / 6) * 280)
  };
};

export const generateInvoice = (tripData: any) => {
  const pdf = new jsPDF();
  
  // Add logo/title
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text('MAZDA TRANSPORT', 20, 20);
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Official Transport Invoice', 20, 30);
  
  // Invoice details
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Invoice #: INV-${tripData.id || Date.now()}`, 20, 50);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 57);
  pdf.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 64);
  
  // Trip Details
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Trip Details', 20, 80);
  
  pdf.setFontSize(10);
  pdf.text(`Vehicle: ${tripData.vehicleType || 'N/A'}`, 20, 92);
  pdf.text(`Pickup Location: ${tripData.pickup || 'N/A'}`, 20, 99);
  pdf.text(`Drop Location: ${tripData.destination || 'N/A'}`, 20, 106);
  pdf.text(`Distance: ${tripData.distance || 'N/A'} km`, 20, 113);
  
  // Driver & Client Info
  pdf.setFontSize(14);
  pdf.text('Party Information', 20, 140);
  
  pdf.setFontSize(10);
  pdf.text(`Client Name: ${tripData.clientName || 'N/A'}`, 20, 152);
  
  // Payment Details
  pdf.setFontSize(14);
  pdf.text('Payment Summary', 20, 193);
  
  pdf.setFontSize(10);
  pdf.text(`Trip Amount: Rs. ${tripData.price || 0}`, 20, 205);
  pdf.text(`Platform Fee (10%): Rs. ${Math.round((tripData.price || 0) * 0.1)}`, 20, 212);
  pdf.text(`Driver Earnings: Rs. ${Math.round((tripData.price || 0) * 0.9)}`, 20, 219);
  
  // Total
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`TOTAL AMOUNT: Rs. ${tripData.price || 0}`, 20, 240);
  
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Thank you for choosing Mazda Transport!', 20, 270);
  pdf.text('For support: support@mazdatransport.com', 20, 277);
  
  // Save PDF
  pdf.save(`Invoice_${tripData.id || Date.now()}.pdf`);
};
