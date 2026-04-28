const express = require('express');
const router = express.Router();
const userPetController = require('../controllers/userPetController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/my', requireAuth, userPetController.getMyPets);
router.post('/', requireAuth, upload.single('image'), userPetController.addUserPet);
router.patch('/:id', requireAuth, upload.single('image'), userPetController.updateUserPet);
router.delete('/:id', requireAuth, userPetController.deleteUserPet);

module.exports = router;
