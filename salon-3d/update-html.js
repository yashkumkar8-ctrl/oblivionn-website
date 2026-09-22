const fs = require('fs');
const path = 'public/index.html';
let content = fs.readFileSync(path, 'utf8');

// Replace titles and brands
content = content.replace(/HABIB'S SIGNATURE SALON/g, 'SALON APPLE [UNISEX]');
content = content.replace(/Habib's Signature Salon/gi, 'Salon Apple [Unisex]');
content = content.replace(/Habib's Signature/gi, 'Salon Apple');
content = content.replace(/HABIB'S<span class="gold-dot">\.<\/span>SIGNATURE/g, 'SALON APPLE');
content = content.replace(/HABIB'S/g, 'SALON APPLE');
content = content.replace(/Habib's/gi, "Salon Apple's");
content = content.replace(/Habib/gi, 'Salon Apple');
content = content.replace(/AUNDH/g, 'HANDEWADI');
content = content.replace(/Aundh/gi, 'Handewadi');

// Addresses & Phone
content = content.replace(/Sayaji Rao Gaikwad Complex, ITI Rd, Handewadi, Pune 411007/g, '3rd Floor, Ladies Katta, Handewadi Rd, Undri, Pune 411028');
content = content.replace(/Sayaji Rao Gaikwad Complex, ITI Road, Handewadi, Pune, Maharashtra 411007 \(Near Parihar Chowk \/ Westend Area\)/gi, 'Third Floor, Ladies Katta, 308 & 309, Handewadi Rd, Autadwadi Handewadi, Indira Nagar, Undri, Pune, Maharashtra 411028');
content = content.replace(/Sayaji Rao Gaikwad Complex, ITI Rd/gi, 'Third Floor, Ladies Katta, Handewadi Rd');
content = content.replace(/\+91 76209 65180/g, '+91 72490 28033');
content = content.replace(/020 2588 4321/g, 'salonapple.in');
content = content.replace(/aundh@habibssignature\.com/gi, 'handewadi@salonapple.in');

// Update Google Maps Link
content = content.replace(/https:\/\/maps\.app\.goo\.gl\/svcz6mJANuRGnAbF7/g, 'https://maps.app.goo.gl/9bN69nJ5b1y2mXbZ9'); // Dummy map link, replacing all map URLs
content = content.replace(/src="https:\/\/www\.google\.com\/maps\/embed\?pb=!1m18!1m12!1m13!1d3782\.261971203582!2d73\.8049386!3d18\.5536553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13\.1!3m3!1m2!1s0x3bc2bf35f7bbf053%3A0x9f3e5da166d38506!2sHabibs%20Signature%20Salon!5e0!3m2!1sen!2sin!4v1711000000000!5m2!1sen!2sin"/g, 'src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.887228892404!2d73.9141022!3d18.4434221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2e90059b02bc1%3A0xe54e6015b6cdcf5!2sSalon%20Apple%20%5BUnisex%5D%20Handewadi!5e0!3m2!1sen!2sin!4v1727000000000!5m2!1sen!2sin"');

// Update Reviews
content = content.replace(/Pooja Rao/g, 'Aishwarya Bhosale');
content = content.replace(/Rohan Deshmukh/g, 'Priyanka Bendbhar');
content = content.replace(/Ananya Iyer/g, 'Shivangi Bhattacharjee');

// Specific HTML replacements for Calculator to match new packages
content = content.replace(/Habib's Signature Geometric Cut \(₹950 • 45 mins\)/gi, 'Female Hair Package 1 (₹1800 • 90 mins)');
content = content.replace(/<option value="950" data-time="45" data-name="Habib's Signature Geometric Cut">/gi, '<option value="1800" data-time="90" data-name="Female Hair Package 1">');

content = content.replace(/Haute Balayage & French Gloss \(₹4,200 • 120 mins\)/gi, 'Festive Glow For Her (₹4000 • 150 mins)');
content = content.replace(/<option value="4200" data-time="120" data-name="Haute Balayage & French Gloss" selected>/gi, '<option value="4000" data-time="150" data-name="Spectacular Festive Glow (For Her)" selected>');

content = content.replace(/24K Liquid Gold Keratin & Nanoplastia \(₹5,500 • 150 mins\)/gi, 'Nanoplastia Protein Treatment (₹10000 • 180 mins)');
content = content.replace(/<option value="5500" data-time="150" data-name="24K Liquid Gold Keratin & Nanoplastia">/gi, '<option value="10000" data-time="180" data-name="Nanoplastia Protein Treatment">');

fs.writeFileSync(path, content);
console.log('index.html updated successfully');
