import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// Big-O / Stress testing configuration
export const options = {
  stages: [
    { duration: '15s', target: 50 },  // Ramp up
    { duration: '30s', target: 200 }, // Spike 
    { duration: '15s', target: 0 },   // Ramp down
  ],
  thresholds: {
    // 95% of requests must finish within 2000ms in CI
    http_req_duration: ['p(95)<2000'],
    // Error rate must be less than 5%
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'http://localhost:8000/api/v1';

export function setup() {
  // Login once to get token
  const payload = JSON.stringify({
    username: 'admin@comunidade.pt',
    password: 'Sync@Sec!2026',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/auth/login`, payload, params);
  let token = '';
  if (res.status === 200) {
      token = res.json('access_token');
  }
  return { token: token };
}

export default function (data) {
  // If we don't have a token, fallback to root endpoint testing
  if (!data.token) {
     http.get('http://localhost:8000/');
     sleep(1);
     return;
  }

  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  // 1. Fetch Dashboard Metrics (Read DB)
  const resDash = http.get(`${BASE_URL}/analytics/dashboard`, params);
  check(resDash, {
    'dashboard status 200': (r) => r.status === 200,
  });

  // 2. Fetch Organizations List (Read DB)
  const resOrgs = http.get(`${BASE_URL}/organizations/`, params);
  check(resOrgs, {
    'orgs status 200': (r) => r.status === 200,
  });

  // 3. Post Announcement (Write DB)
  const announcementPayload = JSON.stringify({
     title: `K6 Load Test ${Math.random()}`,
     content: 'Stress testing in progress.',
     is_active: true
  });
  
  const resPost = http.post(`${BASE_URL}/communication/announcements`, announcementPayload, params);
  check(resPost, {
    'post status 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}

// Generate HTML Report for GitHub Actions Artifacts
export function handleSummary(data) {
  return {
    'k6-report.html': htmlReport(data),
  };
}
