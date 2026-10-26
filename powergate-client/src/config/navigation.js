// Header menus per user type. Pages are wired to these paths in routes.js.
// An entry with `children` renders as a dropdown in the header.
import appConfig from "config/app";

export const CLIENT_HOME = "/client/dashboard";
export const CSP_HOME = "/csp/approvals";

export function homeRouteFor(role) {
  return role === "csp" ? CSP_HOME : CLIENT_HOME;
}

export const clientMenu = [
  ...(appConfig.creatorHomePageUrl
    ? [{ key: "home", label: "Home", href: appConfig.creatorHomePageUrl }]
    : []),
  { key: "dashboard", label: "Dashboard", path: "/client/dashboard" },
  { key: "tasks", label: "My Tasks", path: "/client/tasks" },
  { key: "requests", label: "Requests", path: "/client/requests" },
  { key: "profile", label: "My Profile", path: "/client/profile" },
  { key: "faq", label: "Help & FAQ", path: "/client/help" },
];

export const cspMenu = [
  { key: "approval", label: "Approvals", path: "/csp/approvals" },
  {
    key: "projects",
    label: "Projects",
    children: [
      { key: "p-my", label: "My Projects", path: "/csp/projects/mine" },
      { key: "p-all", label: "All Projects", path: "/csp/projects/all" },
      { key: "p-add", label: "Add Project", path: "/csp/projects/new" },
    ],
  },
  {
    key: "tasks",
    label: "Tasks",
    children: [
      { key: "t-csp", label: "All CSP Tasks", path: "/csp/tasks/csp" },
      { key: "t-all", label: "All Tasks", path: "/csp/tasks/all" },
      { key: "t-add", label: "Add Task", path: "/csp/tasks/new" },
    ],
  },
];
