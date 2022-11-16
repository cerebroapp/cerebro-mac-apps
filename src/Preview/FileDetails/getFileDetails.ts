import fs from 'node:fs/promises'
import memoize from 'memoizee'

const getFileDetails = async (path) => fs.stat(path)

export default memoize(getFileDetails)
