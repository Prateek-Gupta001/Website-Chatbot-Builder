// App component with mock website
import ChatWidget from "../components/ChatWidget"

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mock website content */}
      <div className="max-w-4xl mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Our Website
          </h1>
          <p className="text-lg text-gray-600">
          </p>
        </header>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">About Us</h2>
          <p className="text-gray-700 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p className="text-gray-700">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi 
            ut aliquip ex ea commodo consequat.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-3">Our Services</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Service One</li>
            <li>• Service Two</li>
            <li>• Service Three</li>
          </ul>
        </div>

        <div className="h-96"></div>
      </div>

      {/* Chat Widget - Fixed position */}
      <div className="fixed bottom-5 right-5 z-[999999]">
        <ChatWidget config={{
          apiUrl: 'http://localhost:3001',
          PUBLIC_API_KEY: "e4c3642c37cab8b69c57d94f1554cdd495dad9a36adcdf419739f7d2006cec5a",
        }} />
      </div>
    </div>
  )
}

export default App