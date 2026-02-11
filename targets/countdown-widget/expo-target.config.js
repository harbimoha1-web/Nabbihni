/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "widget",
  name: "NabbihniWidget",
  icon: "../../assets/images/icon.png",
  deploymentTarget: "17.0",
  colors: {
    $widgetBackground: "#0F1419",
    $accent: "#F59E0B",
  },
  entitlements: {
    "com.apple.security.application-groups": [
      "group.app.nabbihni.countdown",
    ],
  },
};
