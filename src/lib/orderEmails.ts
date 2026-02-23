import { sendEmail } from './email';

interface OrderItem {
    product: {
        name: string;
    };
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    items: OrderItem[];
}

// Email template wrapper with Talari Farms branding
function emailTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1c1917;
            background-color: #fafaf9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            padding: 40px 32px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: white;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px 32px;
        }
        .footer {
            background: #f5f5f4;
            padding: 24px 32px;
            text-align: center;
            font-size: 13px;
            color: #78716c;
        }
        h1 {
            margin: 0 0 16px 0;
            font-size: 24px;
            font-weight: 700;
            color: #1c1917;
        }
        p {
            margin: 0 0 16px 0;
            color: #57534e;
        }
        .order-id {
            display: inline-block;
            background: #f5f5f4;
            padding: 8px 16px;
            border-radius: 8px;
            font-family: monospace;
            font-weight: 600;
            color: #059669;
            margin: 16px 0;
        }
        .items-table {
            width: 100%;
            margin: 24px 0;
            border-collapse: collapse;
        }
        .items-table th {
            text-align: left;
            padding: 12px 0;
            border-bottom: 2px solid #e7e5e4;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #78716c;
            font-weight: 600;
        }
        .items-table td {
            padding: 12px 0;
            border-bottom: 1px solid #f5f5f4;
        }
        .total-row {
            font-weight: 700;
            font-size: 18px;
            color: #1c1917;
        }
        .status-badge {
            display: inline-block;
            background: #dcfce7;
            color: #166534;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            margin: 8px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌱 Talari Farms</div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Thank you for choosing Talari Farms</p>
            <p>Fresh from our farm to your table</p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

// Order Placed Email
export async function sendOrderPlacedEmail(order: Order): Promise<boolean> {
    const orderIdShort = order.id.slice(-6).toUpperCase();

    const itemsHtml = order.items.map(item => `
        <tr>
            <td>${item.product.name}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">₹${item.price.toLocaleString()}</td>
            <td style="text-align: right; font-weight: 600;">₹${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
    `).join('');

    const content = `
        <h1>Your Order is Confirmed! 🎉</h1>
        <p>Hi ${order.customerName},</p>
        <p>Thank you for your order. We've received it and our farmers are already selecting the freshest produce for you.</p>
        
        <div class="order-id">Order #${orderIdShort}</div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
                <tr class="total-row">
                    <td colspan="3">Total Amount</td>
                    <td style="text-align: right;">₹${order.total.toLocaleString()}</td>
                </tr>
            </tbody>
        </table>
        
        <p><strong>Current Status:</strong> <span class="status-badge">Order Placed</span></p>
        
        <p>We'll notify you as soon as your order is packed and ready for delivery.</p>
    `;

    return sendEmail({
        to: order.customerEmail,
        subject: `Your Talari Farms order is confirmed (#${orderIdShort})`,
        html: emailTemplate(content),
        text: `Hi ${order.customerName}, your order #${orderIdShort} has been confirmed. Total: ₹${order.total}. We'll keep you updated!`,
    });
}

// Order Packed Email
export async function sendOrderPackedEmail(order: Order): Promise<boolean> {
    const orderIdShort = order.id.slice(-6).toUpperCase();

    const content = `
        <h1>Your Order is Packed! 📦</h1>
        <p>Hi ${order.customerName},</p>
        <p>Great news! Your order has been carefully packed and is ready for the next step.</p>
        
        <div class="order-id">Order #${orderIdShort}</div>
        
        <p><strong>Current Status:</strong> <span class="status-badge">Packed</span></p>
        
        <p>Your fresh produce is now packed and will be shipped soon. We'll notify you once it's on the way!</p>
    `;

    return sendEmail({
        to: order.customerEmail,
        subject: `Your order is packed and ready (#${orderIdShort})`,
        html: emailTemplate(content),
        text: `Hi ${order.customerName}, your order #${orderIdShort} has been packed and is ready for shipping!`,
    });
}

// Order Shipped Email
export async function sendOrderShippedEmail(order: Order): Promise<boolean> {
    const orderIdShort = order.id.slice(-6).toUpperCase();

    const content = `
        <h1>Your Order is on the Way! 🚚</h1>
        <p>Hi ${order.customerName},</p>
        <p>Exciting news! Your order has been shipped and is on its way to you.</p>
        
        <div class="order-id">Order #${orderIdShort}</div>
        
        <p><strong>Current Status:</strong> <span class="status-badge">Shipped</span></p>
        
        <p>Your fresh produce is now in transit. Get ready to enjoy farm-fresh goodness!</p>
        <p>Please ensure someone is available to receive the delivery.</p>
    `;

    return sendEmail({
        to: order.customerEmail,
        subject: `Your order is on the way! (#${orderIdShort})`,
        html: emailTemplate(content),
        text: `Hi ${order.customerName}, your order #${orderIdShort} has been shipped and is on the way to you!`,
    });
}
