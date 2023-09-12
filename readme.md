## labeler

e.g. `./.github/labeler.yml`

```yaml
labels:
  - name: 'foo'
    color: 'd73a4a'
    description: 'Some description.'
  - name: 'bar'
    color: '0075ca'
    description: 'Some description.'
```

### Usage

```yml
name: labeler

on:
  push:
    branches:
      - 'main'
    paths:
      - '.github/labeler.yml'
  workflow_dispatch:

jobs:
  labeler:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run labeler
        uses: boywithkeyboard/labeler@v1
```

- `src` _(defaults to `./.github/labeler.yml`)_

  The file to use as config for labeler. Can be either a remote file, e.g.
  `https://my.domain/example.yml`, or a local file.
