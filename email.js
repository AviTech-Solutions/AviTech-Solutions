
//    AVITECH SOLUTIONS - APPOINTMENT FORM

(function () {

    "use strict";
    const form = document.getElementById("appointmentForm");
    if (!form) {
        return;
    }

    // ELEMENTS
    const submitButton =
        form.querySelector(".send") ||
        form.querySelector('button[type="submit"]');

    const appointmentIdField =
        document.getElementById("appointmentId");

    const receivedAtField =
        document.getElementById("receivedAt");

    const statusField =
        document.getElementById("appointmentStatus");

    const nameField =
        document.getElementById("name");

    const phoneField =
        document.getElementById("phone");

    const emailField =
        document.getElementById("email");

    const serviceField =
        document.getElementById("service");

    const packageField =
        document.getElementById("package");

    const guidePriceField =
        document.getElementById("guidePrice");

    const budgetField =
        document.getElementById("budget");

    const preferredDateField =
        document.getElementById("preferredDate");

    const appointmentTypeField =
        document.getElementById("appointmentType");

    const messageField =
        document.getElementById("message");

    const errorMsg =
        document.getElementById("errorMsg");

    const successMsg =
        document.getElementById("successMsg");

    // SUBMISSION STATE
    let submitting = false;

    // APPOINTMENT ID
    function generateAppointmentId() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const random = Math.floor(1000 + Math.random() * 9000);
        return `AVT-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
    }

    // SYSTEM FIELDS
    function prepareSystemFields() {
        const appointmentId = generateAppointmentId();
        const receivedAt =  new Date().toISOString();
        
        if (appointmentIdField) {
            appointmentIdField.value = appointmentId;
        }

        if (receivedAtField) {
            receivedAtField.value = receivedAt;
        }

        if (statusField) {
            statusField.value = "Pending";
        }

    }


    //    GET FIELD VALUE

    function getValue(field) {

        if (!field) {
            return "";
        }
        return String(field.value || "").trim();

    }

    // CREATE APPOINTMENT RECORD

    function createAppointmentRecord() {

        return {

            appointment_id: getValue(appointmentIdField),
            received_at: getValue(receivedAtField),
            status: getValue(statusField) || "Pending",
            name: getValue(nameField),
            phone: getValue(phoneField),
            email: getValue(emailField),
            service: getValue(serviceField),
            package: getValue(packageField),
            guide_price: getValue(guidePriceField),
            budget: getValue(budgetField),
            preferred_date: getValue(preferredDateField),
            appointment_type: getValue(appointmentTypeField),
            message: getValue(messageField)

        };

    }

    // BUILD EMAIL SUMMARY

    function buildBookingSummary(record) {

        return `
            Appointment ID: ${record.appointment_id}
            Received At: ${record.received_at}
            Status: ${record.status}

            Name: ${record.name}
            Phone: ${record.phone}
            Email: ${record.email}

            Service: ${record.service}
            Package: ${record.package}
            Guide Price: ${record.guide_price}
            Budget: ${record.budget}

            Preferred Date: ${record.preferred_date}
            Appointment Type: ${record.appointment_type}

            Message:
            ${record.message}
        `.trim();

    }

    // SAVE APPOINTMENT TO GOOGLE SHEETS

    function saveAppointmentToGoogleSheets(record) {

        const sheetsUrl =
            window.AVITECH_SHEETS_WEB_APP_URL;

        if (!sheetsUrl) {
            console.warn(
                "AviTech Google Sheets Web App URL is not configured."
            );

            return Promise.resolve({
                skipped: true
            });

        }

        return fetch(
            sheetsUrl,
            {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },

                body:
                    JSON.stringify(record)
            }
        );

    }

    // errors

    function showError(message) {

        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.classList.add(
                "show"
            );

        } else {
            alert(message);
        }

    }

    // SUCCESS

    function showSuccess(message) {

        if (successMsg) {
            successMsg.textContent =  message;
            successMsg.classList.add(
                "show"
            );

        } else {

            alert(message);

        }

    }

    // Clear messages

    function clearMessages() {

        if (errorMsg) {

            errorMsg.textContent = "";
            errorMsg.classList.remove(
                "show"
            );

        }

        if (successMsg) {

            successMsg.textContent = "";
            successMsg.classList.remove(
                "show"
            );

        }

    }

    // RESTORE SUBMIT BUTTON

    function restoreSubmitButton() {

        if (!submitButton) {
            return;
        }

        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="bi bi-send"></i> Send Booking Request';

    }

    // DISABLE SUBMIT BUTTON

    function disableSubmitButton(text) {

        if (!submitButton) {
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = `<i class="bi bi-hourglass-split"></i> ${text}`;

    }

    // FORM SUBMISSION

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();
            if (submitting) {
                return;
            }

            clearMessages();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            submitting = true;
            disableSubmitButton(
                "Sending..."
            );

            prepareSystemFields();
            const appointmentRecord = createAppointmentRecord();
            const bookingSummary = buildBookingSummary(
                appointmentRecord
            );


            /* ---------------------------------------------
               EMAILJS
               --------------------------------------------- */

            if (
                typeof emailjs ===
                "undefined"
            ) {

                showError(
                    "Email service is not available. Please refresh the page and try again."
                );

                submitting =
                    false;

                restoreSubmitButton();

                return;

            }

            const emailRequest = emailjs.send(

                "service_7r4l4kf",
                "template_jxsur3m",

                {

                    appointment_id: appointmentRecord.appointment_id,
                    received_at: appointmentRecord.received_at,
                    status: appointmentRecord.status,
                    name: appointmentRecord.name,
                    phone: appointmentRecord.phone,
                    email: appointmentRecord.email,
                    service: appointmentRecord.service,
                    package: appointmentRecord.package,
                    guide_price: appointmentRecord.guide_price,
                    budget: appointmentRecord.budget,
                    preferred_date: appointmentRecord.preferred_date,
                    appointment_type: appointmentRecord.appointment_type,
                    message: appointmentRecord.message,
                    booking_summary: bookingSummary

                }

            );

            //    GOOGLE SHEETS

            const sheetsRequest = saveAppointmentToGoogleSheets(
                appointmentRecord
            );

            //    SEND & SAVE TO SHEETS

            try {

                await Promise.all([
                    emailRequest,
                    sheetsRequest
                ]);


                //    SAVE SUCCESS 

                sessionStorage.setItem(
                    "avitech_last_appointment_id",
                    appointmentRecord.appointment_id
                );

                form.reset();

                //    RESTORE DEFAULTS
                if (statusField) {
                    statusField.value = "Pending";
                }

                showSuccess(
                    `Your appointment request has been sent successfully. Your Appointment ID is ${appointmentRecord.appointment_id}. AviTech Solutions will contact you to confirm the appointment.`
                );

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<i class="bi bi-check-circle"></i> Request Sent';
                }

                //    REMOVE POST HISTORY
                window.history.replaceState(
                    null,
                    document.title,
                    window.location.href
                );

                // console.log(
                //     "AviTech appointment submitted:",
                //     appointmentRecord
                // );

            } catch (error) {

                console.error(
                    "AviTech appointment submission failed:",
                    error
                );

                showError(
                    "We could not send your appointment request. Please check your details and try again, or contact AviTech Solutions directly on WhatsApp."
                );

                //  RETRY
                submitting = false;
                restoreSubmitButton();
            }

        }
    );

    //    INITIAL FORM STATE
    prepareSystemFields();

})();