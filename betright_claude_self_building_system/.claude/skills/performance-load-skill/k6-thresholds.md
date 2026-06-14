# k6 Thresholds

```js
export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};
```

Manual prediction can have separate p95 threshold of 2500 ms for MVP.
