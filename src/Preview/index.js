import { FileIcon } from '@cerebroapp/cerebro-ui'
import FileDetails from './FileDetails'
import styles from './styles.css'

const Preview = ({ path, name }) => (
  <div>
    <div className={styles.previewIcon}>
      <FileIcon path={path} />
    </div>
    <div className={styles.previewName}>{name}</div>
    <FileDetails path={path} key={path} skipName />
  </div>
)

export default Preview
