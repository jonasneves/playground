#!/usr/bin/env node

import { ManagementClient } from 'auth0';

const config = {
  domain: 'neevs.us.auth0.com',
  clientId: '0kFo1ZRSDrwNGDEnZsNhvUgUYrzSvO2m',
  clientSecret: process.argv[2]
};

console.log('Testing Auth0 connection...');
console.log('Domain:', config.domain);
console.log('Client ID:', config.clientId);

try {
  const auth0 = new ManagementClient({
    domain: config.domain,
    clientId: config.clientId,
    clientSecret: config.clientSecret
  });

  console.log('\n✅ ManagementClient initialized');

  // Test by fetching clients
  const clients = await auth0.clients.getAll({ per_page: 1 });
  console.log('✅ Successfully connected to Auth0!');
  console.log(`Found ${clients.length} client(s)`);
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('Status Code:', error.statusCode);

  if (error.statusCode === 401) {
    console.error('\n🔍 This usually means:');
    console.error('1. Client ID or Secret is incorrect');
    console.error('2. The application is not a Machine-to-Machine app');
    console.error('3. The app doesn\'t have Auth0 Management API permissions');
    console.error('\n📝 To fix:');
    console.error('1. Go to https://manage.auth0.com/dashboard/us/neevs/applications');
    console.error('2. Find the M2M application with ID: 0kFo1ZRSDrwNGDEnZsNhvUgUYrzSvO2m');
    console.error('3. Verify it has "Auth0 Management API" authorized with all permissions');
  }
}
