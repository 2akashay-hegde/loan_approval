// Presets definition
const presets = {
    approved: {
        no_of_dependents: 2,
        education: "Graduate",
        self_employed: "No",
        income_annum: 8500000,
        loan_amount: 22000000,
        loan_term: 10,
        cibil_score: 780,
        residential_assets_value: 12000000,
        commercial_assets_value: 4500000,
        luxury_assets_value: 18000000,
        bank_asset_value: 6500000
    },
    borderline: {
        no_of_dependents: 1,
        education: "Graduate",
        self_employed: "Yes",
        income_annum: 3800000,
        loan_amount: 14000000,
        loan_term: 14,
        cibil_score: 610,
        residential_assets_value: 4000000,
        commercial_assets_value: 1000000,
        luxury_assets_value: 5000000,
        bank_asset_value: 1800000
    },
    rejected: {
        no_of_dependents: 4,
        education: "Not Graduate",
        self_employed: "Yes",
        income_annum: 1500000,
        loan_amount: 18000000,
        loan_term: 20,
        cibil_score: 390,
        residential_assets_value: 800000,
        commercial_assets_value: 0,
        luxury_assets_value: 1200000,
        bank_asset_value: 400000
    }
};

let debounceTimer = null;

function formatCurrency(num) {
    return '₹' + Number(num).toLocaleString('en-IN');
}

function updateCibilDisplay(val) {
    const cibilValEl = document.getElementById('cibil-display');
    if (cibilValEl) cibilValEl.innerText = val;

    const badge = document.getElementById('cibil-tier-badge');
    if (badge) {
        badge.className = 'score-badge';
        const score = parseInt(val, 10);
        if (score >= 750) {
            badge.classList.add('badge-excellent');
            badge.innerText = 'Excellent';
        } else if (score >= 650) {
            badge.classList.add('badge-good');
            badge.innerText = 'Good';
        } else if (score >= 550) {
            badge.classList.add('badge-fair');
            badge.innerText = 'Fair';
        } else {
            badge.classList.add('badge-poor');
            badge.innerText = 'Poor';
        }
    }
}

function recalcAssets() {
    const res = parseFloat(document.getElementById('residential_assets_value').value) || 0;
    const com = parseFloat(document.getElementById('commercial_assets_value').value) || 0;
    const lux = parseFloat(document.getElementById('luxury_assets_value').value) || 0;
    const bnk = parseFloat(document.getElementById('bank_asset_value').value) || 0;
    const loan = parseFloat(document.getElementById('loan_amount').value) || 0;

    const total = res + com + lux + bnk;
    const totalEl = document.getElementById('total-assets-display');
    if (totalEl) totalEl.innerText = formatCurrency(total);

    const ratioEl = document.getElementById('loan-to-asset-display');
    if (ratioEl) {
        if (total > 0) {
            const ratio = ((loan / total) * 100).toFixed(1);
            ratioEl.innerText = `${ratio}%`;
        } else {
            ratioEl.innerText = 'N/A';
        }
    }
}

function applyPreset(type) {
    const data = presets[type];
    if (!data) return;

    document.querySelectorAll('.preset-buttons .btn-chip').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`btn-preset-${type}`);
    if (btn) btn.classList.add('active');

    for (const [key, val] of Object.entries(data)) {
        const el = document.getElementById(key);
        if (el) {
            el.value = val;
        }
    }

    updateCibilDisplay(data.cibil_score);
    recalcAssets();
    submitPrediction();
}

function resetForm() {
    document.querySelectorAll('.preset-buttons .btn-chip').forEach(btn => btn.classList.remove('active'));
    document.getElementById('loan-form').reset();
    updateCibilDisplay(document.getElementById('cibil_score').value);
    recalcAssets();
    submitPrediction();
}

function debouncedInputChanged() {
    updateCibilDisplay(document.getElementById('cibil_score').value);
    recalcAssets();
    
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        submitPrediction();
    }, 350);
}

function updateGauge(confidencePercent, isApproved) {
    const needle = document.getElementById('gauge-needle-group');
    const arc = document.getElementById('gauge-arc');
    const confText = document.getElementById('confidence-text');
    const confBarText = document.getElementById('confidence-bar-text');
    const statusLabel = document.getElementById('gauge-status-label');

    const prob = Math.min(Math.max(parseFloat(confidencePercent) || 0, 0), 100);

    // Speedometer needle rotation: -90deg (0%) to +90deg (100%)
    const angle = -90 + (prob * 1.8);
    if (needle) {
        needle.style.transform = `rotate(${angle}deg)`;
    }

    // SVG arc stroke-dashoffset: total circumference = 251.32
    const totalCircumference = 251.32;
    const offset = totalCircumference * (1 - (prob / 100));
    if (arc) {
        arc.style.strokeDashoffset = offset;
    }

    if (confText) confText.innerText = `${prob.toFixed(1)}%`;
    if (confBarText) confBarText.innerText = `${prob.toFixed(2)}%`;

    if (statusLabel) {
        statusLabel.innerText = isApproved ? 'Approval Confidence' : 'Risk Confidence';
    }
}

function updateEMICalculator(loanAmount, loanTermYears, cibilScore) {
    let ratePct = 7.5;
    if (cibilScore >= 750) {
        ratePct = 7.5;
    } else if (cibilScore >= 650) {
        ratePct = 9.0;
    } else if (cibilScore >= 550) {
        ratePct = 11.0;
    } else {
        ratePct = 13.5;
    }

    const r = ratePct / (12 * 100);
    const n = Math.max(loanTermYears, 1) * 12;
    
    let emi = 0;
    if (r > 0) {
        emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
        emi = loanAmount / n;
    }

    const totalPayment = emi * n;
    const totalInterest = totalPayment - loanAmount;

    const rateBadge = document.getElementById('emi-interest-rate');
    const emiMonthly = document.getElementById('emi-monthly');
    const emiInterest = document.getElementById('emi-total-interest');
    const emiPayment = document.getElementById('emi-total-payment');

    if (rateBadge) rateBadge.innerText = `${ratePct.toFixed(2)}% APR`;
    if (emiMonthly) emiMonthly.innerText = formatCurrency(Math.round(emi));
    if (emiInterest) emiInterest.innerText = formatCurrency(Math.round(totalInterest));
    if (emiPayment) emiPayment.innerText = formatCurrency(Math.round(totalPayment));
}

async function submitPrediction(event) {
    if (event) event.preventDefault();

    const submitBtn = document.getElementById('btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    submitBtn.disabled = true;

    const payload = {
        no_of_dependents: parseInt(document.getElementById('no_of_dependents').value, 10),
        education: document.getElementById('education').value,
        self_employed: document.getElementById('self_employed').value,
        income_annum: parseFloat(document.getElementById('income_annum').value),
        loan_amount: parseFloat(document.getElementById('loan_amount').value),
        loan_term: parseInt(document.getElementById('loan_term').value, 10),
        cibil_score: parseInt(document.getElementById('cibil_score').value, 10),
        residential_assets_value: parseFloat(document.getElementById('residential_assets_value').value),
        commercial_assets_value: parseFloat(document.getElementById('commercial_assets_value').value),
        luxury_assets_value: parseFloat(document.getElementById('luxury_assets_value').value),
        bank_asset_value: parseFloat(document.getElementById('bank_asset_value').value)
    };

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        const resData = await response.json();
        updateDecisionUI(resData, payload);
    } catch (err) {
        console.error('Prediction request failed:', err);
    } finally {
        btnText.style.display = 'inline-flex';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function updateDecisionUI(result, payload) {
    const decisionBox = document.getElementById('decision-box');
    const decisionIcon = document.getElementById('decision-icon');
    const decisionText = document.getElementById('decision-text');
    const decisionSummary = document.getElementById('decision-summary');
    const confidenceBar = document.getElementById('confidence-bar');
    const calloutMessage = document.getElementById('callout-message');

    const isApproved = result.prediction.toLowerCase().includes('approved') && !result.prediction.toLowerCase().includes('not');

    if (isApproved) {
        decisionBox.className = 'decision-box approved';
        decisionIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        decisionText.innerText = 'Loan Approved';
        decisionSummary.innerText = 'Applicant satisfies underwriting criteria and credit risk thresholds.';
        confidenceBar.className = 'progress-fill fill-approved';
    } else {
        decisionBox.className = 'decision-box rejected';
        decisionIcon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
        decisionText.innerText = 'Loan Not Approved';
        decisionSummary.innerText = 'Applicant exhibits elevated credit risk or inadequate collateral backing.';
        confidenceBar.className = 'progress-fill fill-rejected';
    }

    const confVal = parseFloat(result.confidence) || 95;
    confidenceBar.style.width = `${Math.min(Math.max(confVal, 10), 100)}%`;

    // Speedometer & EMI Updates
    updateGauge(confVal, isApproved);
    updateEMICalculator(payload.loan_amount, payload.loan_term, payload.cibil_score);

    // Breakdown updates
    const cibilScore = payload.cibil_score;
    const bCredit = document.getElementById('b-credit');
    if (cibilScore >= 750) {
        bCredit.className = 'b-value text-success';
        bCredit.innerText = `Excellent (${cibilScore})`;
    } else if (cibilScore >= 650) {
        bCredit.className = 'b-value text-success';
        bCredit.innerText = `Good (${cibilScore})`;
    } else if (cibilScore >= 550) {
        bCredit.className = 'b-value text-warning';
        bCredit.innerText = `Fair (${cibilScore})`;
    } else {
        bCredit.className = 'b-value text-danger';
        bCredit.innerText = `Poor (${cibilScore})`;
    }

    const dti = (payload.loan_amount / Math.max(payload.income_annum, 1)).toFixed(2);
    document.getElementById('b-dti').innerText = `${dti}x`;

    const totalAssets = payload.residential_assets_value + payload.commercial_assets_value + payload.luxury_assets_value + payload.bank_asset_value;
    const coverage = (totalAssets / Math.max(payload.loan_amount, 1)).toFixed(2);
    const bCov = document.getElementById('b-coverage');
    if (coverage >= 1.5) {
        bCov.className = 'b-value text-success';
        bCov.innerText = `${coverage}x (Strong)`;
    } else if (coverage >= 1.0) {
        bCov.className = 'b-value text-warning';
        bCov.innerText = `${coverage}x (Moderate)`;
    } else {
        bCov.className = 'b-value text-danger';
        bCov.innerText = `${coverage}x (Low)`;
    }

    document.getElementById('b-term').innerText = `${payload.loan_term} Years`;

    if (isApproved) {
        calloutMessage.innerText = `Applicant demonstrates strong financial viability with a CIBIL score of ${cibilScore} and adequate asset backing.`;
    } else {
        calloutMessage.innerText = `Primary rejection factors likely involve a low CIBIL score (${cibilScore}) or high loan amount relative to income/assets.`;
    }
}

function exportPDFReport() {
    const targetElement = document.getElementById('result-container');
    if (!targetElement) return;

    const opt = {
        margin:       0.5,
        filename:     `LoanPulse_Credit_Appraisal_Report_${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#0B0F19' },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(targetElement).save();
    } else {
        window.print();
    }
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
    recalcAssets();
    updateCibilDisplay(document.getElementById('cibil_score').value);
    
    // Attach live listeners to form inputs
    const formInputs = document.querySelectorAll('#loan-form input, #loan-form select');
    formInputs.forEach(input => {
        input.addEventListener('input', debouncedInputChanged);
        input.addEventListener('change', debouncedInputChanged);
    });

    // Trigger initial prediction for immediate live feel
    submitPrediction();
});

