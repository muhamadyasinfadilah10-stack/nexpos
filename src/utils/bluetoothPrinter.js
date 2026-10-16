// --- FUNGSI HELPER BLUETOOTH PRINTER (ESC/POS) ---
async function printReceiptViaBluetooth(transaction, outletProfile) {
  try {
    // 1. Meminta izin pengguna untuk memilih perangkat Bluetooth (Thermal Printer)
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // UUID umum untuk printer thermal BLE
    });

    // 2. Menghubungkan ke GATT Server
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    const encoder = new TextEncoder();
    let commands = '\x1B\x40'; // Inisialisasi printer (ESC @)
    
    // Header Toko (Rata Tengah / Align Center)
    commands += '\x1B\x61\x01'; 
    commands += `${outletProfile?.storeName || 'NEXPOS STORE'}\n`;
    commands += `${outletProfile?.address || ''}\n`;
    commands += `Telp: ${outletProfile?.phone || '-'}\n`;
    commands += '--------------------------------\n';
    
    // Info Transaksi (Rata Kiri / Align Left)
    commands += '\x1B\x61\x00';
    commands += `No. Transaksi : ${transaction.id || '-'}\n`;
    commands += `Tanggal       : ${transaction.dateStr || new Date().toLocaleDateString()} ${transaction.timeStr || ''}\n`;
    commands += `Kasir         : ${transaction.cashierName || 'Kasir'}\n`;
    commands += `Pelanggan     : ${transaction.customerName || 'Umum'}\n`;
    commands += '--------------------------------\n';

    // Daftar Item Belanja
    if (transaction.items && Array.isArray(transaction.items)) {
      transaction.items.forEach(item => {
        commands += `${item.product?.name || item.name}\n`;
        if (item.customsSummary) {
          commands += `  (${item.customsSummary})\n`;
        }
        commands += `  ${item.qty}x @${Number(item.price).toLocaleString('id-ID')} = ${(item.price * item.qty).toLocaleString('id-ID')}\n`;
      });
    }

    commands += '--------------------------------\n';
    commands += `Subtotal    : Rp ${Number(transaction.subtotal || 0).toLocaleString('id-ID')}\n`;
    if (transaction.discountAmount > 0) {
      commands += `Diskon      : Rp ${Number(transaction.discountAmount).toLocaleString('id-ID')}\n`;
    }
    commands += `TOTAL       : Rp ${Number(transaction.grandTotal || 0).toLocaleString('id-ID')}\n`;
    commands += `Bayar       : Rp ${Number(transaction.cashGiven || 0).toLocaleString('id-ID')}\n`;
    commands += `Kembali     : Rp ${Number(transaction.change || 0).toLocaleString('id-ID')}\n`;
    commands += '--------------------------------\n';

    // Footer Pesan (Rata Tengah / Align Center)
    commands += '\x1B\x61\x01';
    commands += `${outletProfile?.footerMessage || 'Terima Kasih atas Kunjungan Anda!'}\n\n\n`;

    // Kirim perintah byte ke printer thermal via Bluetooth
    await characteristic.writeValue(encoder.encode(commands));
    alert('Struk berhasil dicetak via Bluetooth!');
  } catch (error) {
    console.error('Gagal mencetak:', error);
    alert('Gagal mencetak struk via Bluetooth. Pastikan Bluetooth aktif dan printer terhubung.');
  }
}