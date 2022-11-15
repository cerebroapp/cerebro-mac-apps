import { exec } from 'node:child_process'
import { Fzf, FzfResultItem } from 'fzf'
import { homedir } from 'node:os'
import { normalize } from 'node:path'

const ATTRIBUTES = {
  name: 'kMDItemDisplayName',
  lastUsed: 'kMDItemLastUsedDate',
  useCount: 'kMDItemUseCount'
}

const makeArgs = (array: string[], argName: string): string => (
  array.map(item => `${argName} "${item}"`).join(' ')
)

type AppType = 'apps' | 'preferences'

const FindQueries: Record<AppType, string> = {
  apps: 'kMDItemContentType=com.apple.application-bundle',
  preferences: 'kMDItemContentType=com.apple.systempreference.prefpane'
}

interface FindOptions {
  appTypes: AppType[]
  appIncludeRegexes: string[]
}

const DEFAULT_OPTIONS: FindOptions = {
  appTypes: ['apps', 'preferences'],
  appIncludeRegexes: [
    '^/Applications',
    '^/System/Library/CoreServices',
    '^/System/Applications',
    `^${homedir()}/Applications`,
    '\\.prefPane'
  ]
}

export interface App {
  name: string
  path: string
  lastUsed: string
  useCount: number
}

export default async function getAppsListSearcher ({ appTypes, appIncludeRegexes } = DEFAULT_OPTIONS) {
  const attrArgs = makeArgs(Object.values(ATTRIBUTES), '-attr')
  const queryArgs = appTypes.map(type => FindQueries[type]).join(' || ')

  const args = `${attrArgs} '${queryArgs}'`

  return new Promise<Fzf<App[]>>((resolve, reject) => {
    exec(`mdfind ${args} | egrep "${appIncludeRegexes.join('|').replaceAll('/', '\\/')}"`,
      (error, stdout, stderr) => {
        if (error != null) {
          console.error('mdfind err', error)
          reject(error)
        } else {
          resolve(
            new Fzf<App[]>(
              stdout.split('\n')
                .filter(line => line.trim().length > 0)
                .map(line => {
                  const pieces = line.split('   ')

                  if (pieces.length === 0) return null

                  const path = normalize(pieces[0]).trim()

                  const name = pieces.find(
                    piece => piece.includes(ATTRIBUTES.name))?.replace(`${ATTRIBUTES.name} = `, ''
                  )?.trim() ?? path

                  const lastUsed = pieces.find(
                    piece => piece.includes(ATTRIBUTES.lastUsed))?.replace(`${ATTRIBUTES.lastUsed} = `, ''
                  )?.trim() ?? 'never'

                  const useCountValue = pieces.find(
                    piece => piece.includes(ATTRIBUTES.useCount))?.replace(`${ATTRIBUTES.useCount} = `, ''
                  )?.trim() ?? ''

                  const useCount = parseInt(useCountValue) || 0

                  return { path, name, useCount, lastUsed }
                })
                .filter((app: App | null) => (app != null) && app.path.length > 1),
              {
                selector: (app: App) => app.name,
                tiebreakers: [(first: FzfResultItem<App>, second: FzfResultItem<App>) => second.item.useCount - first.item.useCount]
              }
            )
          )
        }
      })
  })
}
