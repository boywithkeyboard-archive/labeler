import { getInput, setFailed } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { readFile } from 'node:fs/promises'
import { parse } from 'yaml'

type Label = {
  name: string
  color: string
  description: string
}

async function action() {
  const config = {
    token: getInput('token'),
    src: getInput('src'),
  }

  const { rest } = getOctokit(config.token)

  let file: string

  if (config.src.startsWith('http://') || config.src.startsWith('https://')) { // remote file
    const res = await fetch(config.src)
    file = await res.text()
  } else { // local file
    file = await readFile(config.src, { encoding: 'utf-8' })
  }

  const { labels } = parse(file) as { labels: Label[] }

  const existingLabels = (await rest.issues.listLabelsForRepo({
    ...context.repo,
    per_page: 100,
  })).data.map(
    (label) => {
      return {
        name: label.name,
        color: label.color,
        description: label.description,
      }
    },
  )

  // delete unwanted labels
  for (const label of existingLabels) {
    if (labels.findIndex((l) => l.name === label.name) < 0) {
      await rest.issues.deleteLabel({
        ...context.repo,
        name: label.name,
      })
    }
  }

  // add/update other labels
  for (const label of labels) {
    const i = existingLabels.findIndex((l) => l.name === label.name)

    // create new
    if (i < 0) {
      await rest.issues.createLabel({
        ...context.repo,
        name: label.name,
        description: label.description,
        color: label.color,
      })

      continue
    }

    // update existing
    const existingLabel = existingLabels[i]

    if (
      existingLabel.color === label.color &&
      existingLabel.description === existingLabel.description
    ) {
      continue
    }

    await rest.issues.updateLabel({
      ...context.repo,
      name: label.name,
      description: label.description,
      color: label.color,
    })
  }
}

try {
  action()
} catch (err) {
  setFailed(
    err instanceof Error ? err.message : 'something unexpected happened.',
  )
}
