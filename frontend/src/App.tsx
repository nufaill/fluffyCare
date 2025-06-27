import { BrowserRouter as Router } from "react-router-dom";
import UserRoutes from "./routers/UserRoutes";
import ShopRoutes from "./routers/ShopRoutes";
import ToasterSetup from '@/components/ui/ToasterSetup';
function App() {
  return (
    <Router>
      <>
        <UserRoutes />
        <ShopRoutes />
        <ToasterSetup />
      </>
    </Router>
  );
}

export default App;
