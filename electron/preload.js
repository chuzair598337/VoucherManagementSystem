const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveVoucherPDF: (voucherData) =>
    ipcRenderer.invoke('save-voucher-pdf', voucherData),
  isElectron: true,
});
