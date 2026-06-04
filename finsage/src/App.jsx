import React, { useState, useEffect } from "react";
import { GmailContext } from "./GmailContext";
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";
import FinancialDetails from "./components/FinancialDetails.jsx";
import LifestyleBudgeting from "./components/Lifestyle.jsx";
import PeerComparison from "./components/PeerComparison.jsx";
import LoginPage from "./components/LoginPage.jsx";
import Register from "./components/Register.jsx";
import FinSage1 from "./components/FinSage1.jsx";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [user, setUser] = useState(null);
  const [archetype, setArchetype] = useState("");
  const [gmail, setGmail] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const loggedEmail = localStorage.getItem("loggedIngmail");
    const storedAPE = localStorage.getItem("userArchetype") || "";
    if (loggedIn && loggedEmail) {
      setUser({ email: loggedEmail });
      setGmail(loggedEmail);
      setArchetype(storedAPE);
      setCurrentView("dashboard");
    }
    setInitialized(true);
  }, []);

  const navigate = (view) => setCurrentView(view);

  const handleLogout = () => {
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("loggedIngmail");
    localStorage.removeItem("userArchetype");
    setUser(null);
    setGmail("");
    setArchetype("");
    setCurrentView("home");
  };

  const handleSetArchetype = (ape) => {
    setArchetype(ape);
    localStorage.setItem("userArchetype", ape);
  };

  // Don't render routes until initialization is complete
  if (!initialized) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <GmailContext.Provider value={gmail}>
      <div className="App">
        {currentView === "home" && (
          <FinSage1
            onNavigateToDashboard={() => navigate("dashboard")}
            onNavigateToLogin={() => navigate("login")}
            onNavigateToRegister={() => navigate("register")}
            onLogout={handleLogout}
          />
        )}
        {currentView === "login" && (
          <LoginPage
            onLoginSuccess={(email, ape) => {
              setUser({ email });
              setGmail(email); // Correctly set the context!
              handleSetArchetype(ape);
              localStorage.setItem("loggedIn", "true");
              localStorage.setItem("loggedIngmail", email);
              navigate("dashboard");
            }}
            onNavigateToRegister={() => navigate("register")}
            onNavigateToHome={() => navigate("home")}
          />
        )}
        {currentView === "register" && (
          <Register
            // We removed the onRegistrationSuccess prop.
            // Now, Register.jsx will automatically call onNavigateToLogin.
            onNavigateToLogin={() => navigate("login")}
            onNavigateToHome={() => navigate("home")}
          />
        )}
        {currentView === "dashboard" && gmail ? (
          <Dashboard
            user={user}
            archetype={archetype}
            onNavigateToHome={() => navigate("home")}
            onNavigateToProfile={() => navigate("profile")}
            onNavigateToFinancialDetails={() => navigate("financialDetails")}
            onNavigateToLifestyleBudgeting={() => navigate("lifestyleBudgeting")}
            onNavigateToPeerComparison={() => navigate("peerComparison")}
            onLogout={handleLogout}
          />
        ) : currentView === "dashboard" ? (
          <div className="p-10 text-center">Loading...</div>
        ) : null}
        {currentView === "profile" && gmail && (
          <Profile onNavigateBack={() => navigate("dashboard")} user={user} />
        )}
        {currentView === "financialDetails" && gmail && (
          <FinancialDetails onNavigateBack={() => navigate("dashboard")} user={user} />
        )}
        {currentView === "lifestyleBudgeting" && gmail && (
          <LifestyleBudgeting
            onNavigateBack={() => navigate("dashboard")}
            user={user}
            archetype={archetype}
            onArchetypeChange={handleSetArchetype}
          />
        )}
        {currentView === "peerComparison" && gmail && (
          <PeerComparison
            onNavigateBack={() => navigate("dashboard")}
            user={user}
            archetype={archetype}
          />
        )}
      </div>
    </GmailContext.Provider>
  );
}

export default App;
