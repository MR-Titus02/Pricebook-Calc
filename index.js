let jsonData = []; // will store your JSON

// DOM Elements
const regionSelect = document.getElementById("region");
const countrySelect = document.getElementById("country");
const supplierSelect = document.getElementById("supplier");
const currencySelect = document.getElementById("currency");
const paymentTermsSelect = document.getElementById("payment-terms");
const engagementTypeSelect = document.getElementById("engagement-type");
const slaSelect = document.getElementById("sla");
const form = document.getElementById("pricebook-form");
const resultDiv = document.getElementById("result");

// Load JSON
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    jsonData = data;
    populateRegions();
  })
  .catch((err) => console.error("Error loading JSON:", err));

// Populate Regions
function populateRegions() {
  const regions = [...new Set(jsonData.map((r) => r.Region))];
  regions.forEach((region) => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    regionSelect.appendChild(option);
  });
}

// On Region Change → populate countries
regionSelect.addEventListener("change", () => {
  countrySelect.innerHTML = '<option value="">-- Select Country --</option>';
  const selectedRegion = regionSelect.value;
  const regionData = jsonData.find((r) => r.Region === selectedRegion);
  if (!regionData) return;
  regionData.Countries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.Name;
    option.textContent = country.Name;
    countrySelect.appendChild(option);
  });
  resetDependentFields();
});

// On Country Change → populate supplier, currency, payment terms, engagement types
countrySelect.addEventListener("change", () => {
  const selectedRegion = regionSelect.value;
  const selectedCountry = countrySelect.value;
  const regionData = jsonData.find((r) => r.Region === selectedRegion);
  if (!regionData) return;
  const countryData = regionData.Countries.find((c) => c.Name === selectedCountry);
  if (!countryData) return;

  // Supplier
  supplierSelect.innerHTML = `<option value="${countryData.Supplier}">${countryData.Supplier}</option>`;

  // Currency
  currencySelect.innerHTML = `<option value="${countryData.Currency}">${countryData.Currency}</option>`;

  // Payment Terms
  paymentTermsSelect.innerHTML = `<option value="${countryData.PaymentTerms}">${countryData.PaymentTerms}</option>`;

  // Engagement Types (added Staffing here)
  engagementTypeSelect.innerHTML = '<option value="">-- Select Engagement Type --</option>';
  const engagementTypes = [
    "Staffing",
    "FullDayVisits",
    "HalfDayVisits",
    "DispatchTicket",
    "DispatchPricing",
    "ShortTermProjects",
    "LongTermProjects"
  ];
  engagementTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    engagementTypeSelect.appendChild(option);
  });

  resetDependentFields();
});

// Reset SLA + conditional fields
function resetDependentFields() {
  slaSelect.innerHTML = '<option value="">-- Select SLA/Level --</option>';
  document.getElementById("resource-model-group").style.display = "none";
  document.getElementById("duration-group").style.display = "block";
  document.getElementById("additional-hours-group").style.display = "none";
}

// Populate SLA based on Engagement Type
engagementTypeSelect.addEventListener("change", () => {
  const selectedRegion = regionSelect.value;
  const selectedCountry = countrySelect.value;
  const selectedEngagement = engagementTypeSelect.value;

  const regionData = jsonData.find((r) => r.Region === selectedRegion);
  if (!regionData) return;
  const countryData = regionData.Countries.find((c) => c.Name === selectedCountry);
  if (!countryData) return;

  // Reset SLA
  slaSelect.innerHTML = '<option value="">-- Select SLA/Level --</option>';

  // Staffing → SLA = L1–L5, show Resource Model, hide Duration
  if (selectedEngagement === "Staffing") {
    ["L1", "L2", "L3", "L4", "L5"].forEach((level) => {
      const option = document.createElement("option");
      option.value = level;
      option.textContent = level;
      slaSelect.appendChild(option);
    });
    document.getElementById("resource-model-group").style.display = "block";
    document.getElementById("duration-group").style.display = "none";
    document.getElementById("additional-hours-group").style.display = "none";
  }
  // Dispatch Ticket → SLA from JSON keys, show Additional Hours
  else if (selectedEngagement === "DispatchTicket") {
    const dataList = countryData.DispatchTicket;
    if (dataList && dataList.length > 0) {
      Object.keys(dataList[0]).forEach((sla) => {
        const option = document.createElement("option");
        option.value = sla;
        option.textContent = sla;
        slaSelect.appendChild(option);
      });
    }
    document.getElementById("resource-model-group").style.display = "none";
    document.getElementById("duration-group").style.display = "block";
    document.getElementById("additional-hours-group").style.display = "block";
  }
  // Other Engagements → SLA keys from JSON
  else {
    const dataList = countryData[selectedEngagement];
    if (dataList && dataList.length > 0) {
      Object.keys(dataList[0]).forEach((sla) => {
        const option = document.createElement("option");
        option.value = sla;
        option.textContent = sla;
        slaSelect.appendChild(option);
      });
    }
    document.getElementById("resource-model-group").style.display = "none";
    document.getElementById("duration-group").style.display = "block";
    document.getElementById("additional-hours-group").style.display = "none";
  }
});

// Form Submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const values = {
    region: regionSelect.value,
    country: countrySelect.value,
    supplier: supplierSelect.value,
    currency: currencySelect.value,
    paymentTerms: paymentTermsSelect.value,
    engagementType: engagementTypeSelect.value,
    sla: slaSelect.value,
    resourceModel: document.querySelector('input[name="resource-model"]:checked')?.value,
    additionalHours: Number(document.getElementById("additional-hours").value),
    quantity: Number(document.getElementById("quantity").value),
    duration: Number(document.getElementById("duration").value),
  };

  // For now → just show what user selected
  resultDiv.innerHTML = `<pre>${JSON.stringify(values, null, 2)}</pre>`;
});
