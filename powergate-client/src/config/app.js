// Central app settings. Swap values here per environment instead of hunting through pages.

const env = process.env;

const appConfig = {
  appName: "PowerGate",
  tagline: "PowerPlan Work Approval Hub",
  companyName: "Bickert Management Inc.",
  companyLine: "Bickert Management Inc. · Zoho Premium Partner",

  // true = in-browser sample data + fake sign-in (no Catalyst / Creator calls).
  useMock: env.REACT_APP_USE_MOCK === "true",

  // Advanced I/O function base path on Catalyst.
  apiBase: env.REACT_APP_API_BASE || "/server/powergate_api/api",

  // Catalyst Embedded Authentication
  loginElementId: "pg-catalyst-login",
  // Relative to the hosted client root (/app/ on Catalyst).
  loginCssPath: "css/embeddediframe.css",

  supportEmail: "customerservice@bickertmanagement.com",
  termsUrl: "#", // TODO: confirm Terms & Conditions URL
  userGuideUrl:
    "https://7thhabit.bickertmanagement.com/external/manual/approval-app-guide/article/powergate-client-approval-portal?p=7f5a4e929392e9bf29c2d2b519c62fc1ad1b0376d235049896829c256f643125",

  // "Home Page stays exactly as it is today" — it remains in Creator. Set the portal URL here.
  creatorHomePageUrl: "", // TODO: Creator portal Home Page URL; empty hides the menu item

  // Opens a task in Zoho Projects from the CSP approval screen. {taskId} / {projectId} are replaced.
  zohoProjectsTaskUrl: "", // TODO: e.g. https://projects.zoho.com/portal/<portal>#taskdetail/{projectId}/{taskId}

  social: {
    youtube: "", // TODO: BMI YouTube URL
    linkedin: "", // TODO
    facebook: "", // TODO
    instagram: "", // TODO
    website: "https://www.bickertmanagement.com",
  },

  // Request form rules (mirrors the Creator Request_Form)
  request: {
    minDescriptionWords: 10,
    maxFiles: 10,
    maxFileSizeMb: 10, // keep under the Advanced I/O request limit; confirm for your plan
  },

  powerPlans: [
    { id: "EcoGrid", label: "EcoGrid", note: "Essential" },
    { id: "Amped", label: "Amped", note: "Growth" },
    { id: "Lightning", label: "Lightning", note: "Enterprise" },
  ],
};

export default appConfig;
