const qrcode = require("qrcode");

const generateQRCode = async (data) => {
  try {
    const qrCode = await qrcode.toDataURL(data);
    return qrCode;
  } catch (error) {
    throw new Error("Could not generate QR code");
  }
};

module.exports = generateQRCode;