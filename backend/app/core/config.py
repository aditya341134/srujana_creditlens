import os
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Automatically load environment variables from .env files
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"))

MODEL_VERSION = "ulas-0.2.0"
POLICY_VERSION = "2026.1"
FEATURE_SCHEMA_VERSION = "1.0.0"
CALIBRATION_VERSION = "provisional-v1"

# Upload and Security Configurations
MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_DOCUMENT_TYPES = ["application/pdf", "pdf"]
STORAGE_DIRECTORY = "private_storage/documents"

# Secret Key for JWT Tokens
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "creditlens_prudential_underwriting_secret_key_2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# MySQL Database Configurations
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "creditlens")
DB_USERNAME = os.getenv("DB_USERNAME", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DATABASE_URL = os.getenv("DATABASE_URL", "")

def get_database_url() -> str:
    """Builds the MySQL database connection URL from environment variables."""
    if DATABASE_URL:
        return DATABASE_URL
    if DB_PASSWORD:
        return f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    return f"mysql+pymysql://{DB_USERNAME}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

def get_server_connection_url() -> str:
    """Connection URL to MySQL server root (without database specified) to facilitate auto-creation."""
    if DB_PASSWORD:
        return f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/?charset=utf8mb4"
    return f"mysql+pymysql://{DB_USERNAME}@{DB_HOST}:{DB_PORT}/?charset=utf8mb4"

class PolicyGateConfig(BaseModel):
    name_match_threshold: float = 0.80           # G1: 80% minimum fuzzy name match
    claimed_income_mismatch_max: float = 0.30     # G2: 30% max deviation
    adverse_credit_lookback_months: int = 36      # G3: 36 months lookback
    max_open_dpd: int = 90                        # G3: 90+ DPD is definitive adverse
    min_net_monthly_income_floor: float = 15000.0 # G4: Minimum income floor
    max_foir_ceiling: float = 0.65                # G5: 65% maximum FOIR gate
    min_bureau_score_unsecured: int = 600         # G6: Bureau floor unsecured
    min_bureau_score_secured: int = 550           # G6: Bureau floor secured
    min_borrower_age: int = 21                    # G7: Minimum age
    max_borrower_age_maturity: int = 58           # G7: Maximum age at maturity
    min_employment_vintage_months: int = 6        # G7: Minimum employment vintage

class SubscoreWeightsConfig(BaseModel):
    credit_conduct: float = 35.0
    repayment_capacity: float = 25.0
    banking_behaviour: float = 20.0
    debt_collateral_hygiene: float = 12.0
    profile_stability: float = 8.0

class PopulationReferenceMeans(BaseModel):
    credit_conduct: float = 65.0
    repayment_capacity: float = 60.0
    banking_behaviour: float = 55.0
    debt_collateral_hygiene: float = 60.0
    profile_stability: float = 70.0

class CalibrationConfig(BaseModel):
    # Logistic mapping parameters P = 1 / (1 + exp(-((R - 50) / 18)))
    logistic_midpoint: float = 50.0
    logistic_scale: float = 18.0
    population_median_p: float = 0.50
    confidence_min: float = 0.50
    confidence_max: float = 1.00
    missing_optional_penalty: float = 0.15
    statement_short_penalty: float = 0.10
    soft_integrity_multiplier: float = 0.90

class ProductPolicy(BaseModel):
    product_code: str
    product_name: str
    is_secured: bool = False
    min_income_floor: float = 15000.0
    max_foir_ceiling: float = 0.65
    bureau_floor: int = 600
    cir_mandatory: bool = True
    living_cost_floor_tier1: float = 25000.0
    living_cost_floor_tier2: float = 18000.0
    living_cost_floor_tier3: float = 12000.0

PRODUCT_POLICIES: Dict[str, ProductPolicy] = {
    "Personal Loan": ProductPolicy(
        product_code="PL",
        product_name="Personal Loan",
        is_secured=False,
        min_income_floor=15000.0,
        max_foir_ceiling=0.65,
        bureau_floor=600,
        cir_mandatory=True
    ),
    "Home Loan": ProductPolicy(
        product_code="HL",
        product_name="Home Loan",
        is_secured=True,
        min_income_floor=25000.0,
        max_foir_ceiling=0.60,
        bureau_floor=550,
        cir_mandatory=True
    ),
    "Business Growth Loan": ProductPolicy(
        product_code="BL",
        product_name="Business Growth Loan",
        is_secured=False,
        min_income_floor=30000.0,
        max_foir_ceiling=0.65,
        bureau_floor=620,
        cir_mandatory=True
    ),
    "Higher Education Loan": ProductPolicy(
        product_code="EL",
        product_name="Higher Education Loan",
        is_secured=False,
        min_income_floor=20000.0,
        max_foir_ceiling=0.65,
        bureau_floor=580,
        cir_mandatory=False
    ),
    "Electric & Auto Loan": ProductPolicy(
        product_code="VL",
        product_name="Electric & Auto Loan",
        is_secured=True,
        min_income_floor=18000.0,
        max_foir_ceiling=0.65,
        bureau_floor=575,
        cir_mandatory=True
    ),
    "Gold & Asset Backed Loan": ProductPolicy(
        product_code="GL",
        product_name="Gold & Asset Backed Loan",
        is_secured=True,
        min_income_floor=10000.0,
        max_foir_ceiling=0.70,
        bureau_floor=500,
        cir_mandatory=False
    )
}

# Singleton Config Instances
policy_gates = PolicyGateConfig()
subscore_weights = SubscoreWeightsConfig()
population_means = PopulationReferenceMeans()
calibration_settings = CalibrationConfig()

def get_product_policy(product_name: str) -> ProductPolicy:
    return PRODUCT_POLICIES.get(product_name, PRODUCT_POLICIES["Personal Loan"])
