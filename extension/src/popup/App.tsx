import { AuthRoot } from "../ui/AuthRoot";
import { VaultPage } from "./pages/VaultPage";

export function App() {
  return (
    <AuthRoot
      variant="popup"
      renderUnlocked={(props) => <VaultPage {...props} />}
    />
  );
}
