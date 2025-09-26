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

  // Staffing → SLA = L1–L5
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
  // Dispatch Ticket → SLA keys (excluding Additional Hours)
  else if (selectedEngagement === "DispatchTicket") {
    const dataList = countryData.DispatchTicket;
    if (dataList && dataList.length > 0) {
      Object.keys(dataList[0])
        .filter((sla) => sla.toLowerCase() !== "additional hour rate") // remove it
        .forEach((sla) => {
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
  // Other Engagements
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
    document.getElementById("duration-group").style.display = "none";
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

  let totalCost = 0;

  // Get selected country data
  const regionData = jsonData.find((r) => r.Region === values.region);
  const countryData = regionData?.Countries.find((c) => c.Name === values.country);

  if (!countryData) {
    resultDiv.innerHTML = `<p style="color:red;">Invalid selection. Please try again.</p>`;
    return;
  }

  // === Staffing ===
  if (values.engagementType === "Staffing") {
    if (!values.sla || !values.resourceModel) {
      resultDiv.innerHTML = `<p style="color:red;">Please select SLA and Resource Model.</p>`;
      return;
    }

    const slaData = countryData[values.sla];
    const rate = slaData?.[0]?.[values.resourceModel];

    if (!rate) {
      resultDiv.innerHTML = `<p style="color:red;">No rate available for chosen SLA/Model.</p>`;
      return;
    }

    totalCost = rate * values.quantity;

    resultDiv.innerHTML = `
      <h3>Calculation Result</h3>
      <p><strong>Engagement:</strong> Staffing</p>
      <p><strong>SLA:</strong> ${values.sla}</p>
      <p><strong>Resource Model:</strong> ${values.resourceModel}</p>
      <p><strong>Quantity:</strong> ${values.quantity}</p>
      <p><strong>Rate per Resource:</strong> ${rate} ${values.currency}</p>
      <p><strong>Total Cost:</strong> ${totalCost} ${values.currency}</p>
    `;
  }

  // === Full Day Visits ===
  else if (values.engagementType === "FullDayVisits") {
    if (!values.sla) {
      resultDiv.innerHTML = `<p style="color:red;">Please select SLA (L1–L3).</p>`;
      return;
    }

    const visitData = countryData.FullDayVisits?.[0];
    const rate = visitData?.[values.sla];

    if (!rate) {
      resultDiv.innerHTML = `<p style="color:red;">No rate found for ${values.sla}.</p>`;
      return;
    }

    totalCost = rate * values.quantity;

    resultDiv.innerHTML = `
      <h3>Calculation Result</h3>
      <p><strong>Engagement:</strong> Full Day Visit</p>
      <p><strong>SLA:</strong> ${values.sla}</p>
      <p><strong>Quantity:</strong> ${values.quantity}</p>
      <p><strong>Rate per Visit:</strong> ${rate} ${values.currency}</p>
      <p><strong>Total Cost:</strong> ${totalCost} ${values.currency}</p>
    `;
  }

  // === Half Day Visits ===
  else if (values.engagementType === "HalfDayVisits") {
    if (!values.sla) {
      resultDiv.innerHTML = `<p style="color:red;">Please select SLA (L1–L3).</p>`;
      return;
    }

    const visitData = countryData.HalfDayVisits?.[0];
    const rate = visitData?.[values.sla];

    if (!rate) {
      resultDiv.innerHTML = `<p style="color:red;">No rate found for ${values.sla}.</p>`;
      return;
    }

    totalCost = rate * values.quantity;

    resultDiv.innerHTML = `
      <h3>Calculation Result</h3>
      <p><strong>Engagement:</strong> Half Day Visit</p>
      <p><strong>SLA:</strong> ${values.sla}</p>
      <p><strong>Quantity:</strong> ${values.quantity}</p>
      <p><strong>Rate per Visit:</strong> ${rate} ${values.currency}</p>
      <p><strong>Total Cost:</strong> ${totalCost} ${values.currency}</p>
    `;
  }

  // === Dispatch Ticket ===
  else if (values.engagementType === "DispatchTicket") {
    if (!values.sla) {
      resultDiv.innerHTML = `<p style="color:red;">Please select SLA.</p>`;
      return;
    }
    const ticketData = countryData.DispatchTicket?.[0];
    const rate = ticketData?.[values.sla];
    const additionalHourRate = ticketData?.["Additional hour rate"] || 0;

    if (!rate) {
      resultDiv.innerHTML = `<p style="color:red;">No rate found for ${values.sla}.</p>`;
      return;
    }
    let duration = document.getElementById("duration").value;
    if (!duration || duration <= 0) {
      resultDiv.innerHTML = `<p style="color:red;">Please enter a valid duration (in hours).</p>`;
      return;
    }
    totalCost = (rate * values.quantity * Number(duration)) + (additionalHourRate * values.additionalHours);

    resultDiv.innerHTML = `
      <h3>Calculation Result</h3>
      <p><strong>Engagement:</strong> Dispatch Ticket</p>
      <p><strong>SLA:</strong> ${values.sla}</p>
      <p><strong>Quantity:</strong> ${values.quantity}</p>
      <p><strong>Rate per Ticket:</strong> ${rate} ${values.currency}</p>
      <p><strong>Additional Hours:</strong> ${values.additionalHours} hrs at ${additionalHourRate} ${values.currency}/hr</p>
      <p><strong>Total Cost:</strong> ${totalCost} ${values.currency}</p>
    `;
  }
  //Long Term Projects, Short Term Projects
  else if (values.engagementType === "LongTermProjects" || values.engagementType === "ShortTermProjects") {
    if (!values.sla) {
      resultDiv.innerHTML = `<p style="color:red;">Please select SLA.</p>`;
      return;
    }
    const projectData = countryData[values.engagementType]?.[0];
    const rate = projectData?.[values.sla];
    if (!rate) {
      resultDiv.innerHTML = `<p style="color:red;">No rate found for ${values.sla}.</p>`;
      return;
    }
    totalCost = rate * values.quantity ;
    resultDiv.innerHTML = `
      <h3>Calculation Result</h3>
      <p><strong>Engagement:</strong> ${values.engagementType === "LongTermProjects" ? "Long Term Project" : "Short Term Project"}</p>
      <p><strong>SLA:</strong> ${values.sla}</p>
      <p><strong>Quantity:</strong> ${values.quantity}</p>
      <p><strong>Rate:</strong> ${rate} ${values.currency}</p>
      <p><strong>Total Cost:</strong> ${totalCost} ${values.currency}</p>
    `;
  }
  //Dispatch Pricing
  else if (values.engagementType === "DispatchPricing") {
    if (!values.sla) {
      resultDiv.innerHTML = `<p style="color:red;">Please select SLA.</p>`;
      return;
    }
    const pricingData = countryData.DispatchPricing?.[0];
    const rate = pricingData?.[values.sla];
    if (!rate) {
      resultDiv.innerHTML = `<p style="color:red;">No rate found for ${values.sla}.</p>`;
      return;
    }
    totalCost = rate * values.quantity ;
    resultDiv.innerHTML = `
      <h3>Calculation Result</h3>
      <p><strong>Engagement:</strong> Dispatch Pricing</p>
      <p><strong>SLA:</strong> ${values.sla}</p>
      <p><strong>Quantity:</strong> ${values.quantity}</p>
      <p><strong>Rate:</strong> ${rate} ${values.currency}</p>
      <p><strong>Total Cost:</strong> ${totalCost} ${values.currency}</p>
    `;
  }
  else {
    resultDiv.innerHTML = `<p style="color:blue;">Calculation logic for ${values.engagementType} not yet implemented.</p>`;
  }
});
