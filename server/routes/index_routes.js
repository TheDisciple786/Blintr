const express = require('express');
const router = express.Router();
const { HandleCreateNewUser, HandleGetUsers, HandleUserLogin } = require('../controller/index_controller');

router.post('/new_user', HandleCreateNewUser);

router.get('/users', HandleGetUsers);

router.post('/users/login', HandleUserLogin);

module.exports=router;