const fs = require('fs');
const files = ['public/js/app.js', 'public/js/three-salon.js', 'public/css/style.css'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/HABIB'S SIGNATURE SALON/gi, 'SALON APPLE [UNISEX]');
    content = content.replace(/Habib's Signature/gi, 'Salon Apple');
    content = content.replace(/Habib's/gi, "Salon Apple's");
    content = content.replace(/Habib/gi, 'Salon Apple');
    content = content.replace(/Aundh/gi, 'Handewadi');
    content = content.replace(/AUNDH/gi, 'HANDEWADI');
    content = content.replace(/HABIB-/g, 'APPLE-');
    fs.writeFileSync(file, content);
    console.log(file + ' updated successfully');
  }
});
