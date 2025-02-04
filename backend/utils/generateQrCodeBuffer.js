const QRCode = require("qrcode");

async function generateQRCodeBuffer(data) {
  try {
    return await QRCode.toBuffer(data);
  } catch (error) {
    throw new Error("QR Code generation failed");
  }
}

module.exports = generateQRCodeBuffer