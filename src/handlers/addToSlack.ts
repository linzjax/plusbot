import { InstallProvider } from "@slack/oauth"

export default (installer: InstallProvider) => async (req, res) => {
  await installer.handleInstallPath(req, res, {
    scopes: ["chat:write", "command"],
    metadata: "some_metadata",
    redirectUri: "https://plusblot.linzjax.works.dev/authorize"
  })
}
