import Preview from './Preview'
import memoize from 'memoizee'
import getAppsListSearcher, { App } from './lib/getAppsListSearcher'
import fs from 'node:fs'
import type { Fzf } from 'fzf'
import type { KeyboardEvent } from 'react'

/**
 * Directories to watch.
 * Updates in these directories lead to force recache of apps
 * @type {Array}
 */
const WATCH_DIRECTORIES = [
  '/Applications/'
]

/**
 * Options for WATCH_DIRECTORIES fs.watch
 */
const WATCH_OPTIONS: fs.WatchOptions = {
  recursive: true
}

/**
 * Time for apps list cache
 * 30 minutes
 */
const CACHE_TIME = 30 * 60 * 1000

/**
 * Memoized getAppsList function
 */
const cachedAppsListSearcher = memoize(getAppsListSearcher, {
  length: false,
  promise: 'then',
  maxAge: CACHE_TIME,
  preFetch: true
})

const plugin = ({ term, actions, display }) => {
  if (term.toLowerCase() === 'refresh') {
    display({
      title: 'Refresh Mac Apps Cache',
      onSelect: async () => cachedAppsListSearcher.clear()
    })

    return
  }

  cachedAppsListSearcher().then((itemsSearcher: Fzf<string[]>) => {
    const result =
      itemsSearcher.find(term)
        .map(({ item }) => item)
        .map(({ path, name, ...rest }: App) => {
          return {
            id: path,
            title: name,
            term: name,
            icon: path,
            subtitle: path,
            clipboard: path,
            onKeyDown: (event: KeyboardEvent) => {
              if ((event.metaKey || event.ctrlKey) && event.keyCode === 82) {
                // Show application in Finder by cmd+R shortcut
                actions.reveal(path)
                event.preventDefault()
              }
            },
            onSelect: () => actions.open(`file://${path}`),
            getPreview: () => <Preview path={path} name={name} {...rest}/>
          }
        })
    display(result)
  })
}

const initialize = () => {
  // Cache apps cache and force cache reloading in background
  const recache = () => {
    cachedAppsListSearcher.clear()
    cachedAppsListSearcher()
  }
  // Force recache before expiration
  setInterval(recache, CACHE_TIME * 0.95)
  recache()

  // recache apps when apps directories changed
  WATCH_DIRECTORIES.forEach(dir => {
    fs.watch(dir, WATCH_OPTIONS, recache)
  })
}

export default {
  initialize,
  fn: plugin
}
