import { useState, useCallback } from 'react';

export function useAuth() {
  const [authRole, setAuthRole] = useState<"staff" | "fc" | "afc" | "fs" | null>(null);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState(false);

  const handlePinPress = useCallback((num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 6) {
        if (newPin === "123456") setAuthRole("staff");
        else if (newPin === "654321") setAuthRole("fc");
        else if (newPin === "111111") setAuthRole("afc");
        else if (newPin === "999999") setAuthRole("fs");
        else {
          setLoginError(true);
          setTimeout(() => {
            setPin("");
            setLoginError(false);
          }, 1000);
        }
      }
    }
  }, [pin]);

  const handleDeletePress = useCallback(() => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  }, [pin]);

  const logout = useCallback(() => {
    setAuthRole(null);
    setPin("");
  }, []);

  return {
    authRole, setAuthRole,
    pin, setPin,
    loginError, setLoginError,
    handlePinPress,
    handleDeletePress,
    logout,
  };
}
