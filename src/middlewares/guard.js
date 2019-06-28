module.exports = function(req, res, next) {
    if (!req.is('application/json')) {
        res.status(400).send('400 Bad Request');
    } else {
        next();
    }
}