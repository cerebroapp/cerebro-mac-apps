import du from 'du'
import memoize from 'memoizee'

const getFileSize = async (path: string) => du(path)

export default memoize(getFileSize)
