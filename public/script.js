const contactList = document.getElementById('contactList');
const form = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const sortSelect = document.getElementById('sort');
const searchInput = document.getElementById('search');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEdit');

let editingId = null;
let allContacts = [];

// Fetch contacts from database and sort karta hai agar tumne choose kiya hai sort options ussi order me
async function loadContacts(sort = '') {
    const res = await fetch(`/api/contacts${sort ? `?sort=${sort}` : ''}`);
    const contacts = await res.json();
    allContacts = contacts;
    displayContacts(contacts);
}

// Display contacts detail
function displayContacts(contacts) {
    contactList.innerHTML = '';
    contacts.forEach(c => {
        const li = document.createElement('li');
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
      <div>
        <strong>${c.name}</strong> <br>
        <small>${c.email}</small> | <small>${c.phone}</small>
      </div>
      <div>
        <button class="btn btn-sm btn-warning me-2" onclick="editContact('${c._id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteContact('${c._id}')">❌ Delete</button>
      </div>
    `;
        contactList.appendChild(li);
    });
}

//Add or Update Contact
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newContact = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim()
    };

    let res;
    if (editingId) {
        // Update
        res = await fetch(`/api/contacts/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContact)
        });
    } else {
        // Add
        res = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContact)
        });
    }

    const data = await res.json();
    if (res.ok) {
        Swal.fire('✅ Success', data.message, 'success');
        form.reset();
        editingId = null;
        submitBtn.textContent = 'Add Contact';
        cancelEditBtn.classList.add('d-none');
        formTitle.textContent = "Add New Contact";
        loadContacts(sortSelect.value);
    } else {
        Swal.fire('❌ Error', data.error, 'error');
    }
});

// Edit Contact
function editContact(id) {
    const c = allContacts.find(c => c._id === id);
    nameInput.value = c.name;
    emailInput.value = c.email;
    phoneInput.value = c.phone;
    editingId = id;
    submitBtn.textContent = 'Update Contact';
    cancelEditBtn.classList.remove('d-none');
    formTitle.textContent = "Edit Contact";
}

// Cancel Edit
cancelEditBtn.addEventListener('click', () => {
    editingId = null;
    form.reset();
    submitBtn.textContent = 'Add Contact';
    cancelEditBtn.classList.add('d-none');
    formTitle.textContent = "Add New Contact";
});

// Delete Contact with your Confirmation
function deleteContact(id) {
    Swal.fire({
        title: "Delete Contact?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete"
    }).then(async (result) => {
        if (result.isConfirmed) {
            await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
            Swal.fire('🗑️ Deleted', 'Contact has been deleted', 'success');
            loadContacts(sortSelect.value);
        }
    });
}

// Search your contact
searchInput.addEventListener('input', function (e) {
    const term = e.target.value.toLowerCase();
    const filtered = allContacts.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.includes(term)
    );
    displayContacts(filtered);
});

//According to you Sort your Contacts
sortSelect.addEventListener('change', function () {
    loadContacts(this.value);
});

// Display contacts automatically when the page loaded
loadContacts();
