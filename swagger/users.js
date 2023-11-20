/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for a user.
 *         username:
 *           type: string
 *           description: The username of the user.
 *         password:
 *           type: string
 *           description: The hashed password of the user.
 *         email:
 *           type: string
 *           description: The email address of the user.
 *         name:
 *           type: string
 *           description: The name of the user.
 *         avatar:
 *           type: string
 *           description: The URL of the user's avatar.
 *         bio:
 *           type: string
 *           description: The biography of the user.
 *         phone:
 *           type: string
 *           description: The phone number of the user.
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           description: The interests of the user.
 *         follows:
 *           type: array
 *           items:
 *             type: string
 *           description: The users followed by the user.
 *         likedComments:
 *           type: array
 *           items:
 *             type: string
 *           description: The comments liked by the user.
 *         posts:
 *           type: array
 *           items:
 *             type: string
 *           description: The posts created by the user.
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: The posts liked by the user.
 *         savedPosts:
 *           type: array
 *           items:
 *             type: string
 *           description: The posts saved by the user.
 *         role:
 *           type: string
 *           description: The role of the user (e.g., "Admin", "Staff", "Guest").
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: The date and time of the user's last login.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was last updated.
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           description: The HTTP status code.
 *         message:
 *           type: string
 *           description: A human-readable error message.
 *
 * /api/users/{userId}:
 *   get:
 *     summary: Retrieve user details by ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the user details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/users:
 *   get:
 *     summary: Retrieve a list of users with optional pagination and filtering.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: The number of items to return per page.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: The page number.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: The field to use for sorting and the sort order (e.g., "username:asc").
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter users by role (e.g., "Admin", "Staff").
 *     responses:
 *       '200':
 *         description: Successful response with the list of users.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *
 *   post:
 *     summary: Register a new user.
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User data for registration.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: Successful response with the registered user details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/users/login:
 *   post:
 *     summary: Login with username or email and password.
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User credentials for login.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usernameOrEmail:
 *                 type: string
 *                 description: The username or email of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *     responses:
 *       '200':
 *         description: Successful response with the user details and token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /api/users/change-password:
 *   put:
 *     summary: Change user password.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: New and old passwords.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The old password of the user.
 *               newPassword:
 *                 type: string
 *                 description: The new password of the user.
 *     responses:
 *       '200':
 *         description: Successful response indicating the password has been changed.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /api/users/update:
 *   put:
 *     summary: Update user information.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Updated user information.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: Successful response with the updated user details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /api/users/update-list-fields:
 *   put:
 *     summary: Update user list-type fields (e.g., interests, follows).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Field name, operation type, and item IDs.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fieldName:
 *                 type: string
 *                 description: The name of the list-type field to update.
 *               operationType:
 *                 type: string
 *                 description: The operation type ('add' or 'remove').
 *               itemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The IDs of items to add or remove from the list.
 *     responses:
 *       '200':
 *         description: Successful response with the updated user details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /api/users/all/featured:
 *   get:
 *     summary: Retrieve a list of featured users.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: The number of items to return per page.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: The page number.
 *     responses:
 *       '200':
 *         description: Successful response with the list of featured users.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *
 * /api/users/{userId}/posts:
 *   get:
 *     summary: Retrieve posts created by a specific user.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user whose posts to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the list of user's posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/users/{role}/{userId}:
 *   put:
 *     summary: Update the role of a specific user.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         description: The role to assign to the user (e.g., "Admin", "Staff").
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user whose role to update.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the updated user details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */
