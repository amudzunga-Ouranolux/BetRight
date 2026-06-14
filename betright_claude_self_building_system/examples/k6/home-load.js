import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '2m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/v1/mobile/home`);
  check(res, {
    'status is 200': r => r.status === 200,
  });
  sleep(1);
}
