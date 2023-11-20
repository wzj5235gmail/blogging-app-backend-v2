const validateObjectId = (id) => {
  const regex = /[0-9a-f]{24}/
  return regex.test(id)
}

module.exports = validateObjectId