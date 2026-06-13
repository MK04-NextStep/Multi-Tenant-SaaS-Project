const jstoken = require('jsonwebtoken');
const { NewError } = require('../Middleware/errMiddleware')

let accessTokenGenerator = (userId) => {
    try {
        let accessToken = jstoken.sign({ userId }, "thisisthesecretkey", { expiresIn: "1d" });
        return accessToken;
    } catch (err) {
        throw new NewError("Internal Server Error", 500)
    }
}

let refreshTokenGenerator = (userId, role) => {
    try {
        let refreshToken = jstoken.sign({ userId }, "thisisthesecretkey", { expiresIn: "7d" });
        return refreshToken;
    }catch (err) {
        throw new NewError("Internal Server Error", 500)
    }
}

module.exports = { accessTokenGenerator, refreshTokenGenerator };