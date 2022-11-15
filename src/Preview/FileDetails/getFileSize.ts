import du from 'du'
import { memoize } from 'cerebro-tools'

/**
 * Get size of file
 */
const getFileSize = async (path: string) => (
  new Promise((resolve, reject) => {
    du(path, (err, size) => (
      (err != null) ? reject(err) : resolve(size)
    ))
  })
)

export default memoize(getFileSize)
