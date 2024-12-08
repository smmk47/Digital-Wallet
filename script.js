// script.js

// Initialize Theme on Load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializePage();
});

// Initialize Theme Based on User Preference
function initializeTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    setTheme(theme);
}

// Set Theme Function
function setTheme(theme) {
    const themeIcon = document.getElementById('themeIcon');

    if (theme === 'dark') {
        document.body.classList.remove('bg-light-mode');
        document.body.classList.add('bg-dark-mode');

        document.querySelectorAll('.navbar').forEach(nav => {
            nav.classList.remove('bg-primary');
            nav.classList.add('bg-dark-primary');
        });

        themeIcon.textContent = '🌙'; // Moon emoji for dark mode
    } else {
        document.body.classList.remove('bg-dark-mode');
        document.body.classList.add('bg-light-mode');

        document.querySelectorAll('.navbar').forEach(nav => {
            nav.classList.remove('bg-dark-primary');
            nav.classList.add('bg-primary');
        });

        themeIcon.textContent = '🌞'; // Sun emoji for light mode
    }

    localStorage.setItem('theme', theme);
}

// Theme Toggle Button
document.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'themeToggle' || e.target.id === 'themeIcon')) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }
});


// Initialize Page Based on Current Page
function initializePage() {
    const path = window.location.pathname.split('/').pop();

    switch(path) {
        case 'index.html':
        case '':
            handleLogin();
            break;
        case 'signup.html':
            handleSignup();
            break;
        case 'dashboard.html':
            handleDashboard();
            break;
        case 'add-item.html':
            handleAddItem();
            break;
        case 'item-detail.html':
            handleItemDetail();
            break;
        case 'purchase.html':
            handlePurchase();
            break;
        case 'wallet-management.html':
            handleWalletManagement();
            break;
        default:
            break;
    }
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
    const email = localStorage.getItem('currentUser');
    if (!email) return null;
    const users = getUsers();
    return users.find(user => user.email === email);
}

function setCurrentUser(email) {
    localStorage.setItem('currentUser', email);
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Logout Event
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'logout') {
        logoutUser();
    }
});

// Handle Login Page
function handleLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                setCurrentUser(email);
                if (user.balance < 5000) {
                    showNotification('Please add more funds to your wallet.', 'warning');
                }
                window.location.href = 'dashboard.html';
            } else {
                showNotification('Invalid email or password.', 'danger');
            }
        });
    }
}

// Handle Signup Page
function handleSignup() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const initialBalance = parseFloat(document.getElementById('initialBalance').value);

            if (initialBalance < 5000) {
                showNotification('Initial balance must be at least Rs. 5,000.', 'danger');
                return;
            }

            const users = getUsers();
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                showNotification('Email is already registered.', 'danger');
                return;
            }

            const newUser = {
                name,
                email,
                password, // Note: For security, passwords should be hashed
                balance: initialBalance,
                items: [],
                transactions: [
                    { type: 'Credit', amount: initialBalance, date: new Date().toLocaleString() }
                ]
            };
            users.push(newUser);
            saveUsers(users);
            setCurrentUser(email);
            window.location.href = 'dashboard.html';
        });
    }
}

// Handle Dashboard Page
function handleDashboard() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userName').textContent = user.name;
    document.getElementById('walletBalance').textContent = user.balance.toLocaleString();

    if (user.balance < 5000) {
        showNotification('Your wallet balance is below Rs. 5,000. Please add more funds.', 'warning');
    }

    // Display Items
    displayItems(user);

    // Search and Filter
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput && categoryFilter) {
        searchInput.addEventListener('input', () => {
            displayItems(user);
        });

        categoryFilter.addEventListener('change', () => {
            displayItems(user);
        });
    }
}

function displayItems(user) {
    const itemsList = document.getElementById('itemsList');
    if (!itemsList) return;

    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    let filteredItems = user.items;

    if (category !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === category);
    }

    if (searchQuery) {
        filteredItems = filteredItems.filter(item => {
            return Object.values(item).some(val => 
                typeof val === 'string' && val.toLowerCase().includes(searchQuery)
            );
        });
    }

    if (filteredItems.length === 0) {
        itemsList.innerHTML = '<p>No items found.</p>';
        return;
    }

    itemsList.innerHTML = '';
    filteredItems.forEach((item, index) => {
        itemsList.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${capitalizeFirstLetter(item.category)}</h5>
                        <p class="card-text">${getItemSummary(item)}</p>
                        <a href="item-detail.html?index=${index}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            </div>
        `;
    });
}

function getItemSummary(item) {
    switch(item.category) {
        case 'cards':
            return `Card Number: ${item.cardNumber}`;
        case 'licenses':
            return `License Number: ${item.licenseNumber}`;
        case 'tickets':
            return `Type: ${item.ticketType}, Date: ${item.date}`;
        case 'passwords':
            return `Website: ${item.website}`;
        default:
            return '';
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Handle Add Item Page
function handleAddItem() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const addItemForm = document.getElementById('addItemForm');
    const itemCategory = document.getElementById('itemCategory');
    const dynamicFields = document.getElementById('dynamicFields');

    if (itemCategory && dynamicFields && addItemForm) {
        itemCategory.addEventListener('change', () => {
            renderDynamicFields(itemCategory.value, dynamicFields);
        });

        addItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = itemCategory.value;
            if (!category) {
                showNotification('Please select a category.', 'danger');
                return;
            }

            const newItem = { category };

            switch(category) {
                case 'cards':
                    newItem.cardNumber = document.getElementById('cardNumber').value.trim();
                    newItem.expirationDate = document.getElementById('expirationDate').value.trim();
                    newItem.cvv = document.getElementById('cvv').value.trim();
                    break;
                case 'licenses':
                    newItem.licenseNumber = document.getElementById('licenseNumber').value.trim();
                    newItem.expiryDate = document.getElementById('expiryDate').value.trim();
                    break;
                case 'tickets':
                    newItem.ticketType = document.getElementById('ticketType').value.trim();
                    newItem.date = document.getElementById('ticketDate').value.trim();
                    newItem.time = document.getElementById('ticketTime').value.trim();
                    newItem.place = document.getElementById('ticketPlace').value.trim();
                    break;
                case 'passwords':
                    newItem.website = document.getElementById('website').value.trim();
                    newItem.username = document.getElementById('username').value.trim();
                    newItem.password = document.getElementById('password').value.trim();
                    break;
                default:
                    break;
            }

            // Image Upload (Optional)
            const itemImage = document.getElementById('itemImage').files[0];
            if (itemImage) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    newItem.image = e.target.result;
                    saveNewItem(user, newItem);
                };
                reader.readAsDataURL(itemImage);
            } else {
                saveNewItem(user, newItem);
            }
        });
    }
}

function renderDynamicFields(category, container) {
    let fields = '';
    switch(category) {
        case 'cards':
            fields = `
                <div class="mb-3">
                    <label for="cardNumber" class="form-label">Card Number</label>
                    <input type="text" class="form-control" id="cardNumber" required>
                </div>
                <div class="mb-3">
                    <label for="expirationDate" class="form-label">Expiration Date</label>
                    <input type="month" class="form-control" id="expirationDate" required>
                </div>
                <div class="mb-3">
                    <label for="cvv" class="form-label">CVV</label>
                    <input type="text" class="form-control" id="cvv" required>
                </div>
            `;
            break;
        case 'licenses':
            fields = `
                <div class="mb-3">
                    <label for="licenseNumber" class="form-label">License Number</label>
                    <input type="text" class="form-control" id="licenseNumber" required>
                </div>
                <div class="mb-3">
                    <label for="expiryDate" class="form-label">Expiry Date</label>
                    <input type="month" class="form-control" id="expiryDate" required>
                </div>
            `;
            break;
        case 'tickets':
            fields = `
                <div class="mb-3">
                    <label for="ticketType" class="form-label">Ticket Type</label>
                    <input type="text" class="form-control" id="ticketType" required>
                </div>
                <div class="mb-3">
                    <label for="ticketDate" class="form-label">Date</label>
                    <input type="date" class="form-control" id="ticketDate" required>
                </div>
                <div class="mb-3">
                    <label for="ticketTime" class="form-label">Time</label>
                    <input type="time" class="form-control" id="ticketTime" required>
                </div>
                <div class="mb-3">
                    <label for="ticketPlace" class="form-label">Place</label>
                    <input type="text" class="form-control" id="ticketPlace" required>
                </div>
            `;
            break;
        case 'passwords':
            fields = `
                <div class="mb-3">
                    <label for="website" class="form-label">Website Name</label>
                    <input type="text" class="form-control" id="website" required>
                </div>
                <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" required>
                </div>
            `;
            break;
        default:
            break;
    }
    container.innerHTML = fields;
}

function saveNewItem(user, item) {
    user.items.push(item);
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        users[userIndex] = user;
        saveUsers(users);
        showNotification('Item added successfully.');
        window.location.href = 'dashboard.html';
    }
}

// Handle Item Detail Page
function handleItemDetail() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const index = parseInt(urlParams.get('index'));
    if (isNaN(index) || index < 0 || index >= user.items.length) {
        showNotification('Invalid item index.', 'danger');
        return;
    }

    const item = user.items[index];
    const itemDetail = document.getElementById('itemDetail');
    if (itemDetail) {
        let details = `<p><strong>Category:</strong> ${capitalizeFirstLetter(item.category)}</p>`;
        switch(item.category) {
            case 'cards':
                details += `
                    <p><strong>Card Number:</strong> ${item.cardNumber}</p>
                    <p><strong>Expiration Date:</strong> ${item.expirationDate}</p>
                    <p><strong>CVV:</strong> ${item.cvv}</p>
                `;
                break;
            case 'licenses':
                details += `
                    <p><strong>License Number:</strong> ${item.licenseNumber}</p>
                    <p><strong>Expiry Date:</strong> ${item.expiryDate}</p>
                `;
                break;
            case 'tickets':
                details += `
                    <p><strong>Ticket Type:</strong> ${item.ticketType}</p>
                    <p><strong>Date:</strong> ${item.date}</p>
                    <p><strong>Time:</strong> ${item.time}</p>
                    <p><strong>Place:</strong> ${item.place}</p>
                `;
                break;
            case 'passwords':
                details += `
                    <p><strong>Website:</strong> ${item.website}</p>
                    <p><strong>Username:</strong> ${item.username}</p>
                    <p><strong>Password:</strong> ${item.password}</p>
                `;
                break;
            default:
                break;
        }

        if (item.image) {
            details += `<p><strong>Image:</strong><br><img src="${item.image}" alt="Item Image" class="img-fluid"></p>`;
        }

        itemDetail.innerHTML = details;
    }

    // Handle Delete
    const deleteButton = document.getElementById('deleteItem');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this item?')) {
                user.items.splice(index, 1);
                const users = getUsers();
                const userIndex = users.findIndex(u => u.email === user.email);
                if (userIndex !== -1) {
                    users[userIndex] = user;
                    saveUsers(users);
                    showNotification('Item deleted successfully.');
                    window.location.href = 'dashboard.html';
                }
            }
        });
    }

    // Handle Export as PDF
    const exportButton = document.getElementById('exportPDF');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            exportItemAsPDF(item, index);
        });
    }

    // Handle Edit (Optional)
    // Implement edit functionality as needed
}

// Function to Export Item as PDF
function exportItemAsPDF(item, index) {
    // Destructure item details for easier access
    const { category } = item;

    // Create a new jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set title
    doc.setFontSize(18);
    doc.text("Item Detail", 105, 20, null, null, 'center');

    // Add a horizontal line
    doc.setLineWidth(0.5);
    doc.line(10, 25, 200, 25);

    // Starting Y position
    let yPosition = 30;

    // Add Category
    doc.setFontSize(14);
    doc.text(`Category: ${capitalizeFirstLetter(category)}`, 10, yPosition);
    yPosition += 10;

    // Add specific details based on category
    switch(category) {
        case 'cards':
            doc.text(`Card Number: ${item.cardNumber}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Expiration Date: ${item.expirationDate}`, 10, yPosition);
            yPosition += 10;
            doc.text(`CVV: ${item.cvv}`, 10, yPosition);
            yPosition += 10;
            break;
        case 'licenses':
            doc.text(`License Number: ${item.licenseNumber}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Expiry Date: ${item.expiryDate}`, 10, yPosition);
            yPosition += 10;
            break;
        case 'tickets':
            doc.text(`Ticket Type: ${item.ticketType}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Date: ${item.date}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Time: ${item.time}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Place: ${item.place}`, 10, yPosition);
            yPosition += 10;
            break;
        case 'passwords':
            doc.text(`Website: ${item.website}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Username: ${item.username}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Password: ${item.password}`, 10, yPosition);
            yPosition += 10;
            break;
        default:
            break;
    }

    // Add Image if exists
    if (item.image) {
        // Ensure the image is in base64 format
        const img = new Image();
        img.src = item.image;
        img.onload = function() {
            // Calculate image width to fit within the page
            const imgWidth = 180;
            const imgHeight = (img.height * imgWidth) / img.width;
            doc.addImage(img, 'JPEG', 15, yPosition, imgWidth, imgHeight);
            // Save the PDF after image is loaded
            doc.save(`Item_Detail_${index + 1}.pdf`);
        };
        img.onerror = function() {
            // If image fails to load, save PDF without image
            doc.save(`Item_Detail_${index + 1}.pdf`);
        };
    } else {
        // Save the PDF if there's no image
        doc.save(`Item_Detail_${index + 1}.pdf`);
    }
}

// Handle Purchase Page
function handlePurchase() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const productsList = document.getElementById('productsList');
    if (!productsList) return;

    // Example Product Category: Food (Pizzas/Burgers)
    const products = [
        { name: 'Pizza', price: 500 },
        { name: 'Burger', price: 300 },
        { name: 'Pasta', price: 400 },
        { name: 'Fries', price: 200 },
        { name: 'Soda', price: 100 },
        { name: 'Salad', price: 250 },
        { name: 'Sandwich', price: 150 },
        { name: 'Ice Cream', price: 120 },
        { name: 'Tacos', price: 350 },
        { name: 'Noodles', price: 300 },
        { name: 'Steak', price: 800 },
        { name: 'Chicken Wings', price: 450 },
        { name: 'Garlic Bread', price: 180 },
        { name: 'Soup', price: 220 },
        { name: 'Smoothie', price: 180 }
    ];

    products.forEach((product, index) => {
        productsList.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">Price: Rs. ${product.price}</p>
                        <button class="btn btn-primary buy-button" data-price="${product.price}">Buy</button>
                    </div>
                </div>
            </div>
        `;
    });

    // Handle Buy Button Clicks
    const buyButtons = document.querySelectorAll('.buy-button');
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const price = parseFloat(button.getAttribute('data-price'));
            if (user.balance >= price) {
                user.balance -= price;
                user.transactions.push({ type: 'Debit', amount: price, date: new Date().toLocaleString() });
                const users = getUsers();
                const userIndex = users.findIndex(u => u.email === user.email);
                if (userIndex !== -1) {
                    users[userIndex] = user;
                    saveUsers(users);
                    showNotification(`Purchase successful! Rs. ${price} deducted from your wallet.`, 'success');
                    document.getElementById('walletBalance').textContent = user.balance.toLocaleString();
                    if (user.balance < 5000) {
                        showNotification('Your wallet balance is below Rs. 5,000. Please add more funds.', 'warning');
                    }
                }
            } else {
                showNotification('Insufficient balance. Please add more funds.', 'danger');
            }
        });
    });
}

// Handle Wallet Management Page
function handleWalletManagement() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const walletBalance = document.getElementById('walletBalance');
    const transactionsList = document.getElementById('transactionsList');
    const addFundsForm = document.getElementById('addFundsForm');

    if (walletBalance && transactionsList && addFundsForm) {
        walletBalance.textContent = user.balance.toLocaleString();

        // Display Transactions
        user.transactions.slice().reverse().forEach(tx => {
            transactionsList.innerHTML += `
                <li class="list-group-item">
                    <strong>${tx.type}:</strong> Rs. ${tx.amount} <br>
                    <small>${tx.date}</small>
                </li>
            `;
        });

        // Handle Add Funds
        addFundsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('addAmount').value);
            if (isNaN(amount) || amount <= 0) {
                showNotification('Please enter a valid amount.', 'danger');
                return;
            }

            user.balance += amount;
            user.transactions.push({ type: 'Credit', amount: amount, date: new Date().toLocaleString() });
            const users = getUsers();
            const userIndex = users.findIndex(u => u.email === user.email);
            if (userIndex !== -1) {
                users[userIndex] = user;
                saveUsers(users);
                showNotification(`Successfully added Rs. ${amount} to your wallet.`, 'success');
                walletBalance.textContent = user.balance.toLocaleString();
                transactionsList.innerHTML = '';
                user.transactions.slice().reverse().forEach(tx => {
                    transactionsList.innerHTML += `
                        <li class="list-group-item">
                            <strong>${tx.type}:</strong> Rs. ${tx.amount} <br>
                            <small>${tx.date}</small>
                        </li>
                    `;
                });
            }
        });
    }
}
