// app/spells/add/page.tsx
import SpellForm from '../../../components/SpellForm';
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export default function AddSpellPage() {
  return <CopilotKit runtimeUrl="/api/copilotkit">
    <CopilotSidebar
      instructions={"Help the user catalog Harry Potter Spells"}
      labels={{
        initial:
          "Hello",
      }}
      defaultOpen={true}
      clickOutsideToClose={false}>
      <SpellForm isEditMode={false} />;
    </CopilotSidebar>
  </CopilotKit>
}
