const defaultFormEmbedLink = "https://form.jotform.com/252715469871165"

type JotformEmbedProps = {
  formUrl?: string
  minimumHeight?: number
  title?: string
}

export default function JotformEmbed({
  formUrl,
  minimumHeight = 1200,
  title = "List your company form",
}: JotformEmbedProps) {
  const resolvedFormUrl = formUrl ?? defaultFormEmbedLink

  return (
    <div className="w-full">
      <iframe
        src={resolvedFormUrl}
        title={title}
        loading="lazy"
        style={{ width: "100%", minHeight: minimumHeight, border: "none" }}
      />
    </div>
  )
}
