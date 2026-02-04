const API = "https://api.escuelajs.co/api/v1/products";
let data = [];
let filtered = [];
let currentPage = 1;
let pageSize = 10;
let sortField = null;
let sortAsc = true;

async function loadData() {
    const res = await fetch(API);
    data = await res.json();
    filtered = data;
    render();
}
loadData();

// Render table
function render() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    // search + sort + paginate
    let list = filtered.slice();

    if (sortField) {
        list.sort((a, b) => {
            let x = a[sortField];
            let y = b[sortField];
            return sortAsc ? x > y ? 1 : -1 : x < y ? 1 : -1;
        });
    }

    const start = (currentPage - 1) * pageSize;
    const pageData = list.slice(start, start + pageSize);

    pageData.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.title}</td>
            <td>${item.price}</td>
            <td>${item.category?.name}</td>
            <td><img src="${item.images[0]}" width="50"></td>
        `;

        // Tooltip mô tả
        tr.addEventListener("mouseenter", (e) => showTooltip(e, item.description));
        tr.addEventListener("mouseleave", hideTooltip);

        // open modal
        tr.addEventListener("click", () => openDetail(item));

        tbody.appendChild(tr);
    });

    renderPagination(list.length);
}

// Tooltip 
function showTooltip(e, text) {
    const tooltip = document.getElementById("tooltip");
    tooltip.innerText = text;
    tooltip.style.display = "block";
    tooltip.style.left = e.pageX + 10 + "px";
    tooltip.style.top = e.pageY + 10 + "px";
}

function hideTooltip() {
    document.getElementById("tooltip").style.display = "none";
}

// Pagination
function renderPagination(total) {
    let totalPages = Math.ceil(total / pageSize);
    let ul = document.getElementById("pagination");
    ul.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        let li = document.createElement("li");
        li.className = "page-item " + (i === currentPage ? "active" : "");
        li.innerHTML = `<a class="page-link">${i}</a>`;
        li.onclick = () => {
            currentPage = i;
            render();
        };
        ul.appendChild(li);
    }
}

// Search
document.getElementById("searchInput").oninput = function () {
    const q = this.value.toLowerCase();
    filtered = data.filter(x => x.title.toLowerCase().includes(q));
    currentPage = 1;
    render();
};

// Change page size
document.getElementById("pageSize").onchange = function () {
    pageSize = Number(this.value);
    currentPage = 1;
    render();
};

// Sorting
document.querySelectorAll(".sort").forEach(btn => {
    btn.onclick = function () {
        const field = this.dataset.field;
        sortAsc = sortField === field ? !sortAsc : true;
        sortField = field;
        render();
    };
});

// Export CSV
document.getElementById("exportBtn").onclick = function () {
    let csv = "id,title,price,category\n";
    const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    rows.forEach(r => {
        csv += `${r.id},"${r.title}",${r.price},"${r.category?.name}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products.csv";
    a.click();
};

// Modal View/Edit
function openDetail(item) {
    document.getElementById("editId").value = item.id;
    document.getElementById("editTitle").value = item.title;
    document.getElementById("editPrice").value = item.price;
    document.getElementById("editDesc").value = item.description;

    new bootstrap.Modal("#detailModal").show();
}

// Update API
document.getElementById("btnUpdate").onclick = async function (e) {
    e.preventDefault();

    const id = document.getElementById("editId").value;

    await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: document.getElementById("editTitle").value,
            price: Number(document.getElementById("editPrice").value),
            description: document.getElementById("editDesc").value
        })
    });

    loadData();
    alert("Cập nhật thành công!");
};

// Create new
document.getElementById("btnCreate").onclick = async function (e) {
    e.preventDefault();

    await fetch(API, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: newTitle.value,
            price: Number(newPrice.value),
            description: newDesc.value,
            images: [newImage.value],
            categoryId: 1
        })
    });

    loadData();
    alert("Tạo sản phẩm thành công!");
};
