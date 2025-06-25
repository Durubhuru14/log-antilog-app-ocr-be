// upload-test.js
// Usage: node upload-test.js
// This script uploads 'drawing.png' to http://localhost:3000/api/calc-from-image and logs the result.

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function uploadImage() {
  const form = new FormData();
  form.append('image', fs.createReadStream('drawing.png'), 'drawing.png');

  try {
    const res = await fetch('http://localhost:3000/api/calc-from-image', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('❌ Upload error:', err);
  }
}

uploadImage();
