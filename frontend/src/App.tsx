import { BrowserRouter as Router } from "react-router-dom";
import UserRoutes from "./routers/User.routes";
import ShopRoutes from "./routers/Shop.routes";
import AdminRoutes from "./routers/Admin.routes";
import ToasterSetup from '@/components/ui/ToasterSetup';
function App() {
  return (
    <Router>
      <>
        <UserRoutes />
        <ShopRoutes />
        <AdminRoutes/>
        <ToasterSetup />
      </>
    </Router>
  );
}

export default App;
