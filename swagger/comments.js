/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for a comment.
 *         post:
 *           type: string
 *           description: The ID of the post to which the comment belongs.
 *         author:
 *           type: string
 *           description: The ID of the user who authored the comment.
 *         content:
 *           type: string
 *           description: The content of the comment.
 *         parentCommentId:
 *           type: string
 *           description: The ID of the parent comment (if it's a reply to another comment).
 *         likes:
 *           type: number
 *           description: The number of likes received by the comment.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the comment was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the comment was last updated.
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
 * /api/comments/all/{postId}:
 *   get:
 *     summary: Retrieve all comments of a specific post.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: The ID of the post for which to retrieve comments.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the list of comments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/comments/{commentId}:
 *   get:
 *     summary: Retrieve a comment by ID.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: The ID of the comment to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the comment details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a comment by ID.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: The ID of the comment to delete.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response indicating the comment has been deleted.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Update a comment by ID.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: The ID of the comment to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated comment data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       '200':
 *         description: Successful response with the updated comment details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'

 * /api/comments:
 *   post:
 *     summary: Create a new comment.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Comment data for creation.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       '201':
 *         description: Successful response with the created comment details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *
 *
 * /api/comments/like/{commentId}:
 *   post:
 *     summary: Like a comment.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: The ID of the comment to like.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the updated like count.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/comments/unlike/{commentId}:
 *   post:
 *     summary: Unlike a comment.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: The ID of the comment to unlike.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the updated like count.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */
