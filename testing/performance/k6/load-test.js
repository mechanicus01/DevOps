import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be less than 10%
    errors: ['rate<0.1'],             // Custom error rate threshold
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_KEY = __ENV.API_KEY || 'test-api-key';

// Headers
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'User-Agent': 'k6-load-test',
};

// Helper function to generate random data
function generateRandomData() {
  return {
    id: Math.floor(Math.random() * 1000),
    name: `User ${Math.floor(Math.random() * 1000)}`,
    email: `user${Math.floor(Math.random() * 1000)}@example.com`,
    timestamp: new Date().toISOString(),
  };
}

// Test scenarios
export default function () {
  const startTime = Date.now();
  
  // Scenario 1: Health check
  const healthCheck = http.get(`${BASE_URL}/health`, { headers });
  check(healthCheck, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  // Scenario 2: Get users
  const getUsers = http.get(`${BASE_URL}/api/users`, { headers });
  check(getUsers, {
    'get users status is 200': (r) => r.status === 200,
    'get users has data': (r) => r.json().length > 0,
  });
  
  // Scenario 3: Create user
  const userData = generateRandomData();
  const createUser = http.post(`${BASE_URL}/api/users`, JSON.stringify(userData), { headers });
  check(createUser, {
    'create user status is 201': (r) => r.status === 201,
    'create user returns id': (r) => r.json().id !== undefined,
  });
  
  // Scenario 4: Get specific user
  if (createUser.status === 201) {
    const userId = createUser.json().id;
    const getUser = http.get(`${BASE_URL}/api/users/${userId}`, { headers });
    check(getUser, {
      'get specific user status is 200': (r) => r.status === 200,
      'get specific user has correct data': (r) => r.json().name === userData.name,
    });
  }
  
  // Scenario 5: Update user
  if (createUser.status === 201) {
    const userId = createUser.json().id;
    const updateData = { ...userData, name: `Updated ${userData.name}` };
    const updateUser = http.put(`${BASE_URL}/api/users/${userId}`, JSON.stringify(updateData), { headers });
    check(updateUser, {
      'update user status is 200': (r) => r.status === 200,
      'update user returns updated data': (r) => r.json().name === updateData.name,
    });
  }
  
  // Scenario 6: Search users
  const searchQuery = 'test';
  const searchUsers = http.get(`${BASE_URL}/api/users/search?q=${searchQuery}`, { headers });
  check(searchUsers, {
    'search users status is 200': (r) => r.status === 200,
    'search users returns array': (r) => Array.isArray(r.json()),
  });
  
  // Record custom metrics
  const endTime = Date.now();
  const responseTimeValue = endTime - startTime;
  responseTime.add(responseTimeValue);
  
  // Check for errors
  const responses = [healthCheck, getUsers, createUser, searchUsers];
  const hasErrors = responses.some(r => r.status >= 400);
  errorRate.add(hasErrors);
  
  // Think time between requests
  sleep(1);
}

// Setup function (runs once before the test)
export function setup() {
  console.log('Setting up load test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Load test starting...');
}

// Teardown function (runs once after the test)
export function teardown(data) {
  console.log('Load test completed!');
  console.log('Cleaning up...');
}

// Handle test lifecycle events
export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    'load-test-summary.html': generateHtmlReport(data),
  };
}

// Generate HTML report
function generateHtmlReport(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Load Test Results</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; }
            .success { color: green; }
            .error { color: red; }
        </style>
    </head>
    <body>
        <h1>Load Test Results</h1>
        <div class="metric">
            <h3>Test Duration: ${data.state.testRunDuration}ms</h3>
            <h3>Total Requests: ${data.metrics.http_reqs.values.count}</h3>
            <h3>Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms</h3>
            <h3>95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms</h3>
            <h3>Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</h3>
        </div>
    </body>
    </html>
  `;
} 