/**
 * WhatsApp message templates for different order stages
 * Each template is professional and includes key order details
 */

// Helper function to format items list
const formatItemsList = (items) => {
  if (!items || items.length === 0) return '';
  
  return items.map((item, index) => {
    const itemName = item.typeLabel || item.type || 'Item';
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const totalPrice = price * quantity;
    const fabric = item.fabric ? ` (${item.fabric})` : '';
    const color = item.color ? ` - ${item.color}` : '';
    
    return `*${index + 1}. ${itemName}${fabric}${color}*\n   Qty: ${quantity} × ₹${price} = ₹${totalPrice}`;
  }).join('\n\n');
};

export const WHATSAPP_TEMPLATES = {
  started: {
    label: 'Started',
    icon: 'play-circle',
    getTemplate: (customer, order, shop) => {
      const orderId = order?.id || '';
      const amount = order?.totalAmount || order?.total_amount || order?.amount || 0;
      const paidAmount = order?.paidAmount || order?.advance_paid || order?.paid_amount || 0;
      const dueAmount = Math.max(0, amount - paidAmount);
      const paymentStatus = dueAmount === 0 ? 'Paid ✅' : 'Pending ⏳';
      const itemsList = formatItemsList(order?.items);
      const shopInfo = shop ? `\n\n📍 *Visit Us:*\n${shop.name || 'StitchBook'}\n${shop.address || shop.phone || ''}` : '';
      
      return `Hi *${customer?.name || 'Customer'}*,

Thank you for choosing us! 🎉

Your order has been *started* and we're excited to work on it.

*━━━━━━━━━━━━━━━━━━━━━*

*📋 ORDER DETAILS:*

*Order ID:* ${orderId}
${itemsList ? `\n${itemsList}\n` : ''}
*Delivery Date:* ${order?.deliveryDate || order?.delivery_date || 'To be confirmed'}

*━━━━━━━━━━━━━━━━━━━━━*

*💰 PAYMENT INFORMATION:*

*Total Amount:* ₹${amount}
*Paid Amount:* ₹${paidAmount}
*Due Amount:* ₹${dueAmount}
*Payment Status:* ${paymentStatus}

*━━━━━━━━━━━━━━━━━━━━━*

We'll keep you updated every step of the way. If you have any questions, feel free to reach out!

Best regards,
*${shop?.name || 'StitchBook'}*${shopInfo}`;
    }
  },
  
  cutting: {
    label: 'Cutting & Stitching',
    icon: 'scissors-cutting',
    getTemplate: (customer, order, shop) => {
      const orderId = order?.id || '';
      const amount = order?.totalAmount || order?.total_amount || order?.amount || 0;
      const paidAmount = order?.paidAmount || order?.advance_paid || order?.paid_amount || 0;
      const dueAmount = Math.max(0, amount - paidAmount);
      const paymentStatus = dueAmount === 0 ? 'Paid ✅' : 'Pending ⏳';
      const itemsList = formatItemsList(order?.items);
      const shopInfo = shop ? `\n\n📍 *Visit Us:*\n${shop.name || 'StitchBook'}\n${shop.address || shop.phone || ''}` : '';
      
      return `Hi *${customer?.name || 'Customer'}*,

Great news! 📌

Your order is now in the *cutting and stitching* phase. Our skilled tailors are carefully crafting your garment with precision.

*━━━━━━━━━━━━━━━━━━━━━*

*📋 ORDER DETAILS:*

*Order ID:* ${orderId}
${itemsList ? `\n${itemsList}\n` : ''}
*Delivery Date:* ${order?.deliveryDate || order?.delivery_date || 'To be confirmed'}

*━━━━━━━━━━━━━━━━━━━━━*

*💰 PAYMENT INFORMATION:*

*Total Amount:* ₹${amount}
*Paid Amount:* ₹${paidAmount}
*Due Amount:* ₹${dueAmount}
*Payment Status:* ${paymentStatus}

*━━━━━━━━━━━━━━━━━━━━━*

We're on track to deliver on time. Sit back and relax—we've got this! ✨

Best regards,
*${shop?.name || 'StitchBook'}*${shopInfo}`;
    }
  },
  
  ready: {
    label: 'Ready',
    icon: 'check-circle',
    getTemplate: (customer, order, shop) => {
      const orderId = order?.id || '';
      const amount = order?.totalAmount || order?.total_amount || order?.amount || 0;
      const paidAmount = order?.paidAmount || order?.advance_paid || order?.paid_amount || 0;
      const dueAmount = Math.max(0, amount - paidAmount);
      const paymentStatus = dueAmount === 0 ? 'Paid ✅' : 'Pending ⏳';
      const itemsList = formatItemsList(order?.items);
      const shopInfo = shop ? `\n\n📍 *Visit Us:*\n${shop.name || 'StitchBook'}\n${shop.address || shop.phone || ''}` : '';
      
      return `Hi *${customer?.name || 'Customer'}*,

Excellent news! 🎊

Your order is *ready for pickup*! We're thrilled with the quality and we know you will be too.

*━━━━━━━━━━━━━━━━━━━━━*

*📋 ORDER DETAILS:*

*Order ID:* ${orderId}
${itemsList ? `\n${itemsList}\n` : ''}
*Status:* ✅ Ready for Pickup

*━━━━━━━━━━━━━━━━━━━━━*

*💰 PAYMENT INFORMATION:*

*Total Amount:* ₹${amount}
*Paid Amount:* ₹${paidAmount}
*Due Amount:* ₹${dueAmount}
*Payment Status:* ${paymentStatus}

*━━━━━━━━━━━━━━━━━━━━━*

Please schedule a convenient time to pick it up. We're available during business hours. Don't hesitate to reach out if you have any questions!

Best regards,
*${shop?.name || 'StitchBook'}*${shopInfo}`;
    }
  },
  
  delivered: {
    label: 'Delivered',
    icon: 'package-variant-closed-check',
    getTemplate: (customer, order, shop) => {
      const orderId = order?.id || '';
      const amount = order?.totalAmount || order?.total_amount || order?.amount || 0;
      const paidAmount = order?.paidAmount || order?.advance_paid || order?.paid_amount || 0;
      const dueAmount = Math.max(0, amount - paidAmount);
      const paymentStatus = dueAmount === 0 ? 'Paid ✅' : 'Pending ⏳';
      const itemsList = formatItemsList(order?.items);
      const shopInfo = shop ? `\n\n📍 *Visit Us:*\n${shop.name || 'StitchBook'}\n${shop.address || shop.phone || ''}` : '';
      
      return `Hi *${customer?.name || 'Customer'}*,

Thank you so much! 🙏

Your order has been *delivered*. We hope you love your custom tailored garment!

*━━━━━━━━━━━━━━━━━━━━━*

*📋 ORDER DETAILS:*

*Order ID:* ${orderId}
${itemsList ? `\n${itemsList}\n` : ''}
*Completed on:* ${new Date().toLocaleDateString('en-IN')}

*━━━━━━━━━━━━━━━━━━━━━*

*💰 PAYMENT INFORMATION:*

*Total Amount:* ₹${amount}
*Paid Amount:* ₹${paidAmount}
*Due Amount:* ₹${dueAmount}
*Payment Status:* ${paymentStatus}

*━━━━━━━━━━━━━━━━━━━━━*

We'd love to hear your feedback! If you need any alterations or have future tailoring needs, we're always here to help.

Thank you for being our valued customer!

Best regards,
*${shop?.name || 'StitchBook'}*${shopInfo}`;
    }
  }
};

/**
 * Get WhatsApp template for a specific status
 */
export const getWhatsAppTemplate = (status, customer, order, shop) => {
  const template = WHATSAPP_TEMPLATES[status];
  if (!template) {
    return null;
  }
  return template.getTemplate(customer, order, shop);
};

/**
 * Generate WhatsApp share URL
 */
export const generateWhatsAppShareUrl = (phoneNumber, message, scheme = 'app') => {
  if (!phoneNumber) return null;

  const cleanPhone = String(phoneNumber).replace(/\D/g, '');
  if (!cleanPhone) return null;

  const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const encodedMessage = encodeURIComponent(message || '');

  if (scheme === 'web') {
    return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
  }

  return `whatsapp://send?phone=${fullPhone}&text=${encodedMessage}`;
};
