const less = require('less')
const fs = require('fs')
const path = require('path')

const themeName = 'awb_custom'
const baseThemeName = 'sap_horizon'
const inputFile = path.join('src', 'theme', 'awb_custom.less')
const outputDir = path.join('src', 'themes')
const outputFile = path.join(outputDir, `${themeName}.css`)

const CUSTOM_THEME_METADATA = `.sapThemeMetaData-Base-baseLib {
  background-image: url('data:text/plain;utf-8, { "Path": "Base.baseLib.${themeName}.css_variables", "Extends": ["${baseThemeName}","baseTheme"]}');
}`

async function compile() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const lessData = await fs.promises.readFile(inputFile, 'utf-8')
  const { css } = await less.render(lessData, { filename: inputFile })
  const output = `${CUSTOM_THEME_METADATA}\n${css}`

  await fs.promises.writeFile(outputFile, output, 'utf-8')
  console.log(`Theme built: ${outputFile}`)
}

compile().catch((err) => {
  console.error('Theme build failed:', err)
  process.exit(1)
})