document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const fetchStudents = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/students', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch students');
            }

            const students = await res.json();
            const studentList = document.getElementById('studentList');
            studentList.innerHTML = '';

            students.forEach(student => {
                const firstLetter = student.name.charAt(0).toUpperCase();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <span class="badge badge-primary">${firstLetter}</span> ${student.name}
                    </td>
                    <td>${student.subject}</td>
                    <td>${student.marks}</td>
                    <td>
                        <div class="action-container">
                            <button class="btn btn-sm subnav-icon" data-id="${student._id}">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="subnav links" id="sub-nav-${student._id}">
                                <button class="btn btn-sm editBtn" data-id="${student._id}"><i class="fas fa-edit pr-2"></i>Edit</button>
                                <button class="btn btn-sm deleteBtn" data-id="${student._id}"><i class="fas fa-trash-alt pr-2"></i>Delete</button>
                            </div>
                        </div>
                    </td>
                `;
                studentList.appendChild(row);
            });

            document.querySelectorAll('.subnav-icon').forEach(icon => {
                icon.addEventListener('click', (e) => {
                    const subnavId = `sub-nav-${icon.dataset.id}`;
                    const subnav = document.getElementById(subnavId);
                    subnav.classList.toggle('subnav');
                });
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch students');
        }
    };

    await fetchStudents();

    document.getElementById('addStudentBtn').addEventListener('click', () => {
        document.getElementById('studentForm').reset();
        document.getElementById('studentForm').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const subject = document.getElementById('subject').value;
            const marks = parseInt(document.getElementById('marks').value, 10);

            try {
                const res = await fetch('http://localhost:5000/api/students', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name, subject, marks }),
                });

                if (res.status === 201 || res.status === 200) {
                    $('#studentModal').modal('hide');
                    await fetchStudents();
                } else {
                    const data = await res.json();
                    alert(data.error);
                }
            } catch (error) {
                alert('Server error');
            }
        };
        $('#studentModal').modal('show');
    });

    document.getElementById('studentList').addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        const studentId = button.dataset.id;

        if (button.classList.contains('editBtn')) {
            try {
                const res = await fetch(`http://localhost:5000/api/students/${studentId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch student details');
                }

                const student = await res.json();

                document.getElementById('name').value = student.name;
                document.getElementById('subject').value = student.subject;
                document.getElementById('marks').value = student.marks;
                $('#studentModal').modal('show');

                document.getElementById('studentForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const updatedName = document.getElementById('name').value;
                    const updatedSubject = document.getElementById('subject').value;
                    const updatedMarks = parseInt(document.getElementById('marks').value, 10);

                    try {
                        const res = await fetch(`http://localhost:5000/api/students/${studentId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({ name: updatedName, subject: updatedSubject, marks: updatedMarks }),
                        });

                        if (res.status === 200) {
                            $('#studentModal').modal('hide');
                            await fetchStudents();
                        } else {
                            const data = await res.json();
                            alert(data.error);
                        }
                    } catch (error) {
                        alert('Server error');
                    }
                };
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to fetch student details');
            }
        } else if (button.classList.contains('deleteBtn')) {
            try {
                const res = await fetch(`http://localhost:5000/api/students/${studentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (res.status === 200) {
                    await fetchStudents();
                } else {
                    const data = await res.json();
                    alert(data.error);
                }
            } catch (error) {
                alert('Server error');
            }
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        try {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Failed to logout. Please try again.');
        }
    });
});
