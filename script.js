
const productForm = document.getElementById("productForm");
const titleInput = document.getElementById("titleInput");
const priceInput = document.getElementById("priceInput");
const imageInput = document.getElementById("imageInput");
const categoryInput = document.getElementById("categoryInput");

const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const previewThumb = document.getElementById("previewThumb");
const previewImage = document.getElementById("previewImage");
const previewPlaceholder = document.getElementById("previewPlaceholder");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filterSelect = document.getElementById("filterSelect");

const productGrid = document.getElementById("productGrid");
const emptyMessage = document.getElementById("emptyMessage");
const productCount = document.getElementById("productCount");

const STORAGE_KEY = "pastelStockProducts";
let products = [];       
let editingId = null;   


function loadProducts() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  products = storedData ? JSON.parse(storedData) : [];
}

// Save the current "products" array into Local Storage
function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// Checks the form fields and returns true only if everything is valid
function validateForm(title, price, image, category) {
  if (title === "") {
    alert("Please enter a product title.");
    return false;
  }
  if (price === "" || Number(price) <= 0 || isNaN(Number(price))) {
    alert("Please enter a valid product price.");
    return false;
  }
  if (image === "") {
    alert("Please enter a product image URL.");
    return false;
  }
  if (category === "") {
    alert("Please select a product category.");
    return false;
  }
  return true;
}

function addProduct(title, price, image, category) {
  const newProduct = {
    id: Date.now(),
    title: title,
    price: Number(price),
    image: image,
    category: category,
  };

  products.push(newProduct);
  saveProducts();
  alert("Product added successfully!");
}

function displayProducts() {
  let visibleProducts = [...products];

  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm !== "") {
    visibleProducts = visibleProducts.filter((product) =>
      product.title.toLowerCase().includes(searchTerm)
    );
  }

  const filterValue = filterSelect.value;
  if (filterValue !== "all") {
    visibleProducts = visibleProducts.filter(
      (product) => product.category === filterValue
    );
  }

  const sortValue = sortSelect.value;
  if (sortValue === "lowToHigh") {
    visibleProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "highToLow") {
    visibleProducts.sort((a, b) => b.price - a.price);
  }

  productGrid.innerHTML = "";

  if (visibleProducts.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
    visibleProducts.forEach((product) => {
      const card = createProductCard(product);
      productGrid.appendChild(card);
    });
  }

  productCount.textContent =
    products.length === 1 ? "1 item" : `${products.length} items`;
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <div class="card-image-wrap">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" 
           onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
    </div>
    <div class="card-body">
      <span class="card-category">${escapeHtml(product.category)}</span>
      <h3 class="card-title">${escapeHtml(product.title)}</h3>
      <p class="card-price">₹${Number(product.price).toFixed(2)}</p>
      <div class="card-actions">
        <button class="btn btn-edit" data-id="${product.id}" data-action="edit">Edit</button>
        <button class="btn btn-delete" data-id="${product.id}" data-action="delete">Delete</button>
      </div>
    </div>
  `;

  return card;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}


function editProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  titleInput.value = product.title;
  priceInput.value = product.price;
  imageInput.value = product.image;
  categoryInput.value = product.category;

  updateImagePreview();

  editingId = product.id;
  submitBtn.textContent = "Update Product";
  cancelEditBtn.style.display = "inline-block";

  productForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateProduct(id, title, price, image, category) {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return;

  products[index] = {
    id: id,
    title: title,
    price: Number(price),
    image: image,
    category: category,
  };

  saveProducts();
  alert("Product updated successfully!");
}

function exitEditMode() {
  editingId = null;
  submitBtn.textContent = "Add Product";
  cancelEditBtn.style.display = "none";
  clearForm();
}


function deleteProduct(id) {
  const confirmDelete = confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  products = products.filter((product) => product.id !== id);
  saveProducts();
  displayProducts();
  alert("Product deleted successfully!");

  if (editingId === id) {
    exitEditMode();
  }
}

function clearForm() {
  productForm.reset();
  updateImagePreview();
}

function updateImagePreview() {
  const url = imageInput.value.trim();
  if (url === "") {
    previewImage.style.display = "none";
    previewPlaceholder.style.display = "block";
  } else {
    previewImage.src = url;
    previewImage.style.display = "block";
    previewPlaceholder.style.display = "none";
  }
}

productForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const price = priceInput.value.trim();
  const image = imageInput.value.trim();
  const category = categoryInput.value;

  const isValid = validateForm(title, price, image, category);
  if (!isValid) return;

  if (editingId === null) {
    addProduct(title, price, image, category);
  } else {
    updateProduct(editingId, title, price, image, category);
    exitEditMode();
  }

  clearForm();
  displayProducts();
});

cancelEditBtn.addEventListener("click", function () {
  exitEditMode();
});

imageInput.addEventListener("input", updateImagePreview);

productGrid.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;

  const id = Number(button.getAttribute("data-id"));
  const action = button.getAttribute("data-action");

  if (action === "edit") {
    editProduct(id);
  } else if (action === "delete") {
    deleteProduct(id);
  }
});

searchInput.addEventListener("input", displayProducts);
sortSelect.addEventListener("change", displayProducts);
filterSelect.addEventListener("change", displayProducts);


function initApp() {
  loadProducts();
  displayProducts();
  updateImagePreview();
}

initApp();
