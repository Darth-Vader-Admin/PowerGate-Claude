// Sidebar menus per user type. Pages are wired to these paths in routes.js.
import appConfig from "config/app";

export const CLIENT_HOME = "/client/dashboard";
export const CSP_HOME = "/csp/approvals";

export function homeRouteFor(role) {
  return role === "csp" ? CSP_HOME : CLIENT_HOME;
}

// icon keys map to components in components/layout/navIcons.js
export const clientMenu = [
  ...(appConfig.creatorHomePageUrl
    ? [{ key: "home", label: "Home Page", icon: "home", href: appConfig.creatorHomePageUrl }]
    : []),
  { key: "dashboard", label: "My Dashboard", icon: "dashboard", path: "/client/dashboard" },
  { key: "profile", label: "My Profile", icon: "profile", path: "/client/profile" },
  { key: "tasks", label: "My Tasks", icon: "tasks", path: "/client/tasks" },
  { key: "requests", label: "Requests", icon: "requests", path: "/client/requests" },
  { key: "faq", label: "Help & FAQ", icon: "faq", path: "/client/help" },
];

export const cspMenu = [
  { key: "approval", label: "Approval Screen", icon: "approval", path: "/csp/approvals" },
  { section: true, key: "sec-projects", label: "Projects" },
  { key: "p-add", label: "Add Project", icon: "add", path: "/csp/projects/new" },
  { key: "p-my", label: "My Projects", icon: "folder", path: "/csp/projects/mine" },
  { key: "p-all", label: "All Projects", icon: "folder", path: "/csp/projects/all" },
  { section: true, key: "sec-tasks", label: "Tasks" },
  { key: "t-add", label: "Add Task", icon: "add", path: "/csp/tasks/new" },
  { key: "t-csp", label: "All CSP Tasks", icon: "tasks", path: "/csp/tasks/csp" },
  { key: "t-all", label: "All Tasks", icon: "tasks", path: "/csp/tasks/all" },
];
