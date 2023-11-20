/**
 * @swagger
 * tags:
 *   name: OAuth
 *   description: Operations related to OAuth authentication
 */

/**
 * @swagger
 * /oauth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /oauth/google/callback:
 *   get:
 *     summary: Callback URL for Google OAuth authentication
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The authorization code from Google
 *     responses:
 *       302:
 *         description: Redirect to the success or fail route
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /oauth/profile:
 *   get:
 *     summary: Get user profile after OAuth authentication
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /oauth/fail:
 *   get:
 *     summary: OAuth authentication failure route
 *     tags: [OAuth]
 *     responses:
 *       200:
 *         description: OAuth authentication failed
 *       500:
 *         description: Internal server error
 */
