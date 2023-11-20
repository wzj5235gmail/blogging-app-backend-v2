/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for a tag.
 *         name:
 *           type: string
 *           description: The name of the tag.
 *         postCount:
 *           type: number
 *           description: The number of posts associated with the tag.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the tag was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the tag was last updated.
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for a category.
 *         name:
 *           type: string
 *           description: The name of the category.
 *         postCount:
 *           type: number
 *           description: The number of posts associated with the category.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the category was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the category was last updated.
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
 * /api/tags:
 *   get:
 *     summary: Retrieve all tags.
 *     tags:
 *       - Tags and Categories
 *     responses:
 *       '200':
 *         description: Successful response with the list of tags.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 * 
 *   post:
 *     summary: Create a new tag.
 *     tags:
 *       - Tags and Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Tag data for creation.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the new tag.
 *     responses:
 *       '201':
 *         description: Successful response with the created tag details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '409':
 *         description: The tag with the given name already exists.
*
 * /api/tags/{tagId}:
 *   get:
 *     summary: Retrieve a tag by ID.
 *     tags:
 *       - Tags and Categories
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         description: The ID of the tag to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the tag details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a tag by ID.
 *     tags:
 *       - Tags and Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         description: The ID of the tag to delete.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response indicating the tag has been deleted.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 * 
 *   put:
 *     summary: Update a tag by ID.
 *     tags:
 *       - Tags and Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         description: The ID of the tag to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated tag data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               newName:
 *                 type: string
 *                 description: The new name for the tag.
 *     responses:
 *       '200':
 *         description: Successful response with the updated tag details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/categories:
 *   get:
 *     summary: Retrieve all categories.
 *     tags:
 *       - Tags and Categories
 *     responses:
 *       '200':
 *         description: Successful response with the list of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 * 
 *   post:
 *     summary: Create a new category.
 *     tags:
 *       - Tags and Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Category data for creation.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the new category.
 *     responses:
 *       '201':
 *         description: Successful response with the created category details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '409':
 *         description: The category with the given name already exists.
 *
 * /api/categories/{categoryId}:
 *   get:
 *     summary: Retrieve a category by ID.
 *     tags:
 *       - Tags and Categories
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: The ID of the category to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the category details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a category by ID.
 *     tags:
 *       - Tags and Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: The ID of the category to delete.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response indicating the category has been deleted.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Update a category by ID.
 *     tags:
 *       - Tags and Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: The ID of the category to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated category data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               newName:
 *                 type: string
 *                 description: The new name for the category.
 *     responses:
 *       '200':
 *         description: Successful response with the updated category details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */
