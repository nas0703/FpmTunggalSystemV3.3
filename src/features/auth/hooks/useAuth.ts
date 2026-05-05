import { useState, useCallback } from "react";

const STAFF_PIN = "123456"; // Kerani input
const FC_PIN = "888888"; // Field Conductor
const AFC_PIN = "777777"; // Assistant Field Conductor
const FS_PIN = "555555"; // Field Supervisor

interface UseAuthProps {
  onLoginSuccess: (role: "staff" | "fc" | "afc" | "fs") => void;
  onLogout: () => void;
}

export function useAuth({ onLoginSuccess, onLogout }: UseAuthProps) {
  const [authRole, setAuthRole] = useState<"staff" | "fc" | "afc" | "fs" | null>(null);
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
