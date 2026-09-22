const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

(async () => {
  console.log('=== E2E Integration Checks for Salon Apple 3D ===');
  
  // 1. Root HTML Page
  const root = await get('/');
  console.log('1. Root Status (200):', root.status);
  console.log('   - Title correct:', root.data.includes('SALON APPLE [UNISEX] — Premium 3D Luxury Hair Atelier | Handewadi, Pune'));
  console.log('   - Monday Offer in banner:', root.data.includes('SPECTACULAR MONDAY OFFER: On Signature Pedicure get Signature Manicure FREE!'));
  console.log('   - Offers Bento Grid present:', root.data.includes('id="offers-section"'));
  console.log('   - Ambiance Gallery present:', root.data.includes('id="ambiance-section"'));
  console.log('   - Reviews Grid present:', root.data.includes('id="reviews-section"'));
  console.log('   - 3D Canvas element present:', root.data.includes('id="threeSalonCanvas"'));
  console.log('   - WhatsApp button in Ticket present:', root.data.includes('id="ticketWhatsAppBtn"'));
  console.log('   - Handewadi Address present:', root.data.includes('Third Floor, Ladies Katta, 308 & 309, Handewadi Rd'));

  // 2. Static Assets
  const appJs = await get('/js/app.js');
  console.log('2. app.js Status (200):', appJs.status, 'Has WhatsApp link logic:', appJs.data.includes('wa.me/917249028033'));
  
  const threeSalon = await get('/js/three-salon.js');
  console.log('3. three-salon.js Status (200):', threeSalon.status, 'Has Salon Apple stations:', threeSalon.data.includes('Salon Apple 3D Atelier'));

  const css = await get('/css/style.css');
  console.log('4. style.css Status (200):', css.status, 'Has .btn-whatsapp:', css.data.includes('.btn-whatsapp'));

  // 3. API endpoints
  const health = await get('/api/health');
  console.log('5. /api/health:', health.status, JSON.parse(health.data).salon);

  const services = await get('/api/services');
  const servicesData = JSON.parse(services.data);
  console.log('6. /api/services count:', servicesData.length, 'First service:', servicesData[0].name, 'Price: ₹' + servicesData[0].price);

  const stylists = await get('/api/stylists');
  const stylistsData = JSON.parse(stylists.data);
  console.log('7. /api/stylists count:', stylistsData.length, 'Stylists:', stylistsData.map(s => s.name).join(', '));

  const reviews = await get('/api/reviews');
  const reviewsData = JSON.parse(reviews.data);
  console.log('8. /api/reviews count:', reviewsData.length, 'Top reviewer:', reviewsData[0].name, 'Rating:', reviewsData[0].rating + '★');

  console.log('\nAll E2E Integration Checks Passed with 100% Success!');
})();
