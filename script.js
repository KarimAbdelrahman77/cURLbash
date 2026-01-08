document.getElementById("fileInput").addEventListener("change", handleFile);

function handleFile(event) {
    const file = event.target.files[0];

    if (!file) {
        console.error("No file selected.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const headers = extractHeadersFromCurl(content);

        printHeadersForJMeter(headers);
        displayHeadersTable(headers);
    };

    reader.readAsText(file);
}

function extractHeadersFromCurl(content) {
    const headers = [];

    // Match -H or -h followed by quoted OR unquoted argument
    const regex = /-(?:H|h)\s+(?:['"]([^'"]+)['"]|([^\s\\]+))/g;

    let match;
    while ((match = regex.exec(content)) !== null) {
        const headerLine = match[1] || match[2];
        if (!headerLine || !headerLine.includes(":")) continue;

        const colonIndex = headerLine.indexOf(":");
        const name = headerLine.substring(0, colonIndex).trim();
        let remainder = headerLine.substring(colonIndex + 1).trim();

        let value;

        // ✅ NEW RULE: if value starts with a double quote, capture quoted value
        if (remainder.startsWith('"')) {
            const closingQuoteIndex = remainder.indexOf('"', 1);
            if (closingQuoteIndex !== -1) {
                value = remainder.substring(0, closingQuoteIndex + 1);
            } else {
                // unmatched quote → take everything
                value = remainder;
            }
        } else {
            value = remainder;
        }

        headers.push({ name, value });
    }

    return headers;
}

// ----- Console output (JMeter-ready) -----
function printHeadersForJMeter(headers) {
    if (headers.length === 0) {
        console.warn("No headers found.");
        return;
    }

    headers.forEach(h => {
        console.log(`${h.name}: ${h.value}`);
    });
}

// ----- HTML Table output -----
function displayHeadersTable(headers) {
    const table = document.getElementById("headersTable");
    const tbody = table.querySelector("tbody");

    tbody.innerHTML = "";

    if (headers.length === 0) {
        table.style.display = "none";
        return;
    }

    headers.forEach(h => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = h.name;

        const valueCell = document.createElement("td");
        valueCell.textContent = h.value;

        row.appendChild(nameCell);
        row.appendChild(valueCell);
        tbody.appendChild(row);
    });

    table.style.display = "table";
}
