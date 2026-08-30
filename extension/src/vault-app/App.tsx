import { AuthRoot } from "../ui/AuthRoot";
import { VaultManagerApp } from "../ui/vault/VaultManagerApp";

export function App() {
  return (
    <AuthRoot
      variant="full"
      renderUnlocked={(props) => <VaultManagerApp {...props} />}
    />
  );
}
