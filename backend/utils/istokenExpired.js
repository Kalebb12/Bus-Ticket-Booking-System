const jwt = require("jsonwebtoken");

function isTokenExpired(decoded) {
  const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
  return decoded.exp < currentTime; // Check if expired
}

module.exports = isTokenExpired;