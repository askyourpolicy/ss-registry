import { Alert, AlertDescription } from "@/components/ui/alert";

export function AuthError({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
