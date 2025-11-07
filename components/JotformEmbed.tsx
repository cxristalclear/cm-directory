import fs from "node:fs"
import path from "node:path"
import Script from "next/script"

const projectRoot = process.cwd()
const htmlSource = fs.readFileSync(path.join(projectRoot, "Add_Your_Company_to_CM_Directory.html"), "utf-8")

const formMarkup = (() => {
  const start = htmlSource.indexOf("<form")
  const end = htmlSource.indexOf("</form>")
  if (start === -1 || end === -1) return ""
  return htmlSource.slice(start, end + "</form>".length)
})()

const designerStyles = (() => {
  const match = htmlSource.match(/<style[^>]*id="form-designer-style"[^>]*>([\s\S]*?)<\/style>/)
  return match ? match[1] : ""
})()

const inlineScripts = (() => {
  const scripts: string[] = []
  const regex = /<script([^>]*)>([\s\S]*?)<\/script>/g
  let match: RegExpExecArray | null = null
  while ((match = regex.exec(htmlSource))) {
    const attrs = match[1] ?? ""
    const content = (match[2] ?? "").trim()
    if (!content) continue
    if (attrs.includes("src=")) continue
    if (/JotForm|enableEventObserver|all_spc/.test(content)) {
      scripts.push(content)
    }
  }
  return scripts
})()

const toScriptId = (prefix: string, value: string) =>
  `${prefix}-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`

const localScripts = [
  "vendor/jquery-1.8.0.min.js",
  "prototype.js",
  "protoplus.js",
  "protoplus-ui-form.js",
  "calendarview.js",
  "location.js",
  "errorNavigation.js",
  "jotform.js",
  "vendor/maskedinput.min.js",
  "vendor/smoothscroll.min.js",
  "vendor/json2.js",
]
  .map(relativePath => {
    const filePath = path.join(projectRoot, "js", relativePath)
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : ""
    return {
      id: relativePath,
      content,
      scriptId: toScriptId("jotform-local", relativePath),
    }
  })
  .filter(asset => asset.content.length > 0)

const cssLinks = [
  "https://cdn.jotfor.ms/stylebuilder/static/form-common.css?v=e411e43",
  "https://cdn.jotfor.ms/fonts/?family=Inter",
  "https://cdn.jotfor.ms/themes/CSS/5e6b428acc8c4e222d1beb91.css?v=3.3.66554&themeRevisionID=65660e4b326633110492e01a",
  "https://cdn.jotfor.ms/s/static/dc4ad19bb36/css/styles/payment/payment_styles.css?3.3.66554",
  "https://cdn.jotfor.ms/s/static/dc4ad19bb36/css/styles/payment/payment_feature.css?3.3.66554",
]

const remoteScripts = [
  "https://cdn.jotfor.ms/s/static/dc4ad19bb36/js/punycode-1.4.1.min.js",
]

export default function JotformEmbed() {
  return (
    <>
      <div className="jotform-styles">
        {cssLinks.map(href => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        {designerStyles && (
          <style dangerouslySetInnerHTML={{ __html: designerStyles }} />
        )}
      </div>

      <div
        className="jotform-container"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: formMarkup }}
      />

      {localScripts.map(asset => (
        <Script
          key={asset.id}
          id={asset.scriptId}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: asset.content }}
        />
      ))}

      {remoteScripts.map(src => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}

      {inlineScripts.map((content, index) => (
        <Script
          key={`inline-${index}`}
          id={toScriptId("jotform-inline", `inline-${index}`)}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ))}
    </>
  )
}
