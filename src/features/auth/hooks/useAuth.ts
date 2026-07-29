import { useState, useCallback } from "react";

const STAFF_PIN = "123456"; // Kerani input
const PF_PIN = "888888"; // Pengurus Felda
const FC_PIN = "654321"; // Field Controller
const AFC_PIN = "777777"; // Assistant Field Controller
const FS_PIN = "555555"; // Field Supervisor

export type AuthRole = "staff" | "pf" | "fc" | "afc" | "fs";

interface UseAuthProps {
  onLoginSuccess: (role: AuthRole) => void;
  onLogout: () => void;
}

export function useAuth({ onLoginSuccess, onLogout }: UseAuthProps) {
  const [authRole, setAuthRole] = useState<AuthRole | null>(null);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState(false);

  const handlePinPress = useCallback((digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setLoginError(false);

      if (newPin.length === 6) {
        setTimeout(() => {
          if (newPin === STAFF_PIN) {
            setAuthRole("staff");
            onLoginSuccess("staff");
          } else if (newPin === PF_PIN) {
            setAuthRole("pf");
            onLoginSuccess("pf");
          } else if (newPin === FC_PIN) {
            setAuthRole("fc");
            onLoginSuccess("fc");
          } else if (newPin === AFC_PIN) {
            setAuthRole("afc");
            onLoginSuccess("afc");
          } else if (newPin === FS_PIN) {
            setAuthRole("fs");
            onLoginSuccess("fs");
          } else {
            setLoginError(true);
            setPin("");
          }
        }, 300);
      }
    }
  }, [pin, onLoginSuccess]);

  const handleDeletePress = useCallback(() => setPin(prev => prev.slice(0, -1)), []);

  const handleLogout = useCallback(() => {
    setAuthRole(null);
    setPin("");
    // Padam flag sesi modal semasa logout supaya login yang baru boleh paparkan pop up
    sessionStorage.removeItem("merumput_app_session_modal_v34_premium");
    sessionStorage.removeItem("backlog_app_session_modal_v2_premium");
    onLogout();
  }, [onLogout]);

  return {
    authRole,
    setAuthRole,
    pin,
    loginError,
    handlePinPress,
    handleDeletePress,
    handleLogout
  };
}
