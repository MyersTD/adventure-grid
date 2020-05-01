const fs = require('fs')
const jwt = require('jsonwebtoken')


function genToken (email) {
    var privatekey = fs.readFileSync('./middleware/private.pem', 'utf8');
    var token = jwt.sign({"body": email}, privatekey, {algorithm: 'HS256'})
    return token;
}

function authorize (req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        let token = req.headers.authorization.split(" ")[0];
        let privateKey = fs.readFileSync('./middleware/private.pem', 'utf8');
        jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {
            if (err) {  
                res.status(500).json({ error: "Not Authorized" });
                throw new Error("Not Authorized");
            }
            return next();
        });
    } else {
        res.status(500).json({ error: "Not Authorized" });
        throw new Error("Not Authorized");
    }
}

exports.auth = authorize;
exports.tokenize = genToken;   