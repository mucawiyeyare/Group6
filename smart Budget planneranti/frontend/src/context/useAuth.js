import { useContext } from "react";
import { AuthContext } from "./AuthContextState";

export function useAuth() {
  return useContext(AuthContext);
}
