const jwt = require('jsonwebtoken');
const createSignToken = (id , expireAt) => {
    const token = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: expireAt || process.env.JWT_EXPIRES_IN
    });
    return token;
}

module.exports = createSignToken;