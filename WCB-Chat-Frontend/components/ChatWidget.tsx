import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import Markdown from 'react-markdown'



//What the frontend sends/backend expects:
// 1. PUBLIC_API_KEY 
// 2. Messages variable
// 3. conversationId .. now this will be provided after the first axios.post request to the chat endpoint. 

// Mock ChatWidget component
function ChatWidget({ config }: {config: any}) {
  const [isOpen, setIsOpen] = useState(false)
  // const [messages, setMessages] = useState<ModelMessage[]>([])
  const [input, setInput] = useState('')
  const CHAT_BACKEND_URL = "http://localhost:3001" //This would come from the config file actually!
  console.log("CHAT BACKEND URL ", CHAT_BACKEND_URL)
  //This would change in the future to preserve chats in the future. 
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${CHAT_BACKEND_URL}/chat`,
      headers: {
        Authorization: `Bearer ${config.PUBLIC_API_KEY}`
      }
    }),
    onError: (error) => {
        console.error('useChat error:', error);
    }
  })

  const handleSend = () => {
    if (!input.trim()) return
    
    sendMessage({text : input})
    
    
    setInput('')

  }

  return (
    <div className='pr-5 mb-10'>
      {/* Chat bubble button */}
      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="w-120 h-[750px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold text-xl">Website Chatbot Agent</h3>
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
  <div className="font-roboto text-xl flex-1 overflow-y-auto p-4 space-y-4">
  {messages.map(message => (
    <div 
      key={message.id} 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`max-w-[70%] font-normal  rounded-3xl px-4 py-3 ${
          message.role === 'user' 
            ? 'bg-gray-200 text-gray-900' 
            : 'bg-black text-white'
        }`}
      >
        <div className="text-lg font-roboto leading-relaxed prose prose-invert max-w-none">
          {message.parts.map((part, index) =>
            part.type === 'text' ? (
              <Markdown key={index}>{part.text}</Markdown>
            ) : null
          )}
        </div>
      </div>
    </div>
  ))}
  {status === 'submitted' && (
    <div className="flex justify-start">
      <div className="bg-black text-white rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  )}
</div>

          {/* Input */}
          <div className="border-t p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 text-lg px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
            <button
              onClick={handleSend}
              disabled={status !== 'ready'}
              className="bg-black text-lg text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWidget