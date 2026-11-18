# Data evaluation formulas for the soil reader

These working notes support the calibration, repeatability, product evaluation, and cost methods in the [current manuscript](HYBRID_MULTI_SENSOR_SOIL_READER.docx). The equation numbers in these notes are local references.

## Findings and placement

Use these calculations with the relevant sampling and test procedure.

| Existing section | Proposed addition |
|---|---|
| Calibration and Validation Metrics | Paired-error equations, units, R² interpretation, and a clearly defined accuracy assessment |
| Repeatability Testing | Repeatability standard deviation, variance, suitable CV, and the documented repeatability procedure |
| Technical Evaluation Procedure; System Integration and Functional Testing | Rating, task success, timing, and record reconciliation calculations |
| Simple Cost Analysis | Quantity multiplied by unit price and subsystem cost contribution |
| Statistical Treatment of Data | A consistent summary pointing to those equations; optional paired t-test |
| References and all ISO mentions | Correct the product quality model citation to ISO/IEC 25010:2023 |

## PAES reference remains unresolved

The adviser requested a PAES basis for repeatability but supplied no standard number. This review did **not verify a specific PAES clause prescribing repeatability for this multi-sensor soil analyzer**. Do not attribute the following equations to PAES without checking the actual number, edition, scope, and clause.

The official indexed text of **PAES 203:2000, Moisture Content Determination for Rice and Corn**, limits its scope to grain moisture determination and mechanical grain dryer testing. It does not establish a general soil-analyzer repeatability requirement. Its full PDF returned an access restriction during this review; no repeatability equation is attributed to it here. [AMTEC official PAES 203:2000 source](https://amtec.uplb.edu.ph/wp-content/uploads/2019/07/PAES-203-2000.pdf)

The repeatability equations below have a verified **FAO soil-laboratory quality assurance basis**, with terminology supported by JCGM. They are a proposed method pending resolution of the adviser's intended PAES reference. There is no verified PAES pass threshold in this review.

## Proposed text for Calibration and Validation Metrics

Validation will use independent soil samples excluded from calibration. At least three device readings will be collected per sample according to the documented stabilization and measurement procedure. Their mean will represent the device result for the main validation analysis. Reference replicates will be summarized according to the selected reference method. Repeated readings will not increase the number of independent validation samples. A sensor's individual-reading variability will be reported separately through repeatability testing.

For each parameter, let \(d_i\) be the calibrated device result for independent sample \(i\), \(y_i\) its paired reference result, \(n\) the number of independent valid pairs, and \(\bar y\) the mean reference result. Results will be calculated separately for pH, temperature, moisture, N, P, and K where a valid reference comparison is available. Measurements with different units will not be pooled into one error score.

### Measurement error and bias

\[
e_i=d_i-y_i,\qquad AE_i=|d_i-y_i|
\]

\[
\mathrm{MAE}=\frac{1}{n}\sum_{i=1}^{n}|d_i-y_i|
\tag{1}
\]

\[
\mathrm{RMSE}=\sqrt{\frac{1}{n}\sum_{i=1}^{n}(d_i-y_i)^2}
\tag{2}
\]

\[
\mathrm{Bias}=\frac{1}{n}\sum_{i=1}^{n}(d_i-y_i)
\tag{3}
\]

MAE is the mean absolute difference. RMSE means **Root Mean Square Error**, also called root mean squared error; it gives greater weight to large errors. Both have an ideal value of zero and retain the measurement units. Positive bias indicates average over-reading; negative bias indicates average under-reading. [MAE and squared-error definitions](https://scikit-learn.org/stable/modules/model_evaluation.html#regression-metrics), [RMSE documentation](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.root_mean_squared_error.html)

Errors will be expressed in pH units, °C, moisture percentage points on the stated moisture basis, or the matched nutrient units. For example, 24% moisture compared with 20% is a difference of **4 percentage points** and a relative error of 20%; these are different quantities.

### Coefficient of determination

\[
R^2=1-\frac{\sum_{i=1}^{n}(y_i-d_i)^2}
{\sum_{i=1}^{n}(y_i-\bar y)^2}
\tag{4}
\]

For final validation, this equation treats reference results as observed values and calibrated device results as predictions. It measures squared-error performance relative to always predicting the validation reference mean. A value of 1 indicates perfect agreement; 0 matches that mean baseline; negative values indicate worse performance. R² is undefined when the reference results have no variation. It will not be interpreted as percentage accuracy. Calibration-fit R² and independent-validation R² will be labeled separately. [R² definition and limitations](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.r2_score.html)

### Pearson correlation

\[
r=\frac{\sum_{i=1}^{n}(d_i-\bar d)(y_i-\bar y)}
{\sqrt{\sum_{i=1}^{n}(d_i-\bar d)^2\sum_{i=1}^{n}(y_i-\bar y)^2}}
\tag{5}
\]

Here \(\bar d\) is the mean device result. Pearson \(r\) describes linear association, from -1 to +1, and is undefined for a constant input. It does not establish agreement: readings consistently one pH unit too high can still correlate perfectly. Squaring Pearson \(r\) is not generally the same as Equation 4 for device predictions. [SciPy Pearson correlation documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.pearsonr.html)

### How sensor accuracy will be assessed

JCGM describes measurement accuracy through closeness to the quantity being measured, rather than a universal numerical accuracy percentage. This study will assess measurement performance using errors, bias, repeatability, and parameter-specific acceptance limits. [JCGM 200:2012, sections 2.13 and 2.15](https://www.bipm.org/documents/20126/2071204/JCGM_200_2012.pdf)

If a percentage summary is required, the following **researcher-defined percentage within tolerance** may supplement those measures:

\[
P_{\mathrm{tol}}=\frac{100}{n}\sum_{i=1}^{n}
\mathbf 1\{|d_i-y_i|\leq T_i\}
\tag{6}
\]

Here \(T_i\) is the allowable absolute error for that parameter and range, fixed before validation, and \(\mathbf1\) equals 1 when the condition holds and 0 otherwise. Report the tolerance, justification, and numerator and denominator. This is a proposed study statistic, not an established PAES requirement. It must not be labeled simply "sensor accuracy" without its definition.

Do not use \(100-\mathrm{MAPE}\) as a universal sensor accuracy formula. If retained for suitable ratio-scale quantities only:

\[
RE_i=\frac{d_i-y_i}{y_i},\qquad
APE_i=100\frac{|d_i-y_i|}{|y_i|},\qquad
\mathrm{MAPE}=\frac{1}{n}\sum_{i=1}^{n}APE_i
\tag{7}
\]

State that all included reference values are nonzero and how near-zero or below-detection-limit values are handled. MAPE will not be used for pH or Celsius temperature. [MAPE definition](https://scikit-learn.org/stable/modules/model_evaluation.html#mean-absolute-percentage-error)

## Proposed text for Repeatability Testing

At least ten measurement cycles will be performed per selected sample or stable test condition, covering different points in the intended measurement range. The operator, device, method, location, preparation, and environmental conditions will be held as constant as practical over a short interval. Each cycle will follow the same cleaning, placement or reinsertion, and stabilization steps. If probes remain stationary, the result will be identified as stationary-reading repeatability rather than a full repeated measurement procedure. These controls operationalize the repeatability conditions described by JCGM. [JCGM 200:2012, sections 2.20 to 2.21](https://www.bipm.org/documents/20126/2071204/JCGM_200_2012.pdf)

Let \(x_j\) be repeat reading \(j\), \(m\geq10\) the repeat count, and \(\bar x\) their mean for one condition:

\[
\bar x=\frac{1}{m}\sum_{j=1}^{m}x_j
\tag{8}
\]

\[
s_r^2=\frac{\sum_{j=1}^{m}(x_j-\bar x)^2}{m-1},\qquad
s_r=\sqrt{\frac{\sum_{j=1}^{m}(x_j-\bar x)^2}{m-1}}
\tag{9}
\]

The repeatability standard deviation \(s_r\) describes the spread of individual readings; smaller values indicate better consistency. It will be reported separately for each parameter and test condition. Do not calculate one SD across deliberately different moisture levels or temperatures and call it repeatability.

An additional approximate 95% repeatability limit may be reported as:

\[
r_{95}\approx 2.8s_r
\tag{10}
\]

Under independent, approximately normally distributed repeatability errors with comparable variance, the absolute difference between two individual results is expected to be below this limit approximately 95% of the time. This is an estimated difference limit, not a confidence interval for the mean, a 95% accuracy claim, or a pass threshold. FAO presents this expression in its soil-laboratory quality guidance, section 7.5.2.2, Equation 7.19. It is **not verified as the adviser's intended PAES formula**. [FAO repeatability guidance](https://www.fao.org/4/w7295e/w7295e09.htm)

For suitable positive ratio-scale measurements with a mean sufficiently above zero:

\[
CV(\%)=100\frac{s_r}{\bar x}
\tag{11}
\]

CV will be supplementary for calibrated moisture or validated nutrient quantities where appropriate. It will not be used for pH, Celsius temperature, or an arbitrary raw sensor scale. NIST specifically restricts meaningful CV interpretation to ratio scales and cautions against means near zero. [NIST coefficient of variation](https://www.itl.nist.gov/div898/software/dataplot/refman2/auxillar/coefvari.htm)

## Additional calculations already implied by the study

The following are proposed operational definitions for this prototype, not formulas mandated by ISO or PAES.

### Embedded product evaluation

For a questionnaire item, with score \(v\in\{1,2,3,4,5\}\) and valid-response frequency \(f_v\):

\[
\bar Q=\frac{\sum_{v=1}^{5}vf_v}{\sum_{v=1}^{5}f_v}
\tag{12}
\]

Exclude missing and not-applicable responses from the denominator. Report valid counts. State whether characteristic and overall scores weight items, responses, or characteristics equally; apply the selected scheme consistently. These ratings describe evaluator judgments and will not establish ISO certification.

\[
\mathrm{Task\ success}(\%)=100\frac{N_{\mathrm{successful\ attempts}}}{N_{\mathrm{attempts}}},\qquad
\bar t=\frac{1}{L}\sum_{\ell=1}^{L}(t_{\mathrm{end},\ell}-t_{\mathrm{start},\ell})
\tag{13}
\]

Define task success, assistance, timing endpoints, timeout, and the prototype setup and cellular conditions where applicable before testing. Report timeouts and failures separately rather than silently omitting them from response-time summaries.

### Offline recording and SMS

For \(N_c>0\) scans reported saved, let \(N_v\) be the number recovered from the card with the expected identifiers and matching readings:

\[
\mathrm{Record\ retention}(\%)=100\frac{N_v}{N_c}
\tag{14}
\]

Check the card after a power cycle and after operating without cellular coverage. Count missing, mismatched, and interrupted writes separately. Record acquisition attempts that failed before a save was confirmed.

For \(N_a>0\) SMS attempts, let \(N_d\) be the number observed on the handset:

\[
\mathrm{Handset\ receipt}(\%)=100\frac{N_d}{N_a}
\tag{15}
\]

Report modem acknowledgements and handset receipts separately. Measure receipt latency for delivered texts and record the trial conditions and time limit. Measure battery runtime from the defined start condition to the cutoff under the specified workload.

### Cost analysis

\[
C_{\mathrm{total}}=\sum_{h=1}^{H}q_hp_h+\sum_{a=1}^{A}c_a,\qquad
\mathrm{Share}_g(\%)=100\frac{C_g}{C_{\mathrm{total}}}
\tag{16}
\]

Here \(q_h\) and \(p_h\) are component quantity and unit cost, \(c_a\) represents other nonduplicated direct expenses, and \(C_g\) is a subsystem subtotal. State treatment of labor, delivery, testing services, donated items, and reusable equipment. Budget allowances are not actual expenditures.

### Optional paired t-test

Retain this only if it serves an explicit research question and its assumptions are reasonable. With \(e_i=d_i-y_i\), \(\bar e\) the mean difference, and \(s_e\) its sample SD:

\[
t=\frac{\bar e}{s_e/\sqrt n},\qquad df=n-1
\tag{17}
\]

For a two-sided test of zero mean difference, use the proposed \(\alpha=0.05\). Assess independence of pairs and the distribution of paired differences. A nonsignificant result does not establish equivalence or acceptable individual errors. [NIST paired-observation test](https://www.itl.nist.gov/div898/handbook/prc/section3/prc311.htm)

## Product quality reference

The questionnaire and technical checklist draw on selected product quality characteristics from [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html).

## Transfer and reporting checks

- Give every equation its variables, units, application, interpretation, and a nearby citation where applicable.
- Keep calibration samples separate from the independent validation samples.
- Replace the existing short equations and vague metric list with consistent notation and cross-references; avoid duplicate formulas with conflicting symbols.
- Keep pH preparation methods and moisture bases matched. N, P, and K comparisons require matched nutrient fractions and units.
- Fix sample counts, measurement ranges, parameter-specific tolerances, and repeatability criteria before final testing; no universal pass limits were established by this review.
- Resolve the exact PAES reference with the adviser or AMTEC before claiming PAES-based repeatability. Do not cite FAO's Equation 7.19 as a PAES equation.
- Number equations according to the university format and update the table of contents after Word editing.
- Report field and laboratory results when observed.
