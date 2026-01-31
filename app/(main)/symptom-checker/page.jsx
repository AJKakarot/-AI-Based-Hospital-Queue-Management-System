import { SymptomChecker } from "@/components/symptom-checker";

export default function SymptomCheckerPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Symptom Checker</h1>
        <p className="text-muted-foreground">
          Get AI-powered recommendations for the right healthcare professional
        </p>
      </div>
      <SymptomChecker />
    </div>
  );
}
