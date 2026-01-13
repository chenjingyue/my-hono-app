// routes/users.js
const {Hono} = require("hono");
const {getUserById, saveUser, userList} = require("../controller/userController");
const router = new Hono();



// GET /api/users — 获取所有用户
router.get('/', userList);

// GET /api/users/:id — 获取单个用户
router.get('/:id', getUserById);

// POST /api/users — 创建新用户
router.post('/', saveUser);

module.exports = router;