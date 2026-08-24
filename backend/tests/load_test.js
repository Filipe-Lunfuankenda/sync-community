import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// Big-O / Stress testing configuration
// Simulating an increasing load of users hitting the API
export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp up to 50 concurrent users
    { duration: '20s', target: 200 }, // Spike to 200 concurrent users
    { duration: '10s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    // 95% of requests must finish within 500ms
    http_req_duration: ['p(95)<500'],
    // Error rate must be less than 1%
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Test the root health endpoint (FastAPI)
  const res = http.get('http://localhost:8000/');
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'latency is acceptable': (r) => r.timings.duration < 1000, // strictly under 1 sec
  });

  sleep(1);
}

// Generate HTML Report for GitHub Actions Artifacts
export function handleSummary(data) {
  return {
    'k6-report.html': htmlReport(data),
  };
}
