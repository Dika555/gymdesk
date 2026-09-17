export function getActiveBranchId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("activeBranchId");
}