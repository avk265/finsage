import { createContext, useContext } from "react";

// Context holds the global gmail value
export const GmailContext = createContext();

// Hook for convenient access in any component
export const useGmail = () => useContext(GmailContext);
