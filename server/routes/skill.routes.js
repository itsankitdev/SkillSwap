const router = require('express').Router();
const ctrl = require('../controllers/skill.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { createSkillValidator, browseSkillsValidator } = require('../middleware/validators/skill.validators');
const validate = require('../middleware/validate.middleware');

router.get('/', optionalAuth, browseSkillsValidator, validate, ctrl.getAllSkills);
router.get('/user/:userId', ctrl.getSkillsByUser);
router.get('/:id',          ctrl.getSkillById);
router.post('/',   protect, createSkillValidator, validate, ctrl.createSkill);
router.put('/:id', protect, ctrl.updateSkill);
router.delete('/:id', protect, ctrl.deleteSkill);

module.exports = router;