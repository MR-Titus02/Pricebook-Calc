let jsonData = [];

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

  function camelCaseToWords(str) {
  return str
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (char) => char.toUpperCase()); // Capitalize first letter
}

// On Region Change to populate countries
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

// On Country Change to populate supplier, currency, payment terms, engagement types
countrySelect.addEventListener("change", () => {
  const selectedRegion = regionSelect.value;
  const selectedCountry = countrySelect.value;
  const regionData = jsonData.find((r) => r.Region === selectedRegion);
  if (!regionData) return;
  const countryData = regionData.Countries.find((c) => c.Name === selectedCountry);
  if (!countryData) return;



 // Show message for USA Tier 1
  if (selectedCountry === "United States of America (Tier 1)") {
   document.getElementById("message").innerHTML = `<span style='color: red; font-weight: bold;'>Note: USA Tier 1 cities are 
   <ol style='margin-top: 0; padding-left: 30px; color: black; font-weight: normal;'>
   <li>Atlanta</li>
   <li>Austin</li>
   <li>Charlotte</li>
    <li>Boston</li>
   <li>Chcicago</li>
   <li>Dallas</li>
    <li>denver</li>
   <li>Honolulu</li>
   <li>Houston</li>
    <li>Las Vegas</li>
   <li>Los Angeles</li>
   <li>Miami</li>
    <li>Minneapolis</li>
   <li>Nashville</li>
   <li>New York City</li>
  <li>Oakland</li>
   <li>Philadelphia</li>
   <li>Phoenix</li>
  <li>Portland</li>
   <li>Raleigh</li>
   <li>San Antonio</li>
  <li>San Diego</li>
   <li>San Francisco</li>
  <li>San Jose</li>
   <li>Seattle</li>
   <li>Washington, D.C.</li>
   </ol>
   <p>if your project location is outside these cities, please select USA Tier 2 option.</p>
   </span>`;
  } else {
    document.getElementById('message').innerHTML = ""; // Clear message if another country is selected
  }

  // Supplier
  supplierSelect.innerHTML = `<option value="${countryData.Supplier}">${countryData.Supplier}</option>`;

  // Currency
  currencySelect.innerHTML = `<option value="${countryData.Currency}">${countryData.Currency}</option>`;

  // Payment Terms
  paymentTermsSelect.innerHTML = `<option value="${countryData.PaymentTerms}">${countryData.PaymentTerms}</option>`;

  // Engagement Types (added Staffing)
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
    option.textContent = camelCaseToWords(type);
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
    document.getElementById("format").textContent = " (in hours)";
  }
  //Short Term Projects, Long Term Projects 
  else if (selectedEngagement === "ShortTermProjects" || selectedEngagement === "LongTermProjects") {
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
    document.getElementById("additional-hours-group").style.display = "none";
    document.getElementById("duration-group").style.display = "block";
    document.getElementById("format").textContent = " (in months)";
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
      <div style="padding: 16px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; max-width: 400px; margin: 20px auto; ">
        <h3 style="margin-bottom: 12px; color: #333; text-align: center;"> Calculation Result</h3>
        <p><strong>Engagement:</strong> ${values.engagementType}</p>
        <p><strong>SLA:</strong> ${values.sla || "N/A"}</p>
        <p><strong>Quantity:</strong> ${values.quantity}</p>
        <p><strong>Rate:</strong> ${rate} ${values.currency}</p>
        <hr style="margin: 16px 0;">
        <p style="font-size: 1.2rem; font-weight: bold; color: #444;">
           Total Cost: 
          <span style="color: #2c7a2c; font-size: 1.5rem;">${totalCost} ${values.currency}</span>
        </p>
      </div>
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
      <div style="padding: 16px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; max-width: 400px; margin: 20px auto;">
        <h3 style="margin-bottom: 12px; color: #333; text-align: center;"> Calculation Result</h3>
        <p><strong>Engagement:</strong> ${camelCaseToWords(values.engagementType)}</p>
        <p><strong>SLA:</strong> ${values.sla || "N/A"}</p>
        <p><strong>Quantity:</strong> ${values.quantity}</p>
        <p><strong>Rate:</strong> ${rate} ${values.currency}</p>
        <hr style="margin: 16px 0;">
        <p style="font-size: 1.2rem; font-weight: bold; color: #444;">
           Total Cost: 
          <span style="color: #2c7a2c; font-size: 1.5rem;">${totalCost} ${values.currency}</span>
        </p>
      </div>
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
      <div style="padding: 16px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; max-width: 400px; margin: 20px auto;">
        <h3 style="margin-bottom: 12px; color: #333; text-align: center;"> Calculation Result</h3>
        <p><strong>Engagement:</strong> ${camelCaseToWords(values.engagementType)}</p>
        <p><strong>SLA:</strong> ${values.sla || "N/A"}</p>
        <p><strong>Quantity:</strong> ${values.quantity}</p>
        <p><strong>Rate:</strong> ${rate} ${values.currency}</p>
        <hr style="margin: 16px 0;">
        <p style="font-size: 1.2rem; font-weight: bold; color: #444;">
           Total Cost: 
          <span style="color: #2c7a2c; font-size: 1.5rem;">${totalCost} ${values.currency}</span>
        </p>
      </div>
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
      <div style="padding: 16px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; max-width: 400px; margin: 20px auto;">
        <h3 style="margin-bottom: 12px; color: #333; text-align: center;"> Calculation Result</h3>
        <p><strong>Engagement:</strong> ${camelCaseToWords(values.engagementType)}</p>
        <p><strong>SLA:</strong> ${values.sla || "N/A"}</p>
        <p><strong>Quantity:</strong> ${values.quantity}</p>
        <p><strong>Rate:</strong> ${rate} ${values.currency}</p>
        <hr style="margin: 16px 0;">
        <p style="font-size: 1.2rem; font-weight: bold; color: #444;">
           Total Cost: 
          <span style="color: #2c7a2c; font-size: 1.5rem;">${totalCost} ${values.currency}</span>
        </p>
      </div>
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
    let duration = document.getElementById("duration").value;
    if (!duration || duration <= 0) {
      resultDiv.innerHTML = `<p style="color:red;">Please enter a valid duration (in months).</p>`;
      return;
    }
    totalCost = rate * values.quantity * values.duration;
    resultDiv.innerHTML = `
      <div style="padding: 16px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; max-width: 400px; margin: 20px auto;">
        <h3 style="margin-bottom: 12px; color: #333; text-align: center;"> Calculation Result</h3>
        <p><strong>Engagement:</strong> ${camelCaseToWords(values.engagementType)}</p>
        <p><strong>SLA:</strong> ${values.sla || "N/A"}</p>
        <p><strong>Quantity:</strong> ${values.quantity}</p>
        <p><strong>Rate:</strong> ${rate} ${values.currency}</p>
        <hr style="margin: 16px 0;">
        <p style="font-size: 1.2rem; font-weight: bold; color: #444;">
           Total Cost: 
          <span style="color: #2c7a2c; font-size: 1.5rem;">${totalCost} ${values.currency}</span>
        </p>
      </div>
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
      <div style="padding: 16px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; max-width: 400px; margin: 20px auto;">
        <h3 style="margin-bottom: 12px; color: #333; text-align: center;"> Calculation Result</h3>
        <p><strong>Engagement:</strong> ${camelCaseToWords(values.engagementType)}</p>
        <p><strong>SLA:</strong> ${values.sla || "N/A"}</p>
        <p><strong>Quantity:</strong> ${values.quantity}</p>
        <p><strong>Rate:</strong> ${rate} ${values.currency}</p>
        <hr style="margin: 16px 0;">
        <p style="font-size: 1.2rem; font-weight: bold; color: #444;">
           Total Cost: 
          <span style="color: #2c7a2c; font-size: 1.5rem;">${totalCost} ${values.currency}</span>
        </p>
      </div>
    `;
      }
  else {
    resultDiv.innerHTML = `<p style="color:blue;">Choose a Valid Engagement Type.</p>`;
  }
});
