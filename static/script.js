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

function formatCurrency(num) {
    return '₹' + Number(num).toLocaleString('en-IN');
}

function updateCibilDisplay(val) {
    document.getElementById('cibil-display').innerText = val;
    const badge = document.getElementById('cibil-tier-badge');
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

function recalcAssets() {
    const res = parseFloat(document.getElementById('residential_assets_value').value) || 0;
    const com = parseFloat(document.getElementById('commercial_assets_value').value) || 0;
    const lux = parseFloat(document.getElementById('luxury_assets_value').value) || 0;
    const bnk = parseFloat(document.getElementById('bank_asset_value').value) || 0;
    const loan = parseFloat(document.getElementById('loan_amount').value) || 0;

    const total = res + com + lux + bnk;
    document.getElementById('total-assets-display').innerText = formatCurrency(total);

    if (total > 0) {
        const ratio = ((loan / total) * 100).toFixed(1);
        document.getElementById('loan-to-asset-display').innerText = `${ratio}%`;
    } else {
        document.getElementById('loan-to-asset-display').innerText = 'N/A';
    }
}

function applyPreset(type) {
    const data = presets[type];
    if (!data) return;

    // Highlight chip button
    document.querySelectorAll('.preset-buttons .btn-chip').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`btn-preset-${type}`);
    if (btn) btn.classList.add('active');

    // Populate inputs
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
        alert('Prediction failed. Please check server logs.');
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
    const confidenceText = document.getElementById('confidence-text');
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
    confidenceText.innerText = result.confidence || `${confVal}%`;
    confidenceBar.style.width = `${Math.min(Math.max(confVal, 10), 100)}%`;

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

function copyCurl() {
    const code = document.getElementById('curl-sample').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('cURL snippet copied to clipboard!');
    }).catch(err => {
        console.error('Clipboard copy failed:', err);
    });
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
    recalcAssets();
    updateCibilDisplay(document.getElementById('cibil_score').value);
    // Trigger initial prediction for immediate live feel
    submitPrediction();
});
