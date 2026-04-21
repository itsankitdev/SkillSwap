const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { registerValidator, loginValidator } = require('../middleware/validators/auth.validators');
const validate = require('../middleware/validate.middleware');

router.post('/register', registerValidator, validate, register);
router.post('/login',    loginValidator,    validate, login);
router.get('/me',        protect,                     getMe);

module.exports = router;