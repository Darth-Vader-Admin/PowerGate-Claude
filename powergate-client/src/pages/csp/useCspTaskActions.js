import { useState } from "react";
import useToast from "hooks/useToast";
import { actOnCspTask } from "api/powergate";

const copy = {
  send: { title: "Send for client approval?", confirm: "Send", done: "Sent to the client for approval." },
  approve: { title: "Approve on the client's behalf?", confirm: "Approve", done: "Task approved." },
  reject: { title: "Reject this task?", confirm: "Reject", done: "Task rejected." },
};

// Shared confirm-then-act flow for CSP task buttons.
export default function useCspTaskActions(onDone) {
  const toast = useToast();
  const [pendingAction, setPendingAction] = useState(null); // { task, action }
  const [busy, setBusy] = useState(false);

  const request = (task, action) => setPendingAction({ task, action });
  const cancel = () => setPendingAction(null);

  const confirm = async (note) => {
    if (!pendingAction) return;
    setBusy(true);
    try {
      await actOnCspTask(pendingAction.task.id, pendingAction.action, note);
      toast(copy[pendingAction.action].done);
      setPendingAction(null);
      if (onDone) onDone();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const dialogProps = {
    open: Boolean(pendingAction),
    title: pendingAction ? copy[pendingAction.action].title : "",
    confirmLabel: pendingAction ? copy[pendingAction.action].confirm : "Confirm",
    destructive: Boolean(pendingAction && pendingAction.action === "reject"),
    withNote: Boolean(pendingAction && pendingAction.action !== "send"),
    busy,
    onConfirm: confirm,
    onClose: cancel,
  };

  return { request, dialogProps, pendingAction };
}
