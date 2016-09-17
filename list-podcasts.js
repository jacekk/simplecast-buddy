const fs = require('fs')
const request = require('request')
const parser = require('xml-parser')
const getValue = require('get-value')
const pad = require('string-padding')

// params parsing
const startId = parseInt(process.argv[2] || 1)
const amount = parseInt(process.argv[3] || 10)
const doSaveToFile = process.argv.includes('--save-to-file')
const doLogDescription = process.argv.includes('--with-description')
const doShowErrors = process.argv.includes('--show-errors')

// output-related contants
const PODCASTS_LIST_PATH = './listed-podcasts.txt'
const COLUMN_DELIMITER = ' ‖ '

let podcastsListFileHandler

if (doSaveToFile) {
  podcastsListFileHandler = fs.openSync(PODCASTS_LIST_PATH, 'w')
}

const findAttr = (list, attrName) => {
  const attrs = list
    .filter((item) => {
      return item.name === attrName
    })
    .map((item) => {
      return item.content || ''
    })

  return attrs[0] ?
    attrs[0].replace(/\r\n/g, '')
    : ''
}

const parseXmlResponseBody = (responseBody, rssUrl) => {
  const parsed = parser(responseBody)
  const details = getValue(parsed, 'root.children.0.children')

  if (! details) {
    return
  }

  const lang = findAttr(details, 'language')
  const link = findAttr(details, 'link')
  const title = findAttr(details, 'title')
  const description = findAttr(details, 'description')

  let podcastDetails = [
    pad(rssUrl, 42, ' ', pad.RIGHT),
    pad(lang, 5, ' ', pad.RIGHT),
    pad(link, 60, ' ', pad.RIGHT),
    doLogDescription ? pad(title, 50, ' ', pad.RIGHT) : title,
  ]

  console.log(podcastDetails.join(COLUMN_DELIMITER))

  if (doLogDescription) {
    podcastDetails.push(description)
  }

  if (doSaveToFile) {
    fs.appendFile(
      podcastsListFileHandler,
      podcastDetails.join(COLUMN_DELIMITER) + "\r\n",
      'utf8'
    )
  }
}

const handleResponseError = (response, rssUrl) => {
  if (! doShowErrors) {
    return
  }

  console.error([
    pad(rssUrl, 42, ' ', pad.RIGHT),
    pad(response.statusCode, 5, ' ', pad.BOTH),
    response.statusMessage,
  ].join(COLUMN_DELIMITER))
}

const highestId = startId + amount - 1

for (let id = highestId; id >= startId; id -= 1) {
  const url = `https://simplecast.com/podcasts/${id}/rss`

  request(url, (error, response, body) => {
    if (error) {
      return console.error(error.toString())
    }
    if (response.statusCode === 200) {
      parseXmlResponseBody(body, url)
    } else {
      handleResponseError(response, url)
    }
  })
}
