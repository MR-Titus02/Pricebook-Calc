let jsonData = []; // will store your JSON

// DOM Elements
const regionSelect = document.getElementById("region");
const countrySelect = document.getElementById("country");
const supplierSelect = document.getElementById("supplier");
const currencySelect = document.getElementById("currency");
const paymentTermsSelect = document.getElementById("payment-terms");
const serviceLevelSelect = document.getElementById("service-level");
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

// On Country Change → populate supplier, currency, payment terms, service levels, engagement types
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

  // Service Level
  serviceLevelSelect.innerHTML = '<option value="">-- Select Service Level --</option>';
  Object.keys(countryData).forEach((key) => {
    if (key.match(/^L[1-5]$/)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      serviceLevelSelect.appendChild(option);
    }
  });

  // Engagement Types
  engagementTypeSelect.innerHTML = '<option value="">-- Select Engagement Type --</option>';
  const engagementTypes = ["FullDayVisits", "HalfDayVisits", "DispatchTicket", "DispatchPricing", "ShortTermProjects", "LongTermProjects"];
  engagementTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    engagementTypeSelect.appendChild(option);
  });

  resetDependentFields();
});

// Reset SLA
function resetDependentFields() {
  slaSelect.innerHTML = '<option value="">-- Select SLA --</option>';
}

// Populate SLA based on Engagement Type and Service Level
engagementTypeSelect.addEventListener("change", () => {
  const selectedRegion = regionSelect.value;
  const selectedCountry = countrySelect.value;
  const selectedServiceLevel = serviceLevelSelect.value;
  const selectedEngagement = engagementTypeSelect.value;

  const regionData = jsonData.find((r) => r.Region === selectedRegion);
  if (!regionData) return;
  const countryData = regionData.Countries.find((c) => c.Name === selectedCountry);
  if (!countryData) return;

  slaSelect.innerHTML = '<option value="">-- Select SLA --</option>';
  const dataList = countryData[selectedEngagement];
  if (!dataList || dataList.length === 0) return;

  Object.keys(dataList[0]).forEach((sla) => {
    const option = document.createElement("option");
    option.value = sla;
    option.textContent = sla;
    slaSelect.appendChild(option);
  });
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
    serviceLevel: serviceLevelSelect.value,
    engagementType: engagementTypeSelect.value,
    sla: slaSelect.value,
    resourceModel: document.querySelector('input[name="resource-model"]:checked')?.value,
    additionalHours: Number(document.getElementById("additional-hours").value),
    quantity: Number(document.getElementById("quantity").value),
    duration: Number(document.getElementById("duration").value),
  };
  resultDiv.innerHTML = `<pre>${JSON.stringify(values, null, 2)}</pre>`;
});
