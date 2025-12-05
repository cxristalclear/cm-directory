const formEmbedLink = "https://form.jotform.com/252715469871165"

type JotformEmbedProps = {
  minimumHeight?: number
  title?: string
}

/**
* Render a responsive JotForm embed iframe inside a full-width container.
* @example
* JotformEmbed({ minimumHeight: 800, title: "Contact form" })
* <div className="w-full"><iframe src="{formEmbedLink}" title="Contact form" style={{ width: "100%", minHeight: 800, border: "none" }} loading="lazy" /></div>
* @param {{number}} {{minimumHeight}} - Minimum height of the iframe in pixels (optional, default: 1200).
* @param {{string}} {{title}} - Accessible title for the iframe (optional, default: "List your company form").
* @returns {{JSX.Element}} A JSX element containing the embedded JotForm iframe.
**/
export default function JotformEmbed({
  minimumHeight = 1200,
  title = "List your company form",
}: JotformEmbedProps) {
  return (
    <div className="w-full">
      <iframe
        src={formEmbedLink}        
        title={title}
        loading="lazy"
        style={{ width: "100%", minHeight: minimumHeight, border: "none" }}
      />
    </div>
  )
}
