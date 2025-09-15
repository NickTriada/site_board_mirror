// Simulated data (replace with live API call or server response)
const mockGasData = [
    {
      station: "Chevron",
      address: "1234 Main St, San Jose, CA",
      price: "$4.89",
      updated: "2 hours ago"
    },
    {
      station: "Shell",
      address: "5678 Market Ave, San Jose, CA",
      price: "$4.75",
      updated: "1 hour ago"
    },
    {
      station: "76 Station",
      address: "9012 Capitol Expy, San Jose, CA",
      price: "$4.69",
      updated: "30 minutes ago"
    }
  ];
  
  function displayGasData(data) {
    const container = document.getElementById("gas-container");
    container.innerHTML = '';
  
    data.forEach(station => {
      const card = document.createElement('div');
      card.className = 'gas-card';
  
      card.innerHTML = `
        <h2>${station.station}</h2>
        <p><strong>Address:</strong> ${station.address}</p>
        <p><strong>Price:</strong> ${station.price}</p>
        <p><strong>Last Updated:</strong> ${station.updated}</p>
      `;
      container.appendChild(card);
    });
  }
  
  // Run on page load
  displayGasData(mockGasData);
  