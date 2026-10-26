"""
ULAS Ordered Policy Gates Engine (G1 through G7)
Evaluates gates sequentially. Stops decision path at the first definitive fail.
Preserves structured gate results and reason codes in the assessment record.
"""

from typing import Dict, Any, Tuple
from ...schemas.ulas import GateResult
from ...core.config import policy_gates, ProductPolicy

def evaluate_policy_gates(
    features: Dict[str, Any],
    product_policy: ProductPolicy
) -> Tuple[bool, Dict[str, GateResult]]:
    """
    Evaluates G1 to G7 in sequential priority order.
    Returns: (all_passed: bool, gate_results_dict)
    """
    results: Dict[str, GateResult] = {}
    stopped_at_fail = False

    # --------------------------------------------------------------------------
    # Gate G1: KYC Identity
    # Rule: Name match >= 80%, PAN valid, Identity evidence (Aadhaar or Passport)
    # --------------------------------------------------------------------------
    name_match = features.get("name_match_score", 1.0)
    pan_valid = features.get("pan_format_valid", True)
    has_identity_doc = features.get("has_identity_doc", True)

    if not pan_valid or not has_identity_doc or name_match < policy_gates.name_match_threshold:
        g1_status = "FAIL" if name_match < 0.50 else "NEEDS_MANUAL_REVIEW"
        reason = "RC_G1_KYC_MISMATCH" if name_match < policy_gates.name_match_threshold else "RC_G1_PAN_INVALID"
        results["G1_kyc"] = GateResult(
            status=g1_status,
            reason_codes=[reason],
            description=f"Identity verification: Name match is {name_match*100:.0f}% (threshold {policy_gates.name_match_threshold*100:.0f}%).",
            evaluated_value=name_match,
            threshold=policy_gates.name_match_threshold
        )
        if g1_status == "FAIL":
            stopped_at_fail = True
    else:
        results["G1_kyc"] = GateResult(
            status="PASS",
            reason_codes=["RC_G1_KYC_PASS"],
            description="Aadhaar/Passport & PAN identity verified with high confidence.",
            evaluated_value=name_match,
            threshold=policy_gates.name_match_threshold
        )

    # --------------------------------------------------------------------------
    # Gate G2: Document Integrity
    # Rule: Salary claimed vs statement median deviation <= 30%, no material contradiction
    # --------------------------------------------------------------------------
    if stopped_at_fail:
        results["G2_integrity"] = GateResult(status="NOT_EVALUATED")
    else:
        income_mismatch = features.get("income_mismatch_pct", 0.0)
        has_contradiction = features.get("has_material_contradiction", False)

        if has_contradiction or income_mismatch > policy_gates.claimed_income_mismatch_max:
            g2_status = "FAIL" if income_mismatch > 0.60 or has_contradiction else "NEEDS_MANUAL_REVIEW"
            results["G2_integrity"] = GateResult(
                status=g2_status,
                reason_codes=["RC_G2_INCOME_DISCREPANCY" if income_mismatch > 0.30 else "RC_G2_DECLARATION_CONTRADICTION"],
                description=f"Document integrity: Income mismatch is {income_mismatch*100:.1f}% (tolerance {policy_gates.claimed_income_mismatch_max*100:.0f}%).",
                evaluated_value=income_mismatch,
                threshold=policy_gates.claimed_income_mismatch_max
            )
            if g2_status == "FAIL":
                stopped_at_fail = True
        else:
            results["G2_integrity"] = GateResult(
                status="PASS",
                reason_codes=["RC_G2_INTEGRITY_PASS"],
                description="Document cross-corroboration verified without material discrepancies.",
                evaluated_value=income_mismatch,
                threshold=policy_gates.claimed_income_mismatch_max
            )

    # --------------------------------------------------------------------------
    # Gate G3: Adverse Credit Event
    # Rule: No write-off/settlement/suit-filed in prior 36m, no open DPD 90+
    # --------------------------------------------------------------------------
    if stopped_at_fail:
        results["G3_adverse_credit"] = GateResult(status="NOT_EVALUATED")
    else:
        has_major_derogatory = features.get("has_major_derogatory", False)
        has_settlement = features.get("has_settlement_36m", False)
        open_dpd_90 = features.get("open_dpd_90_plus", False)

        if has_major_derogatory or has_settlement or open_dpd_90:
            results["G3_adverse_credit"] = GateResult(
                status="FAIL",
                reason_codes=["RC_G3_ADVERSE_CREDIT_EVENT"],
                description="Adverse credit record identified in prior 36 months (settlement/write-off/90+ DPD).",
                evaluated_value="Adverse Derogatory Event Recorded",
                threshold="Clean 36-Month Bureau Record"
            )
            stopped_at_fail = True
        else:
            results["G3_adverse_credit"] = GateResult(
                status="PASS",
                reason_codes=["RC_G3_CREDIT_CONDUCT_CLEAN"],
                description="Zero 90+ DPD delinquencies or write-off settlements in prior 36 months.",
                evaluated_value="Clean Record",
                threshold="Clean 36-Month Bureau Record"
            )

    # --------------------------------------------------------------------------
    # Gate G4: Minimum Income Floor
    # Rule: Verified net monthly income reaches product's configured floor
    # --------------------------------------------------------------------------
    if stopped_at_fail:
        results["G4_minimum_income"] = GateResult(status="NOT_EVALUATED")
    else:
        verified_income = features.get("income_verified", 0.0)
        floor = product_policy.min_income_floor

        if verified_income < floor:
            results["G4_minimum_income"] = GateResult(
                status="FAIL",
                reason_codes=["RC_G4_INSUFFICIENT_INCOME_FLOOR"],
                description=f"Verified monthly income of ₹{verified_income:,.0f} falls below product floor of ₹{floor:,.0f}.",
                evaluated_value=verified_income,
                threshold=floor
            )
            stopped_at_fail = True
        else:
            results["G4_minimum_income"] = GateResult(
                status="PASS",
                reason_codes=["RC_G4_INCOME_FLOOR_MET"],
                description=f"Verified monthly income meets product policy floor (₹{verified_income:,.0f} >= ₹{floor:,.0f}).",
                evaluated_value=verified_income,
                threshold=floor
            )

    # --------------------------------------------------------------------------
    # Gate G5: Capacity Ceiling (FOIR)
    # Rule: FOIR must not exceed configured ceiling (e.g. 65%)
    # --------------------------------------------------------------------------
    if stopped_at_fail:
        results["G5_capacity"] = GateResult(status="NOT_EVALUATED")
    else:
        foir_ratio = features.get("foir_ratio", 0.0)
        max_foir = product_policy.max_foir_ceiling

        if foir_ratio is None or foir_ratio > max_foir:
            eval_val = foir_ratio * 100.0 if foir_ratio is not None else "Undetermined"
            results["G5_capacity"] = GateResult(
                status="FAIL",
                reason_codes=["RC_G5_FOIR_CEILING_BREACHED"],
                description=f"Fixed Obligations to Income Ratio ({eval_val}%) exceeds maximum permissible ceiling of {max_foir*100.0:.0f}%.",
                evaluated_value=eval_val,
                threshold=f"{max_foir*100.0:.0f}%"
            )
            stopped_at_fail = True
        else:
            results["G5_capacity"] = GateResult(
                status="PASS",
                reason_codes=["RC_G5_CAPACITY_APPROVED"],
                description=f"FOIR of {foir_ratio*100.0:.1f}% satisfies prudential debt service ceiling ({max_foir*100.0:.0f}%).",
                evaluated_value=f"{foir_ratio*100.0:.1f}%",
                threshold=f"{max_foir*100.0:.0f}%"
            )

    # --------------------------------------------------------------------------
    # Gate G6: Bureau Floor
    # Rule: Bureau score >= 600 for unsecured, >= 550 for secured.
    # --------------------------------------------------------------------------
    if stopped_at_fail:
        results["G6_bureau_floor"] = GateResult(status="NOT_EVALUATED")
    else:
        bureau_score = features.get("bureau_score")
        min_bureau = product_policy.bureau_floor

        if bureau_score is None:
            # Thin-file routing per prompt: NOT_AVAILABLE is not equal to FAIL
            results["G6_bureau_floor"] = GateResult(
                status="NEEDS_MANUAL_REVIEW",
                reason_codes=["RC_G6_THIN_FILE_NO_BUREAU"],
                description="No formal bureau record found. Routed to manual thin-file underwriting policy.",
                evaluated_value="Thin File / No Bureau",
                threshold=min_bureau
            )
        elif bureau_score < min_bureau:
            results["G6_bureau_floor"] = GateResult(
                status="FAIL",
                reason_codes=["RC_G6_SUBPRIME_BUREAU_FLOOR"],
                description=f"Bureau score of {bureau_score} is below product policy threshold of {min_bureau}.",
                evaluated_value=bureau_score,
                threshold=min_bureau
            )
            stopped_at_fail = True
        else:
            results["G6_bureau_floor"] = GateResult(
                status="PASS",
                reason_codes=["RC_G6_BUREAU_FLOOR_MET"],
                description=f"Bureau score of {bureau_score} meets prime threshold (>= {min_bureau}).",
                evaluated_value=bureau_score,
                threshold=min_bureau
            )

    # --------------------------------------------------------------------------
    # Gate G7: Age / Employment Vintage
    # Rule: Age between 21 and 58 at maturity, employment vintage >= 6 months
    # --------------------------------------------------------------------------
    if stopped_at_fail:
        results["G7_age_vintage"] = GateResult(status="NOT_EVALUATED")
    else:
        age = features.get("borrower_age", 30)
        tenure_years = features.get("tenure_months", 36) / 12.0
        age_at_maturity = age + tenure_years
        vintage_months = features.get("employment_vintage_months", 24)

        if age < policy_gates.min_borrower_age or age_at_maturity > policy_gates.max_borrower_age_maturity:
            results["G7_age_vintage"] = GateResult(
                status="FAIL",
                reason_codes=["RC_G7_AGE_OUT_OF_BOUNDS"],
                description=f"Borrower age at maturity ({age_at_maturity:.1f} yrs) exceeds standard boundary ({policy_gates.max_borrower_age_maturity} yrs).",
                evaluated_value=age_at_maturity,
                threshold=policy_gates.max_borrower_age_maturity
            )
            stopped_at_fail = True
        elif vintage_months < policy_gates.min_employment_vintage_months:
            results["G7_age_vintage"] = GateResult(
                status="NEEDS_MANUAL_REVIEW",
                reason_codes=["RC_G7_LOW_EMPLOYMENT_VINTAGE"],
                description=f"Employment vintage of {vintage_months} months is below standard 6-month threshold.",
                evaluated_value=vintage_months,
                threshold=policy_gates.min_employment_vintage_months
            )
        else:
            results["G7_age_vintage"] = GateResult(
                status="PASS",
                reason_codes=["RC_G7_AGE_VINTAGE_MET"],
                description=f"Age ({age} yrs) and employment stability ({vintage_months} mos) conform to underwriting guidelines.",
                evaluated_value=f"Age: {age}, Vintage: {vintage_months}m",
                threshold="21-58 Yrs & >=6 mos"
            )

    all_passed = all(g.status == "PASS" for g in results.values())
    return all_passed, results
