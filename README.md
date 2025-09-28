TECEZE Global Pricebook Calculator

This is a web application developed as part of the TECEZE internship assessment task.
The application converts the provided Excel-based Global Pricebook into an interactive web calculator, allowing users to quickly calculate service costs based on region, country, supplier, contract type, SLA, and number of resources.

✨ Features

📊 Converts Excel pricebook data into JSON format for fast lookups

🌎 Cascading dropdowns: Region → Country → Supplier → Service → Contract → SLA

⚡ Dynamic calculator that supports multiple pricing models:

Dispatch Tickets → (Base Price + (Additional Hours × Hourly Rate)) × Resources

Full Day / Half Day Visits → Base Price × Resources

Short / Long-Term Projects → (Monthly Price × Duration) × Resources

🔄 Fields (Duration / Additional Hours) appear dynamically depending on SLA type

🖥️ Built with pure HTML, CSS, and JavaScript (no frameworks, minimal & lightweight)

☁️ Hosted on Vercel for easy access

🚀 Live Demo
[Click Here](https://pricebook-calc.vercel.app)

👉 View the Application on Vercel

🛠️ Tech Stack

Frontend: HTML5, CSS3, Vanilla JavaScript

Data: Converted Excel (.xlsx) → JSON

Hosting: Vercel

📂 Project Structure
├── index.html        # Main UI
├── styles.css         # Minimal styling
├── index.js         # Calculator logic
├── data.json       # Converted pricing data
├── data.xlsx     #Provided excel file
└── README.md         # Documentation

⚙️ How It Works

Select Region → Country → Supplier → Service → Contract → SLA from dropdowns.

Enter Number of Resources.

Depending on SLA type:

Enter Additional Hours (for Dispatch Tickets).

Enter Duration in Months (for Projects).

No extra input for Full/Half Day visits.

Click Calculate → Get the Total Price instantly.

📌 Setup (Run Locally)

Clone this repo:

git clone https://github.com/MR-Titus02/Pricebook-Calc

cd Pricebook-Calc


Open index.html in your browser.

No build or dependencies required (pure HTML/CSS/JS).

🧾 Notes

This project is built specifically for TECEZE Internship Assessment.

JSON structure was carefully derived from the provided Pricebook for reliable calculations.

Author
Titus Senthilkumaran

titusroxsan@gmail.com

[Linkedin](https://www.linkedin.com/in/titus-senthilkumaran)

[Portfolio](https://mrtitus.netlify.app)
