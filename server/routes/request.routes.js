const router = require('express').Router();
const ctrl = require('../controllers/request.controller');
const { protect } = require('../middleware/auth.middleware');
const { createRequestValidator, updateRequestValidator } = require('../middleware/validators/request.validators');
const validate = require('../middleware/validate.middleware');

router.use(protect);

router.get('/',       ctrl.getMyRequests);
router.post('/',      createRequestValidator, validate, ctrl.createRequest);
router.put('/:id',    updateRequestValidator, validate, ctrl.updateRequest);
router.delete('/:id', ctrl.deleteRequest);

module.exports = router;