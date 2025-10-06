import { createRoot } from 'react-dom/client';  // React 18 way
import ChatWidget from "../components/ChatWidget"

// Vite IIFE format will wrap this and expose it as window.ChatWidget
export function init(mountPoint: any, config: any) {
  const root = createRoot(mountPoint);
  root.render(<ChatWidget config={config} />);
}

// For IIFE format, Vite expects a default export
export default { init };