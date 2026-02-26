export function registerAuthCommands(commandRegistry, context, socket) {
  commandRegistry.register("LOGIN", () => {
    const loginScreen = context.uiState?.currentScreen;
    const rootNode = loginScreen?.rootNode;

    const username = rootNode?.findById("login-username")?.getValue?.() || "";
    const password = rootNode?.findById("login-password")?.getValue?.() || "";

    if (!username || !password) {
      loginScreen?.showError?.("Enter username and password");
      return;
    }

    socket.emit("loginUser", { username, password });

    socket.once("loginUserResponse", (resp) => {
      if (resp.success && resp.token) {
        localStorage.setItem("sessionToken", resp.token);
        localStorage.setItem("username", username);
        context.runMainApp();
      } else {
        loginScreen?.showError?.(resp.error || "Login failed");
      }
    });
  });
}