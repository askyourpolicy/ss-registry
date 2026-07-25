export function isStitchEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase().endsWith("@stitchstudio.ai") ?? false;
}
