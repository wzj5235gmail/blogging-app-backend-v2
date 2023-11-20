/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for a post.
 *         title:
 *           type: string
 *           description: The title of the post.
 *         content:
 *           type: string
 *           description: The content of the post.
 *         author:
 *           type: string
 *           description: The ID of the post author.
 *         category:
 *           type: string
 *           description: The ID of the post category.
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: The list of tag IDs associated with the post.
 *         publishDate:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was published.
 *         lastUpdateDate:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was last updated.
 *         status:
 *           type: string
 *           enum:
 *             - draft
 *             - published
 *             - archived
 *           description: The status of the post.
 *         views:
 *           type: number
 *           description: The number of views the post has.
 *         likes:
 *           type: number
 *           description: The number of likes the post has.
 *         comments:
 *           type: number
 *           description: The number of comments on the post.
 *         coverImage:
 *           type: string
 *           description: The URL of the cover image for the post.
 *         summary:
 *           type: string
 *           description: A summary or excerpt of the post content.
 *         featured:
 *           type: boolean
 *           description: Indicates if the post is featured.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was last updated.
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
 * /api/posts:
 *   get:
 *     summary: Retrieve all posts.
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: page
 *         type: integer
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         type: integer
 *         description: The number of items per page.
 *     responses:
 *       '200':
 *         description: Successful response with the list of posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 object:
 *                   type: string
 *                   description: The type of the response object.
 *                 has_more:
 *                   type: boolean
 *                   description: Indicates if there are more pages.
 *                 item_count:
 *                   type: integer
 *                   description: The number of items in the current response.
 *                 pageCount:
 *                   type: integer
 *                   description: The total number of pages.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 *   post:
 *     summary: Create a new post.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Post data for creation.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       '201':
 *         description: Successful response with the created post details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 * 
 * /api/posts/{postId}:
 *   get:
 *     summary: Retrieve a post by ID.
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: The ID of the post to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the post details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 *
 *   delete:
 *     summary: Delete a post by ID.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: The ID of the post to delete.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response indicating the post has been deleted.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Update a post by ID.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: The ID of the post to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated post data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       '200':
 *         description: Successful response with the updated post details.
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 * 
 * /api/posts/like/{postId}:
 *   post:
 *     summary: Like a post.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: The ID of the post to like.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response indicating the post has been liked.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 * 
 * /api/posts/unlike/{postId}:
 *   post:
 *     summary: Unlike a post.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: The ID of the post to unlike.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response indicating the post has been unliked.
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */
