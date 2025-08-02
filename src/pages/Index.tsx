import { Dashboard } from "@/containers/Dashboard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  console.log("📄 Renderitzant Index page");
  
  return (
    <div>
      <Dashboard />
      
      {/* Navigation Links for testing */}
      <div className="fixed bottom-4 right-4 flex gap-2">
        <Link to="/session/123">
          <Button variant="outline" size="sm">
            Session Workspace
          </Button>
        </Link>
        <Link to="/account">
          <Button variant="outline" size="sm">
            My Account
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;