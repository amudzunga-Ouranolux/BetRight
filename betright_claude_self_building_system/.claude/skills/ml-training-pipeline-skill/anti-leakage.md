# Anti-Leakage Rules

Never include:
- final result before prediction time;
- confirmed lineups if prediction was generated before lineups;
- post-match xG;
- post-match injuries;
- future team rating;
- closing information not known at prediction time.

Every feature must have:
- source;
- timestamp;
- availability time;
- null handling;
- data quality flag.
