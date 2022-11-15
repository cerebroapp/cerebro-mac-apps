import fs from 'node:fs'
import { memoize } from 'cerebro-tools'

/**
 * Promise-wrapper for fs.stat
 */
const getFileDetails = async (path) => (
  new Promise((resolve, reject) => {
    fs.stat(path, (err, stat) => (
      (err != null) ? reject(err) : resolve(stat)
    ))
  })
)

export default memoize(getFileDetails)
