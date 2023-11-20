// Import necessary modules and constants
const statusCodes = require("../constants")
const validateObjectId = require("./validateObjectId")

// Define a function to generate a filtered query for database searches
const getFilteredQuery = (req, res, modelName) => {
    // Check if the request query is an object
    if (typeof (req.query) !== 'object') {
        throw new Error('Req object invalid.')
    }

    // Check if the number of keys in the request query is less than 3
    if (Object.keys(req.query).length < 3) {
        // If fewer than 3 keys, return an empty query
        return {}
    }

    // Create a copy of the request query to work with
    let filteredQuery = { ...req.query }

    // Remove 'page' and 'limit' keys from the query
    delete filteredQuery.page
    delete filteredQuery.limit
    delete filteredQuery.order

    // Check if the query has a 'search' key
    if (!(filteredQuery.hasOwnProperty('search'))) {
        // If 'search' key is not present, check for 'id' keys and validate them
        for (let queryKey in filteredQuery) {
            if (/id/i.test(queryKey) && !validateObjectId(filteredQuery[queryKey])) {
                // If invalid 'id', set a BAD_REQUEST status and throw an error
                res.status(statusCodes.BAD_REQUEST)
                throw new Error('Invalid query Id.')
            }
        }
    } else {
        // If 'search' key is present, perform model-specific query modifications
        const searchTerm = filteredQuery.search

        // Check if modelName is a string
        if (typeof (modelName) !== 'string') {
            throw new Error('Model name must be a string. e.g. User, Post')
        }

        // Modify the query based on the modelName
        switch (modelName) {
            case 'Post':
                filteredQuery = {
                    $or: [
                        { title: { $regex: searchTerm, $options: "i" } },
                        { content: { $regex: searchTerm, $options: "i" } }
                    ]
                }
                break
            case 'User':
                filteredQuery = {
                    $or: [
                        { username: { $regex: searchTerm, $options: "i" } },
                        { email: { $regex: searchTerm, $options: "i" } }
                    ]
                }
                break
            case 'Comment':
                const postId = req.params.postId
                filteredQuery = { postId, content: { $regex: searchTerm, $options: 'i' } }
                break
            case 'Tag':
                filteredQuery = { name: { $regex: searchTerm, $options: 'i' } }
                break
            case 'Category':
                filteredQuery = { name: { $regex: searchTerm, $options: 'i' } }
                break
            default:
                throw new Error('Unknown model name.')
        }
    }

    // Return the generated filtered query
    return filteredQuery
}

// Export the getFilteredQuery function for use in other modules
module.exports = getFilteredQuery
