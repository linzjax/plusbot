import { InstallProvider } from "@slack/oauth"
import { IncomingMessage, ServerResponse } from "http"

export default (installer: InstallProvider) =>
  async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    await installer.handleInstallPath(req, res, {
      scopes: ["chat:write", "command"],
      metadata: "some_metadata",
      redirectUri: "https://plusblot.linzjax.works.dev/authorize"
    })
  }
