// Sample data for mock mode only (REACT_APP_USE_MOCK=true). Never shipped to real users' data paths.

export const mockUsers = {
  client: { email: "client@company.com", name: "Alex Carter", role: "client" },
  csp: { email: "csp@bickertmanagement.com", name: "Casey Shaw", role: "csp" },
};

export function buildMockDb() {
  return {
    tasks: [
      { id: "1001", name: "Quote approval workflow update", project: "[Project A]", projectId: "p1", client: "[Client A]", clientEmail: "client@company.com", requestedBy: "tech@bickertmanagement.com", dateAdded: "21-Oct-2026", estimateHours: 4, approvalStatus: "Pending", sentToClient: true, decidedOn: "", workStatus: "Open", cspEmail: "csp@bickertmanagement.com" },
      { id: "1002", name: "Books invoice template changes", project: "[Project A]", projectId: "p1", client: "[Client A]", clientEmail: "client@company.com", requestedBy: "tech@bickertmanagement.com", dateAdded: "22-Oct-2026", estimateHours: 2.5, approvalStatus: "Pending", sentToClient: true, decidedOn: "", workStatus: "Open", cspEmail: "csp@bickertmanagement.com" },
      { id: "1003", name: "CRM lead scoring rules", project: "[Project B]", projectId: "p2", client: "[Client B]", clientEmail: "client@company.com", requestedBy: "tech@bickertmanagement.com", dateAdded: "23-Oct-2026", estimateHours: 6, approvalStatus: "Pending", sentToClient: true, decidedOn: "", workStatus: "Open", cspEmail: "csp@bickertmanagement.com" },
      { id: "1004", name: "Desk SLA escalation setup", project: "[Project A]", projectId: "p1", client: "[Client A]", clientEmail: "client@company.com", requestedBy: "tech@bickertmanagement.com", dateAdded: "10-Oct-2026", estimateHours: 3, approvalStatus: "Approved", sentToClient: true, decidedOn: "14-Oct-2026", workStatus: "In Progress", cspEmail: "csp@bickertmanagement.com" },
      { id: "1005", name: "Analytics sales dashboard", project: "[Project B]", projectId: "p2", client: "[Client B]", clientEmail: "client@company.com", requestedBy: "tech@bickertmanagement.com", dateAdded: "05-Oct-2026", estimateHours: 8, approvalStatus: "Approved", sentToClient: true, decidedOn: "09-Oct-2026", workStatus: "Closed", cspEmail: "csp@bickertmanagement.com" },
      { id: "1006", name: "Creator form redesign", project: "[Project A]", projectId: "p1", client: "[Client A]", clientEmail: "client@company.com", requestedBy: "tech@bickertmanagement.com", dateAdded: "29-Sep-2026", estimateHours: 5.5, approvalStatus: "Rejected", sentToClient: true, decidedOn: "02-Oct-2026", workStatus: "—", cspEmail: "csp@bickertmanagement.com" },
      { id: "1007", name: "Desk auto-assignment rule", project: "[Project C]", projectId: "p3", client: "[Client C]", clientEmail: "other@clientc.com", requestedBy: "tech@bickertmanagement.com", dateAdded: "23-Oct-2026", estimateHours: 3, approvalStatus: "Pending", sentToClient: false, decidedOn: "", workStatus: "Open", cspEmail: "csp@bickertmanagement.com" },
      { id: "1008", name: "Creator portal access fix", project: "[Project B]", projectId: "p2", client: "[Client B]", clientEmail: "client@company.com", requestedBy: "tech@bickertmanagement.com", dateAdded: "24-Oct-2026", estimateHours: 1.5, approvalStatus: "Pending", sentToClient: false, decidedOn: "", workStatus: "Open", cspEmail: "csp@bickertmanagement.com" },
      { id: "1009", name: "Email template refresh", project: "[Project C]", projectId: "p3", client: "[Client C]", clientEmail: "other@clientc.com", requestedBy: "tech@bickertmanagement.com", dateAdded: "25-Sep-2026", estimateHours: 1.5, approvalStatus: "Approved", sentToClient: true, decidedOn: "28-Sep-2026", workStatus: "Closed", cspEmail: "csp@bickertmanagement.com" },
    ],
    projects: [
      { id: "p1", name: "[Project A]", customer: "[Client A]", batteryType: "Amped Battery", available: 18.5, threshold: 2, status: "Active", cspEmail: "csp@bickertmanagement.com" },
      { id: "p2", name: "[Project B]", customer: "[Client B]", batteryType: "Lightning", available: 7, threshold: 4, status: "Active", cspEmail: "csp@bickertmanagement.com" },
      { id: "p3", name: "[Project C]", customer: "[Client C]", batteryType: "EcoGrid Battery", available: 2.5, threshold: 2, status: "Active", cspEmail: "other.csp@bickertmanagement.com" },
    ],
    profile: {
      customerName: "[Customer Name]",
      primaryEmail: "client@company.com",
      powerPlan: "Amped",
      status: "Active",
      battery: { max: 40, used: 15.2, committed: 6.3, available: 18.5 },
      users: [
        { email: "client@company.com", role: "Primary" },
        { email: "ops@company.com", role: "Authorized" },
        { email: "finance@company.com", role: "Authorized" },
      ],
      projects: [
        { name: "[Project A]", cspEmail: "csp@bickertmanagement.com", status: "Active" },
        { name: "[Project B]", cspEmail: "csp@bickertmanagement.com", status: "Active" },
      ],
    },
    requests: [
      { id: "r1", type: "New Task Request", plan: "", submittedOn: "22-Oct-2026", fileCount: 2, status: "Pending" },
      { id: "r2", type: "Change PowerPlan", plan: "Lightning", submittedOn: "15-Oct-2026", fileCount: 0, status: "Needs Discussion" },
      { id: "r3", type: "Opt for Trickle Charge", plan: "", submittedOn: "03-Oct-2026", fileCount: 0, status: "Approved" },
      { id: "r4", type: "New Task Request", plan: "", submittedOn: "27-Sep-2026", fileCount: 1, status: "Approved" },
    ],
  };
}
