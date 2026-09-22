const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

(async () => {
  console.log('--- 1. Testing Helmet Security Headers ---');
  const res1 = await request({ hostname: 'localhost', port: 3000, path: '/api/health', method: 'GET' });
  console.log('CSP Header present:', res1.headers['content-security-policy'] ? 'YES ✓' : 'NO ✗');
  console.log('X-Content-Type-Options:', res1.headers['x-content-type-options']);
  console.log('X-Frame-Options:', res1.headers['x-frame-options']);
  console.log('X-Powered-By hidden:', !res1.headers['x-powered-by'] ? 'YES ✓' : 'NO ✗');

  console.log('\n--- 2. Testing XSS Injection & Sanitization in Booking ---');
  const xssBooking = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/book',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    clientName: '<script>alert(1)</script>Princess Diana',
    clientEmail: 'diana@royal.com',
    clientPhone: '+91 72490 28033',
    serviceId: 'apple-hair-1',
    date: '2026-09-28',
    timeSlot: '11:30',
    notes: '<img src=x onerror=alert(1)>Special request'
  });
  console.log('XSS Booking Status:', xssBooking.status);
  console.log('Sanitized Name:', xssBooking.data.booking?.clientName);
  console.log('Sanitized Notes:', xssBooking.data.booking?.notes);

  console.log('\n--- 3. Testing Input Validation (Invalid Email & Past Date) ---');
  const invalidEmail = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/book',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    clientName: 'Test Bad',
    clientEmail: 'not-an-email',
    clientPhone: '+91 72490 28033',
    serviceId: 'apple-hair-1',
    date: '2026-09-28',
    timeSlot: '11:30'
  });
  console.log('Invalid Email Rejected (400):', invalidEmail.status === 400 ? 'YES ✓ (' + invalidEmail.data.error + ')' : 'NO ✗');

  const pastDate = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/book',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    clientName: 'Test Bad',
    clientEmail: 'good@example.com',
    clientPhone: '+91 72490 28033',
    serviceId: 'apple-hair-1',
    date: '2020-01-01',
    timeSlot: '11:30'
  });
  console.log('Past Date Rejected (400):', pastDate.status === 400 ? 'YES ✓ (' + pastDate.data.error + ')' : 'NO ✗');

  console.log('\n--- 4. Testing PII Masking on Public Search ---');
  const searchRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/bookings?search=priyanka',
    method: 'GET'
  });
  console.log('Public Search Result (Masked PII):', searchRes.data[0]);

  console.log('\n--- 5. Testing Reviews and Calculator Endpoints ---');
  const reviewsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/reviews',
    method: 'GET'
  });
  console.log('Reviews count:', reviewsRes.data?.length, 'Average rating:', reviewsRes.data?.[0]?.rating);

  const calcRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/calculator/estimate',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    basePrice: 7500,
    lengthFee: 500,
    addonFees: 650
  });
  console.log('Calculator estimate:', calcRes.data);

  console.log('\n--- 6. Testing Admin Route Authorization ---');
  const unauthAdmin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/bookings',
    method: 'GET'
  });
  console.log('Unauthorized Admin Rejected (401):', unauthAdmin.status === 401 ? 'YES ✓' : 'NO ✗');

  const authAdmin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/bookings',
    method: 'GET',
    headers: { 'x-admin-key': 'APPLE_SECURE_ATELIER_2026' }
  });
  console.log('Authorized Admin Access (200):', authAdmin.status === 200 ? 'YES ✓ (' + authAdmin.data.totalBookings + ' bookings)' : 'NO ✗');
})();
