const fs = require('fs')
const request = require('request')
const parser = require('xml-parser')
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

const parseXmlResponseBody = (responseBody, rssUrl) => {
  const parsed = parser(responseBody)
  const details = parsed.root.children[0].children

  const title = details[1].content
  const description = details[3].content
  const lang = details[5].content
  const link = details[8].content

  let podcastDetails = [
    pad(rssUrl, 44, ' ', pad.RIGHT),
    pad(lang, 5, ' ', pad.RIGHT),
    pad(title, 50, ' ', pad.RIGHT),
    doLogDescription ? pad(link, 50, ' ', pad.RIGHT) : link,
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
