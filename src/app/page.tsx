import { OSProvider } from "@/components/contexts/OSContext";
import Desktop from "@/components/desktop/Desktop";
import registeredApps from "@/components/apps/AppRegistry";
// No need to import globals.css here as it's already imported in layout.tsx

export default function Home() {
  return (
    <OSProvider registeredApps={registeredApps}>
      <Desktop />
    </OSProvider>
  );
}
