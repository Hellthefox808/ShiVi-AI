# Data Foundation & Quality Architecture
## Enterprise Data Management & Quality Framework

ShiVi enforces strict data hygiene, schema validation, and bias detection before data reaches any AI or analytical consumer.

---

### 1. The 6 Dimensions of Data Quality

1. **Completeness**: Ratio of required non-null fields across leads, opportunities, and accounts.
2. **Accuracy**: Cross-verification of contact emails, phone numbers, and company numbers against external authoritative registries.
3. **Consistency**: Field formatting uniformity across multiple CRM instances and integrated tools.
4. **Uniqueness**: Deduplication score across account names, domain roots, and contact records.
5. **Validity**: Conformance to defined data contracts and regex formats.
6. **Timeliness (Freshness)**: Continuous tracking of record update recency; records exceeding staleness thresholds experience trust degradation.

---

### 2. Demographic Bias Screening

The platform actively scans training and retrieval datasets for consequential demographic bias using the **EEOC 4/5ths (80%) Disparate Impact Ratio Rule**:

$$\text{Disparate Impact Ratio} = \frac{\text{Selection Rate of Protected Group}}{\text{Selection Rate of Highest Group}} \ge 0.80$$

If the ratio falls below 0.80, the system triggers an automatic governance alert and pauses automated tier assignment until re-calibrated.
