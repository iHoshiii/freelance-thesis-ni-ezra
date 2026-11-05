# Data evaluation formulas for the soil analyzer thesis

Prepared on 5 November 2026 from a review of `docs/initial_paper.docx` and the primary sources linked below. This Markdown file records the proposed evaluation methods and explains the scope of the formulas incorporated into the current Word draft.

## Findings and placement

The paper already contains short MAE, RMSE, and bias equations under **Statistical Treatment of Data**. It also names RÂ², correlation, repeatability statistics, classification metrics, questionnaire means, and cost contributions, but does not fully define their equations and symbols. Expand the existing sections rather than adding a disconnected list of formulas.

| Existing section | Proposed addition |
|---|---|
| Calibration and Validation Metrics | Paired-error equations, units, RÂ² interpretation, and a clearly defined accuracy assessment |
| Repeatability Testing | Repeatability standard deviation, variance, suitable CV, and the documented repeatability procedure |
| Dataset Preparation and Trained Model Development; Recommendation Validation | Classification accuracy, per-class precision, recall, F1, and confusion matrix definitions |
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

Errors will be expressed in pH units, Â°C, moisture percentage points on the stated moisture basis, or the matched nutrient units. For example, 24% moisture compared with 20% is a difference of **4 percentage points** and a relative error of 20%; these are different quantities.

### Coefficient of determination

\[
R^2=1-\frac{\sum_{i=1}^{n}(y_i-d_i)^2}
{\sum_{i=1}^{n}(y_i-\bar y)^2}
\tag{4}
\]

For final validation, this equation treats reference results as observed values and calibrated device results as predictions. It measures squared-error performance relative to always predicting the validation reference mean. A value of 1 indicates perfect agreement; 0 matches that mean baseline; negative values indicate worse performance. RÂ² is undefined when the reference results have no variation. It will not be interpreted as percentage accuracy. Calibration-fit RÂ² and independent-validation RÂ² will be labeled separately. [RÂ² definition and limitations](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.r2_score.html)

### Pearson correlation

\[
r=\frac{\sum_{i=1}^{n}(d_i-\bar d)(y_i-\bar y)}
{\sqrt{\sum_{i=1}^{n}(d_i-\bar d)^2\sum_{i=1}^{n}(y_i-\bar y)^2}}
\tag{5}
\]

Here \(\bar d\) is the mean device result. Pearson \(r\) describes linear association, from âˆ’1 to +1, and is undefined for a constant input. It does not establish agreement: readings consistently one pH unit too high can still correlate perfectly. Squaring Pearson \(r\) is not generally the same as Equation 4 for device predictions. [SciPy Pearson correlation documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.pearsonr.html)

### How sensor accuracy will be assessed

Measurement accuracy and classification accuracy are different concepts. JCGM describes measurement accuracy through closeness to the quantity being measured, rather than a universal numerical accuracy percentage. This study will assess measurement performance using errors, bias, repeatability, and parameter-specific acceptance limits. [JCGM 200:2012, sections 2.13 and 2.15](https://www.bipm.org/documents/20126/2071204/JCGM_200_2012.pdf)

If a percentage summary is required, the following **researcher-defined percentage within tolerance** may supplement those measures:

\[
P_{\mathrm{tol}}=\frac{100}{n}\sum_{i=1}^{n}
\mathbf 1\{|d_i-y_i|\leq T_i\}
\tag{6}
\]

Here \(T_i\) is the allowable absolute error for that parameter and range, fixed before validation, and \(\mathbf1\) equals 1 when the condition holds and 0 otherwise. Report the tolerance, justification, and numerator and denominator. This is a proposed study statistic, not an established PAES requirement. It must not be labeled simply â€œsensor accuracyâ€ without its definition.

Do not use \(100-\mathrm{MAPE}\) as a universal sensor accuracy formula. If retained for suitable ratio-scale quantities only:

\[
RE_i=\frac{d_i-y_i}{y_i},\qquad
APE_i=100\frac{|d_i-y_i|}{|y_i|},\qquad
\mathrm{MAPE}=\frac{1}{n}\sum_{i=1}^{n}APE_i
\tag{7}
\]

State that all included reference values are nonzero and how near-zero or below-detection-limit values are handled. MAPE will not be used for pH or Celsius temperature. [MAPE definition](https://scikit-learn.org/stable/modules/model_evaluation.html#mean-absolute-percentage-error)

## Proposed text for Repeatability Testing

At least ten measurement cycles will be performed per selected sample or stable test condition, covering different points in the intended measurement range. The operator, device, method, location, preparation, and environmental conditions will be held as constant as practical over a short interval. Each cycle will follow the same cleaning, placement or reinsertion, and stabilization steps. If probes remain stationary, the result will be identified as stationary-reading repeatability rather than a full repeated measurement procedure. These controls operationalize the repeatability conditions described by JCGM. [JCGM 200:2012, sections 2.20â€“2.21](https://www.bipm.org/documents/20126/2071204/JCGM_200_2012.pdf)

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

## Proposed text for trained model evaluation

The fertilizer compatibility classifier will be evaluated using independent held-out samples and documented reference labels. Let \(N\) be the number of test cases, \(c_i\) the expected class, and \(\hat c_i\) the predicted class:

\[
\mathrm{Accuracy}(\%)=\frac{100}{N}\sum_{i=1}^{N}\mathbf1\{\hat c_i=c_i\}
\tag{12}
\]

For each class \(k\), treated as the positive class against all others:

\[
\mathrm{Precision}_k=\frac{TP_k}{TP_k+FP_k},\qquad
\mathrm{Recall}_k=\frac{TP_k}{TP_k+FN_k}
\tag{13}
\]

\[
F1_k=\frac{2TP_k}{2TP_k+FP_k+FN_k},\qquad
F1_{\mathrm{macro}}=\frac{1}{K}\sum_{k=1}^{K}F1_k
\tag{14}
\]

\(TP_k\) counts correctly predicted class-\(k\) cases; \(FP_k\) counts other cases incorrectly predicted as \(k\); \(FN_k\) counts class-\(k\) cases predicted as another class; and \(K\) is the fixed number of supported classes. Precision, recall, and F1 are fractions from 0 to 1 unless multiplied by 100. Report class support and define handling of zero denominators; mark undefined results explicitly. [Classification accuracy](https://scikit-learn.org/stable/modules/model_evaluation.html#accuracy-score), [precision, recall, F1, and averaging](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_fscore_support.html)

The confusion matrix will use expected classes as rows and predicted classes as columns. Cell \(C_{ab}\) counts cases whose expected class is \(a\) and prediction is \(b\). Its diagonal contains correct predictions. RMSE and RÂ² will not be applied to arbitrary numeric codes assigned to fertilizer categories. [Confusion matrix convention](https://scikit-learn.org/stable/modules/model_evaluation.html#confusion-matrix)

Abstentions or insufficient-data outputs will be counted and reported. If accuracy excludes them, report both prediction coverage and accuracy among the covered cases. A high classification score does not by itself demonstrate increased crop yield or agronomic effectiveness.

## Additional calculations already implied by the study

The following are proposed operational definitions for this prototype, not formulas mandated by ISO or PAES.

### Web application evaluation

For a questionnaire item, with score \(v\in\{1,2,3,4,5\}\) and valid-response frequency \(f_v\):

\[
\bar Q=\frac{\sum_{v=1}^{5}vf_v}{\sum_{v=1}^{5}f_v}
\tag{15}
\]

Exclude missing and not-applicable responses from the denominator. Report valid counts. State whether characteristic and overall scores weight items, responses, or characteristics equally; apply the selected scheme consistently. These ratings describe evaluator judgments and will not establish ISO certification.

\[
\mathrm{Task\ success}(\%)=100\frac{N_{\mathrm{successful\ attempts}}}{N_{\mathrm{attempts}}},\qquad
\bar t=\frac{1}{L}\sum_{\ell=1}^{L}(t_{\mathrm{end},\ell}-t_{\mathrm{start},\ell})
\tag{16}
\]

Define task success, assistance, timing endpoints, timeout, and browser/network conditions before testing. Report timeouts and failures separately rather than silently omitting them from response-time summaries.

### Offline recording and synchronization

Use a known set of \(N_c>0\) successfully committed device records. At the end of a defined recovery window, count \(N_s\), the expected unique identifiers stored on the server with matching payloads:

\[
\mathrm{Recovery}(\%)=100\frac{N_s}{N_c},\qquad N_{\mathrm{missing}}=N_c-N_s
\tag{17}
\]

List missing identifiers, conflicting payloads, and duplicate database rows separately. A repeated upload request that produces no additional stored record is not a duplicate database row. Attempted acquisitions that never committed will be recorded separately, including queue-full pauses and interrupted writes.

For an initially empty queue with verified capacity \(Q\) records and sampling interval \(\Delta t\), the nominal capacity-equivalent logging duration is:

\[
D_{\mathrm{capacity}}=Q\Delta t
\tag{18}
\]

Report the actual first-record time, last-record time, and first rejected-acquisition time as well; first-to-last spacing for \(Q\) regularly spaced records is \((Q-1)\Delta t\). Synchronization duration runs from restored server reachability to acknowledgment of the last expected record. Battery runtime is the measured elapsed time from the defined start condition to the defined shutdown or cutoff condition, with workload stated.

### Cost analysis

\[
C_{\mathrm{total}}=\sum_{h=1}^{H}q_hp_h+\sum_{a=1}^{A}c_a,\qquad
\mathrm{Share}_g(\%)=100\frac{C_g}{C_{\mathrm{total}}}
\tag{19}
\]

Here \(q_h\) and \(p_h\) are component quantity and unit cost, \(c_a\) represents other nonduplicated direct expenses, and \(C_g\) is a subsystem subtotal. State treatment of labor, delivery, testing services, donated items, and reusable equipment. Budget allowances are not actual expenditures.

### Optional paired t-test

Retain this only if it serves an explicit research question and its assumptions are reasonable. With \(e_i=d_i-y_i\), \(\bar e\) the mean difference, and \(s_e\) its sample SD:

\[
t=\frac{\bar e}{s_e/\sqrt n},\qquad df=n-1
\tag{20}
\]

For a two-sided test of zero mean difference, use the proposed \(\alpha=0.05\). Assess independence of pairs and the distribution of paired differences. A nonsignificant result does not establish equivalence or acceptable individual errors. [NIST paired-observation test](https://www.itl.nist.gov/div898/handbook/prc/section3/prc311.htm)

## Citation correction before transfer to Word

Replace **ISO/IEC 25010:2024** with **ISO/IEC 25010:2023** throughout the paper, questionnaire, headings, objectives, table of contents, and reference list. The official product quality model is the 2023 second edition. The currently cited `78175` page is for ISO/IEC 25002:2024, *Quality model overview and usage*. [Correct product quality standard](https://www.iso.org/standard/78176.html), [current link's actual standard](https://www.iso.org/standard/78175.html)

Suggested reference:

International Organization for Standardization. (2023). *ISO/IEC 25010:2023 Systems and software engineering â€” Systems and software Quality Requirements and Evaluation (SQuaRE) â€” Product quality model*. https://www.iso.org/standard/78176.html

## Transfer and reporting checks

- Give every equation its variables, units, application, interpretation, and a nearby citation where applicable.
- Preserve calibration versus independent-validation separation, and split model data by independent sample or collection group.
- Replace the existing short equations and vague metric list with consistent notation and cross-references; avoid duplicate formulas with conflicting symbols.
- Keep pH preparation methods and moisture bases matched. N, P, and K comparisons require matched nutrient fractions and units.
- Fix sample counts, measurement ranges, parameter-specific tolerances, and repeatability criteria before final testing; no universal pass limits were established by this review.
- Resolve the exact PAES reference with the adviser or AMTEC before claiming PAES-based repeatability. Do not cite FAO's Equation 7.19 as a PAES equation.
- Number equations according to the university format and update the table of contents after Word editing.
- All numerical examples are explanatory; no sensor, model, or field performance results have been fabricated.

