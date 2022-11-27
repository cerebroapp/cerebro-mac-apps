import bytesToSize from './bytesToSize'
import getFileSize from './getFileSize'
import getFileDetails from './getFileDetails'
import styles from './styles.css'
import nodePath from 'node:path'
import type { Stats } from 'node:fs'

interface Props {
  path: string
  skipName?: boolean
  skipSize?: boolean
}

const FileDetails = ({ skipName = false, skipSize = false, path }: Props) => {
  const [size, setSize] = React.useState<number>(0)
  const [details, setDetails] = React.useState<Stats | null>(null)

  React.useEffect(() => {
    async function fetchFileDetails () {
      const size = await getFileSize(path)
      setSize(size)

      const details = await getFileDetails(path)
      setDetails(details)
    }
    fetchFileDetails()
  }, [path])

  const name = nodePath.basename(path)

  return (
    <div className={styles.fileDetails}>
      {!skipName && <h3 className={styles.fileName}>{name}</h3>}
      <dl>
        { (details != null) &&
          <>
            <dt>Last opened:</dt>
            <dd>{details.atime.toLocaleString()}</dd>
            <dt>Modified:</dt>
            <dd>{details.mtime.toLocaleString()}</dd>
            <dt>Created:</dt>
            <dd>{details.ctime.toLocaleString()}</dd>
          </>
        }
        {!skipSize && <dt>Size:</dt>}
        {!skipSize && <dd>{bytesToSize(size)}</dd>}
      </dl>
    </div>
  )
}

export default FileDetails
