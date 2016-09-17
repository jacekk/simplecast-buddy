const fs = require('fs')
const request = require('request')
const parser = require('xml-parser')
const getValue = require('get-value')
const pad = require('string-padding')

const PODCASTS_LIST_PATH = './listed-podcasts.txt'

const startId = parseInt(process.argv[2] || 1)
const endId = parseInt(process.argv[3] || 10)
const doSaveToFile = process.argv.includes('--save-to-file')
const doLogDescription = process.argv.includes('--with-description')

if (startId > endId) {
  return console.error('Start id cannot be higher than end id :P')
}

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

  return attrs[0] || ''
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
  ];

  console.log(podcastDetails.join(' || '));

  if (doLogDescription) {
    podcastDetails.push(description)
  }

  if (doSaveToFile) {
    fs.appendFile(
      podcastsListFileHandler,
      podcastDetails.join(' || ') + "\n",
      'utf8'
    )
  }
}

for (var id = startId; id <= endId; id += 1) {
  const url = `https://simplecast.com/podcasts/${id}/rss`

  request(url, (error, response, body) => {
    if (error) {
      return console.error(error.toString())
    }
    if (response.statusCode !== 200) {
      return
    }
    parseXmlResponseBody(body, url)
  })
}
