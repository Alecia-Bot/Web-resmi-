// Tambahkan fungsi ini di script.js untuk simpan pesanan saat payment success

async function saveOrderToFirestore(orderData) {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      console.log('User not logged in, pesanan tidak tersimpan di Firebase');
      return;
    }

    const ownerUID = 'tika13593'; // Ganti dengan UID owner yang sebenarnya dari database

    const orderDoc = {
      pkg: orderData.pkg || '',
      nama: orderData.nama || '',
      nomor: orderData.nomor || '',
      link: orderData.link || '',
      total: orderData.total || 0,
      idTransaksi: orderData.idTransaksi || '',
      status: 'PENDING',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      userEmail: user.email || '',
      userName: user.displayName || '',
    };

    // Simpan ke: users/{ownerUID}/orders/{idTransaksi}
    await firebase.firestore()
      .collection('users')
      .doc(ownerUID)
      .collection('orders')
      .doc(orderData.idTransaksi)
      .set(orderDoc);

    console.log('✅ Pesanan tersimpan ke Firestore');
  } catch (err) {
    console.error('Error saving order:', err);
  }
}

// Panggil fungsi ini saat payment SUCCESS di cekStatusQris()
// Contoh:
// if (data.status === 'found' && data.kategori_status === 'SUCCESS') {
//   await saveOrderToFirestore({
//     pkg: window._qrisOrderInfo.pkg,
//     nama: window._qrisOrderInfo.nama,
//     nomor: window._qrisOrderInfo.nomor,
//     link: window._qrisOrderInfo.link,
//     total: window._qrisOrderInfo.total,
//     idTransaksi: window._qrisData.id_transaksi
//   });
//   ...rest of code
// }
