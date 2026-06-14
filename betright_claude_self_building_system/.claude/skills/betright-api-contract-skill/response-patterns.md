# Response Patterns

All prediction responses must include:

```text
prediction_id
fixture_id
model_version
generated_at
home_win_probability
draw_probability
away_win_probability
expected_goals
likely_scorelines
confidence
data_quality
explanation
risk_factors
```

All errors must include:

```text
code
message
field
request_id
```
