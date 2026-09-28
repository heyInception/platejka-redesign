function initCompliance(root) {
  if (root.dataset.complianceReady === 'true') return;
  const dialog = root.querySelector('[data-compliance-dialog]');
  const opener = root.querySelector('[data-compliance-dialog-open]');
  const closer = dialog?.querySelector('[data-compliance-dialog-close]');
  if (!dialog || !opener) return;
  root.dataset.complianceReady = 'true';
  opener.addEventListener('click', () => { dialog.dialogOpener = opener; dialog.showModal(); });
  closer?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.dialogOpener?.focus?.());
}
document.querySelectorAll('[data-compliance]').forEach(initCompliance);
export { initCompliance };
