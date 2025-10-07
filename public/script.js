const contactList = document.getElementById('contactList');
const form = document.getElementById('contactForm');
const fnameInput = document.getElementById('fname');
const lnameInput = document.getElementById('lname');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const sortSelect = document.getElementById('sort');
const searchInput = document.getElementById('search');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEdit');

let editingId = null;
let allContacts = [];

async function loadContacts(sort = '') {
    const res = await fetch(`/api/contacts${sort ? `?sort=${sort}` : ''}`);
    const contacts = await res.json();
    allContacts = contacts;
    displayContacts(contacts);
}

function displayContacts(contacts) {
    contactList.innerHTML = '';
    contacts.forEach(c => {
        const initials = `${c.fname?.[0] || ''}${c.lname?.[0] || ''}`.toUpperCase();
        const li = document.createElement('li');
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width:40px; height:40px;">
          ${initials}
        </div>
        <div>
          <strong>${c.fname} ${c.lname}</strong><br>
          <small>${c.email}</small> | <small>${c.phone}</small>
        </div>
      </div>
      <div>
        <button class="btn btn-sm btn-warning me-2 px-3" onclick="editContact('${c._id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-danger " onclick="deleteContact('${c._id}')">❌ Delete</button>
      </div>
    `;
        contactList.appendChild(li);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fname = fnameInput.value.trim();
    const lname = lnameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    // ✅ Simple JS validation
    if (!/^[A-Za-z\s]+$/.test(fname)) return Swal.fire("❌ Error", "First name should only contain letters.", "error");
    if (!/^[A-Za-z\s]+$/.test(lname)) return Swal.fire("❌ Error", "Last name should only contain letters.", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Swal.fire("❌ Error", "Invalid email format.", "error");
    if (!/^\d{10,15}$/.test(phone)) return Swal.fire("❌ Error", "Phone should be 10-15 digits only.", "error");

    const newContact = { fname, lname, email, phone };
    let res;

    if (editingId) {
        res = await fetch(`/api/contacts/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContact)
        });
    } else {
        res = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContact)
        });
    }

    const data = await res.json();

    if (res.ok) {
        Swal.fire("✅ Success", data.message, "success");
        form.reset();
        editingId = null;
        submitBtn.textContent = 'Add Contact';
        cancelEditBtn.classList.add('d-none');
        formTitle.textContent = "Add New Contact";
        loadContacts(sortSelect.value);
    } else {
        Swal.fire("❌ Error", data.error || "Something went wrong", "error");
    }
});

function editContact(id) {
    if (editingId && editingId !== id) {
        Swal.fire({
            title: "You're already editing!",
            text: "Do you want to discard the current edit?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
        }).then((result) => {
            if (!result.isConfirmed) return;
            doEdit(id);
        });
    } else {
        doEdit(id);
    }
}

function doEdit(id) {
    const c = allContacts.find(c => c._id === id);
    fnameInput.value = c.fname;
    lnameInput.value = c.lname;
    emailInput.value = c.email;
    phoneInput.value = c.phone;
    editingId = id;
    submitBtn.textContent = 'Update Contact';
    cancelEditBtn.classList.remove('d-none');
    formTitle.textContent = "Edit Contact";
}

cancelEditBtn.addEventListener('click', () => {
    editingId = null;
    form.reset();
    submitBtn.textContent = 'Add Contact';
    cancelEditBtn.classList.add('d-none');
    formTitle.textContent = "Add New Contact";
});

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

searchInput.addEventListener('input', function (e) {
    const term = e.target.value.toLowerCase();
    const filtered = allContacts.filter(c =>
        c.fname.toLowerCase().includes(term) ||
        c.lname.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.includes(term)
    );
    displayContacts(filtered);
});

sortSelect.addEventListener('change', function () {
    loadContacts(this.value);
});

function exportToCSV() {
    let csv = 'First Name,Last Name,Email,Phone\n';
    allContacts.forEach(c => {
        csv += `${c.fname},${c.lname},${c.email},${c.phone}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contacts.csv';
    link.click();
}

loadContacts();



const themeSwitch = document.getElementById('themeSwitch');
const themeIcon = document.getElementById('themeIcon');

// Load user's theme preference on page load
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeSwitch.checked = true;
    themeIcon.textContent = '🌙';
}

// Toggle dark mode on switch
// themeSwitch.addEventListener('change', () => {
//     document.body.classList.toggle('dark-mode');
//     const isDark = document.body.classList.contains('dark-mode');
//     themeIcon.textContent = isDark ? '🌙' : '🌞';
//     localStorage.setItem('theme', isDark ? 'dark' : 'light');
// });


const themeToggle = document.getElementById('themeSwitch');

themeToggle.addEventListener('change', function () {
    document.body.classList.toggle('dark-mode', this.checked);
});
