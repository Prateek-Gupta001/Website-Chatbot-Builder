import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
//What the frontend sends/backend expects:
// 1. PUBLIC_API_KEY 
// 2. Messages variable
// 3. conversationId .. now this will be provided after the first axios.post request to the chat endpoint. 

// Mock ChatWidget component
function ChatWidget({ config }: {config: any}) {
  const [isOpen, setIsOpen] = useState(false)
  // const [messages, setMessages] = useState<ModelMessage[]>([])
  const [conversationId, setconversationId] = useState<any>(null) 
  const [input, setInput] = useState('')
  const CHAT_BACKEND_URL = import.meta.env.VITE_CHAT_BACKEND
  // useEffect(()=>{
    //in this we need to make an axios.post request everytime the messages variable changes ..and the main thing really is making up that 
    //axios.post request. 


  // }, [messages])
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${CHAT_BACKEND_URL}/chat`,
      headers: {
        Authorization: `Bearer ${config.PUBLIC_API_KEY}`
      }
    })
  })

  const handleSend = () => {
    if (!input.trim()) return
    
    sendMessage({text : input})
    
    
    setInput('')

  }

  return (
    <>
      {/* Chat bubble button */}
      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">ChatBot</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, index) =>
            part.type === 'text' ? <span key={index}>{part.text}</span> : null,
          )}
        </div>
      ))}

          </div>

          {/* Input */}
          <div className="border-t p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
            <button
              onClick={handleSend}
              disabled={status !== 'ready'}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget