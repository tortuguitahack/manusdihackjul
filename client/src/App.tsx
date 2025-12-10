import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Integrations from "./pages/Integrations";
import N8nSettings from "./pages/N8nSettings";
import { WorkflowMonitor } from "./pages/WorkflowMonitor";
import { ExpertDashboard } from "./pages/ExpertDashboard";
import { AdvancedPayment } from "./pages/AdvancedPayment";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/integrations"} component={Integrations} />
      <Route path={"/n8n-settings"} component={N8nSettings} />
      <Route path={"/workflow-monitor"} component={WorkflowMonitor} />
      <Route path={"/expert"} component={ExpertDashboard} />
      <Route path={"/advanced-payment"} component={AdvancedPayment} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
