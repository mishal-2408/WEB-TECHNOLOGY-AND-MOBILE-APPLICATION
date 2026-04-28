document.addEventListener('DOMContentLoaded', () => {

    const authContainer = document.getElementById('auth-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    

    const toggleAdmin = document.getElementById('toggle-admin');
    const togglePatient = document.getElementById('toggle-patient');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    const loginTitle = document.getElementById('login-title');
    const signupTitle = document.getElementById('signup-title');
    const patientSignupFields = document.getElementById('patient-signup-fields');

    let currentRole = 'admin';
    let currentMode = 'login';
    
    function updateAuthView() {
        if (currentMode === 'login') {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            loginTitle.textContent = currentRole === 'admin' ? 'Admin Login' : 'Patient Login';
        } else {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            signupTitle.textContent = currentRole === 'admin' ? 'Create Admin Account' : 'Create Patient Account';
            
            if (currentRole === 'patient') {
                patientSignupFields.classList.remove('hidden');
            } else {
                patientSignupFields.classList.add('hidden');
            }
        }
    }

    toggleAdmin.addEventListener('click', () => {
        toggleAdmin.classList.add('active');
        togglePatient.classList.remove('active');
        currentRole = 'admin';
        currentMode = 'login'; 
        updateAuthView();
    });

    togglePatient.addEventListener('click', () => {
        togglePatient.classList.add('active');
        toggleAdmin.classList.remove('active');
        currentRole = 'patient';
        currentMode = 'login'; 
        updateAuthView();
    });

    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        currentMode = 'signup';
        updateAuthView();
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        currentMode = 'login';
        updateAuthView();
    });


    function parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    let token = localStorage.getItem('hms_token');
    let userRole = localStorage.getItem('hms_role');

    if (token && userRole) {
        showDashboard();
    }

    function clearAuthErrors() {
        document.getElementById('login-error').textContent = '';
        document.getElementById('signup-error').textContent = '';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthErrors();
        const obj = {
            username: document.getElementById('login-username').value,
            password: document.getElementById('login-password').value
        };
        const endpoint = currentRole === 'admin' ? '/api/auth/login' : '/api/patients/login';
        await authApi(endpoint, obj, document.getElementById('login-error'));
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthErrors();
        let obj = {
            username: document.getElementById('signup-username').value,
            password: document.getElementById('signup-password').value
        };
        let endpoint = '/api/auth/register';

        if (currentRole === 'patient') {
            endpoint = '/api/patients/register';
            obj.name = document.getElementById('signup-name').value;
            obj.age = document.getElementById('signup-age').value;
            obj.gender = document.getElementById('signup-gender').value;
            obj.disease = document.getElementById('signup-disease').value;
            obj.contact = document.getElementById('signup-contact').value;
        }

        await authApi(endpoint, obj, document.getElementById('signup-error'));
    });

    async function authApi(url, body, errEl) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                const parsed = parseJwt(data.token);
                userRole = parsed ? parsed.role : (url.includes('patient') ? 'patient' : 'admin');

                localStorage.setItem('hms_token', data.token);
                localStorage.setItem('hms_role', userRole);
                localStorage.setItem('hms_user_id', data._id);
                token = data.token;
                
                showDashboard();
            } else {
                errEl.textContent = data.message || 'Operation failed';
            }
        } catch (err) { errEl.textContent = 'Server error'; }
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_role');
        localStorage.removeItem('hms_user_id');
        token = null; userRole = null;
        dashboardContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
        clearAuthErrors();
        loginForm.reset(); signupForm.reset();
        

        currentRole = 'admin'; currentMode = 'login';
        toggleAdmin.classList.add('active'); togglePatient.classList.remove('active');
        updateAuthView();
    });


    const navButtons = document.querySelectorAll('#nav-menu button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.add('hidden'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.remove('hidden');
        });
    });

    async function showDashboard() {
        authContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        

        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.patient-only').forEach(el => el.classList.add('hidden'));

        if (userRole === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
            document.querySelector('[data-target="tab-overview"]').click();
        } else {
            document.querySelectorAll('.patient-only').forEach(el => el.classList.remove('hidden'));
            document.querySelector('[data-target="tab-my-info"]').click();
        }

        fetchAllData(); 
    }


    async function apiRequest(endpoint, method='GET', body=null) {
        const opts = {
            method,
            headers: { 'Authorization': `Bearer ${token}` }
        };
        

        if (body && !(body instanceof FormData)) {
            opts.headers['Content-Type'] = 'application/json';
            opts.body = JSON.stringify(body);
        } else if (body instanceof FormData) {
            opts.body = body;
        }

        const res = await fetch(endpoint, opts);
        if(res.status === 401) { document.getElementById('logout-btn').click(); return null; }
        return res.json();
    }

    async function fetchAllData() {
        if (userRole === 'admin') {
            await loadOverview();
            await loadPatientsAdmin();
            await loadDoctorsAdmin();
            await loadAppointmentsAdmin();
        } else {
            await loadPatientInfo();
            await loadDoctorsPatient();
            await loadPatientAppointments();
            await loadPatientRecords();
        }
    }


    async function loadOverview() {
        const data = await apiRequest('/api/dashboard');
        if(!data || !data.stats) return;

        document.getElementById('stat-patients').textContent = data.stats.totalPatients;
        document.getElementById('stat-doctors').textContent = data.stats.totalDoctors;
        document.getElementById('stat-appointments').textContent = data.stats.totalAppointments;

        const ulApp = document.getElementById('appointments-list-overview');
        ulApp.innerHTML = data.recentAppointments.map(app => 
            `<li><span><strong>${app.patient?.name||'N/A'}</strong> / Dr. ${app.doctor?.name||'N/A'}</span> <span>${app.date} ${app.timeSlot}</span></li>`
        ).join('') || '<li>No recent appointments</li>';

        const ulDis = document.getElementById('diseases-list');
        ulDis.innerHTML = data.commonDiseases.map(d => 
            `<li><span>${d._id||'N/A'}</span> <span>${d.count} cases</span></li>`
        ).join('') || '<li>No data</li>';
    }


    const patForm = document.getElementById('add-patient-form');
    if (patForm) {
        patForm.addEventListener('submit', async(e) => {
            e.preventDefault();
            const obj = {
                name: document.getElementById('pat-name').value,
                age: document.getElementById('pat-age').value,
                gender: document.getElementById('pat-gender').value,
                disease: document.getElementById('pat-disease').value,
                contact: document.getElementById('pat-contact').value,
            };
            const res = await apiRequest('/api/patients', 'POST', obj);
            if(res && res._id) { 
                document.getElementById('pat-msg').textContent = 'Added securely!'; 
                patForm.reset(); 
                loadPatientsAdmin(); 
            } else {
                document.getElementById('pat-msg').style.color = 'red';
                document.getElementById('pat-msg').textContent = res.message || 'Error occurred';
            }
            setTimeout(() => { document.getElementById('pat-msg').textContent=''; 
            document.getElementById('pat-msg').style.color='#10B981';}, 2500);
        });
    }

    async function loadPatientsAdmin() {
        const pats = await apiRequest('/api/patients');
        if(!pats || !Array.isArray(pats)) return;
        document.getElementById('full-patients-list').innerHTML = pats.map(p => 
            `<li><strong>${p.name}</strong> <span>Age: ${p.age} | ${p.gender} | ${p.disease} | ${p.contact}</span></li>`
        ).join('');

        const patOptions = '<option value="">Select Patient</option>' + pats.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
        document.getElementById('app-patient').innerHTML = patOptions;
        document.getElementById('record-patient').innerHTML = patOptions;
    }


    const docForm = document.getElementById('add-doctor-form');
    if (docForm) {
        docForm.addEventListener('submit', async(e) => {
            e.preventDefault();
            const availText = document.getElementById('doc-avail').value;
            const obj = {
                name: document.getElementById('doc-name').value,
                specialization: document.getElementById('doc-spec').value,
                availability: availText.split(',').map(s=>s.trim())
            };
            const res = await apiRequest('/api/doctors', 'POST', obj);
            if(res && res._id) { 
                document.getElementById('doc-msg').textContent = 'Added securely!'; 
                docForm.reset(); loadDoctorsAdmin(); 
            }
            setTimeout(() => document.getElementById('doc-msg').textContent='', 2500);
        });
    }

    async function loadDoctorsAdmin() {
        const docs = await apiRequest('/api/doctors');
        if(!docs) return;
        document.getElementById('full-doctors-list').innerHTML = docs.map(d => 
            `<li style="display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin-bottom:10px; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px;">
                <div style="flex:1;">
                    <strong>Dr. ${d.name} (${d.specialization})</strong><br>
                    <span style="font-size:0.9em; color:#ddd;">Slots: ${d.availability.join(', ')}</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <select onchange="window.updateDocStatus('${d._id}', this.value)" style="padding:5px; border-radius:5px; background:rgba(255,255,255,0.1); color:${d.status === 'Arrived' ? '#10b981' : d.status === 'Late' ? '#f59e0b' : d.status === 'Leave' ? '#ef4444' : '#fff'}; font-weight:600; border:1px solid rgba(255,255,255,0.3);">
                        <option style="color:#6b7280; font-weight:600;" value="Not Arrived" ${d.status === 'Not Arrived' ? 'selected' : ''}>Not Arrived</option>
                        <option style="color:#10b981; font-weight:600;" value="Arrived" ${d.status === 'Arrived' ? 'selected' : ''}>Arrived</option>
                        <option style="color:#f59e0b; font-weight:600;" value="Late" ${d.status === 'Late' ? 'selected' : ''}>Late</option>
                        <option style="color:#ef4444; font-weight:600;" value="Leave" ${d.status === 'Leave' ? 'selected' : ''}>Leave</option>
                    </select>
                    <button onclick="window.deleteDoctor('${d._id}')" style="background:#EF4444; color:#fff; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Delete</button>
                </div>
            </li>`
        ).join('');

        document.getElementById('app-doctor').innerHTML = '<option value="">Select Doctor</option>' + 
            docs.map(d => `<option value="${d._id}">Dr. ${d.name} (${d.specialization})</option>`).join('');
    }


    const appForm = document.getElementById('book-appointment-form');
    if (appForm) {
        appForm.addEventListener('submit', async(e) => {
            e.preventDefault();
            const finalTime = formatTimeFilter(document.getElementById('app-time').value);

            const obj = {
                patient: document.getElementById('app-patient').value,
                doctor: document.getElementById('app-doctor').value,
                date: document.getElementById('app-date').value,
                timeSlot: finalTime
            };
            const res = await apiRequest('/api/appointments', 'POST', obj);
            handleBookingMessage(res, appForm, 'app-msg', loadAppointmentsAdmin);
        });
    }

    async function loadAppointmentsAdmin() {
        const apps = await apiRequest('/api/appointments');
        if(!apps || !Array.isArray(apps)) return;

        const activeApps = apps.filter(app => app.status === 'Scheduled');
        const historyApps = apps.filter(app => app.status === 'Completed');

        document.getElementById('full-appointments-list').innerHTML = activeApps.map(app => 
            `<li style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px;">
                <div>
                    <strong>${app.patient?.name||'N/A'} ➔ Dr. ${app.doctor?.name||'N/A'}</strong><br>
                    <span style="font-size:0.9em; color:#ddd;">${app.date} | ${app.timeSlot} | Status: Scheduled</span>
                </div>
                <button onclick="window.markApptCompleted('${app._id}')" style="background:var(--primary); color:#fff; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Mark Completed</button>
            </li>`
        ).join('') || '<li>No active appointments.</li>';

        const historyList = document.getElementById('history-appointments-list');
        if(historyList) {
            historyList.innerHTML = historyApps.map(app => 
                `<li style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px; border-left: 4px solid #10B981;">
                    <div>
                        <strong>${app.patient?.name||'N/A'} ➔ Dr. ${app.doctor?.name||'N/A'}</strong><br>
                        <span style="font-size:0.9em; color:#ddd;">${app.date} | ${app.timeSlot}</span>
                    </div>
                    <span style="color:#10B981; font-weight:600;">Completed</span>
                </li>`
            ).join('') || '<li>No completed appointments yet.</li>';
        }
    }


    const recordForm = document.getElementById('upload-record-form');
    if(recordForm) {
        recordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('patient', document.getElementById('record-patient').value);
            formData.append('description', document.getElementById('record-description').value);
            formData.append('file', document.getElementById('record-file').files[0]);

            const res = await apiRequest('/api/records', 'POST', formData);
            if(res && res._id) {
                document.getElementById('record-msg').textContent = 'Record uploaded securely!';
                recordForm.reset();
            } else {
                document.getElementById('record-msg').textContent = res.message || 'Upload failed.';
                document.getElementById('record-msg').style.color = 'red';
            }
            setTimeout(() => { document.getElementById('record-msg').textContent=''; 
            document.getElementById('record-msg').style.color='#10B981';}, 2500);
        });
    }



    async function loadPatientInfo() {
        const uId = localStorage.getItem('hms_user_id');
        const pData = await apiRequest(`/api/patients/${uId}`);
        if(pData && pData.name) {
            document.getElementById('my-info-card').innerHTML = `
                <p><strong>Name:</strong> ${pData.name}</p>
                <p><strong>Age:</strong> ${pData.age}</p>
                <p><strong>Gender:</strong> ${pData.gender}</p>
                <p><strong>Disease / Reason for joining:</strong> ${pData.disease}</p>
                <p><strong>Contact:</strong> ${pData.contact}</p>
            `;
        }
    }

    async function loadDoctorsPatient() {
        const docs = await apiRequest('/api/doctors');
        if(!docs) return;
        document.getElementById('patient-app-doctor').innerHTML = '<option value="">Select Doctor</option>' + 
            docs.map(d => `<option value="${d._id}">Dr. ${d.name} (${d.specialization}) - Slots: ${d.availability.join(', ')}</option>`).join('');
    }

    const patientAppForm = document.getElementById('patient-book-appointment-form');
    if (patientAppForm) {
        patientAppForm.addEventListener('submit', async(e) => {
            e.preventDefault();
            const finalTime = formatTimeFilter(document.getElementById('patient-app-time').value);

            const obj = {
                patient: localStorage.getItem('hms_user_id'),
                doctor: document.getElementById('patient-app-doctor').value,
                date: document.getElementById('patient-app-date').value,
                timeSlot: finalTime
            };
            const res = await apiRequest('/api/appointments', 'POST', obj);
            handleBookingMessage(res, patientAppForm, 'patient-app-msg', loadPatientAppointments);
        });
    }

    async function loadPatientAppointments() {
        const apps = await apiRequest('/api/appointments');
        if(!apps || !Array.isArray(apps)) return;
        document.getElementById('my-appointments-list').innerHTML = apps.map(app => {
            const isCompleted = app.status === 'Completed';
            return `<li style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px; border-left: 4px solid ${isCompleted ? '#10B981' : 'var(--primary)'};">
                <div>
                    <strong>Dr. ${app.doctor?.name||'N/A'}</strong><br>
                    <span style="font-size:0.9em; color:#ddd;">${app.date} | ${app.timeSlot}</span>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:0.85em; background:${isCompleted ? '#10B981' : 'rgba(255,255,255,0.1)'}; color:${isCompleted ? '#fff' : 'inherit'}; font-weight:${isCompleted ? 'bold': 'normal'}; padding:3px 8px; border-radius:12px;">Appt: ${app.status}</span><br>
                    ${!isCompleted 
                        ? `<span style="font-size:0.85em; color:var(--primary); font-weight:600; margin-top:5px; display:inline-block;">Dr. Status: ${app.doctor?.status || 'Not Arrived'}</span>` 
                        : `<span style="font-size:0.85em; color:#10B981; font-weight:600; margin-top:5px; display:inline-block;">Finished</span>`}
                </div>
            </li>`;
        }).join('') || '<li>No appointments found.</li>';
    }

    async function loadPatientRecords() {
        const uId = localStorage.getItem('hms_user_id');
        const records = await apiRequest(`/api/records/${uId}`);
        if (!records) return;
        
        document.getElementById('my-records-list').innerHTML = records.map(r => 
            `<li><strong>${r.description || 'Medical Record'}</strong> 
            <span><a href="/${r.filePath}" target="_blank" style="color:var(--primary); text-decoration:none;">View File <img src="/${r.filePath}" alt="record preview" style="display:none; max-width: 50px;"/></a> | Date: ${new Date(r.createdAt).toLocaleDateString()}</span></li>`
        ).join('') || '<li>No medical records found.</li>';
    }


    function formatTimeFilter(textTime) {
        const [h, m] = textTime.split(':');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedTimeH = h % 12 || 12;
        return `${formattedTimeH.toString().padStart(2, '0')}:${m} ${ampm}`;
    }

    function handleBookingMessage(res, formObj, msgId, reloadFn) {
        if(res && res._id) { 
            document.getElementById(msgId).textContent = 'Booked securely!'; 
            formObj.reset(); document.getElementById(msgId).style.color='#10B981';
            reloadFn(); 
        } else {
            document.getElementById(msgId).style.color = 'red';
            document.getElementById(msgId).textContent = res?.message || 'Double booking error';
        }
        setTimeout(() => { document.getElementById(msgId).textContent=''; document.getElementById(msgId).style.color='#10B981'; }, 3000);
    }


    window.markApptCompleted = async (id) => {
        if(!confirm('Mark this appointment as completed?')) return;
        const res = await apiRequest(`/api/appointments/${id}/status`, 'PUT', { status: 'Completed' });
        if(res && res._id) {
            loadAppointmentsAdmin();
            loadOverview();
        } else {
            alert('Error updating status');
        }
    };

    window.deleteDoctor = async (id) => {
        if(!confirm('Are you sure you want to delete this doctor?')) return;
        const res = await apiRequest(`/api/doctors/${id}`, 'DELETE');
        if(!res || res.message !== 'Doctor removed') {
             alert('Error deleting doctor');
        }
        loadDoctorsAdmin();
    };

    window.updateDocStatus = async (id, status) => {
        const res = await apiRequest(`/api/doctors/${id}/status`, 'PUT', { status });
        if(!res || !res._id) {
             alert('Error updating doctor status');
        }
        loadDoctorsAdmin();
    };
});
