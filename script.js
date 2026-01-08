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
    const regex = /-(?:H|h)\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const headerLine = match[1];

        if (headerLine.includes(":")) {
            const [name, ...rest] = headerLine.split(":");
            headers.push({
                name: name.trim(),
                value: rest.join(":").trim()
            });
        }
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
