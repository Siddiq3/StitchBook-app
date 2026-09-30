const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatDate = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return escapeHtml(value);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (err) {
    return escapeHtml(value);
  }
};

const formatCurrency = (amount, currency = "₹") => {
  if (amount === null || amount === undefined || amount === "") return "";
  const value = Number(amount);
  if (Number.isNaN(value)) return escapeHtml(amount);
  return `${escapeHtml(currency)}${value.toFixed(2)}`;
};

const renderMeasurementGroup = (measurement) => {
  const outfitLabel =
    measurement.outfitLabel || measurement.outfit_label || measurement.outfitType || measurement.outfit_type || "Measurement profile";
  const data = measurement.measurementsData || measurement.measurements_data || {};
  const entries = Object.entries(data || {});

  if (entries.length === 0) {
    return `
      <div class="measurement-block">
        <div class="measurement-title">Outfit: ${escapeHtml(outfitLabel)}</div>
        <div class="no-measurements">No measurements recorded</div>
      </div>
    `;
  }

  const rows = entries
    .map(
      ([key, value]) => `
      <tr>
        <td>${escapeHtml(key)}</td>
        <td>${escapeHtml(value)}</td>
      </tr>`
    )
    .join("");

  return `
    <div class="measurement-block">
      <div class="measurement-title">Outfit: ${escapeHtml(outfitLabel)}</div>
      <table class="measurement-table">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

const generateJobSheetHTML = (jobSheetData) => {
  const order = jobSheetData?.order || {};
  const customer = jobSheetData?.customer || {};
  const shop = jobSheetData?.shop || {};
  const assignedStaff = jobSheetData?.assignedStaff || {};
  const customerMeasurements = customer.measurements || [];
  const currency = shop.currency || "₹";
  const isUrgent = String(order.priority || "").toLowerCase() === "urgent";
  const priorityLabel = order.priority ? escapeHtml(order.priority.toUpperCase()) : "Normal";
  const orderNumber = order.orderNumber || order.order_number || "";
  const deliveryDate = formatDate(order.deliveryDate || order.delivery_date);
  const trialDate = formatDate(order.trialDate || order.trial_date);
  const specialInstructions = order.specialInstructions || order.special_instructions || "";
  const orderItems = Array.isArray(order.items) ? order.items : [];

  const itemsHtml = orderItems
    .map((item, index) => {
      const label = item.typeLabel || item.type || "Item";
      const fabric = item.fabric ? ` (${escapeHtml(item.fabric)})` : "";
      const quantity = item.quantity || 0;
      const price = item.price || 0;
      const lineTotal = Number(quantity) * Number(price);
      return `
        <tr>
          <td>${index + 1}. ${escapeHtml(label)}${fabric}</td>
          <td>${quantity}</td>
          <td>${formatCurrency(lineTotal, currency)}</td>
        </tr>`;
    })
    .join("");

  const measurementsHtml = Array.isArray(customerMeasurements) && customerMeasurements.length > 0
    ? customerMeasurements.map(renderMeasurementGroup).join("")
    : `
        <div class="no-measurements">No measurements recorded</div>
      `;

  const staffRow = assignedStaff && (assignedStaff.name || assignedStaff.fullName || assignedStaff.staff_name)
    ? `<div class="row">
        <div class="label">Assigned To:</div>
        <div class="value">${escapeHtml(assignedStaff.name || assignedStaff.fullName || assignedStaff.staff_name)}</div>
      </div>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Job Sheet</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #111;
          margin: 0;
          padding: 0;
          background: white;
        }
        .page {
          width: 100%;
          padding: 24px;
          box-sizing: border-box;
        }
        .header,
        .section {
          width: 100%;
          margin-bottom: 18px;
        }
        .shop-line {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .shop-name {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .shop-meta {
          font-size: 12px;
          color: #333;
          line-height: 1.5;
        }
        .divider {
          border-top: 1px solid #ddd;
          margin: 16px 0;
        }
        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 12px;
        }
        .job-title {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .job-number {
          font-size: 16px;
          font-weight: 700;
        }
        .row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 8px;
        }
        .label {
          font-size: 12px;
          color: #555;
          width: 40%;
        }
        .value {
          font-size: 13px;
          color: #111;
          width: 60%;
          text-align: right;
        }
        .priority {
          font-weight: 800;
          color: ${isUrgent ? '#b00020' : '#111'};
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .items-table,
        .measurement-table {
          width: 100%;
          border-collapse: collapse;
        }
        .items-table td,
        .measurement-table td {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          vertical-align: top;
        }
        .items-table td:first-child,
        .measurement-table td:first-child {
          width: 65%;
        }
        .items-total {
          font-weight: 700;
        }
        .measurement-block {
          margin-bottom: 14px;
        }
        .measurement-title {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .no-measurements {
          font-size: 13px;
          color: #666;
          margin-top: 8px;
        }
        .instructions-box {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fafafa;
          font-size: 13px;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="shop-line">
            <div>
              <div class="shop-name">${escapeHtml(shop.name || shop.shopName || "Shop")}</div>
            </div>
            <div class="shop-meta">
              <div>Phone: ${escapeHtml(shop.phone || shop.contact || "-")}</div>
              <div>Location: ${escapeHtml(shop.location || shop.address || "-")}</div>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="section">
          <div class="title-row">
            <div class="job-title">JOB SHEET</div>
            <div class="job-number">${escapeHtml(orderNumber)}</div>
          </div>
          <div class="row">
            <div class="label">Customer</div>
            <div class="value">${escapeHtml(customer.name || customer.fullName || order.customer_name || "-")}</div>
          </div>
          <div class="row">
            <div class="label">Phone</div>
            <div class="value">${escapeHtml(customer.phone || customer.mobile || "-")}</div>
          </div>
          <div class="row">
            <div class="label">Delivery</div>
            <div class="value">${escapeHtml(deliveryDate)}</div>
          </div>
          <div class="row">
            <div class="label">Trial</div>
            <div class="value">${escapeHtml(trialDate)}</div>
          </div>
          <div class="row">
            <div class="label">Priority</div>
            <div class="value priority">${priorityLabel}</div>
          </div>
          ${staffRow}
        </div>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">Order Items</div>
          <table class="items-table">
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="row items-total">
            <div class="label">Total</div>
            <div class="value">${formatCurrency(order.total_amount || order.totalAmount, currency)}</div>
          </div>
          <div class="row">
            <div class="label">Advance</div>
            <div class="value">${formatCurrency(order.advance_paid || order.advancePaid || 0, currency)}</div>
          </div>
          <div class="row">
            <div class="label">Balance Due</div>
            <div class="value">${formatCurrency(order.balance_due || order.balanceDue || 0, currency)}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">📏 Measurements</div>
          ${measurementsHtml}
        </div>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">Special Instructions</div>
          <div class="instructions-box">
            ${specialInstructions ? escapeHtml(specialInstructions) : "No special instructions."}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default generateJobSheetHTML;
