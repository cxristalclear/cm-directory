const formEmbedLink = "https://form.jotform.com/252715469871165"

type JotformEmbedProps = {
  minimumHeight?: number
  title?: string
}

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
