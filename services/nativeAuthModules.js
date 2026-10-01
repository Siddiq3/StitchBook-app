import Constants from "expo-constants";
import { NativeModules, Platform, TurboModuleRegistry } from "react-native";

let googleModule = null;
let msg91Module = null;

// Checking before require matters: these SDKs access native code during import.
const isExpoGo = () => Constants.executionEnvironment === "storeClient";

export function getNativeGoogleModule() {
  if (Platform.OS !== "android" || isExpoGo()) return null;
  if (!TurboModuleRegistry.get("RNGoogleSignin")) return null;
  if (!googleModule) {
    googleModule = require("@react-native-google-signin/google-signin");
  }
  return googleModule;
}

export function getMsg91Module() {
  if (Platform.OS === "web" || isExpoGo()) return null;
  // MSG91's entry point loads its biometric bridge even for OTP-only callers.
  if (!NativeModules.BiometricAuth) return null;
  if (!msg91Module) {
    msg91Module = require("@msg91comm/sendotp-react-native");
  }
  return msg91Module;
}
