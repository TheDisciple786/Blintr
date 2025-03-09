const express = require('express');
const router = express.Router();
const { HandleCreateNewUser } = require('../controller/index_controller');

router.post('/new_user', HandleCreateNewUser);

module.exports=router;