// Route table. Sidebar entries live in config/navigation.js and point at these paths.
import ClientDashboard from "pages/client/ClientDashboard";
import MyProfile from "pages/client/MyProfile";
import MyTasks from "pages/client/MyTasks";
import Requests from "pages/client/Requests";
import HelpFaq from "pages/client/HelpFaq";
import ApprovalScreen from "pages/csp/ApprovalScreen";
import ProjectsList from "pages/csp/ProjectsList";
import ProjectForm from "pages/csp/ProjectForm";
import TasksList from "pages/csp/TasksList";
import TaskForm from "pages/csp/TaskForm";

export const clientRoutes = [
  { path: "/client/dashboard", element: <ClientDashboard /> },
  { path: "/client/profile", element: <MyProfile /> },
  { path: "/client/tasks", element: <MyTasks /> },
  { path: "/client/requests", element: <Requests /> },
  { path: "/client/help", element: <HelpFaq /> },
];

export const cspRoutes = [
  { path: "/csp/approvals", element: <ApprovalScreen /> },
  { path: "/csp/projects/new", element: <ProjectForm /> },
  { path: "/csp/projects/mine", element: <ProjectsList key="mine" scope="mine" /> },
  { path: "/csp/projects/all", element: <ProjectsList key="all" scope="all" /> },
  { path: "/csp/tasks/new", element: <TaskForm /> },
  { path: "/csp/tasks/csp", element: <TasksList key="mine" view="mine" /> },
  { path: "/csp/tasks/all", element: <TasksList key="all" view="all" /> },
];
