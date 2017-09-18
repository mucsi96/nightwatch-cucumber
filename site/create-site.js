const fs = require('fs')
const path = require('path')
const assert = require('assert')
const md = require('markdown-it')()
const Prism = require('prismjs')
const twemoji = require('twemoji')
const PrismLoader = require('prismjs-components-loader')
const componentIndex = require('prismjs-components-loader/lib/all-components')
const glob = require('glob')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

md.use((markdownit) => {
  const prismLoader = new PrismLoader(componentIndex)

  markdownit.options.highlight = (text, lang) => {
    prismLoader.load(Prism, lang)
    assert(Prism.languages[lang], `${lang} Prism component not found`)
    const code = Prism.highlight(text, Prism.languages[lang])
    const classAttribute = ` class="language-${lang}"`
    return `<pre${classAttribute}><code${classAttribute}>${code}</code></pre>`
  }
})
md.use(require('markdown-it-anchor'))
md.use(require('markdown-it-table-of-contents'))

const markdownSrc = path.resolve(__dirname, 'data')
const templateSrc = path.resolve(__dirname, 'template')
const templeteResSrc = path.resolve(templateSrc, 'res')
const prismSrc = path.resolve(__dirname, '../node_modules/prismjs')
const dist = path.resolve(__dirname, '../site-dist')
const distRes = path.resolve(dist, 'res')
const twemojiSrc = path.resolve(__dirname, '../node_modules/twemoji/2/svg')
const template = fs.readFileSync(path.resolve(__dirname, 'template/index.html'), 'utf8')
const svgSrc = path.resolve(__dirname, '../node_modules/simple-icons/icons')

function copyFile (from, to) {
  mkdirp.sync(to)
  const fileName = path.basename(from)
  const dest = path.resolve(to, fileName)
  console.log(`copy ${from} -> ${dest}`)
  fs.createReadStream(from).pipe(fs.createWriteStream(dest))
}

function copyAllFiles (from, to) {
  const files = glob.sync(path.resolve(from, '**/*.*'))
  files.forEach(file => {
    const relativePath = path.relative(from, file)
    copyFile(file, path.dirname(path.resolve(to, relativePath)))
  })
}

function getEmojiSVG (emoji) {
  return fs
    .readFileSync(path.resolve(twemojiSrc, `${twemoji.convert.toCodePoint(emoji)}.svg`), 'utf8')
    .replace('<svg', '<svg class="emoji" ')
}

function makeTableResponsive (html) {
  return html.replace(/<table>[\s\S]*?<\/table>/gi, '<div class="responsive-table">$&</div>')
}

function injectEmoji (html) {
  const ranges = [
    '[\u2049-\u3299]',
    '\ud83c[\udf00-\udfff]',
    '\ud83d[\udc00-\ude4f]',
    '\ud83d[\ude80-\udeff]'
  ]
  return html.replace(new RegExp(ranges.join('|'), 'g'), emoji => getEmojiSVG(emoji))
}

function injectContributors (html) {
  const contributors = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.all-contributorsrc'), 'utf8')).contributors
  .map(contributor => (`
  <li><a href="${contributor.profile}">
  <img src="${contributor.avatar_url}" class="avatar">
  <sub>${contributor.name}</sub>
  </a></li>
  `)).join('')
  return html.replace('<p>[[contributors]]</p>', `<ul class="contributors">${contributors}</ul>`)
}

function injectSvg (html) {
  return html.replace(/:([^:]*).svg:/g, (match, fileName) => {
    return fs.readFileSync(path.resolve(svgSrc, `${fileName}.svg`), 'utf8').replace('<svg', `<svg class="icon ${fileName}" `)
  })
}

function loadMarkdown (filePath) {
  console.log('loading', filePath)
  const content = fs.readFileSync(filePath, 'utf8')
  return content.replace(/@import '([^']+)'/g, (match, fileName) => {
    return `${loadMarkdown(path.resolve(path.dirname(filePath), fileName))}\n`
  })
}

function renderMarkdown (markdown, targetFileName) {
  const initialHtml = template.replace('<!-- CONTENT -->', md.render(markdown))
  const html = [
    injectContributors,
    makeTableResponsive,
    injectSvg,
    injectEmoji
  ].reduce((result, processor) => processor(result), initialHtml)
  mkdirp.sync(path.dirname(targetFileName))
  console.log(`write ${targetFileName}`)
  fs.writeFileSync(targetFileName, html, 'utf8')
}

rimraf.sync(dist)
renderMarkdown(loadMarkdown(path.resolve(markdownSrc, 'index.md')), path.resolve(dist, 'index.html'))
copyAllFiles(templeteResSrc, distRes)
copyFile(path.resolve(prismSrc, 'prism.js'), distRes)
copyFile(path.resolve(prismSrc, 'themes/prism-okaidia.css'), distRes)
