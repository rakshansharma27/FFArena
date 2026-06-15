import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-zinc max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-zinc-100 mb-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4 border-b border-zinc-800 pb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-3" {...props} />,
          p: ({node, ...props}) => <p className="text-zinc-400 leading-relaxed mb-4" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside text-zinc-400 mb-4 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside text-zinc-400 mb-4 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="text-zinc-400" {...props} />,
          a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-zinc-200" {...props} />,
        }}
      >
        {content || "*No rules specified.*"}
      </ReactMarkdown>
    </div>
  )
}
