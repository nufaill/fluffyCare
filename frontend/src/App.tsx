import { BrowserRouter as Router } from "react-router-dom";
import UserRoutes from "./routers/UserRoutes";
import ShopRoutes from "./routers/ShopRoutes";

function App() {
  return (
    <Router>
      <>
        <UserRoutes />
        <ShopRoutes />
      </>
    </Router>
  );
}

export default App;
